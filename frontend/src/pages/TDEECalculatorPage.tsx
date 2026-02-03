/**
 * TDEE Calculator Page
 * 
 * Calculate Total Daily Energy Expenditure based on BMR and activity level.
 * Target keywords: TDEE calculator, total daily energy expenditure, how many calories do I burn
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateFAQSchema, generateWebApplicationSchema } from '@/components/seo/SEOHead';

type Gender = 'male' | 'female';
type Unit = 'metric' | 'imperial';
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

const activityMultipliers: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const activityLabels: Record<Activity, { label: string; description: string }> = {
  sedentary: { label: 'Sedentary', description: 'Little or no exercise, desk job' },
  light: { label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  moderate: { label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  active: { label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  veryActive: { label: 'Extremely Active', description: 'Very hard exercise, physical job' },
};

const faqs = [
  {
    question: 'What is TDEE?',
    answer: "TDEE (Total Daily Energy Expenditure) is the total number of calories you burn per day, including your basal metabolic rate plus activity. It's the starting point for any diet plan.",
  },
  {
    question: 'How accurate are TDEE calculators?',
    answer: 'TDEE calculators provide estimates based on formulas like Mifflin-St Jeor. Actual needs can vary by 10-20%. Use the result as a starting point and adjust based on real-world results over 2-4 weeks.',
  },
  {
    question: 'Should I eat above or below my TDEE?',
    answer: 'To lose weight, eat below TDEE (deficit of 300-500 calories). To gain muscle, eat slightly above (surplus of 200-300 calories). To maintain, eat at TDEE.',
  },
  {
    question: 'What formula does this calculator use?',
    answer: 'We use the Mifflin-St Jeor equation, which is considered one of the most accurate formulas for estimating BMR. Your BMR is then multiplied by an activity factor to get TDEE.',
  },
];

export default function TDEECalculatorPage() {
  const [gender, setGender] = useState<Gender>('male');
  const [unit, setUnit] = useState<Unit>('metric');
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [activity, setActivity] = useState<Activity>('moderate');

  // Convert to metric if needed
  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight;
  const heightCm = unit === 'imperial' ? height * 2.54 : height;

  // Calculate BMR using Mifflin-St Jeor equation
  const bmr = useMemo(() => {
    if (gender === 'male') {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    } else {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
  }, [gender, weightKg, heightCm, age]);

  // Calculate TDEE
  const tdee = useMemo(() => {
    return Math.round(bmr * activityMultipliers[activity]);
  }, [bmr, activity]);

  // Goal-based calories
  const goals = useMemo(() => ({
    lose: Math.round(tdee - 500),
    maintain: tdee,
    gain: Math.round(tdee + 300),
  }), [tdee]);

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
        title="TDEE Calculator - Total Daily Energy Expenditure"
        description="Calculate your TDEE (Total Daily Energy Expenditure) to find how many calories you burn per day. Free TDEE calculator with activity multipliers."
        canonical="https://www.proteinlens.com/tdee-calculator"
        keywords="TDEE calculator, total daily energy expenditure, how many calories do I burn, calorie calculator, BMR calculator"
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
              <span className="text-3xl">🔥</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">TDEE Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Calculate how many calories you burn per day
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8"
          >
            {/* Unit Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setUnit('metric')}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  unit === 'metric'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  unit === 'imperial'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Imperial (lb/in)
              </button>
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    gender === 'male'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    gender === 'female'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Age, Weight, Height */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  min={15}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight ({unit === 'metric' ? 'kg' : 'lb'})
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  min={30}
                  max={300}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Height ({unit === 'metric' ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  min={100}
                  max={250}
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Activity Level</label>
              <div className="space-y-2">
                {(Object.keys(activityLabels) as Activity[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setActivity(a)}
                    className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                      activity === a
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span className="font-medium">{activityLabels[a].label}</span>
                    <span className="text-sm opacity-80 ml-2">({activityLabels[a].description})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-muted/50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">BMR</p>
                  <p className="text-2xl font-bold text-foreground">{bmr}</p>
                  <p className="text-xs text-muted-foreground">cal/day at rest</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">TDEE</p>
                  <p className="text-3xl font-bold text-primary">{tdee}</p>
                  <p className="text-xs text-muted-foreground">cal/day total</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-3 text-center">Goal-Based Calories</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-card rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{goals.lose}</p>
                    <p className="text-xs text-muted-foreground">Lose Weight</p>
                  </div>
                  <div className="bg-card rounded-lg p-3 ring-2 ring-primary">
                    <p className="text-lg font-bold text-primary">{goals.maintain}</p>
                    <p className="text-xs text-muted-foreground">Maintain</p>
                  </div>
                  <div className="bg-card rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{goals.gain}</p>
                    <p className="text-xs text-muted-foreground">Build Muscle</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg mb-8">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-medium text-foreground mb-1">Using the Mifflin-St Jeor Formula</p>
              <p className="text-sm text-muted-foreground">
                This calculator uses the Mifflin-St Jeor equation, considered the most accurate for 
                estimating metabolic rate. Results are estimates—track your weight for 2-4 weeks and 
                adjust if needed.
              </p>
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
              to="/macro-calculator"
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <span className="text-2xl">🧮</span>
              <p className="font-medium text-foreground mt-2">Macro Calculator</p>
              <p className="text-xs text-muted-foreground">P/C/F split</p>
            </Link>
            <Link
              to="/protein-calculator"
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <span className="text-2xl">🎯</span>
              <p className="font-medium text-foreground mt-2">Protein Calculator</p>
              <p className="text-xs text-muted-foreground">Daily protein needs</p>
            </Link>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Now that you know your TDEE, track your meals with AI
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
