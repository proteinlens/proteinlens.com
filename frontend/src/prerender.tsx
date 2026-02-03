/**
 * Prerender Entry Point
 * 
 * This file is used by vite-prerender-plugin to generate static HTML
 * for public routes at build time, enabling proper SEO crawling.
 * 
 * NOTE: This is a minimal prerender that generates SEO head elements
 * without trying to render the full React app, avoiding SSR issues
 * with client-side routing libraries.
 */

import { getSeoForUrl, PUBLIC_ROUTES } from './seo/seoConfig';

// Re-export routes for the plugin
export { PUBLIC_ROUTES };

interface PrerenderData {
  url: string;
}

interface HeadElement {
  type: string;
  props: Record<string, unknown>;
}

interface PrerenderResult {
  html: string;
  head: {
    lang: string;
    title: string;
    elements: Set<HeadElement>;
  };
}

/**
 * Prerender function called by vite-prerender-plugin
 * 
 * This generates a minimal HTML structure with proper SEO meta tags.
 * The full app will hydrate on the client side.
 */
export async function prerender(data: PrerenderData): Promise<PrerenderResult> {
  const url = data.url || '/';
  const seo = getSeoForUrl(url);
  
  // Generate minimal content for the page (client will hydrate)
  // This gives crawlers something meaningful to index
  const pageTitle = seo.title.split(' | ')[0] || seo.title;
  const appHtml = `
    <div class="prerender-placeholder" style="display:none">
      <h1>${pageTitle}</h1>
      <p>${seo.description}</p>
    </div>
  `;

  // Build head elements from SEO config
  const headElements = new Set<HeadElement>([
    // Meta description
    { type: 'meta', props: { name: 'description', content: seo.description } },
    
    // Canonical URL
    { type: 'link', props: { rel: 'canonical', href: seo.canonical } },
    
    // Keywords (if provided)
    ...(seo.keywords ? [{ type: 'meta', props: { name: 'keywords', content: seo.keywords } }] : []),
    
    // Robots
    { type: 'meta', props: { name: 'robots', content: seo.noindex ? 'noindex, nofollow' : 'index, follow' } },
    
    // Open Graph
    { type: 'meta', props: { property: 'og:type', content: seo.ogType || 'website' } },
    { type: 'meta', props: { property: 'og:url', content: seo.canonical } },
    { type: 'meta', props: { property: 'og:title', content: seo.ogTitle || seo.title } },
    { type: 'meta', props: { property: 'og:description', content: seo.ogDescription || seo.description } },
    { type: 'meta', props: { property: 'og:image', content: seo.ogImage || 'https://www.proteinlens.com/og-image.svg' } },
    { type: 'meta', props: { property: 'og:site_name', content: 'ProteinLens' } },
    
    // Twitter Card
    { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
    { type: 'meta', props: { name: 'twitter:url', content: seo.canonical } },
    { type: 'meta', props: { name: 'twitter:title', content: seo.ogTitle || seo.title } },
    { type: 'meta', props: { name: 'twitter:description', content: seo.ogDescription || seo.description } },
    { type: 'meta', props: { name: 'twitter:image', content: seo.ogImage || 'https://www.proteinlens.com/og-image.svg' } },
  ]);

  // Add JSON-LD structured data if provided
  if (seo.jsonLd) {
    const jsonLdArray = Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd];
    jsonLdArray.forEach((schema) => {
      headElements.add({
        type: 'script',
        props: {
          type: 'application/ld+json',
          children: JSON.stringify(schema),
        },
      });
    });
  }

  return {
    html: appHtml,
    head: {
      lang: 'en',
      title: seo.title,
      elements: headElements,
    },
  };
}
