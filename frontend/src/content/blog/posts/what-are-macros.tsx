/**
 * Blog Post: What Are Macros?
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function WhatAreMacros() {
  return (
    <div className="blog-content">
      <p>
        If you've heard people talking about "hitting their macros" or "macro-friendly meals," 
        you might wonder what all the fuss is about. Macros (short for macronutrients) are the 
        building blocks of everything you eat. Understanding them is the first step to taking 
        control of your nutrition.
      </p>

      <h2>The Three Macronutrients</h2>

      <p>
        Every food you eat contains some combination of three macronutrients:
      </p>

      <h3>1. Protein (4 calories per gram)</h3>
      <p>
        Protein builds and repairs muscle, supports your immune system, and makes enzymes 
        and hormones. It's found in meat, fish, eggs, dairy, beans, and tofu.
      </p>
      <ul>
        <li><strong>Function:</strong> Builds muscle, repairs tissue, makes enzymes</li>
        <li><strong>Best sources:</strong> Chicken, fish, eggs, Greek yogurt, lentils</li>
        <li><strong>Typical target:</strong> 0.7-1g per pound of body weight</li>
      </ul>

      <h3>2. Carbohydrates (4 calories per gram)</h3>
      <p>
        Carbs are your body's preferred energy source. They fuel your brain, muscles, and 
        daily activities. Found in grains, fruits, vegetables, and sugars.
      </p>
      <ul>
        <li><strong>Function:</strong> Primary energy source, fuels workouts</li>
        <li><strong>Best sources:</strong> Oats, rice, potatoes, fruits, vegetables</li>
        <li><strong>Typical target:</strong> 40-50% of total calories for most people</li>
      </ul>

      <h3>3. Fat (9 calories per gram)</h3>
      <p>
        Fat supports hormone production, absorbs vitamins, and provides long-lasting energy. 
        Found in oils, nuts, avocados, and animal products.
      </p>
      <ul>
        <li><strong>Function:</strong> Hormone production, vitamin absorption, insulation</li>
        <li><strong>Best sources:</strong> Olive oil, avocados, nuts, fatty fish</li>
        <li><strong>Typical target:</strong> 20-35% of total calories</li>
      </ul>

      <h2>Macros vs. Calories: What's the Difference?</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">Simple way to think about it:</p>
        <ul className="mt-2">
          <li><strong>Calories</strong> = How MUCH you eat (determines weight change)</li>
          <li><strong>Macros</strong> = WHAT you eat (determines body composition)</li>
        </ul>
      </div>

      <p>
        Two diets with the same calories can have very different results. A 1,500 calorie diet 
        high in protein will help you maintain muscle while losing fat. A 1,500 calorie diet 
        low in protein might cause muscle loss along with fat loss.
      </p>

      <h2>Why Track Macros Instead of Just Calories?</h2>

      <h3>For Fat Loss</h3>
      <p>
        High protein intake (at least 0.7g per pound body weight) preserves muscle during a 
        calorie deficit. Without enough protein, you'll lose muscle along with fat, which 
        slows your metabolism.
      </p>

      <h3>For Muscle Building</h3>
      <p>
        You need adequate protein to build new muscle tissue (about 1g per pound body weight). 
        Carbs fuel your workouts, and fats support testosterone production.
      </p>

      <h3>For Performance</h3>
      <p>
        Athletes need strategic carb intake to fuel training and replenish glycogen. The timing 
        and amount of carbs can significantly impact performance.
      </p>

      <h3>For General Health</h3>
      <p>
        Balanced macros help stabilize blood sugar, reduce cravings, and provide sustained energy 
        throughout the day.
      </p>

      <h2>How to Calculate Your Macros</h2>

      <p>
        Here's a simple starting point (adjust based on results):
      </p>

      <h3>Step 1: Calculate Your Calories</h3>
      <p>
        Use our <Link to="/calculators/tdee" className="text-primary hover:underline">TDEE calculator</Link> to 
        find your maintenance calories. Then:
      </p>
      <ul>
        <li><strong>Fat loss:</strong> Subtract 300-500 calories</li>
        <li><strong>Muscle gain:</strong> Add 200-300 calories</li>
        <li><strong>Maintenance:</strong> Stay at TDEE</li>
      </ul>

      <h3>Step 2: Set Your Protein</h3>
      <p>
        <strong>0.8-1g per pound of body weight</strong> for most active people.
      </p>
      <p className="text-sm text-muted-foreground">Example: 160lb person = 128-160g protein daily</p>

      <h3>Step 3: Set Your Fat</h3>
      <p>
        <strong>0.3-0.4g per pound of body weight</strong> (minimum for hormone health).
      </p>
      <p className="text-sm text-muted-foreground">Example: 160lb person = 48-64g fat daily</p>

      <h3>Step 4: Fill the Rest with Carbs</h3>
      <p>
        Whatever calories are left after protein and fat go to carbs.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold">Example for 160lb Person (Fat Loss)</p>
        <ul className="mt-2">
          <li>TDEE: 2,200 calories</li>
          <li>Target: 1,800 calories (400 deficit)</li>
          <li>Protein: 150g = 600 calories</li>
          <li>Fat: 60g = 540 calories</li>
          <li>Carbs: (1,800 - 600 - 540) ÷ 4 = 165g</li>
        </ul>
      </div>

      <h2>Common Macro Ratios</h2>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Goal</th>
              <th className="text-left p-2">Protein</th>
              <th className="text-left p-2">Carbs</th>
              <th className="text-left p-2">Fat</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Fat Loss</td>
              <td className="p-2">30-35%</td>
              <td className="p-2">35-40%</td>
              <td className="p-2">25-30%</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Muscle Gain</td>
              <td className="p-2">25-30%</td>
              <td className="p-2">45-50%</td>
              <td className="p-2">20-25%</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Maintenance</td>
              <td className="p-2">25-30%</td>
              <td className="p-2">40-50%</td>
              <td className="p-2">25-30%</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Low Carb</td>
              <td className="p-2">30-35%</td>
              <td className="p-2">10-25%</td>
              <td className="p-2">45-55%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: These are starting points. Adjust based on how you feel and your results.
      </p>

      <h2>Do I Need to Track Macros Perfectly?</h2>

      <p>
        No! Here's a realistic approach:
      </p>

      <ul>
        <li><strong>Priority 1: Protein</strong> — Hit your protein target consistently. This is the most important macro for body composition.</li>
        <li><strong>Priority 2: Total calories</strong> — Stay within 100 calories of your target most days.</li>
        <li><strong>Priority 3: Carbs and fat</strong> — Let these fill in the rest. Don't stress if they vary day to day.</li>
      </ul>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">The 80/20 Rule</p>
        <p className="mt-2">
          If you hit your protein target and stay close to your calorie target 80% of the time, 
          you'll see great results. Perfect tracking isn't necessary.
        </p>
      </div>

      <h2>Tips for Getting Started</h2>

      <ol>
        <li><strong>Track for 1 week without changing anything</strong> — This shows your current patterns</li>
        <li><strong>Focus on protein first</strong> — Most people under-eat protein</li>
        <li><strong>Don't be too restrictive</strong> — All foods can fit in your macros</li>
        <li><strong>Use a tracking method that works for you</strong> — Apps, photos, or a simple journal</li>
        <li><strong>Adjust every 2-4 weeks based on results</strong> — If you're not progressing, tweak your targets</li>
      </ol>

      <h2>The Bottom Line</h2>

      <p>
        Macros are simply protein, carbs, and fat — the three components of food that provide 
        calories. Tracking them gives you more control over your body composition than tracking 
        calories alone. Start with protein, stay consistent, and adjust based on results.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Start tracking macros the easy way:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> lets you 
          track macros by snapping a photo — no manual entry, no database searching. It's the 
          fastest way to see what you're actually eating.
        </p>
      </div>

      <p>
        <Link to="/calculators/macro" className="text-primary hover:underline">
          → Calculate your personal macros with our free macro calculator
        </Link>
      </p>
    </div>
  );
}
