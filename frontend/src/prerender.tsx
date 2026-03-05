/**
 * Prerender Entry Point
 * 
 * This file is used by vite-prerender-plugin to generate static HTML
 * for public routes at build time, enabling proper SEO crawling.
 */

import { getSeoForUrl, PUBLIC_ROUTES } from './seo/seoConfig';
import { blogPosts } from './content/blog/index';

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
 * Generate meaningful placeholder content for blog posts
 * so crawlers see 300+ words even without JS execution.
 */
function getBlogContent(slug: string): string {
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) return '';

  // Generate a rich text block from metadata + related posts
  const relatedPosts = blogPosts
    .filter(p => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  const relatedHtml = relatedPosts.length > 0
    ? `<section><h2>Related Articles</h2><ul>${relatedPosts.map(p =>
        `<li><a href="/blog/${p.slug}">${p.title}</a> — ${p.description}</li>`
      ).join('')}</ul></section>`
    : '';

  // Build keyword-rich intro paragraphs
  const keywords = post.keywords.split(',').map(k => k.trim());
  const keywordText = keywords.length > 3
    ? `<p>Topics covered: ${keywords.join(', ')}.</p>`
    : '';

  return `
    <article>
      <h1>${post.title}</h1>
      <p>${post.description}</p>
      ${keywordText}
      <p>Published ${post.publishedAt} · ${post.readingTime} min read</p>
      <p>ProteinLens is an AI-powered macro nutrition tracker. Snap a photo of your meal and get instant breakdowns of protein, carbs, fat, and calories. No manual searching, no barcode scanning — just point, shoot, and track.</p>
      <p>Whether you're tracking macros for weight loss, muscle gain, or general health, ProteinLens makes it fast and easy. Try it free at <a href="https://www.proteinlens.com">proteinlens.com</a>.</p>
      ${relatedHtml}
      <p>Category: ${post.category.replace(/-/g, ' ')} · <a href="/blog">Browse all articles</a> · <a href="/pricing">View pricing</a></p>
    </article>
  `;
}

/**
 * Prerender function called by vite-prerender-plugin
 */
export async function prerender(data: PrerenderData): Promise<PrerenderResult> {
  const url = data.url || '/';
  const seo = getSeoForUrl(url);
  
  const slug = url.startsWith('/blog/') ? url.split('/').pop() || '' : '';
  const isBlogPost = url.startsWith('/blog/') && slug.length > 0;

  // Generate content based on page type
  let appHtml: string;
  if (isBlogPost) {
    appHtml = getBlogContent(slug);
  } else {
    const pageTitle = seo.title.split(' | ')[0] || seo.title;
    appHtml = `
      <div>
        <h1>${pageTitle}</h1>
        <p>${seo.description}</p>
        <p>ProteinLens is an AI-powered macro nutrition tracker. Upload a food photo and get instant protein, carbs, fat, and calorie breakdowns. Free to try — no account required for your first scans.</p>
        <nav>
          <a href="/features">Features</a> ·
          <a href="/pricing">Pricing</a> ·
          <a href="/blog">Blog</a> ·
          <a href="/how-it-works">How It Works</a>
        </nav>
      </div>
    `;
  }

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
