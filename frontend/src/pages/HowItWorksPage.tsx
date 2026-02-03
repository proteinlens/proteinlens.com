/**
 * How It Works Page
 * 
 * Public SEO page explaining how ProteinLens AI macro tracking works.
 * Target keywords: how to track macros from photo, AI food scanner, photo macro tracker
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateFAQSchema, generateWebApplicationSchema } from '@/components/seo/SEOHead';

const steps = [
  {
    number: '01',
    icon: '📸',
    title: 'Snap a Photo',
    description: 'Take a picture of your meal using your phone camera or upload an existing image. Works with any food - home-cooked, restaurant meals, or packaged foods.',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI Analyzes Your Meal',
    description: 'Our advanced AI (powered by GPT Vision) identifies every food item, estimates portion sizes, and calculates the macronutrients in seconds.',
  },
  {
    number: '03',
    icon: '📊',
    title: 'Get Your Macro Breakdown',
    description: 'Instantly see protein, carbs, fat, and total calories. View the percentage breakdown and track against your daily goals.',
  },
  {
    number: '04',
    icon: '🎯',
    title: 'Track Your Progress',
    description: 'Your meals are saved to your history. Track daily totals, see trends, and share meals with friends or your coach.',
  },
];

const faqs = [
  {
    question: 'How accurate is AI macro tracking from photos?',
    answer: 'Our AI provides estimates within 10-20% accuracy for most meals. Accuracy improves with clear photos, visible portions, and common foods. For precise tracking, we recommend weighing foods, but photo-based tracking is excellent for daily convenience.',
  },
  {
    question: 'What foods can ProteinLens recognize?',
    answer: 'ProteinLens can identify thousands of foods including home-cooked meals, restaurant dishes, fast food, packaged foods, fruits, vegetables, proteins, grains, and more. The AI continuously improves its recognition.',
  },
  {
    question: 'Do I need to log in to try it?',
    answer: 'No! You can try a demo scan without creating an account. For saving your meal history and tracking daily totals, you\'ll need to sign up for a free account.',
  },
  {
    question: 'How is this different from manual macro tracking?',
    answer: 'Manual tracking requires searching databases, weighing foods, and entering everything by hand. ProteinLens saves time by doing the heavy lifting - just snap a photo and get instant results. It\'s perfect for busy people who want to track without the hassle.',
  },
  {
    question: 'Can I edit the results if the AI makes a mistake?',
    answer: 'Yes! After the AI provides its estimate, you can adjust portion sizes or correct food items. Your edits help improve accuracy over time.',
  },
];

export default function HowItWorksPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateWebApplicationSchema(),
      generateFAQSchema(faqs),
    ],
  };

  return (
    <>
      <SEOHead
        title="How It Works - AI Photo Macro Tracking"
        description="Learn how ProteinLens uses AI to track macros from food photos. Snap a picture, get instant protein, carbs, fat & calories. No manual logging required."
        canonical="https://www.proteinlens.com/how-it-works"
        keywords="how to track macros from photo, AI food scanner, photo macro tracker, automatic macro tracking, food photo analyzer"
        structuredData={structuredData}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                📸 Photo-Based Macro Tracking
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                How ProteinLens Works
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Track your macros in seconds. Just snap a photo of your meal and let AI do the rest.
                No more searching databases or weighing every ingredient.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                          {step.icon}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-primary/60">STEP {step.number}</span>
                        <h2 className="text-xl font-bold text-foreground mt-1 mb-3">
                          {step.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Photo Tracking Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Why Track Macros With Photos?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  ⚡
                </div>
                <h3 className="font-bold text-foreground mb-2">10x Faster</h3>
                <p className="text-muted-foreground text-sm">
                  Get results in seconds instead of minutes spent searching and logging manually.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  🎯
                </div>
                <h3 className="font-bold text-foreground mb-2">Stay Consistent</h3>
                <p className="text-muted-foreground text-sm">
                  The easier it is to track, the more likely you'll stick with it long-term.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  🍽️
                </div>
                <h3 className="font-bold text-foreground mb-2">Any Meal Works</h3>
                <p className="text-muted-foreground text-sm">
                  Home cooking, restaurants, or packaged food - just point and shoot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-bold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Try It?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start tracking your macros in seconds. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                📸 Try a Demo Scan
              </Link>
              <Link
                to="/protein-calculator"
                className="px-8 py-4 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors"
              >
                🎯 Calculate Your Protein Goal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
