import React from 'react';
import { Link } from 'react-router-dom';

export default function HowToCountMacrosBeginners() {
  return (
    <>
      <p>Macro counting is the most effective nutrition strategy for body composition — whether you want to lose fat, build muscle, or just understand what you're eating. But getting started feels overwhelming: numbers, formulas, food scales, apps... where do you even begin?</p>
      <p><strong>Right here.</strong> This is the complete beginner guide to counting macros, step by step.</p>
      
      <h2>Step 1: Understand What Macros Are</h2>
      <p>Macros (macronutrients) are the three types of nutrients that provide calories:</p>
      <ul>
      <li><strong>Protein:</strong> 4 cal/gram — builds and repairs muscle, highest satiety</li>
      <li><strong>Carbohydrates:</strong> 4 cal/gram — primary energy source, fuels workouts</li>
      <li><strong>Fat:</strong> 9 cal/gram — hormones, vitamin absorption, brain function</li>
      </ul>
      <p>Every food is some combination of these three. When you "count macros," you're tracking how many grams of each you eat daily. Read our <Link to="/blog/what-are-macros">detailed macro explainer</Link> for more.</p>
      
      <h2>Step 2: Calculate Your Targets</h2>
      <ol>
      <li><strong>Find your TDEE:</strong> Use our <Link to="/tdee-calculator">TDEE calculator</Link> — this is how many calories you burn daily</li>
      <li><strong>Set your calorie target:</strong> TDEE − 400 cal (fat loss) / TDEE (maintain) / TDEE + 300 cal (muscle gain)</li>
      <li><strong>Set protein:</strong> <Link to="/blog/how-much-protein-per-kg">1.6-2.2 g/kg body weight</Link></li>
      <li><strong>Set fat:</strong> 25-30% of calories (÷ 9 for grams)</li>
      <li><strong>Set carbs:</strong> Remaining calories (÷ 4 for grams)</li>
      </ol>
      <p>Or just use our <Link to="/macro-calculator">macro calculator</Link> — it does all this automatically.</p>
      
      <h3>Example: 75 kg Male, Fat Loss</h3>
      <ul>
      <li>TDEE: 2,500 cal</li>
      <li>Target: 2,100 cal (−400)</li>
      <li>Protein: 150g (600 cal) — 2.0 g/kg</li>
      <li>Fat: 58g (525 cal) — 25%</li>
      <li>Carbs: 244g (975 cal) — remaining</li>
      </ul>
      
      <h2>Step 3: Start Tracking</h2>
      <p>You have three options:</p>
      <ol>
      <li><strong>AI photo tracking</strong> — Snap photos with <Link to="/">ProteinLens</Link>. Fastest method, ~30 seconds per meal.</li>
      <li><strong>Manual app logging</strong> — Search databases, enter portions. More precise for packaged foods.</li>
      <li><strong>Hand portion method</strong> — No app needed, ~85% accuracy. See our <Link to="/blog/track-macros-without-counting">no-counting guide</Link>.</li>
      </ol>
      <p>Our recommendation for beginners: <strong>start with AI photo tracking</strong>. It's the lowest friction, so you're more likely to actually do it consistently.</p>
      
      <h2>Your First Week: What to Expect</h2>
      <ul>
      <li><strong>Day 1-2:</strong> You'll be surprised how much (or little) protein you actually eat</li>
      <li><strong>Day 3-4:</strong> You'll start adjusting portions naturally — "I need more protein at lunch"</li>
      <li><strong>Day 5-7:</strong> It starts feeling automatic — you know roughly what's in your usual meals</li>
      <li><strong>After 2 weeks:</strong> You can eyeball most meals within 80% accuracy</li>
      </ul>
      
      <h2>The 5 Biggest Beginner Mistakes</h2>
      <ol>
      <li><strong>Being too precise:</strong> ±5g on each macro is fine. Don't stress over hitting exact numbers.</li>
      <li><strong>Not eating enough protein:</strong> Most beginners are 40-60g short. Make protein the priority.</li>
      <li><strong>Forgetting to count oils/sauces:</strong> A tablespoon of olive oil is 120 cal. Sauces can add 200-400 cal.</li>
      <li><strong>Eating the same foods forever:</strong> Variety prevents burnout. You don't need "clean" foods — any food can fit your macros.</li>
      <li><strong>Quitting after a bad day:</strong> One over-target day changes nothing. What matters is the weekly average.</li>
      </ol>
      
      <h2>Pro Tips for Success</h2>
      <ul>
      <li><strong>Meal prep on Sunday:</strong> Pre-tracked meals eliminate daily decision fatigue (<Link to="/blog/high-protein-meal-prep">meal prep guide</Link>)</li>
      <li><strong>Build a rotation:</strong> 4-5 breakfasts, 4-5 lunches, 4-5 dinners that hit your macros. Rotate weekly.</li>
      <li><strong>Front-load protein:</strong> Get 30g+ at breakfast — it's harder to catch up later</li>
      <li><strong>Don't drink your calories:</strong> Soda, juice, alcohol — liquid calories don't register as "food" in your brain</li>
      <li><strong>Take progress photos monthly:</strong> The scale lies (water weight), but photos don't</li>
      </ul>
      
      <h2>When to Adjust Your Macros</h2>
      <ul>
      <li><strong>After 2-3 weeks:</strong> Not losing weight? Drop 200 cal. Not gaining? Add 200 cal.</li>
      <li><strong>After losing/gaining 3-5 kg:</strong> Recalculate — your TDEE has changed</li>
      <li><strong>When changing activity:</strong> Started lifting? Increase protein and carbs. Injured and sedentary? Reduce carbs.</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/what-are-macros">What Are Macros?</Link></li>
        <li><Link to="/blog/calories-vs-macros">Calories vs Macros</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
