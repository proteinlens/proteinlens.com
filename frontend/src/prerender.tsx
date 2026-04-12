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

  // If fewer than 3 same-category posts, fill with other categories
  const fillPosts = relatedPosts.length < 3
    ? blogPosts
        .filter(p => p.slug !== slug && p.category !== post.category && !relatedPosts.includes(p))
        .slice(0, 3 - relatedPosts.length)
    : [];
  const allRelated = [...relatedPosts, ...fillPosts];

  const relatedHtml = allRelated.length > 0
    ? `<section><h2>Related Articles</h2><ul>${allRelated.map(p =>
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
      <h2>About This Article</h2>
      <p>This article covers essential strategies and practical advice related to ${keywords.slice(0, 3).join(', ')}. Whether you are a beginner starting your nutrition journey or an experienced tracker looking for better tools, this guide provides actionable insights you can apply today.</p>
      <h2>Why Macro Tracking Matters</h2>
      <p>Tracking macronutrients — protein, carbohydrates, and fat — gives you a clearer picture of your nutrition than counting calories alone. Understanding your macro balance helps you make smarter food choices, optimize body composition, and reach your fitness goals faster. Research consistently shows that adequate protein intake supports muscle recovery, satiety, and metabolic health.</p>
      <h2>How ProteinLens Makes It Easier</h2>
      <p>ProteinLens is an AI-powered macro nutrition tracker. Snap a photo of your meal and get instant breakdowns of protein, carbs, fat, and calories. No manual searching through databases, no barcode scanning required — just point your camera, take a photo, and get your macros in seconds. The AI analyzes portion sizes, identifies individual food items, and calculates nutritional values automatically.</p>
      <p>Whether you're tracking macros for weight loss, muscle gain, or general health, ProteinLens makes the process fast and frictionless. Start tracking for free at <a href="https://www.proteinlens.com">proteinlens.com</a>. No credit card required.</p>
      ${relatedHtml}
      <nav>
        <p>Category: ${post.category.replace(/-/g, ' ')} · <a href="/blog">Browse all articles</a> · <a href="/pricing">View pricing</a> · <a href="/features">Features</a> · <a href="/how-it-works">How it works</a></p>
      </nav>
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
        <h2>AI-Powered Macro Tracking</h2>
        <p>ProteinLens uses advanced artificial intelligence to analyze food photos and provide instant macronutrient breakdowns. Simply take a photo of your meal, and our AI identifies the foods on your plate, estimates portion sizes, and calculates protein, carbohydrates, fat, and total calories. No manual database searches, no barcode scanning — just snap and track.</p>
        <h2>Why Choose ProteinLens</h2>
        <p>Traditional nutrition trackers require tedious manual entry or barcode scanning. ProteinLens eliminates that friction with AI photo analysis. Whether you are eating at home, at a restaurant, or on the go, tracking your macros takes seconds. Our users consistently report spending less time logging meals and more time enjoying their food while staying on track with their nutrition goals.</p>
        <h2>Free Tools & Resources</h2>
        <p>ProteinLens offers free calculators for protein needs, macro splits, TDEE, and daily calories. Combined with our blog covering macro tracking tips, protein strategies, and weight management advice, you have everything you need to succeed. Start tracking for free — no credit card required.</p>
        <h2>Built for Real Life</h2>
        <p>Most macro trackers fail because they demand too much effort. ProteinLens was designed for people who want results without obsession. The AI handles the hard work of food identification, portion estimation, and nutritional calculation. You just eat, snap, and stay informed. Whether your goal is weight loss, muscle gain, athletic performance, or simply understanding what you eat, ProteinLens adapts to your needs and keeps things simple.</p>
        <p>Join thousands of users who have simplified their nutrition tracking. Available on web and mobile, ProteinLens works anywhere you eat. Get started in seconds with no sign-up required for your first scans.</p>
        <nav>
          <a href="/features">Features</a> ·
          <a href="/pricing">Pricing</a> ·
          <a href="/blog">Blog</a> ·
          <a href="/how-it-works">How It Works</a> ·
          <a href="/about">About</a> ·
          <a href="/methodology">Methodology</a> ·
          <a href="/guides">Guides</a> ·
          <a href="/protein-calculator">Protein Calculator</a> ·
          <a href="/macro-calculator">Macro Calculator</a> ·
          <a href="/tdee-calculator">TDEE Calculator</a> ·
          <a href="/calorie-calculator">Calorie Calculator</a> ·
          <a href="/privacy">Privacy Policy</a> ·
          <a href="/terms">Terms of Service</a>
        </nav>
        <section>
          <h2>Popular Articles</h2>
          <ul>
            <li><a href="/blog/proteinlens-vs-myfitnesspal">ProteinLens vs MyFitnessPal</a></li>
            <li><a href="/blog/how-ai-food-scanning-works">How AI Food Scanning Works</a></li>
            <li><a href="/blog/best-macro-tracking-apps-2026">Best Macro Tracking Apps 2026</a></li>
            <li><a href="/blog/common-ai-food-scan-mistakes">Common AI Food Scan Mistakes</a></li>
            <li><a href="/blog/proteinlens-vs-cronometer">ProteinLens vs Cronometer</a></li>
            <li><a href="/blog/proteinlens-vs-lose-it">ProteinLens vs Lose It</a></li>
            <li><a href="/blog/track-restaurant-meals-unknown-ingredients">Track Restaurant Meals</a></li>
          </ul>
        </section>
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
    { type: 'meta', props: { property: 'og:image', content: seo.ogImage || 'https://www.proteinlens.com/og-image.png' } },
    { type: 'meta', props: { property: 'og:site_name', content: 'ProteinLens' } },
    
    // Twitter Card
    { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
    { type: 'meta', props: { name: 'twitter:url', content: seo.canonical } },
    { type: 'meta', props: { name: 'twitter:title', content: seo.ogTitle || seo.title } },
    { type: 'meta', props: { name: 'twitter:description', content: seo.ogDescription || seo.description } },
    { type: 'meta', props: { name: 'twitter:image', content: seo.ogImage || 'https://www.proteinlens.com/og-image.png' } },
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

  // Add BlogPosting schema for blog posts
  if (isBlogPost) {
    const post = blogPosts.find(p => p.slug === slug);
    if (post) {
      const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: {
          '@type': 'Organization',
          name: 'ProteinLens',
          url: 'https://www.proteinlens.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'ProteinLens',
          url: 'https://www.proteinlens.com',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': seo.canonical,
        },
        keywords: post.keywords,
      };
      headElements.add({
        type: 'script',
        props: {
          type: 'application/ld+json',
          children: JSON.stringify(blogSchema),
        },
      });
    }
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
