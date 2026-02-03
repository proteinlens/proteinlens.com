/**
 * Blog Post: How Much Protein Do I Need Per Day?
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function HowMuchProteinPerDay() {
  return (
    <div className="blog-content">
      <p>
        "How much protein do I need?" is one of the most common nutrition questions — and 
        the internet gives wildly different answers. Here's the evidence-based truth, with 
        practical recommendations based on your goals.
      </p>

      <h2>The Quick Answer</h2>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Daily protein targets (grams per pound of body weight):</p>
        <ul className="space-y-1">
          <li><strong>General health:</strong> 0.36g/lb (0.8g/kg) — minimum RDA</li>
          <li><strong>Fat loss:</strong> 0.7-1.0g/lb (1.6-2.2g/kg)</li>
          <li><strong>Muscle building:</strong> 0.7-1.0g/lb (1.6-2.2g/kg)</li>
          <li><strong>Athletes:</strong> 0.8-1.2g/lb (1.8-2.4g/kg)</li>
        </ul>
      </div>

      <p>
        For most active people trying to build muscle or lose fat, <strong>0.7-1.0 grams per 
        pound of body weight</strong> is the sweet spot.
      </p>

      <h2>Protein Needs by Body Weight</h2>

      <table className="w-full border-collapse my-6">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">Body Weight</th>
            <th className="text-left p-2">Minimum (0.36g/lb)</th>
            <th className="text-left p-2">Active (0.7g/lb)</th>
            <th className="text-left p-2">Athletic (1.0g/lb)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="p-2">120 lbs (55 kg)</td>
            <td className="p-2">43g</td>
            <td className="p-2">84g</td>
            <td className="p-2">120g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">150 lbs (68 kg)</td>
            <td className="p-2">54g</td>
            <td className="p-2">105g</td>
            <td className="p-2">150g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">180 lbs (82 kg)</td>
            <td className="p-2">65g</td>
            <td className="p-2">126g</td>
            <td className="p-2">180g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">200 lbs (91 kg)</td>
            <td className="p-2">72g</td>
            <td className="p-2">140g</td>
            <td className="p-2">200g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">220 lbs (100 kg)</td>
            <td className="p-2">79g</td>
            <td className="p-2">154g</td>
            <td className="p-2">220g</td>
          </tr>
        </tbody>
      </table>

      <p>
        Use our <Link to="/protein-calculator" className="text-primary hover:underline">protein 
        calculator</Link> to get a personalized recommendation.
      </p>

      <h2>Why Protein Needs Vary</h2>

      <h3>Goal: Fat Loss</h3>
      <p>
        Higher protein (0.8-1.0g/lb) during a calorie deficit helps:
      </p>
      <ul>
        <li><strong>Preserve muscle</strong> while losing fat</li>
        <li><strong>Control hunger</strong> (protein is the most satiating macro)</li>
        <li><strong>Boost metabolism</strong> (protein has a higher thermic effect)</li>
      </ul>

      <h3>Goal: Muscle Building</h3>
      <p>
        Building muscle requires adequate protein for repair and growth. Research shows:
      </p>
      <ul>
        <li><strong>0.7g/lb is sufficient</strong> for most people</li>
        <li><strong>1.0g/lb provides a buffer</strong> and may be optimal for some</li>
        <li><strong>Beyond 1.0g/lb</strong> shows minimal additional benefit</li>
      </ul>

      <h3>Goal: General Health</h3>
      <p>
        The RDA (0.36g/lb) is the minimum to prevent deficiency, not the optimal amount. 
        Most health experts now recommend 0.5-0.7g/lb for non-athletes.
      </p>

      <h2>Common Protein Myths</h2>

      <h3>Myth: "You can only absorb 30g of protein per meal"</h3>
      <p>
        <strong>False.</strong> Your body can absorb much more — it just takes longer. The 30g 
        myth came from misinterpreted muscle protein synthesis studies. You can eat 50g+ in a 
        meal and your body will use it.
      </p>

      <h3>Myth: "Too much protein damages your kidneys"</h3>
      <p>
        <strong>False for healthy people.</strong> High protein intake has no negative kidney 
        effects in people without pre-existing kidney disease. If you have kidney issues, 
        consult your doctor.
      </p>

      <h3>Myth: "You need protein immediately after workouts"</h3>
      <p>
        <strong>Overblown.</strong> The "anabolic window" is much longer than 30-60 minutes. 
        Total daily protein matters far more than timing. Eat when convenient.
      </p>

      <h2>How to Hit Your Protein Goal</h2>

      <p>
        For someone needing 150g of protein per day:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Example day:</p>
        <ul className="space-y-1">
          <li><strong>Breakfast:</strong> 3 eggs + Greek yogurt = 35g</li>
          <li><strong>Lunch:</strong> Chicken breast salad = 45g</li>
          <li><strong>Snack:</strong> Protein shake or cottage cheese = 25g</li>
          <li><strong>Dinner:</strong> Salmon + sides = 40g</li>
          <li><strong>Evening:</strong> Casein or Greek yogurt = 20g</li>
          <li><strong>Total: ~165g protein</strong></li>
        </ul>
      </div>

      <h2>Best Protein Sources</h2>

      <h3>Animal Proteins (complete, high bioavailability)</h3>
      <ul>
        <li>Chicken breast: 31g per 4oz</li>
        <li>Lean beef: 28g per 4oz</li>
        <li>Fish (salmon, tuna): 25-30g per 4oz</li>
        <li>Eggs: 6g per egg</li>
        <li>Greek yogurt: 15-20g per cup</li>
        <li>Cottage cheese: 14g per half cup</li>
      </ul>

      <h3>Plant Proteins (combine for complete amino acids)</h3>
      <ul>
        <li>Tofu: 20g per cup</li>
        <li>Tempeh: 31g per cup</li>
        <li>Lentils: 18g per cup cooked</li>
        <li>Black beans: 15g per cup cooked</li>
        <li>Edamame: 17g per cup</li>
        <li>Seitan: 25g per 3oz</li>
      </ul>

      <h2>Signs You're Not Getting Enough Protein</h2>

      <ul>
        <li>Constant hunger, especially after meals</li>
        <li>Slow recovery from workouts</li>
        <li>Losing muscle despite exercising</li>
        <li>Weak nails, hair loss, dry skin</li>
        <li>Getting sick frequently</li>
        <li>Cravings for sweets (body seeking quick energy)</li>
      </ul>

      <h2>The Bottom Line</h2>

      <p>
        For most people reading this (active, trying to improve body composition), aim for 
        <strong>0.7-1.0 grams of protein per pound of body weight</strong>. This gives you 
        the benefits of adequate protein without obsessing over exact amounts.
      </p>

      <p>
        Start tracking your protein for a week to see where you're at. Most people are 
        surprised to find they're eating far less than they thought.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Track your protein:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> makes it 
          easy to see your protein intake at a glance. Snap a photo of your meals and get 
          instant macro breakdowns, including protein per meal and daily totals.
        </p>
      </div>
    </div>
  );
}
