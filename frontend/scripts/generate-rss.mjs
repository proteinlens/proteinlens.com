/**
 * Generate RSS feed from blog index at build time.
 * Run after vite build: node scripts/generate-rss.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const BASE_URL = 'https://www.proteinlens.com';

// Parse blog posts from index.ts (simple regex extraction)
const indexSrc = readFileSync('src/content/blog/index.ts', 'utf8');
const postRegex = /\{\s*slug:\s*'([^']+)',\s*title:\s*'([^']*)',\s*description:\s*'([^']*)',[\s\S]*?category:\s*'([^']*)',\s*publishedAt:\s*'([^']*)',/g;

const posts = [];
let m;
while ((m = postRegex.exec(indexSrc)) !== null) {
  posts.push({
    slug: m[1],
    title: m[2].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    description: m[3].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;'),
    category: m[4],
    publishedAt: m[5],
  });
}

// Sort by date descending
posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

const now = new Date().toUTCString();

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ProteinLens Blog</title>
    <description>AI-powered macro nutrition tracking — guides, tips, and comparisons for protein tracking, macro counting, and healthy eating.</description>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <image>
      <url>${BASE_URL}/favicon.svg</url>
      <title>ProteinLens Blog</title>
      <link>${BASE_URL}/blog</link>
    </image>
${posts.map(p => `    <item>
      <title>${p.title}</title>
      <description>${p.description}</description>
      <link>${BASE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${p.category}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

writeFileSync('dist/blog/rss.xml', rss);
console.log(`✅ RSS feed generated: dist/blog/rss.xml (${posts.length} posts)`);
