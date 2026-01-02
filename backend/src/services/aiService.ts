// AI Service for GPT-5.1 Vision analysis via Azure AI Foundry
// Constitution Principle V: Deterministic JSON Output
// T031-T032: GPT-5.1 Vision integration with retry logic
// T075: Performance monitoring for AI calls

import { Logger } from '../utils/logger.js';
import { AIAnalysisResponse, AIAnalysisResponseSchema } from '../models/schemas.js';
import { AIAnalysisError, SchemaValidationError } from '../utils/errors.js';
import { config } from '../utils/config.js';
import { trackAICall } from '../utils/telemetry.js';

class AIService {
  private maxRetries = 3;
  private baseDelayMs = 1000;

  /**
   * T031: Analyze meal image using GPT-5.1 Vision via Azure AI Foundry
   * Constitution Principle V: Returns schema-valid JSON only
   */
  async analyzeMealImage(imageUrl: string, requestId: string): Promise<AIAnalysisResponse> {
    Logger.info('AI analysis started', { requestId, model: config.aiModelDeployment });
    
    const startTime = Date.now();
    
    const prompt = `You are a professional nutritionist analyzing food photos. Analyze this meal image and:

1. Identify all visible food items
2. Estimate portion sizes
3. Return complete macronutrient data: PROTEIN, CARBOHYDRATES, and FAT (all in grams)

CRITICAL: You MUST provide protein, carbs, and fat for every food item.
If you cannot estimate carbs or fat reliably, provide your best educated estimate.

Return ONLY valid JSON in this exact structure (no markdown, no extra text):
{
  "foods": [
    {
      "name": "specific food name",
      "portion": "estimated portion size (e.g., 150g, 1 cup)",
      "protein": number_in_grams,
      "carbs": number_in_grams,
      "fat": number_in_grams
    }
  ],
  "totalProtein": sum_of_all_protein,
  "totalCarbs": sum_of_all_carbs,
  "totalFat": sum_of_all_fat,
  "confidence": "high" or "medium" or "low",
  "notes": "optional observations"
}

Guidelines:
- Food names: specific (e.g., "Grilled Salmon Fillet" not just "Fish")
- Portions: realistic estimates (e.g., "200g salmon", "1 cup rice", "2 tbsp olive oil")
- Macros: protein, carbohydrates (including fiber), and fat in grams
- Confidence: high (clear, recognizable), medium (some items unclear), low (blurry, unidentifiable)
- If image has no food, return: {"foods": [], "totalProtein": 0, "totalCarbs": 0, "totalFat": 0, "confidence": "high", "notes": "No food visible"}`;

    const requestBody = {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_completion_tokens: 1000, // GPT-5+ uses max_completion_tokens instead of max_tokens
      temperature: 0.3, // Lower temperature for more consistent responses
      response_format: { type: 'json_object' },
    };

    try {
      const result = await this.callWithRetry(requestBody, requestId, startTime);
      return result;
    } catch (error) {
      // T075: Track failed AI call
      const durationMs = Date.now() - startTime;
      trackAICall(
        'analyzeMealImage',
        config.aiModelDeployment,
        durationMs,
        false,
        undefined,
        (error as Error).message
      );
      throw error;
    }
  }

  /**
   * T032: Retry logic with exponential backoff
   * T075: Added performance tracking
   */
  private async callWithRetry(
    requestBody: unknown,
    requestId: string,
    startTime: number,
    attempt = 1
  ): Promise<AIAnalysisResponse> {
    try {
      // Use Azure OpenAI endpoint (from Key Vault via AZURE_OPENAI_API_KEY)
      const endpoint = config.azureOpenAIEndpoint || config.aiFoundryEndpoint;
      const apiKey = config.azureOpenAIApiKey;
      
      if (!apiKey) {
        throw new AIAnalysisError('Azure OpenAI API key not configured (AZURE_OPENAI_API_KEY)');
      }
      
      const response = await fetch(`${endpoint}/openai/deployments/${config.azureOpenAIDeployment}/chat/completions?api-version=2024-02-15-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey, // From Key Vault reference in production
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIAnalysisError(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json() as any;
      const aiResponseText = data.choices?.[0]?.message?.content;

      if (!aiResponseText) {
        throw new AIAnalysisError('No response content from AI model');
      }

      // Log raw AI response for debugging macro issues
      Logger.info('Raw AI response received', { 
        requestId,
        responsePreview: aiResponseText.substring(0, 500),
        hasCarbs: aiResponseText.includes('carbs'),
        hasFat: aiResponseText.includes('fat'),
      });

      // T075: Extract token usage for telemetry
      const tokenUsage = data.usage ? {
        prompt: data.usage.prompt_tokens || 0,
        completion: data.usage.completion_tokens || 0,
        total: data.usage.total_tokens || 0,
      } : undefined;

      // Parse and validate JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponseText);
      } catch (error) {
        throw new SchemaValidationError(`AI returned invalid JSON: ${aiResponseText.substring(0, 100)}`);
      }

      // Validate against schema (Constitution Principle V)
      const validation = AIAnalysisResponseSchema.safeParse(parsedResponse);
      if (!validation.success) {
        const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        Logger.warn('AI response validation failed', {
          requestId,
          errors,
          parsed: JSON.stringify(parsedResponse).substring(0, 200),
        });
        throw new SchemaValidationError(errors);
      }

      // Log parsed response for debugging
      Logger.info('AI response validated successfully', {
        requestId,
        totalProtein: validation.data.totalProtein,
        totalCarbs: validation.data.totalCarbs,
        totalFat: validation.data.totalFat,
        foodCount: validation.data.foods.length,
      });

      // T075: Track successful AI call
      const durationMs = Date.now() - startTime;
      trackAICall(
        'analyzeMealImage',
        config.aiModelDeployment,
        durationMs,
        true,
        tokenUsage
      );

      Logger.info('AI analysis completed successfully', {
        requestId,
        foodCount: validation.data.foods.length,
        totalProtein: validation.data.totalProtein,
        confidence: validation.data.confidence,
        durationMs,
        ...(tokenUsage && { tokenUsage: tokenUsage.total }),
      });

      return validation.data;

    } catch (error) {
      if (attempt < this.maxRetries) {
        const delayMs = this.baseDelayMs * Math.pow(2, attempt - 1);
        Logger.warn(`AI analysis attempt ${attempt} failed, retrying in ${delayMs}ms`, {
          requestId,
          error: (error as Error).message,
        });
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.callWithRetry(requestBody, requestId, startTime, attempt + 1);
      }

      Logger.error('AI analysis failed after all retries', error as Error, { requestId });
      throw error;
    }
  }
}

export const aiService = new AIService();
