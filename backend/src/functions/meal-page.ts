/**
 * Azure Function: GET /meal/:shareId (SSR for OG tags)
 * 
 * Feature 017: Shareable Meal Scans & Diet Style Profiles
 * Task: T014 - SSR Azure Function for /meal/:shareId with OG tags
 * 
 * Serves HTML with Open Graph meta tags for social media crawlers.
 * Human visitors are redirected to the SPA.
 * 
 * Bot Detection: User-Agent inspection for social media crawlers
 * - Facebook: facebookexternalhit, Facebot
 * - Twitter: Twitterbot
 * - LinkedIn: LinkedInBot
 * - Slack: Slackbot
 * - Discord: Discordbot
 * - Telegram: TelegramBot
 * - WhatsApp: WhatsApp
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { mealService } from '../services/mealService.js';
import { blobService } from '../services/blobService.js';
import { isValidShareId } from '../utils/nanoid.js';
import { generateOGHtml, OGMealData } from '../utils/ogTemplate.js';
import { config } from '../utils/config.js';

// Bot user agent patterns for social media crawlers
const BOT_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /TelegramBot/i,
  /WhatsApp/i,
  /Pinterest/i,
  /Googlebot/i,
  /bingbot/i,
  /bot/i,
  /crawler/i,
  /spider/i,
];

/**
 * Detect if request is from a social media bot/crawler
 */
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

interface Food {
  name: string;
  portion: string;
  protein: number | { toNumber: () => number };
}

interface DietStyleSnapshot {
  id: string;
  slug: string;
  name: string;
  netCarbCapG: number | null;
  fatTargetPercent: number | null;
}

interface MealWithDetails {
  id: string;
  shareId: string;
  blobName: string;
  blobUrl: string;
  totalProtein: { toNumber: () => number } | number;
  confidence: string;
  notes: string | null;
  createdAt: Date;
  foods: Food[];
  dietStyleAtScan: DietStyleSnapshot | null;
}

export async function mealPage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  const shareId = request.params.shareId;
  const userAgent = request.headers.get('user-agent');

  Logger.info('GET /meal/:shareId - SSR meal page', { 
    requestId, 
    shareId,
    isBot: isBot(userAgent),
    userAgent: userAgent?.substring(0, 100),
  });

  try {
    // Validate shareId format
    if (!shareId || !isValidShareId(shareId)) {
      Logger.warn('Invalid shareId format', { requestId, shareId });
      // Redirect to home for invalid share IDs
      const frontendUrl = config.frontendUrl || 'https://www.proteinlens.com';
      return {
        status: 302,
        headers: {
          'Location': frontendUrl,
          'X-Request-ID': requestId,
        },
      };
    }

    // For human visitors (non-bots), redirect directly to SPA
    if (!isBot(userAgent)) {
      const frontendUrl = config.frontendUrl || 'https://www.proteinlens.com';
      return {
        status: 302,
        headers: {
          'Location': `${frontendUrl}/meal/${shareId}`,
          'X-Request-ID': requestId,
        },
      };
    }

    // For bots, get meal data and serve SSR HTML with OG tags
    const meal = await mealService.getPublicMealByShareId(shareId) as unknown as MealWithDetails | null;

    if (!meal) {
      Logger.info('Meal not found or is private for SSR', { requestId, shareId });
      // Return minimal HTML for not-found meals
      return {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Request-ID': requestId,
        },
        body: `<!DOCTYPE html>
<html><head>
  <title>Meal Not Found - ProteinLens</title>
  <meta property="og:title" content="Meal Not Found">
  <meta property="og:description" content="This meal is no longer available or is private.">
</head><body>
  <h1>Meal Not Found</h1>
  <p>This meal is no longer available or is private.</p>
</body></html>`,
      };
    }

    // Generate SAS URL for the meal image (24 hour expiry for OG previews)
    let imageUrl = meal.blobUrl;
    try {
      if (meal.blobName) {
        imageUrl = await blobService.generateReadSasUrl(meal.blobName, 60 * 24);
      }
    } catch (error) {
      Logger.warn('Failed to generate SAS URL for SSR meal image', {
        requestId,
        shareId,
        blobName: meal.blobName,
      });
    }

    // Prepare OG data
    const ogData: OGMealData = {
      shareId: meal.shareId,
      imageUrl,
      totalProtein: typeof meal.totalProtein === 'number' 
        ? meal.totalProtein 
        : Number(meal.totalProtein),
      confidence: meal.confidence,
      proTip: meal.notes,
      dietStyleName: meal.dietStyleAtScan?.name ?? null,
      foodNames: (meal.foods as Food[]).map(f => f.name),
      uploadedAt: meal.createdAt.toISOString(),
    };

    // Generate full HTML with OG tags
    const html = generateOGHtml(ogData);

    Logger.info('SSR meal page served for bot', {
      requestId,
      shareId,
      totalProtein: ogData.totalProtein,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Request-ID': requestId,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: html,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Failed to serve SSR meal page', error instanceof Error ? error : new Error(errorMessage), {
      requestId,
      shareId,
    });

    // On error, redirect to frontend (it will handle 404)
    const frontendUrl = config.frontendUrl || 'https://www.proteinlens.com';
    return {
      status: 302,
      headers: {
        'Location': `${frontendUrl}/meal/${shareId}`,
        'X-Request-ID': requestId,
      },
    };
  }
}

// Register Azure Function
// Note: This route is at /meal/:shareId (not /api/meal/:shareId)
// for cleaner shareable URLs
app.http('mealPage', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'meal/{shareId}',
  handler: mealPage,
});
