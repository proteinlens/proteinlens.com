/**
 * Methodology Page
 * 
 * Explains how ProteinLens AI estimates macros, data sources, and accuracy notes.
 * This is a citation-worthy page for backlinks.
 * Target keywords: ProteinLens accuracy, AI food recognition, macro estimation methodology
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateOrganizationSchema } from '@/components/seo/SEOHead';

export default function MethodologyPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'ProteinLens Methodology: How We Estimate Macros from Food Photos',
    description: 'Technical explanation of how ProteinLens AI estimates macronutrients from food photos, including data sources, accuracy, and limitations.',
    author: generateOrganizationSchema(),
    datePublished: '2026-02-01',
    dateModified: '2026-02-03',
  };

  return (
    <>
      <SEOHead
        title="Methodology - How ProteinLens AI Works"
        description="Learn how ProteinLens estimates macros from food photos. Our methodology, data sources, accuracy notes, and limitations explained transparently."
        canonical="https://www.proteinlens.com/methodology"
        keywords="ProteinLens accuracy, AI food recognition, macro estimation methodology, nutrition AI explained, food photo analysis"
        structuredData={structuredData}
      />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <span className="text-3xl">🔬</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Methodology</h1>
            <p className="text-muted-foreground mt-2">
              How ProteinLens Estimates Macronutrients from Food Photos
            </p>
          </motion.div>

          {/* Content */}
          <article className="prose prose-invert max-w-none">
            {/* Overview */}
            <section className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                ProteinLens uses AI, computer vision and large language models to 
                analyze food photos and estimate macronutrient content. This document explains our approach, 
                data sources, accuracy expectations, and known limitations.
              </p>
            </section>

            {/* How It Works */}
            <section className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">How It Works</h2>
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <div>
                    <strong className="text-foreground">Image Analysis:</strong> Your food photo is sent to 
                    AI Vision, which identifies individual food items in the image.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <div>
                    <strong className="text-foreground">Portion Estimation:</strong> The model estimates 
                    portion sizes based on visual cues (plate size, food proportions, common serving sizes).
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <div>
                    <strong className="text-foreground">Nutritional Lookup:</strong> Identified foods are 
                    matched against nutritional data to calculate protein, carbohydrates, fat, and calories.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <div>
                    <strong className="text-foreground">Confidence Assessment:</strong> The system provides 
                    a confidence level (high/medium/low) based on image clarity and food recognizability.
                  </div>
                </li>
              </ol>
            </section>

            {/* Data Sources */}
            <section className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Data Sources</h2>
              <p className="text-muted-foreground mb-4">
                Our nutritional estimates are informed by established databases:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <div>
                    <strong className="text-foreground">USDA FoodData Central</strong> — The primary source 
                    for food composition data in the United States. 
                    <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      fdc.nal.usda.gov
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <div>
                    <strong className="text-foreground">Nutrition labels</strong> — For branded/packaged 
                    foods, manufacturer-provided nutrition facts are used when available.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <div>
                    <strong className="text-foreground">Standard portion sizes</strong> — Based on USDA 
                    standard reference portions and common serving sizes.
                  </div>
                </li>
              </ul>
            </section>

            {/* Accuracy */}
            <section className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Accuracy & Expectations</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Expected accuracy range:</strong> For typical meals 
                  with clear photos, expect estimates within <strong className="text-primary">±15-25%</strong> of 
                  actual values. This is comparable to human estimation accuracy for most foods.
                </p>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium text-foreground mb-2">Factors that improve accuracy:</p>
                  <ul className="text-sm space-y-1">
                    <li>✓ Clear, well-lit photos</li>
                    <li>✓ Foods visible and not hidden/stacked</li>
                    <li>✓ Common, recognizable foods</li>
                    <li>✓ Standard portion sizes</li>
                    <li>✓ Reference objects in frame (plate, utensils)</li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium text-foreground mb-2">Factors that reduce accuracy:</p>
                  <ul className="text-sm space-y-1">
                    <li>✗ Blurry or dark photos</li>
                    <li>✗ Mixed dishes with hidden ingredients</li>
                    <li>✗ Regional/uncommon foods</li>
                    <li>✗ Very small or very large portions</li>
                    <li>✗ Heavy sauces or coatings</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitations */}
            <section className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Known Limitations</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <div>
                    <strong className="text-foreground">Portion estimation:</strong> Visual portion 
                    estimation is inherently imprecise. For high accuracy, weighing food is recommended.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <div>
                    <strong className="text-foreground">Hidden ingredients:</strong> Oils, sauces, butter, 
                    and hidden ingredients are difficult to estimate from photos.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <div>
                    <strong className="text-foreground">Recipe variations:</strong> The same dish can vary 
                    significantly in macros depending on preparation method.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <div>
                    <strong className="text-foreground">Not for medical use:</strong> ProteinLens is designed 
                    for general wellness tracking, not medical nutrition therapy.
                  </div>
                </li>
              </ul>
            </section>

            {/* Best Practices */}
            <section className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Best Practices for Users</h2>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Take clear, well-lit photos from directly above the plate.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>Include all items you'll be eating in the frame.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>Review and adjust estimates if you know they're off (e.g., you added extra oil).</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Use consistently over time—even imperfect tracking beats no tracking.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">5.</span>
                  <span>For precise goals, weigh high-calorie foods (nuts, oils, meat).</span>
                </li>
              </ol>
            </section>

            {/* References */}
            <section className="bg-muted/50 border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4">References</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  • U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019. 
                  <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                    fdc.nal.usda.gov
                  </a>
                </li>
                <li>
                  • EFSA Panel on Dietetic Products, Nutrition and Allergies. "Scientific Opinion on Dietary 
                  Reference Values for protein." EFSA Journal, 2012.
                </li>
                <li>
                  • Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, 
                  Protein, and Amino Acids. National Academies Press, 2005.
                </li>
              </ul>
            </section>
          </article>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Questions about our methodology?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@proteinlens.com"
                className="px-6 py-3 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80"
              >
                Contact Us
              </a>
              <Link
                to="/"
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl"
              >
                📸 Try ProteinLens
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
