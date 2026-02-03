/**
 * Guides Index Page
 * 
 * Hub page for nutrition guides and educational content.
 * Target keywords: nutrition guides, macro tracking tips, protein guide
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';

const guides = [
  {
    slug: 'how-to-track-macros',
    title: 'How to Track Macros: A Beginner\'s Guide',
    description: 'Learn the fundamentals of macro tracking, from calculating your targets to logging your food.',
    category: 'Getting Started',
    readTime: '8 min',
    icon: '📊',
    comingSoon: true,
  },
  {
    slug: 'protein-requirements',
    title: 'How Much Protein Do You Really Need?',
    description: 'Evidence-based guide to protein intake for different goals: muscle building, weight loss, and general health.',
    category: 'Nutrition',
    readTime: '6 min',
    icon: '🥩',
    comingSoon: true,
  },
  {
    slug: 'photo-vs-manual-tracking',
    title: 'Photo Tracking vs Manual Logging',
    description: 'Compare AI-powered photo tracking with traditional manual logging. Pros, cons, and when to use each.',
    category: 'Tracking Methods',
    readTime: '5 min',
    icon: '📸',
    comingSoon: true,
  },
  {
    slug: 'high-protein-meal-prep',
    title: 'High-Protein Meal Prep Guide',
    description: 'Simple meal prep strategies to hit your protein goals. Includes sample meals and shopping tips.',
    category: 'Meal Planning',
    readTime: '10 min',
    icon: '🥗',
    comingSoon: true,
  },
  {
    slug: 'common-tracking-mistakes',
    title: '5 Common Macro Tracking Mistakes',
    description: 'Avoid these pitfalls that derail most people\'s nutrition tracking efforts.',
    category: 'Tips',
    readTime: '4 min',
    icon: '⚠️',
    comingSoon: true,
  },
  {
    slug: 'understanding-calories',
    title: 'Understanding Calories: Quality vs Quantity',
    description: 'Why the type of calories matters, and how to balance nutrition with calorie targets.',
    category: 'Nutrition',
    readTime: '7 min',
    icon: '🔬',
    comingSoon: true,
  },
];

const categories = [...new Set(guides.map(g => g.category))];

export default function GuidesIndexPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ProteinLens Nutrition Guides',
    description: 'Educational guides on macro tracking, protein, and nutrition',
    url: 'https://www.proteinlens.com/guides',
  };

  return (
    <>
      <SEOHead
        title="Nutrition Guides - Macro Tracking Tips"
        description="Learn macro tracking, protein targets, meal planning, and nutrition fundamentals. Free guides from ProteinLens."
        canonical="https://www.proteinlens.com/guides"
        keywords="nutrition guides, macro tracking tips, protein guide, how to track macros, nutrition education"
        structuredData={structuredData}
      />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <span className="text-3xl">📚</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Nutrition Guides</h1>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Learn the fundamentals of macro tracking, protein optimization, and sustainable nutrition habits.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              All Guides
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {guides.map((guide, index) => (
              <motion.article
                key={guide.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors relative"
              >
                {guide.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {guide.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      {guide.category}
                    </span>
                    <h2 className="text-lg font-bold text-foreground mt-1 mb-2">
                      {guide.comingSoon ? (
                        guide.title
                      ) : (
                        <Link to={`/guides/${guide.slug}`} className="hover:text-primary transition-colors">
                          {guide.title}
                        </Link>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📖 {guide.readTime} read</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Methodology Link */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                🔬
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  How ProteinLens AI Works
                </h2>
                <p className="text-muted-foreground mb-4">
                  Curious about our methodology? Learn how we estimate macros from food photos, our data sources, and accuracy notes.
                </p>
                <Link
                  to="/methodology"
                  className="inline-flex px-6 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90"
                >
                  Read Our Methodology →
                </Link>
              </div>
            </div>
          </div>

          {/* Calculator Links */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Calculators & Tools</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/protein-calculator" className="px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80">
                🎯 Protein Calculator
              </Link>
              <Link to="/macro-calculator" className="px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80">
                🧮 Macro Calculator
              </Link>
              <Link to="/tdee-calculator" className="px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80">
                🔥 TDEE Calculator
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Ready to put your knowledge into practice?
            </p>
            <Link
              to="/"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl"
            >
              📸 Try ProteinLens Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
