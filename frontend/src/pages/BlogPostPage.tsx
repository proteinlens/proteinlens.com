/**
 * Blog Post Page — XDA-style reading experience
 * 
 * Features:
 * - Reading progress bar
 * - Hero header with author, date, reading time
 * - Sticky sidebar table of contents (desktop) / collapsible (mobile)
 * - Mid-article CTA promotion
 * - Related articles cards
 * - Back to top button
 * - @tailwindcss/typography for proper prose styling
 * - Lazy-loaded blog post content (each post is its own chunk)
 */

import React, { useRef, useEffect, Suspense, lazy } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';
import { getBlogPostBySlug, categoryLabels, blogPosts } from '@/content/blog';
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { MidArticleCTA } from '@/components/blog/MidArticleCTA';
import { BackToTop } from '@/components/blog/BackToTop';
import { Skeleton } from '@/components/Skeleton';

// Lazy-load each blog post as its own chunk — only the visited post is downloaded
const postContentMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'how-to-track-macros-from-photo': lazy(() => import('@/content/blog/posts/how-to-track-macros-from-photo')),
  'photo-macro-tracking-vs-barcode-scanning': lazy(() => import('@/content/blog/posts/photo-macro-tracking-vs-barcode-scanning')),
  'best-lighting-angles-food-photo-macros': lazy(() => import('@/content/blog/posts/best-lighting-angles-food-photo-macros')),
  'estimate-portion-sizes-from-photos': lazy(() => import('@/content/blog/posts/estimate-portion-sizes-from-photos')),
  'common-ai-food-scan-mistakes': lazy(() => import('@/content/blog/posts/common-ai-food-scan-mistakes')),
  'track-restaurant-meals-unknown-ingredients': lazy(() => import('@/content/blog/posts/track-restaurant-meals-unknown-ingredients')),
  'how-much-protein-per-day': lazy(() => import('@/content/blog/posts/how-much-protein-per-day')),
  'protein-for-fat-loss': lazy(() => import('@/content/blog/posts/protein-for-fat-loss')),
  'protein-for-muscle-gain': lazy(() => import('@/content/blog/posts/protein-for-muscle-gain')),
  'high-protein-breakfast-ideas': lazy(() => import('@/content/blog/posts/high-protein-breakfast-ideas')),
  'what-are-macros': lazy(() => import('@/content/blog/posts/what-are-macros')),
  'how-to-calculate-macros-weight-loss': lazy(() => import('@/content/blog/posts/how-to-calculate-macros-weight-loss')),
  'calories-vs-macros': lazy(() => import('@/content/blog/posts/calories-vs-macros')),
  'what-is-tdee': lazy(() => import('@/content/blog/posts/what-is-tdee')),
  'weight-loss-plateau-reasons': lazy(() => import('@/content/blog/posts/weight-loss-plateau-reasons')),
  'track-macros-without-food-scale': lazy(() => import('@/content/blog/posts/track-macros-without-food-scale')),
  'track-macros-eating-out': lazy(() => import('@/content/blog/posts/track-macros-eating-out')),
  'macro-tracking-busy-people': lazy(() => import('@/content/blog/posts/macro-tracking-busy-people')),
  'proteinlens-vs-myfitnesspal': lazy(() => import('@/content/blog/posts/proteinlens-vs-myfitnesspal')),
  'proteinlens-vs-cronometer': lazy(() => import('@/content/blog/posts/proteinlens-vs-cronometer')),
  'proteinlens-vs-lose-it': lazy(() => import('@/content/blog/posts/proteinlens-vs-lose-it')),
  'best-macro-tracking-apps-2026': lazy(() => import('@/content/blog/posts/best-macro-tracking-apps-2026')),
  'how-ai-food-scanning-works': lazy(() => import('@/content/blog/posts/how-ai-food-scanning-works')),
  'why-you-quit-macro-tracking': lazy(() => import('@/content/blog/posts/why-you-quit-macro-tracking')),
  'scan-menu-for-protein': lazy(() => import('@/content/blog/posts/scan-menu-for-protein')),
  'protein-calculator-for-seniors': lazy(() => import('@/content/blog/posts/protein-calculator-for-seniors')),
  'fifty-grams-protein-breakfast': lazy(() => import('@/content/blog/posts/fifty-grams-protein-breakfast')),
  'photo-vs-manual-calorie-counting': lazy(() => import('@/content/blog/posts/photo-vs-manual-calorie-counting')),
  'high-protein-meal-prep': lazy(() => import('@/content/blog/posts/high-protein-meal-prep')),
  'how-much-protein-per-kg': lazy(() => import('@/content/blog/posts/how-much-protein-per-kg')),
  'ai-nutrition-tracking-accuracy': lazy(() => import('@/content/blog/posts/ai-nutrition-tracking-accuracy')),
  'best-macro-split-for-weight-loss': lazy(() => import('@/content/blog/posts/best-macro-split-for-weight-loss')),
  'track-macros-without-counting': lazy(() => import('@/content/blog/posts/track-macros-without-counting')),
  'protein-timing-does-it-matter': lazy(() => import('@/content/blog/posts/protein-timing-does-it-matter')),
  'how-to-read-nutrition-labels': lazy(() => import('@/content/blog/posts/how-to-read-nutrition-labels')),
  'vegan-protein-sources-complete': lazy(() => import('@/content/blog/posts/vegan-protein-sources-complete')),
  'protein-in-eggs': lazy(() => import('@/content/blog/posts/protein-in-eggs')),
  'protein-in-chicken-breast': lazy(() => import('@/content/blog/posts/protein-in-chicken-breast')),
  'protein-in-greek-yogurt': lazy(() => import('@/content/blog/posts/protein-in-greek-yogurt')),
  'calories-in-rice': lazy(() => import('@/content/blog/posts/calories-in-rice')),
  'calories-in-banana': lazy(() => import('@/content/blog/posts/calories-in-banana')),
  'protein-in-salmon': lazy(() => import('@/content/blog/posts/protein-in-salmon')),
  'protein-in-oats': lazy(() => import('@/content/blog/posts/protein-in-oats')),
  'intermittent-fasting-macros': lazy(() => import('@/content/blog/posts/intermittent-fasting-macros')),
  'how-many-calories-to-build-muscle': lazy(() => import('@/content/blog/posts/how-many-calories-to-build-muscle')),
  'what-is-bmr': lazy(() => import('@/content/blog/posts/what-is-bmr')),
  'protein-for-women': lazy(() => import('@/content/blog/posts/protein-for-women')),
  'pre-workout-nutrition': lazy(() => import('@/content/blog/posts/pre-workout-nutrition')),
  'track-macros-while-traveling': lazy(() => import('@/content/blog/posts/track-macros-while-traveling')),
  'protein-in-beans-and-lentils': lazy(() => import('@/content/blog/posts/protein-in-beans-and-lentils')),
  'how-to-count-macros-beginners': lazy(() => import('@/content/blog/posts/how-to-count-macros-beginners')),
  'protein-in-tofu': lazy(() => import('@/content/blog/posts/protein-in-tofu')),
  'protein-in-peanut-butter': lazy(() => import('@/content/blog/posts/protein-in-peanut-butter')),
  'protein-powder-comparison': lazy(() => import('@/content/blog/posts/protein-powder-comparison')),
  'calories-in-pasta': lazy(() => import('@/content/blog/posts/calories-in-pasta')),
  'calories-in-avocado': lazy(() => import('@/content/blog/posts/calories-in-avocado')),
  'what-is-tdee': lazy(() => import('@/content/blog/posts/what-is-tdee')),
  'weight-loss-plateau-reasons': lazy(() => import('@/content/blog/posts/weight-loss-plateau-reasons')),
  'protein-in-cottage-cheese-and-dairy': lazy(() => import('@/content/blog/posts/protein-in-cottage-cheese-and-dairy')),
  'calories-in-alcohol': lazy(() => import('@/content/blog/posts/calories-in-alcohol')),
  'creatine-and-protein-guide': lazy(() => import('@/content/blog/posts/creatine-and-protein-guide')),
};

