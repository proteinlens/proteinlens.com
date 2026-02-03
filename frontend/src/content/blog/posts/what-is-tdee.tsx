/**
 * Blog Post: What Is TDEE? (And Why It Matters for Weight Loss)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function WhatIsTDEE() {
  return (
    <div className="blog-content">
      <p>
        TDEE (Total Daily Energy Expenditure) is the number of calories you burn every day. 
        It's the most important number for weight management — and most people have no idea 
        what theirs is.
      </p>

      <h2>TDEE Explained Simply</h2>

      <p>
        Your body burns calories in four ways:
      </p>

      <ol>
        <li><strong>BMR (Basal Metabolic Rate)</strong> — Calories burned just staying alive (60-70%)</li>
        <li><strong>TEF (Thermic Effect of Food)</strong> — Calories burned digesting food (~10%)</li>
        <li><strong>NEAT (Non-Exercise Activity)</strong> — Walking, fidgeting, daily movement (15-30%)</li>
        <li><strong>EAT (Exercise Activity)</strong> — Intentional workouts (5-10%)</li>
      </ol>

      <p>
        <strong>TDEE = BMR + TEF + NEAT + EAT</strong>
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">Think of TDEE as your "break-even" point:</p>
        <ul className="mt-2">
          <li>Eat less than your TDEE → Lose weight</li>
          <li>Eat more than your TDEE → Gain weight</li>
          <li>Eat equal to your TDEE → Maintain weight</li>
        </ul>
      </div>

      <h2>Why TDEE Matters More Than BMR</h2>

      <p>
        Many people calculate their BMR and try to eat that amount — but that's wrong. 
        BMR is just the calories needed if you were in a coma. You need TDEE, which 
        accounts for all daily activity.
      </p>

      <p>
        For an average person:
      </p>
      <ul>
        <li>BMR might be 1,500 calories</li>
        <li>TDEE might be 2,200 calories</li>
      </ul>

      <p>
        Eating at BMR (1,500) when your TDEE is 2,200 creates a 700-calorie deficit — 
        which is too aggressive and unsustainable for most people.
      </p>

      <h2>How to Calculate Your TDEE</h2>

      <h3>Method 1: Formula (Quick Estimate)</h3>

      <p>
        Start with BMR using the Mifflin-St Jeor equation:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p><strong>Men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5</p>
        <p><strong>Women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161</p>
      </div>

      <p>Then multiply by activity factor:</p>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Lifestyle</th>
              <th className="text-left p-2">Multiply By</th>
              <th className="text-left p-2">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Sedentary (desk job, no exercise)</td>
              <td className="p-2">1.2</td>
              <td className="p-2">Office worker who drives everywhere</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Lightly Active</td>
              <td className="p-2">1.375</td>
              <td className="p-2">Light walking, 1-2 workouts/week</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Moderately Active</td>
              <td className="p-2">1.55</td>
              <td className="p-2">Active job or 3-5 workouts/week</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Very Active</td>
              <td className="p-2">1.725</td>
              <td className="p-2">Physical job + daily workouts</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Extremely Active</td>
              <td className="p-2">1.9</td>
              <td className="p-2">Athlete training multiple times daily</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
        <p className="font-semibold">⚠️ Most people overestimate activity level</p>
        <p className="mt-2">
          Working out 3x/week but sitting at a desk all day? You're probably "Lightly Active," 
          not "Moderately Active." Be honest — overestimating leads to eating too much.
        </p>
      </div>

      <h3>Method 2: Track Your Actual Intake (Most Accurate)</h3>

      <p>
        The most accurate way to find your TDEE is to track what you eat and monitor your 
        weight for 2-4 weeks:
      </p>

      <ol>
        <li>Track everything you eat accurately (weigh food)</li>
        <li>Weigh yourself daily at the same time</li>
        <li>Calculate your average daily intake</li>
        <li>Note your average weekly weight change</li>
      </ol>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">The Math:</p>
        <ul className="mt-2">
          <li>If you lost 1 lb/week eating 2,000 cal/day → TDEE is ~2,500</li>
          <li>If you maintained eating 2,000 cal/day → TDEE is ~2,000</li>
          <li>If you gained 1 lb/week eating 2,000 cal/day → TDEE is ~1,500</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          (1 pound ≈ 3,500 calories, so 500 cal/day deficit = 1 lb/week loss)
        </p>
      </div>

      <h2>TDEE for Different Goals</h2>

      <h3>For Weight Loss</h3>
      <p>
        Eat 300-500 calories below TDEE. This creates a sustainable deficit that preserves 
        muscle and energy.
      </p>
      <ul>
        <li><strong>TDEE 2,000:</strong> Eat 1,500-1,700 for weight loss</li>
        <li><strong>TDEE 2,500:</strong> Eat 2,000-2,200 for weight loss</li>
      </ul>

      <h3>For Muscle Gain</h3>
      <p>
        Eat 200-300 calories above TDEE. A larger surplus just adds more fat without 
        faster muscle growth.
      </p>
      <ul>
        <li><strong>TDEE 2,000:</strong> Eat 2,200-2,300 for muscle gain</li>
        <li><strong>TDEE 2,500:</strong> Eat 2,700-2,800 for muscle gain</li>
      </ul>

      <h3>For Maintenance</h3>
      <p>
        Eat at TDEE ± 100 calories. Weight will naturally fluctuate 2-5 lbs due to water, 
        food volume, and other factors.
      </p>

      <h2>Why TDEE Changes Over Time</h2>

      <p>
        Your TDEE isn't fixed — it changes based on:
      </p>

      <ul>
        <li><strong>Weight loss</strong> — Smaller bodies burn fewer calories</li>
        <li><strong>Muscle mass</strong> — More muscle = higher BMR</li>
        <li><strong>Activity changes</strong> — New job, lifestyle changes</li>
        <li><strong>Age</strong> — Metabolism slows ~2-3% per decade after 20</li>
        <li><strong>Metabolic adaptation</strong> — Your body adjusts to prolonged deficits</li>
      </ul>

      <p>
        <strong>Recalculate every 10-15 lbs of weight change</strong> or when progress stalls.
      </p>

      <h2>Common TDEE Mistakes</h2>

      <ol>
        <li><strong>Using BMR as your target</strong> — BMR is too low; use TDEE</li>
        <li><strong>Overestimating activity level</strong> — Be honest about how much you move</li>
        <li><strong>Not recalculating as you lose weight</strong> — TDEE drops as you get smaller</li>
        <li><strong>Eating exercise calories back</strong> — Fitness trackers overestimate burns</li>
        <li><strong>Ignoring NEAT</strong> — Daily movement varies hugely between people</li>
      </ol>

      <h2>Quick TDEE Reference</h2>

      <p>
        Here are rough TDEE estimates for moderately active people:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Weight</th>
              <th className="text-left p-2">Women (TDEE)</th>
              <th className="text-left p-2">Men (TDEE)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">120 lbs</td>
              <td className="p-2">1,700-1,900</td>
              <td className="p-2">1,900-2,100</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">140 lbs</td>
              <td className="p-2">1,850-2,050</td>
              <td className="p-2">2,100-2,300</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">160 lbs</td>
              <td className="p-2">2,000-2,200</td>
              <td className="p-2">2,300-2,500</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">180 lbs</td>
              <td className="p-2">2,150-2,350</td>
              <td className="p-2">2,500-2,700</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">200 lbs</td>
              <td className="p-2">2,300-2,500</td>
              <td className="p-2">2,700-2,900</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        These are estimates. Your actual TDEE depends on age, muscle mass, and exact activity level.
      </p>

      <h2>The Bottom Line</h2>

      <p>
        TDEE is the foundation of any diet. Without knowing it, you're just guessing. 
        Calculate it, track your intake, adjust based on results. It's that simple.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Know your TDEE, hit your targets:</p>
        <p>
          Once you know your TDEE, <Link to="/" className="text-primary hover:underline">ProteinLens</Link> makes 
          tracking easy. Snap a photo of your meal and instantly see if you're on track.
        </p>
      </div>

      <p>
        <Link to="/calculators/tdee" className="text-primary hover:underline">
          → Calculate your exact TDEE with our free calculator
        </Link>
      </p>
    </div>
  );
}
