/**
 * Macro Calculator Page
 * 
 * Calculate macronutrient split (protein, carbs, fat) based on calories and goals.
 * Target keywords: macro calculator, calculate macros, macro split calculator
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateFAQSchema, generateWebApplicationSchema } from '@/components/seo/SEOHead';

type Goal = 'lose' | 'maintain' | 'gain';
type Split = 'balanced' | 'lowCarb' | 'highProtein' | 'keto';

const goalLabels: Record<Goal, string> = {
  lose: 'Lose Weight',
  maintain: 'Maintain',
  gain: 'Build Muscle',
};

const splitLabels: Record<Split, string> = {
  balanced: 'Balanced',
  lowCarb: 'Low Carb',
  highProtein: 'High Protein',
  keto: 'Keto',
};

const splits: Record<Split, { protein: number; carbs: number; fat: number }> = {
  balanced: { protein: 30, carbs: 40, fat: 30 },
  lowCarb: { protein: 35, carbs: 25, fat: 40 },
  highProtein: { protein: 40, carbs: 30, fat: 30 },
  keto: { protein: 25, carbs: 5, fat: 70 },
};

const faqs = [
  {
    question: 'What is the best macro split for weight loss?',
    answer: 'A common starting point is 40% protein, 30% carbs, 30% fat. However, the best split depends on your preferences, activity level, and how your body responds. Consistency matters more than the exact split.',
  },
  {
    question: 'How do I calculate my macros?',
    answer: 'First calculate your TDEE (total daily energy expenditure), then divide calories among protein, carbs, and fat based on your goals. Our calculator handles the math for you.',
  },
  {
    question: 'Should I track macros or just calories?',
    answer: 'Tracking macros provides more insight than calories alone. It ensures adequate protein for muscle, and helps balance energy from carbs and fats. However, tracking calories is better than tracking nothing.',
  },
  {
    question: 'How many grams per macro?',
    answer: 'Protein and carbs have 4 calories per gram. Fat has 9 calories per gram. Our calculator converts your calorie targets to grams automatically.',
  },
];

export default function MacroCalculatorPage() {
  const [calories, setCalories] = useState(2000);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [split, setSplit] = useState<Split>('balanced');

  // Adjust calories based on goal
  const adjustedCalories = useMemo(() => {
    switch (goal) {
      case 'lose':
        return Math.round(calories * 0.8); // 20% deficit
      case 'gain':
        return Math.round(calories * 1.1); // 10% surplus
      default:
        return calories;
    }
  }, [calories, goal]);

  // Calculate macros in grams
  const macros = useMemo(() => {
    const { protein, carbs, fat } = splits[split];
    return {
      protein: Math.round((adjustedCalories * (protein / 100)) / 4), // 4 cal/g
      carbs: Math.round((adjustedCalories * (carbs / 100)) / 4), // 4 cal/g
      fat: Math.round((adjustedCalories * (fat / 100)) / 9), // 9 cal/g
      percentages: { protein, carbs, fat },
    };
  }, [adjustedCalories, split]);

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
        title="Macro Calculator - Calculate Your Macros"
        description="Free macro calculator to find your ideal protein, carbs, and fat split. Calculate macros for weight loss, muscle gain, or maintenance."
        canonical="https://www.proteinlens.com/macro-calculator"
        keywords="macro calculator, macronutrient calculator, calculate macros, macro split calculator, carb fat protein calculator"
        structuredData={structuredData}
      />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <span className="text-3xl">🧮</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Macro Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Calculate your ideal protein, carbs, and fat based on your goals
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8"
          >
            {/* Daily Calories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Daily Calories (TDEE)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                min={1000}
                max={6000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Don't know your TDEE?{' '}
                <Link to="/tdee-calculator" className="text-primary hover:underline">
                  Calculate it here
                </Link>
              </p>
            </div>

            {/* Goal Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(goalLabels) as Goal[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      goal === g
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {goalLabels[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Macro Split</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(splitLabels) as Split[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSplit(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      split === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {splitLabels[s]} ({splits[s].protein}/{splits[s].carbs}/{splits[s].fat})
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-muted/50 rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Adjusted Daily Calories</p>
                <p className="text-3xl font-bold text-primary">{adjustedCalories} cal</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-card rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{macros.protein}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xs text-primary">{macros.percentages.protein}%</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{macros.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xs text-primary">{macros.percentages.carbs}%</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{macros.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-xs text-primary">{macros.percentages.fat}%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info Section */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <span className="text-lg">💡</span>
              <div>
                <p className="font-medium text-foreground mb-1">About macro ratios</p>
                <p className="text-sm text-muted-foreground">
                  Protein: 4 calories/gram • Carbs: 4 calories/gram • Fat: 9 calories/gram. 
                  These ratios are guidelines—adjust based on how you feel and perform.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-medium text-foreground mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Calculators */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/protein-calculator"
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <span className="text-2xl">🎯</span>
              <p className="font-medium text-foreground mt-2">Protein Calculator</p>
              <p className="text-xs text-muted-foreground">Daily protein needs</p>
            </Link>
            <Link
              to="/tdee-calculator"
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <span className="text-2xl">🔥</span>
              <p className="font-medium text-foreground mt-2">TDEE Calculator</p>
              <p className="text-xs text-muted-foreground">Daily calorie burn</p>
            </Link>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Track your macros effortlessly with AI-powered photo analysis
            </p>
            <Link
              to="/"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              📸 Try ProteinLens Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