/** Skeleton placeholder while blog post content loads */
function BlogPostSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-3/4 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <div className="h-6" />
      <Skeleton className="h-6 w-2/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-4/5 rounded" />
    </div>
  );
}

/**
 * Injects a mid-article CTA after the 3rd <h2> in the rendered content.
 */
function ContentWithCTA({ PostContent }: { PostContent: React.ComponentType }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const headings = wrapperRef.current.querySelectorAll(':scope > h2');
    // Insert CTA after the 3rd h2 (or 2nd if fewer)
    const targetIdx = headings.length >= 3 ? 2 : headings.length >= 2 ? 1 : -1;
    if (targetIdx < 0) return;
    const target = headings[targetIdx];
    // Find the next sibling that isn't an h2 to insert after the section content
    let insertBefore = target.nextElementSibling;
    // Walk past paragraph/list content until next h2 or end
    while (insertBefore && insertBefore.tagName !== 'H2') {
      insertBefore = insertBefore.nextElementSibling;
    }
    // Check if we already injected
    if (wrapperRef.current.querySelector('[data-mid-cta]')) return;
    const ctaContainer = document.createElement('div');
    ctaContainer.setAttribute('data-mid-cta', 'true');
    wrapperRef.current.insertBefore(ctaContainer, insertBefore);
    // Render React into it
    import('react-dom/client').then(({ createRoot }) => {
      createRoot(ctaContainer).render(<MidArticleCTA />);
    });
  }, []);

  return (
    <div ref={wrapperRef} className="blog-content">
      <Suspense fallback={<BlogPostSkeleton />}>
        <PostContent />
      </Suspense>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const post = getBlogPostBySlug(slug);
  const PostContent = postContentMap[slug];

  if (!post || !PostContent) {
    return <Navigate to="/blog" replace />;
  }

  // Related posts: same category first, then cross-category fill
  const sameCat = blogPosts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);
  const fill = sameCat.length < 3
    ? blogPosts.filter(p => p.category !== post.category && p.slug !== post.slug).slice(0, 3 - sameCat.length)
    : [];
  const relatedPosts = [...sameCat, ...fill];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'ProteinLens',
      url: 'https://www.proteinlens.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ProteinLens',
      url: 'https://www.proteinlens.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.proteinlens.com/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.proteinlens.com/blog/${post.slug}`,
    },
  };

  const publishDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const updateDate = new Date(post.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.description}
        canonical={`https://www.proteinlens.com/blog/${post.slug}`}
        keywords={post.keywords}
        structuredData={structuredData}
      />
      <ReadingProgressBar />
      <BackToTop />

      <article className="min-h-screen">
        {/* ── Hero Header ── */}
        <header className="bg-gradient-to-b from-primary-50 to-background border-b border-border">
          <div className="max-w-3xl mx-auto px-4 pt-10 pb-8">
            {/* Breadcrumb */}
            <nav className="mb-5 text-sm text-muted-foreground flex items-center gap-1.5">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>›</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>›</span>
              <span className="text-foreground/70">{categoryLabels[post.category]}</span>
            </nav>

            {/* Category badge */}
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
              {categoryLabels[post.category]}
            </span>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-foreground leading-tight mb-4"
            >
              {post.title}
            </motion.h1>

            {/* Subtitle / description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl"
            >
              {post.description}
            </motion.p>

            {/* Meta row: author · date · reading time */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  PL
                </div>
                <span className="font-medium text-foreground">ProteinLens Team</span>
              </div>
              <span className="hidden sm:inline text-border">·</span>
              <time dateTime={post.publishedAt}>Published {publishDate}</time>
              {post.publishedAt !== post.updatedAt && (
                <>
                  <span className="hidden sm:inline text-border">·</span>
                  <span>Updated {updateDate}</span>
                </>
              )}
              <span className="hidden sm:inline text-border">·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* ── Body: TOC sidebar + Content ── */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="xl:grid xl:grid-cols-[1fr_240px] xl:gap-12">
            {/* Main content column */}
            <div className="max-w-3xl">
              {/* Mobile TOC */}
              <TableOfContents contentRef={contentRef} />

              {/* Article content with typography */}
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="
                  prose prose-lg prose-slate max-w-none
                  prose-headings:font-bold prose-headings:text-foreground prose-headings:scroll-mt-20
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-muted-foreground prose-h3:font-semibold prose-h3:italic
                  prose-p:text-foreground/90 prose-p:leading-[1.8] prose-p:mb-5
                  prose-li:text-foreground/90 prose-li:leading-[1.7]
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-4 prose-ol:my-4
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-l-primary prose-blockquote:bg-primary-50/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                "
              >
                <ContentWithCTA PostContent={PostContent} />
              </motion.div>

              {/* ── Bottom CTA ── */}
              <div className="mt-14 bg-gradient-to-r from-primary-50 to-background border border-primary/20 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Track macros the easy way
                </h2>
                <p className="text-muted-foreground mb-5 max-w-md mx-auto">
                  Snap a photo of your meal and get instant protein, carbs, fat &amp; calorie breakdowns. No manual logging.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                >
                  📸 Try ProteinLens Free
                </Link>
              </div>

              {/* ── Related Articles ── */}
              {relatedPosts.length > 0 && (
                <section className="mt-14">
                  <h2 className="text-xl font-bold text-foreground mb-6">Related Articles</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp.slug}
                        to={`/blog/${rp.slug}`}
                        className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
                      >
                        {/* Color accent top bar */}
                        <div className="h-1 bg-primary/30 group-hover:bg-primary transition-colors" />
                        <div className="p-5">
                          <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full mb-3">
                            {categoryLabels[rp.category]}
                          </span>
                          <h3 className="font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                            {rp.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {rp.description}
                          </p>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{rp.readingTime} min read</span>
                            <span>·</span>
                            <span>{new Date(rp.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Back to Blog */}
              <div className="mt-10 text-center">
                <Link to="/blog" className="text-primary hover:underline font-medium">
                  ← Back to all articles
                </Link>
              </div>
            </div>

            {/* Desktop TOC sidebar */}
            <aside className="hidden xl:block">
              <TableOfContents contentRef={contentRef} />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
