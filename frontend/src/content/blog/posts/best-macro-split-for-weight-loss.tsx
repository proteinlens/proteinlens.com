import React from 'react';
import { Link } from 'react-router-dom';

export default function BestMacroSplitForWeightLoss() {
  return (
    <>
      <p>
        You know you need a calorie deficit to lose weight — but <strong>how you split those calories between protein, carbs, and fat makes a massive difference</strong> in whether you lose fat, muscle, or both.
      </p>
      <p>
        Here's the evidence-based guide to finding the best macro split for weight loss that preserves muscle, keeps you full, and is actually sustainable.
      </p>

      <h2>Why Macro Split Matters for Fat Loss</h2>
      <p>
        A calorie deficit alone will make you lose weight. But not all weight loss is equal:
      </p>
      <ul>
        <li><strong>High protein + moderate deficit:</strong> ~80% fat loss, ~20% muscle loss</li>
        <li><strong>Low protein + aggressive deficit:</strong> ~50% fat loss, ~50% muscle loss</li>
      </ul>
      <p>
        Losing muscle slows your metabolism, makes you look "soft" even at a lower weight, and makes it harder to keep the weight off. Your macro split is the difference between looking lean and just being lighter.
      </p>

      <h2>The Research-Backed Fat Loss Macro Split</h2>
      <p>
        Based on the best available research (Helms et al., 2014; ISSN Position Stand, 2017; Aragon et al., 2017), here's the optimal range:
      </p>
      <ul>
        <li><strong>Protein:</strong> 30-35% of calories (or <Link to="/blog/how-much-protein-per-kg">1.6-2.4 g/kg body weight</Link>)</li>
        <li><strong>Fat:</strong> 20-30% of calories (minimum ~0.5 g/kg for hormonal health)</li>
        <li><strong>Carbs:</strong> Remaining calories (typically 35-50%)</li>
      </ul>

      <h3>Example: 75 kg Person Eating 2,000 Calories</h3>
      <ul>
        <li><strong>Protein (30%):</strong> 150g (600 cal) — 2.0 g/kg ✓</li>
        <li><strong>Fat (25%):</strong> 56g (500 cal) — 0.75 g/kg ✓</li>
        <li><strong>Carbs (45%):</strong> 225g (900 cal)</li>
      </ul>
      <p>
        Use our <Link to="/macro-calculator">macro calculator</Link> to get your personalized split.
      </p>

      <h2>Protein: The Most Important Macro for Fat Loss</h2>
      <p>
        If you can only focus on one macronutrient, make it protein. Three reasons:
      </p>
      <ol>
        <li><strong>Muscle preservation:</strong> Adequate protein (1.6+ g/kg) prevents muscle loss during a deficit (Phillips et al., 2016)</li>
        <li><strong>Highest satiety:</strong> Protein keeps you fuller longer than carbs or fat, reducing total calorie intake naturally</li>
        <li><strong>Thermic effect:</strong> Your body burns 20-30% of protein calories during digestion, vs. 5-10% for carbs and 0-3% for fat</li>
      </ol>
      <p>
        Read more: <Link to="/blog/protein-for-fat-loss">How protein helps fat loss</Link>
      </p>

      <h2>Fat: Don't Go Too Low</h2>
      <p>
        Fat is essential for hormone production (testosterone, estrogen), vitamin absorption, and brain function. Going below 20% of calories (or ~0.5 g/kg) can cause:
      </p>
      <ul>
        <li>Hormonal disruption (low testosterone in men, menstrual irregularities in women)</li>
        <li>Poor vitamin absorption (A, D, E, K are fat-soluble)</li>
        <li>Constant hunger (fat + fiber = satiety)</li>
        <li>Dry skin, brittle hair</li>
      </ul>
      <p>
        <strong>Practical tip:</strong> Prioritize healthy fats — olive oil, avocado, nuts, fatty fish. They're calorie-dense, so measure them carefully during a cut.
      </p>

      <h2>Carbs: Your Performance Fuel</h2>
      <p>
        After protein and fat are set, fill the remaining calories with carbs. Carbs fuel your workouts, support recovery, and keep your mood stable.
      </p>
      <p>
        Low-carb diets aren't inherently better for fat loss. A meta-analysis by Hall & Guo (2017) found no significant difference in fat loss between low-carb and low-fat diets when protein and calories are matched. Choose whichever you can stick to.
      </p>
      <p>
        <strong>If you train hard:</strong> Keep carbs at 40-50% to fuel workouts<br />
        <strong>If you're sedentary:</strong> Lower carbs (35-40%) and increase fat for satiety
      </p>

      <h2>Common Macro Split Approaches Compared</h2>
      <ul>
        <li><strong>40/30/30 (Zone):</strong> 40% carbs, 30% protein, 30% fat — balanced, good for moderate activity</li>
        <li><strong>40/35/25:</strong> Higher protein, lower fat — optimal for heavy lifters in a cut</li>
        <li><strong>50/25/25:</strong> Higher carb — better for endurance athletes or high-volume training</li>
        <li><strong>30/35/35 (Low Carb):</strong> Lower carb, higher fat — may help with appetite control if you don't train intensely</li>
        <li><strong>Keto (5/30/65):</strong> Very low carb, high fat — effective for some but not superior for fat loss when calories are matched</li>
      </ul>
      <p>
        <strong>The best split is the one you can sustain.</strong> All of these work if you maintain a deficit with adequate protein. Track your meals with <Link to="/">ProteinLens</Link> to see how your actual intake compares to your targets.
      </p>

      <h2>How to Adjust Your Split Over Time</h2>
      <ol>
        <li><strong>Start with the research-backed default</strong> (30-35% protein, 25% fat, rest carbs)</li>
        <li><strong>Track for 2 weeks</strong> — monitor weight trend, energy, and hunger</li>
        <li><strong>Adjust carbs/fat:</strong> Tired and flat in workouts? Increase carbs. Hungry all the time? Increase fat.</li>
        <li><strong>Keep protein constant</strong> — this is the one macro you don't flex</li>
        <li><strong>Re-calculate as you lose weight:</strong> Use our <Link to="/calorie-calculator">calorie calculator</Link> every 4-6 weeks</li>
      </ol>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/how-to-calculate-macros-weight-loss">Calculate Macros for Weight Loss</Link></li>
        <li><Link to="/blog/calories-vs-macros">Calories vs. Macros: What Matters More?</Link></li>
        <li><Link to="/blog/weight-loss-plateau-reasons">Why Your Weight Loss Has Stalled</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">Protein Per Kg: Complete Guide</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
