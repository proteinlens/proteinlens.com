/**
 * OG Meta Tag Template Generator
 * 
 * Feature 017: Shareable Meal Scans & Diet Style Profiles
 * Task: T015 - Generate OG meta tag HTML template
 * 
 * Creates HTML with Open Graph tags for social media previews.
 * Constitution Principle VII: Privacy by design - only includes data user chose to share
 */

import { config } from './config.js';

export interface OGMealData {
  shareId: string;
  imageUrl: string;
  totalProtein: number;
  confidence: string;
  proTip?: string | null;
  dietStyleName?: string | null;
  foodNames: string[];
  uploadedAt: string;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate social-friendly description from meal data
 */
function generateDescription(data: OGMealData): string {
  const foods = data.foodNames.slice(0, 3).join(', ');
  const moreCount = data.foodNames.length - 3;
  const foodSummary = moreCount > 0 ? `${foods} and ${moreCount} more` : foods;
  
  let description = `${data.totalProtein}g protein`;
  if (foodSummary) {
    description += ` from ${foodSummary}`;
  }
  if (data.dietStyleName && data.dietStyleName !== 'Balanced') {
    description += ` | ${data.dietStyleName} diet`;
  }
  
  return description;
}

/**
 * Generate full HTML page with OG tags for SSR
 * This page is served when bots crawl /meal/:shareId
 */
export function generateOGHtml(data: OGMealData): string {
  const baseUrl = config.frontendUrl || 'https://www.proteinlens.com';
  const shareUrl = `${baseUrl}/meal/${data.shareId}`;
  const title = `Meal Analysis - ${data.totalProtein}g Protein`;
  const description = generateDescription(data);
  const siteName = 'ProteinLens';
  
  // Format date for display
  const dateStr = new Date(data.uploadedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(data.imageUrl)}">
  <meta property="og:image:alt" content="Meal photo analyzed by ProteinLens">
  <meta property="og:site_name" content="${siteName}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapeHtml(shareUrl)}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${escapeHtml(data.imageUrl)}">
  
  <!-- Additional Meta -->
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${escapeHtml(shareUrl)}">
  
  <!-- Redirect for human visitors (bots get the meta tags, humans get redirected) -->
  <meta http-equiv="refresh" content="0; url=${escapeHtml(shareUrl)}">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      text-align: center;
      background: #f8fafc;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      padding: 24px;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    .protein {
      font-size: 48px;
      font-weight: 700;
      color: #2563eb;
      margin: 16px 0;
    }
    .protein span {
      font-size: 24px;
      color: #64748b;
    }
    .meta {
      color: #64748b;
      font-size: 14px;
    }
    .tip {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 12px 16px;
      margin: 16px 0;
      text-align: left;
      font-size: 14px;
    }
    .redirect {
      margin-top: 24px;
      color: #94a3b8;
      font-size: 14px;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="${escapeHtml(data.imageUrl)}" alt="Meal photo">
    <h1>Meal Analysis</h1>
    <div class="protein">${data.totalProtein}<span>g protein</span></div>
    <div class="meta">
      ${data.foodNames.slice(0, 3).map(f => escapeHtml(f)).join(' • ')}
      ${data.foodNames.length > 3 ? ` + ${data.foodNames.length - 3} more` : ''}
    </div>
    ${data.proTip ? `<div class="tip">💡 ${escapeHtml(data.proTip)}</div>` : ''}
    <div class="meta">${escapeHtml(dateStr)}${data.dietStyleName && data.dietStyleName !== 'Balanced' ? ` • ${escapeHtml(data.dietStyleName)}` : ''}</div>
  </div>
  <div class="redirect">
    Redirecting to <a href="${escapeHtml(shareUrl)}">ProteinLens</a>...
  </div>
</body>
</html>`;
}

/**
 * Generate minimal meta tags only (for embedding in SPA)
 */
export function generateOGMetaTags(data: OGMealData): string {
  const baseUrl = config.frontendUrl || 'https://www.proteinlens.com';
  const shareUrl = `${baseUrl}/meal/${data.shareId}`;
  const title = `Meal Analysis - ${data.totalProtein}g Protein`;
  const description = generateDescription(data);
  
  return `
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(data.imageUrl)}">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:image" content="${escapeHtml(data.imageUrl)}">
  `.trim();
}
