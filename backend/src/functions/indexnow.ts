/**
 * IndexNow API endpoint
 * 
 * POST /api/indexnow — Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam)
 * GET  /api/indexnow — Returns the IndexNow key for verification
 * 
 * Reads sitemap.xml from the frontend and submits all URLs.
 * Called by the CI/CD pipeline after deployment.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

const INDEXNOW_KEY = 'f688d2e7668f5080a2d692bb1cac61d5';
const SITE_HOST = 'www.proteinlens.com';
const SITE_URL = `https://${SITE_HOST}`;
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

/**
 * Fetch sitemap and extract all <loc> URLs
 */
async function getSitemapUrls(): Promise<string[]> {
  const response = await fetch(`${SITE_URL}/sitemap.xml`, {
    signal: AbortSignal.timeout(10000),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${response.status}`);
  }
  
  const xml = await response.text();
  const urls: string[] = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Submit URLs to IndexNow API
 */
async function submitToIndexNow(urls: string[]): Promise<{ status: number; body: string }> {
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const body = await response.text();
  return { status: response.status, body };
}

/**
 * POST /api/indexnow — Submit all sitemap URLs to IndexNow
 * Optionally accepts JSON body with { urls: string[] } to submit specific URLs
 */
async function handlePost(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  
  try {
    let urls: string[];
    
    // Check if specific URLs were provided in the body
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json() as { urls?: string[] };
        if (body.urls && Array.isArray(body.urls) && body.urls.length > 0) {
          urls = body.urls;
          context.log(`IndexNow: Using ${urls.length} URLs from request body`);
        } else {
          urls = await getSitemapUrls();
          context.log(`IndexNow: No URLs in body, fetched ${urls.length} from sitemap`);
        }
      } catch {
        urls = await getSitemapUrls();
        context.log(`IndexNow: Could not parse body, fetched ${urls.length} from sitemap`);
      }
    } else {
      urls = await getSitemapUrls();
      context.log(`IndexNow: Fetched ${urls.length} URLs from sitemap`);
    }

    if (urls.length === 0) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { error: 'No URLs found to submit' },
      };
    }

    // IndexNow accepts max 10,000 URLs per request
    const maxUrls = 10000;
    const submitUrls = urls.slice(0, maxUrls);

    const result = await submitToIndexNow(submitUrls);
    const latencyMs = Date.now() - startTime;
    const accepted = result.status === 200 || result.status === 202;

    context.log(`IndexNow: ${accepted ? '✅ Accepted' : '⚠️ Returned'} HTTP ${result.status} — ${submitUrls.length} URLs in ${latencyMs}ms`);

    return {
      status: accepted ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        success: accepted,
        indexnowStatus: result.status,
        urlsSubmitted: submitUrls.length,
        latencyMs,
        ...(result.body && !accepted ? { indexnowResponse: result.body } : {}),
      },
    };
  } catch (error) {
    const err = error as Error;
    context.error(`IndexNow submission failed: ${err.message}`);
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        success: false,
        error: err.message,
        latencyMs: Date.now() - startTime,
      },
    };
  }
}

/**
 * GET /api/indexnow — Return the IndexNow key (for verification/status)
 */
async function handleGet(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      host: SITE_HOST,
      endpoint: INDEXNOW_ENDPOINT,
      usage: 'POST /api/indexnow to submit all sitemap URLs. Optionally send { "urls": ["..."] } to submit specific URLs.',
    },
  };
}

/**
 * Route handler
 */
async function indexnow(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (request.method === 'POST') {
    return handlePost(request, context);
  }
  return handleGet(request, context);
}

// Register endpoint
app.http('indexnow', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'indexnow',
  handler: indexnow,
});
