/**
 * Blog Post: Protein Per Day for Fat Loss
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinForFatLoss() {
  return (
    <div className="blog-content">
      <p>
        When you're trying to lose fat, protein becomes even more important. But does eating 
        more protein always mean better results? Here's what the research actually shows.
      </p>

      <h2>Why Protein Matters More During Fat Loss</h2>

      <p>
        When you're in a calorie deficit, your body doesn't just burn fat — it can also 
        break down muscle for energy. Higher protein intake helps prevent this in three ways:
      </p>

      <ol>
        <li><strong>Preserves muscle mass</strong> — Protein provides amino acids to maintain 
        muscle tissue even when calories are low</li>
        <li><strong>Increases satiety</strong> — Protein keeps you fuller longer, making it 
        easier to stick to a deficit</li>
        <li><strong>Boosts metabolism</strong> — Protein has a higher thermic effect (20-30% 
        of protein calories are burned during digestion vs 5-10% for carbs/fat)</li>
      </ol>

      <h2>Optimal Protein for Fat Loss</h2>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Research-backed recommendation:</p>
        <p className="text-xl"><strong>0.8-1.0 grams per pound of body weight</strong></p>
        <p className="text-sm text-muted-foreground mt-2">(1.8-2.2 grams per kilogram)</p>
      </div>

      <p>
        This is higher than the general recommendation because calorie restriction increases 
        the risk of muscle loss. More protein provides a protective buffer.
      </p>

      <h3>By Body Weight</h3>
      <table className="w-full border-collapse my-6">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">Body Weight</th>
            <th className="text-left p-2">Protein Target (0.8-1.0g/lb)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="p-2">130 lbs</td>
            <td className="p-2">104-130g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">150 lbs</td>
            <td className="p-2">120-150g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">180 lbs</td>
            <td className="p-2">144-180g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">200 lbs</td>
            <td className="p-2">160-200g</td>
          </tr>
        </tbody>
      </table>

      <h2>Does More Protein = More Fat Loss?</h2>

      <p>
        Not exactly. Here's what the research shows:
      </p>

      <h3>Benefits of Higher Protein (0.7-1.0g/lb)</h3>
      <ul>
        <li>Better muscle retention during weight loss</li>
        <li>Reduced hunger and cravings</li>
        <li>Slightly higher calorie burn from digestion</li>
        <li>Easier to maintain a deficit long-term</li>
      </ul>

      <h3>Diminishing Returns Above 1.0g/lb</h3>
      <ul>
        <li>No additional muscle-sparing benefit shown in studies</li>
        <li>Displaces other macros (carbs fuel workouts, fats support hormones)</li>
        <li>Can make diet feel restrictive</li>
        <li>More expensive (protein-rich foods cost more)</li>
      </ul>

      <p>
        <strong>Bottom line:</strong> Aim for 0.8-1.0g/lb. Going higher won't hurt, but 
        there's no proven benefit, and it may make your diet harder to sustain.
      </p>

      <h2>Protein Timing During Fat Loss</h2>

      <p>
        When calories are limited, spreading protein throughout the day may help optimize 
        muscle protein synthesis:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Example: 150g protein in 1600 calories</p>
        <ul className="space-y-1">
          <li><strong>Breakfast (8am):</strong> 35-40g protein</li>
          <li><strong>Lunch (12pm):</strong> 40-45g protein</li>
          <li><strong>Snack (3pm):</strong> 20-25g protein</li>
          <li><strong>Dinner (7pm):</strong> 40-50g protein</li>
        </ul>
      </div>

      <p>
        This isn't mandatory — total daily protein matters most. But 4-5 protein feedings 
        may be slightly better than 1-2 large meals.
      </p>

      <h2>High-Protein Foods for Low-Calorie Diets</h2>

      <p>
        When calories are limited, you want the most protein per calorie:
      </p>

      <h3>Best Protein-to-Calorie Ratios</h3>
      <ul>
        <li><strong>Chicken breast:</strong> 31g protein per 140 calories (4oz)</li>
        <li><strong>Egg whites:</strong> 11g protein per 50 calories (1 cup)</li>
        <li><strong>Shrimp:</strong> 24g protein per 120 calories (4oz)</li>
        <li><strong>Nonfat Greek yogurt:</strong> 17g protein per 100 calories (1 cup)</li>
        <li><strong>Cottage cheese (2%):</strong> 14g protein per 90 calories (½ cup)</li>
        <li><strong>White fish (cod, tilapia):</strong> 26g protein per 110 calories (4oz)</li>
      </ul>

      <h3>Moderate Options</h3>
      <ul>
        <li><strong>Lean beef (93%):</strong> 23g protein per 170 calories (4oz)</li>
        <li><strong>Salmon:</strong> 23g protein per 200 calories (4oz)</li>
        <li><strong>Whole eggs:</strong> 12g protein per 140 calories (2 eggs)</li>
        <li><strong>Tofu:</strong> 20g protein per 180 calories (1 cup)</li>
      </ul>

      <h2>Common Mistakes During Fat Loss</h2>

      <h3>Mistake 1: Cutting protein when cutting calories</h3>
      <p>
        Some people reduce everything proportionally when dieting. This is backwards — 
        protein should stay high (or even increase) while carbs and fats decrease.
      </p>

      <h3>Mistake 2: Relying only on protein shakes</h3>
      <p>
        Whole food protein is more satiating than shakes. Use shakes to supplement, 
        not replace, real meals.
      </p>

      <h3>Mistake 3: Ignoring protein at breakfast</h3>
      <p>
        A high-protein breakfast (30-40g) reduces hunger and cravings all day. Don't 
        "save" protein for dinner.
      </p>

      <h3>Mistake 4: Not tracking protein</h3>
      <p>
        Most people overestimate their protein intake. Track for at least a week to see 
        if you're actually hitting your target.
      </p>

      <h2>Fat Loss Protein Checklist</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li>✅ Eating 0.8-1.0g protein per pound of body weight</li>
          <li>✅ Protein at every meal (30-50g per meal)</li>
          <li>✅ Choosing lean protein sources to save calories</li>
          <li>✅ Not skipping protein at breakfast</li>
          <li>✅ Tracking to ensure you hit your target</li>
          <li>✅ Prioritizing whole foods over shakes</li>
        </ul>
      </div>

      <h2>The Bottom Line</h2>

      <p>
        For fat loss, aim for <strong>0.8-1.0 grams of protein per pound</strong>. This 
        preserves muscle, controls hunger, and slightly boosts your metabolism. Going 
        higher than 1.0g/lb probably won't help more.
      </p>

      <p>
        The hardest part is consistency. Track your protein to make sure you're actually 
        hitting your target — it's easier than you think to fall short.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Track your protein goals:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> shows your 
          protein intake front and center. Snap meal photos to track protein throughout the 
          day and see if you're hitting your fat loss targets.
        </p>
      </div>
    </div>
  );
}
