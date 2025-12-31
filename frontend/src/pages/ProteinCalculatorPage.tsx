/**
 * Protein Calculator Page (Feature 015)
 * 
 * Dedicated page for protein target calculation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ProteinCalculator } from '@/components/protein';

export default function ProteinCalculatorPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
          <span className="text-3xl">🎯</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Protein Calculator
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Calculate your daily protein target based on your weight and goals
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <ProteinCalculator />
      </div>

      {/* Info Section */}
      <div className="mt-8 space-y-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <span className="text-lg">💡</span>
          <div>
            <p className="font-medium text-foreground mb-1">How it works</p>
            <p>
              Your protein target is calculated using a g/kg multiplier based on your 
              training level and fitness goal. Regular training increases protein needs.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <span className="text-lg">📊</span>
          <div>
            <p className="font-medium text-foreground mb-1">Meal distribution</p>
            <p>
              Your daily target is split across meals with larger portions at lunch 
              and dinner when hunger is typically higher.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <span className="text-lg">✨</span>
          <div>
            <p className="font-medium text-foreground mb-1">Track your meals</p>
            <p>
              Use our <a href="/" className="text-primary hover:underline">meal scanner</a> to 
              track how much protein you're actually eating throughout the day.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
