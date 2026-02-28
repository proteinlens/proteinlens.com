/**
 * Blog Post Page Component
 * 
 * Dynamic blog post renderer with SEO optimization.
 * Loads content based on slug from URL params.
 */

import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';
import { getBlogPostBySlug, categoryLabels, blogPosts } from '@/content/blog';

// Import all blog post content components
import HowToTrackMacrosFromPhoto from '@/content/blog/posts/how-to-track-macros-from-photo';
import PhotoMacroTrackingVsBarcodeScanning from '@/content/blog/posts/photo-macro-tracking-vs-barcode-scanning';
import BestLightingAngles from '@/content/blog/posts/best-lighting-angles-food-photo-macros';
import EstimatePortionSizes from '@/content/blog/posts/estimate-portion-sizes-from-photos';
import CommonAIFoodScanMistakes from '@/content/blog/posts/common-ai-food-scan-mistakes';
import TrackRestaurantMeals from '@/content/blog/posts/track-restaurant-meals-unknown-ingredients';
import HowMuchProteinPerDay from '@/content/blog/posts/how-much-protein-per-day';
import ProteinForFatLoss from '@/content/blog/posts/protein-for-fat-loss';
import ProteinForMuscleGain from '@/content/blog/posts/protein-for-muscle-gain';
import HighProteinBreakfastIdeas from '@/content/blog/posts/high-protein-breakfast-ideas';
import WhatAreMacros from '@/content/blog/posts/what-are-macros';
import HowToCalculateMacrosWeightLoss from '@/content/blog/posts/how-to-calculate-macros-weight-loss';
import CaloriesVsMacros from '@/content/blog/posts/calories-vs-macros';
import WhatIsTDEE from '@/content/blog/posts/what-is-tdee';
import WeightLossPlateau from '@/content/blog/posts/weight-loss-plateau-reasons';
import TrackMacrosWithoutScale from '@/content/blog/posts/track-macros-without-food-scale';
import TrackMacrosEatingOut from '@/content/blog/posts/track-macros-eating-out';
import MacroTrackingBusyPeople from '@/content/blog/posts/macro-tracking-busy-people';
import ProteinLensVsMyFitnessPal from '@/content/blog/posts/proteinlens-vs-myfitnesspal';
import ProteinLensVsCronometer from '@/content/blog/posts/proteinlens-vs-cronometer';
import ProteinLensVsLoseIt from '@/content/blog/posts/proteinlens-vs-lose-it';

// Map slugs to content components
const postContentMap: Record<string, React.ComponentType> = {
  'how-to-track-macros-from-photo': HowToTrackMacrosFromPhoto,
  'photo-macro-tracking-vs-barcode-scanning': PhotoMacroTrackingVsBarcodeScanning,
  'best-lighting-angles-food-photo-macros': BestLightingAngles,
  'estimate-portion-sizes-from-photos': EstimatePortionSizes,
  'common-ai-food-scan-mistakes': CommonAIFoodScanMistakes,
  'track-restaurant-meals-unknown-ingredients': TrackRestaurantMeals,
  'how-much-protein-per-day': HowMuchProteinPerDay,
  'protein-for-fat-loss': ProteinForFatLoss,
  'protein-for-muscle-gain': ProteinForMuscleGain,
  'high-protein-breakfast-ideas': HighProteinBreakfastIdeas,
  'what-are-macros': WhatAreMacros,
  'how-to-calculate-macros-weight-loss': HowToCalculateMacrosWeightLoss,
  'calories-vs-macros': CaloriesVsMacros,
  'what-is-tdee': WhatIsTDEE,
  'weight-loss-plateau-reasons': WeightLossPlateau,
  'track-macros-without-food-scale': TrackMacrosWithoutScale,
  'track-macros-eating-out': TrackMacrosEatingOut,
  'macro-tracking-busy-people': MacroTrackingBusyPeople,
  'proteinlens-vs-myfitnesspal': ProteinLensVsMyFitnessPal,
  'proteinlens-vs-cronometer': ProteinLensVsCronometer,
  'proteinlens-vs-lose-it': ProteinLensVsLoseIt,
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }
  
  const post = getBlogPostBySlug(slug);
  const PostContent = postContentMap[slug];
  
  if (!post || !PostContent) {
    return <Navigate to="/blog" replace />;
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

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

  return (
    <>
      <SEOHead
        title={`${post.title} | ProteinLens Blog`}
        description={post.description}
        canonical={`https://www.proteinlens.com/blog/${post.slug}`}
        keywords={post.keywords}
        structuredData={structuredData}
      />

      <article className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span className="mx-2">›</span>
            <span>{categoryLabels[post.category]}</span>
          </nav>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {categoryLabels[post.category]}
              </span>
              <span className="text-sm text-muted-foreground">{post.readingTime} min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {post.description}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Updated {new Date(post.updatedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <PostContent />
          </motion.div>

          {/* CTA Box */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Track macros the easy way
            </h2>
            <p className="text-muted-foreground mb-4">
              Snap a photo of your meal, get instant macros. No manual logging, no barcode scanning.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              📸 Try ProteinLens Free
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Related Articles</h2>
              <div className="grid gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    to={`/blog/${relatedPost.slug}`}
                    className="block bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground mb-1">{relatedPost.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="mt-8 text-center">
            <Link
              to="/blog"
              className="text-primary hover:underline"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
