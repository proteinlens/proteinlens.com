/**
 * Calorie Calculator Page
 * 
 * Simple calorie needs calculator.
 * Target keywords: calorie calculator, daily calorie needs, how many calories should I eat
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateWebApplicationSchema } from '@/components/seo/SEOHead';

type Goal = 'lose' | 'maintain' | 'gain';
type Activity = 'sedentary' | 'light' | 'moderate' | 'active';

const activityLabels: Record<Activity, string> = {
  sedentary: 'Sedentary (desk job, no exercise)',
  light: 'Lightly Active (1-2 workouts/week)',
  moderate: 'Moderately Active (3-5 workouts/week)',
  active: 'Very Active (daily exercise)',
};

const activityMultipliers: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export default function CalorieCalculatorPage() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<Activity>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');

  // Calculate BMR (Mifflin-St Jeor)
  const bmr = useMemo(() => {
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    }
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }, [weight, height, age, gender]);

  // Calculate maintenance calories
  const maintenance = useMemo(() => {
    return Math.round(bmr * activityMultipliers[activity]);
  }, [bmr, activity]);

  // Calculate goal calories
  const calories = useMemo(() => {
    switch (goal) {
      case 'lose':
        return Math.round(maintenance - 500);
      case 'gain':
        return Math.round(maintenance + 300);
      default:
        return maintenance;
    }
  }, [maintenance, goal]);

  return (
    <>
      <SEOHead
        title="Calorie Calculator - Daily Calorie Needs"
        description="Calculate how many calories you need per day for weight loss, maintenance, or muscle gain. Free calorie calculator with goal-based recommendations."
        canonical="https://www.proteinlens.com/calorie-calculator"
        keywords="calorie calculator, daily calorie needs, how many calories should I eat, calorie deficit calculator"
        structuredData={generateWebApplicationSchema()}
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
              <span className="text-3xl">🍎</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Calorie Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Find out how many calories you need per day
            </p>
          </motion.div>

          {/* Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8"
          >
            {/* Gender */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 px-4 py-2 rounded-xl capitalize ${
                      gender === g
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-center"
                />
              </div>
            </div>

            {/* Activity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Activity Level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as Activity)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground"
              >
                {(Object.keys(activityLabels) as Activity[]).map((a) => (
                  <option key={a} value={a}>
                    {activityLabels[a]}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {(['lose', 'maintain', 'gain'] as Goal[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`px-4 py-2 rounded-xl text-sm capitalize ${
                      goal === g
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {g === 'lose' ? 'Lose Weight' : g === 'gain' ? 'Build Muscle' : 'Maintain'}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Daily Calorie Target</p>
              <p className="text-5xl font-bold text-primary">{calories}</p>
              <p className="text-sm text-muted-foreground mt-1">calories per day</p>
              
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Maintenance: {maintenance} cal | BMR: {bmr} cal
                </p>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> This calculator uses the Mifflin-St Jeor equation. 
              Results are estimates—adjust based on your actual progress over 2-4 weeks. For weight loss, 
              a 500-calorie deficit typically results in ~0.5kg/week loss.
            </p>
          </div>

          {/* Related */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Link to="/tdee-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30">
              <span className="text-2xl">🔥</span>
              <p className="text-sm font-medium mt-2">TDEE</p>
            </Link>
            <Link to="/macro-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30">
              <span className="text-2xl">🧮</span>
              <p className="text-sm font-medium mt-2">Macros</p>
            </Link>
            <Link to="/protein-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30">
              <span className="text-2xl">🎯</span>
              <p className="text-sm font-medium mt-2">Protein</p>
            </Link>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl"
            >
              📸 Track Calories with AI
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
