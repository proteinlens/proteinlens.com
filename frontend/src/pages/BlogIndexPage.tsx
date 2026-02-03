/**
 * Blog Index Page
 * 
 * Lists all blog posts with filtering by category.
 * SEO optimized for "macro tracking blog", "protein tracking tips", etc.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';
import { blogPosts, categoryLabels, getFeaturedPosts, type BlogPost } from '@/content/blog';

const categories = ['all', 'ai-tracking', 'protein-goals', 'macro-basics', 'tdee-calories', 'real-life-tracking'] as const;

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const featuredPosts = getFeaturedPosts();
  
  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ProteinLens Blog',
    description: 'Macro tracking tips, protein guides, and nutrition advice from ProteinLens',
    url: 'https://www.proteinlens.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'ProteinLens',
      url: 'https://www.proteinlens.com',
    },
  };

  return (
    <>
      <SEOHead
        title="Macro Tracking Blog - Protein Tips & Nutrition Guides | ProteinLens"
        description="Learn macro tracking, hit your protein goals, and simplify nutrition. Expert guides on AI food tracking, protein intake, TDEE, and practical meal planning."
        canonical="https://www.proteinlens.com/blog"
        keywords="macro tracking blog, protein tips, nutrition guides, macro counting tips, protein tracking, TDEE guide, meal planning"
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Macro Tracking Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert guides on AI food tracking, hitting your protein goals, and making nutrition 
              simple. No bro-science, just practical advice that works.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category === 'all' ? 'All Posts' : categoryLabels[category as BlogPost['category']]}
              </button>
            ))}
          </div>

          {/* Featured Posts (only show on "all" view) */}
          {activeCategory === 'all' && featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-4">Featured Guides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredPosts.slice(0, 2).map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="block bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-colors"
                  >
                    <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full mb-3">
                      Featured
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.readingTime} min read</span>
                      <span>•</span>
                      <span>{categoryLabels[post.category]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Post List */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              {activeCategory === 'all' ? 'All Posts' : categoryLabels[activeCategory as BlogPost['category']]}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'})
              </span>
            </h2>
            
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded-full">
                            {categoryLabels[post.category]}
                          </span>
                          <span>{post.readingTime} min read</span>
                          <span>•</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                      <span className="text-primary text-xl">→</span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Ready to simplify your macro tracking?
            </h2>
            <p className="text-muted-foreground mb-4">
              Snap a photo, get instant macros. No manual logging required.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              📸 Try ProteinLens Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
