/**
 * About Page
 * 
 * Public SEO page for brand disambiguation and company info.
 * Helps differentiate from academic "ProteinLens" (proteinlens.io)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateOrganizationSchema } from '@/components/seo/SEOHead';

const values = [
  {
    icon: '⚡',
    title: 'Simplicity First',
    description: 'We believe tracking nutrition shouldn\'t be complicated. One photo should be all it takes.',
  },
  {
    icon: '🎯',
    title: 'Accuracy Matters',
    description: 'We continuously improve our AI to give you the most accurate estimates possible from photos.',
  },
  {
    icon: '🔒',
    title: 'Privacy Respected',
    description: 'Your meal photos and nutrition data are yours. We don\'t sell or share your personal information.',
  },
  {
    icon: '🌱',
    title: 'Sustainable Habits',
    description: 'Quick, easy tracking helps you build lasting nutrition awareness, not obsessive calorie counting.',
  },
];

export default function AboutPage() {
  const structuredData = generateOrganizationSchema();

  return (
    <>
      <SEOHead
        title="About ProteinLens - AI Macro Nutrition Tracker"
        description="ProteinLens is an AI-powered nutrition tracking app that analyzes food photos to provide instant macro breakdowns. Track protein, carbs & fat the easy way."
        canonical="https://www.proteinlens.com/about"
        keywords="ProteinLens, AI nutrition tracker, food photo analyzer, macro tracking app, about ProteinLens"
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg shadow-primary/25 mb-6">
                <span className="text-4xl">🍽️</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About ProteinLens
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-Powered Macro Nutrition Tracker
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 lg:p-12"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Our Mission</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">ProteinLens</strong> exists to make nutrition tracking 
                  effortless. We believe that understanding what you eat shouldn't require spending minutes 
                  searching databases or weighing every ingredient.
                </p>
                <p>
                  Using advanced AI vision technology (powered by GPT), ProteinLens analyzes photos of your 
                  meals to instantly identify foods, estimate portions, and calculate macronutrients—protein, 
                  carbohydrates, fat, and total calories.
                </p>
                <p>
                  Whether you're building muscle, losing weight, or simply curious about your nutrition, 
                  ProteinLens helps you track consistently without the friction that makes most people quit.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Disambiguation Note */}
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-muted/50 border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Not the Academic Project</h3>
                  <p className="text-sm text-muted-foreground">
                    Note: ProteinLens (proteinlens.com) is a consumer nutrition tracking app. We are not 
                    affiliated with the academic research project "ProteinLens" focused on protein allosteric 
                    signalling and molecular dynamics (proteinlens.io). If you're looking for biomolecular 
                    research tools, please visit their site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              What We Believe
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Preview */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              How ProteinLens Works
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <span className="text-xl">📸</span>
                <span className="text-sm font-medium">1. Snap a photo</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <span className="text-xl">🤖</span>
                <span className="text-sm font-medium">2. AI analyzes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <span className="text-xl">📊</span>
                <span className="text-sm font-medium">3. Get macros</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <span className="text-xl">🎯</span>
                <span className="text-sm font-medium">4. Track goals</span>
              </div>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex px-6 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors"
            >
              Learn More →
            </Link>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Get In Touch</h2>
              <p className="text-muted-foreground mb-6">
                Questions, feedback, or partnership inquiries? We'd love to hear from you.
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Support:</strong>{' '}
                  <a href="mailto:support@proteinlens.com" className="text-primary hover:underline">
                    support@proteinlens.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Privacy:</strong>{' '}
                  <a href="mailto:privacy@proteinlens.com" className="text-primary hover:underline">
                    privacy@proteinlens.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Tracking?
            </h2>
            <p className="text-muted-foreground mb-8">
              Try ProteinLens free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                📸 Try Demo Scan
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
