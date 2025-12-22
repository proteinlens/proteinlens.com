// AI Service for GPT-5.1 Vision analysis via Azure AI Foundry
// Constitution Principle V: Deterministic JSON Output
// To be fully implemented in Phase 3 (T031-T032)

import { Logger } from '../utils/logger.js';
import { AIAnalysisResponse } from '../models/schemas.js';

class AIService {
  async analyzeMealImage(imageUrl: string, requestId: string): Promise<AIAnalysisResponse> {
    Logger.info('AI analysis requested (stub)', { imageUrl, requestId });
    
    // Stub implementation - will be completed in T031
    throw new Error('AIService.analyzeMealImage() not yet implemented');
  }
}

export const aiService = new AIService();
