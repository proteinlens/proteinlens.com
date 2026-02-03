/**
 * Blog Post: How to Track Macros Without a Food Scale
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function TrackMacrosWithoutFoodScale() {
  return (
    <div className="blog-content">
      <p>
        Let's be real: not everyone wants to weigh every morsel of food. Maybe you're 
        traveling, eating out, or just don't want to be that person at dinner parties. 
        Good news — you can still track macros effectively without a scale.
      </p>

      <h2>The Hand Measurement System</h2>

      <p>
        Your hands are surprisingly accurate portion guides that go wherever you go.
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Hand Measure</th>
              <th className="text-left p-2">Equals</th>
              <th className="text-left p-2">Use For</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Palm (length & thickness)</td>
              <td className="p-2">~4 oz / 100g protein</td>
              <td className="p-2">Meat, fish, tofu</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Fist</td>
              <td className="p-2">~1 cup / 200g carbs</td>
              <td className="p-2">Rice, pasta, potatoes, fruit</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Cupped hand</td>
              <td className="p-2">~½ cup / 100g carbs</td>
              <td className="p-2">Grains, beans, cereals</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Thumb (length)</td>
              <td className="p-2">~1 tbsp fat</td>
              <td className="p-2">Oil, butter, nut butter</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Thumb tip</td>
              <td className="p-2">~1 tsp</td>
              <td className="p-2">Oil, mayo, dressings</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Two fingers (width)</td>
              <td className="p-2">~1 oz / 30g cheese</td>
              <td className="p-2">Block cheese</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Quick Macro Estimates Per Hand Portion</h3>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li><strong>1 palm chicken breast</strong> = ~25-30g protein, 3g fat</li>
          <li><strong>1 palm salmon</strong> = ~25g protein, 10g fat</li>
          <li><strong>1 fist cooked rice</strong> = ~45g carbs, 4g protein</li>
          <li><strong>1 fist potatoes</strong> = ~35g carbs, 4g protein</li>
          <li><strong>1 thumb olive oil</strong> = ~14g fat, 120 calories</li>
          <li><strong>1 thumb peanut butter</strong> = ~8g fat, 4g protein, 3g carbs</li>
        </ul>
      </div>

      <h2>Precision Nutrition's Simple System</h2>

      <p>
        For each meal, aim for:
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold">Per Meal (Women):</p>
        <ul className="mt-2">
          <li>1 palm of protein</li>
          <li>1 fist of vegetables</li>
          <li>1 cupped hand of carbs</li>
          <li>1 thumb of fats</li>
        </ul>
        <p className="font-semibold mt-4">Per Meal (Men):</p>
        <ul className="mt-2">
          <li>2 palms of protein</li>
          <li>2 fists of vegetables</li>
          <li>2 cupped hands of carbs</li>
          <li>2 thumbs of fats</li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Eat 3-4 meals like this daily. Adjust servings based on your specific goals and results.
      </p>

      <h2>Visual Comparison Guide</h2>

      <p>
        Compare food portions to familiar objects:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Object</th>
              <th className="text-left p-2">Size</th>
              <th className="text-left p-2">Example Foods</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Deck of cards</td>
              <td className="p-2">3 oz meat</td>
              <td className="p-2">Chicken, beef, fish</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Baseball</td>
              <td className="p-2">1 cup</td>
              <td className="p-2">Cereal, pasta, rice</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Tennis ball</td>
              <td className="p-2">½ cup</td>
              <td className="p-2">Ice cream, rice, beans</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Golf ball</td>
              <td className="p-2">2 tbsp</td>
              <td className="p-2">Peanut butter, hummus</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Dice (one)</td>
              <td className="p-2">1 tsp</td>
              <td className="p-2">Oil, butter</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">4 stacked dice</td>
              <td className="p-2">1 oz cheese</td>
              <td className="p-2">Block cheese</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Checkbook</td>
              <td className="p-2">3 oz fish fillet</td>
              <td className="p-2">Salmon, tilapia</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Lightbulb</td>
              <td className="p-2">1 medium fruit</td>
              <td className="p-2">Apple, orange, pear</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Use Standard Portions</h2>

      <p>
        Whenever possible, choose foods with known, consistent portions:
      </p>

      <h3>Pre-Portioned Proteins</h3>
      <ul>
        <li>Canned tuna/chicken (drained): ~25g protein per can</li>
        <li>Greek yogurt single-serve: 17g protein (0% Fage)</li>
        <li>Eggs: 6g protein each</li>
        <li>String cheese: 6g protein per stick</li>
        <li>Deli turkey: ~18g protein per 3oz package</li>
        <li>Protein bar: Check label, typically 20-25g</li>
      </ul>

      <h3>Pre-Portioned Carbs</h3>
      <ul>
        <li>Bread slices: ~15g carbs each</li>
        <li>Tortillas: 20-30g carbs depending on size</li>
        <li>Rice cups (microwaveable): ~40g carbs per cup</li>
        <li>Oatmeal packets: ~27g carbs each</li>
      </ul>

      <h3>Pre-Portioned Fats</h3>
      <ul>
        <li>Nut butter packets: ~8g fat per 1-oz packet</li>
        <li>Cheese slices: ~5g fat per slice</li>
        <li>Cooking spray: ~0 calories (brief spray)</li>
      </ul>

      <h2>The Plate Method</h2>

      <p>
        Use your plate as a portion guide:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li><strong>½ plate:</strong> Non-starchy vegetables (low calorie)</li>
          <li><strong>¼ plate:</strong> Lean protein (palm-sized)</li>
          <li><strong>¼ plate:</strong> Starchy carbs (fist-sized)</li>
          <li><strong>Small addition:</strong> Healthy fat (thumb-sized)</li>
        </ul>
      </div>

      <p>
        This naturally creates a balanced, moderate-calorie meal without any measuring.
      </p>

      <h2>Smart Tracking Shortcuts</h2>

      <h3>1. Eat Similar Meals</h3>
      <p>
        The more you eat the same meals, the better you get at estimating them. Pick 
        3-4 go-to breakfasts and lunches with known macros.
      </p>

      <h3>2. Front-Load Protein</h3>
      <p>
        Make breakfast and lunch high-protein (eggs, chicken, Greek yogurt). This gives 
        you flexibility for dinner while ensuring you hit your protein target.
      </p>

      <h3>3. Track the High-Impact Foods</h3>
      <p>
        Focus on accurately tracking:
      </p>
      <ul>
        <li><strong>Oils and fats</strong> — Easy to add 200+ calories without noticing</li>
        <li><strong>Nuts</strong> — A handful can be 300+ calories</li>
        <li><strong>Alcohol</strong> — Often forgotten, high calorie</li>
        <li><strong>Protein sources</strong> — To ensure you hit your target</li>
      </ul>

      <h3>4. Use Restaurant Nutrition Info</h3>
      <p>
        Many chains publish nutrition data. Order meals with known macros, then estimate 
        the rest of your day around them.
      </p>

      <h2>Accuracy vs. Convenience Trade-Off</h2>

      <p>
        Let's be honest about the accuracy levels:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Method</th>
              <th className="text-left p-2">Accuracy</th>
              <th className="text-left p-2">Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Food scale</td>
              <td className="p-2">95%+</td>
              <td className="p-2">Serious cuts, competition prep</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">AI photo tracking</td>
              <td className="p-2">80-90%</td>
              <td className="p-2">Daily tracking, convenience</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Hand portions</td>
              <td className="p-2">70-80%</td>
              <td className="p-2">Sustainable lifestyle, travel</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">No tracking</td>
              <td className="p-2">???</td>
              <td className="p-2">Maintenance, intuitive eating</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        70-80% accuracy with hand portions is often good enough for steady progress, 
        especially if you're consistent.
      </p>

      <h2>When You Should Use a Scale</h2>

      <p>
        Consider actually weighing food when:
      </p>

      <ul>
        <li>You're in a serious cutting phase and every calorie matters</li>
        <li>You've plateaued and need to tighten up</li>
        <li>You're learning — weigh for a few weeks to calibrate your estimates</li>
        <li>You're prepping for a competition or photo shoot</li>
      </ul>

      <h2>The Bottom Line</h2>

      <p>
        You don't need a food scale to track macros effectively. Hand portions, visual 
        comparisons, and pre-portioned foods can get you 80% accuracy — which is enough 
        for most people to see results. Perfect is the enemy of good.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">The easiest scale-free tracking:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> uses AI to 
          estimate macros from a photo — no scale, no measuring cups, no database searching. 
          Just snap and track.
        </p>
      </div>

      <p>
        <Link to="/calculators/macro" className="text-primary hover:underline">
          → Calculate your macro targets to know what you're aiming for
        </Link>
      </p>
    </div>
  );
}
