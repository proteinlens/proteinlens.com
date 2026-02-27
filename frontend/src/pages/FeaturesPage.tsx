/**
 * Features Page
 * 
 * Public SEO page showcasing ProteinLens features.
 * Target keywords: macro tracker app features, protein tracking app, nutrition AI features
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateWebApplicationSchema } from '@/components/seo/SEOHead';

const features = [
  {
    icon: '📸',
    title: 'AI Photo Analysis',
    description: 'Snap a photo of any meal and get instant macro breakdown. Our GPT Vision-powered AI identifies foods and estimates portions automatically.',
    highlight: true,
  },
  {
    icon: '🥩',
    title: 'Protein Tracking',
    description: 'Set your daily protein goal and track progress throughout the day. Perfect for muscle building, weight loss, or maintaining a healthy diet.',
    highlight: true,
  },
  {
    icon: '🧮',
    title: 'Complete Macro Breakdown',
    description: 'Get detailed analysis of protein, carbohydrates, and fat for every meal. See percentage splits and calorie totals at a glance.',
    highlight: false,
  },
  {
    icon: '📊',
    title: 'Daily Totals & History',
    description: 'Track your nutrition over time. View daily, weekly, and monthly summaries to understand your eating patterns.',
    highlight: false,
  },
  {
    icon: '🎯',
    title: 'Protein Calculator',
    description: 'Calculate your optimal daily protein intake based on your weight, activity level, and fitness goals.',
    highlight: false,
  },
  {
    icon: '🔗',
    title: 'Shareable Meal Results',
    description: 'Share your meal analysis with friends, trainers, or on social media. Perfect for accountability and getting feedback.',
    highlight: false,
  },
  {
    icon: '🥗',
    title: 'Diet Profile Support',
    description: 'Get feedback tailored to your diet style - Keto, Paleo, Vegan, High-Protein, Balanced, or custom preferences.',
    highlight: false,
  },
  {
    icon: '📱',
    title: 'Works Anywhere',
    description: 'Use on any device with a camera. No app download required - works directly in your browser on phone or desktop.',
    highlight: false,
  },
];

const comparisons = [
  {
    feature: 'Log a meal',
    proteinLens: '5 seconds (photo)',
    manual: '2-5 minutes (search + entry)',
  },
  {
    feature: 'Complex meals',
    proteinLens: 'AI identifies all items',
    manual: 'Enter each ingredient',
  },
  {
    feature: 'Restaurant food',
    proteinLens: 'Photo → instant results',
    manual: 'Guess or skip',
  },
  {
    feature: 'Learning curve',
    proteinLens: 'Point and shoot',
    manual: 'Learn database navigation',
  },
];

export default function FeaturesPage() {
  const structuredData = generateWebApplicationSchema();

  return (
    <>
      <SEOHead
        title="Features - AI Macro Tracker App"
        description="Explore ProteinLens features: AI photo analysis, protein tracking, macro breakdown, daily totals, shareable results, diet profiles & more. Free to start."
        canonical="https://www.proteinlens.com/features"
        keywords="macro tracker app features, protein tracking app, nutrition AI features, food scanner app, calorie counter features"
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
              <span className="inline-block px-4 py-2 bg-emerald-50 text-primary rounded-full text-sm font-medium mb-6">
                ✨ Powerful & Simple
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Features That Make Tracking Easy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to track macros without the hassle.
                Powered by AI, designed for busy people.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`relative bg-card border rounded-2xl p-6 hover:border-primary/30 transition-all ${
                    feature.highlight ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border'
                  }`}
                >
                  {feature.highlight && (
                    <div className="absolute -top-3 left-6">
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        CORE FEATURE
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                    {feature.icon}
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">
              Photo Tracking vs. Manual Logging
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              See how AI-powered photo tracking compares to traditional macro counting apps.
            </p>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 bg-slate-50 border-b border-border">
                <div className="p-4 font-bold text-foreground">Feature</div>
                <div className="p-4 font-bold text-primary text-center">ProteinLens</div>
                <div className="p-4 font-bold text-muted-foreground text-center">Manual Apps</div>
              </div>
              {comparisons.map((row, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 ${index !== comparisons.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="p-4 text-foreground font-medium">{row.feature}</div>
                  <div className="p-4 text-center text-primary">{row.proteinLens}</div>
                  <div className="p-4 text-center text-muted-foreground">{row.manual}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator Callout */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-4xl">
                    🎯
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Not Sure How Much Protein You Need?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Use our free protein calculator to find your optimal daily intake based on your weight and goals.
                  </p>
                  <Link
                    to="/protein-calculator"
                    className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Calculate My Protein Goal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Start Tracking Smarter
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands who've simplified their macro tracking with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                📸 Try Free Demo
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-4 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
