/**
 * Blog Post: Protein Per Day for Muscle Gain
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinForMuscleGain() {
  return (
    <div className="blog-content">
      <p>
        Building muscle requires protein — but how much? The fitness industry loves to push 
        extreme numbers. Here's what the science actually supports.
      </p>

      <h2>The Evidence-Based Answer</h2>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Optimal protein for muscle gain:</p>
        <p className="text-xl"><strong>0.7-1.0 grams per pound of body weight</strong></p>
        <p className="text-sm text-muted-foreground mt-2">(1.6-2.2 grams per kilogram)</p>
      </div>

      <p>
        Multiple meta-analyses confirm this range. A landmark 2018 study analyzing 49 studies 
        found that <strong>1.6g/kg (0.7g/lb)</strong> maximized muscle gains, with no additional 
        benefit above <strong>2.2g/kg (1.0g/lb)</strong>.
      </p>

      <h2>Protein Targets by Body Weight</h2>

      <table className="w-full border-collapse my-6">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">Body Weight</th>
            <th className="text-left p-2">Minimum (0.7g/lb)</th>
            <th className="text-left p-2">Upper Range (1.0g/lb)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="p-2">140 lbs (64 kg)</td>
            <td className="p-2">98g</td>
            <td className="p-2">140g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">160 lbs (73 kg)</td>
            <td className="p-2">112g</td>
            <td className="p-2">160g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">180 lbs (82 kg)</td>
            <td className="p-2">126g</td>
            <td className="p-2">180g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">200 lbs (91 kg)</td>
            <td className="p-2">140g</td>
            <td className="p-2">200g</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">220 lbs (100 kg)</td>
            <td className="p-2">154g</td>
            <td className="p-2">220g</td>
          </tr>
        </tbody>
      </table>

      <h2>Why Higher Isn't Always Better</h2>

      <p>
        The fitness industry often recommends 1.5g/lb or more. Here's why that's probably overkill:
      </p>

      <ul>
        <li><strong>No additional muscle benefit</strong> — Studies show no extra gains above 1.0g/lb</li>
        <li><strong>Displaces other macros</strong> — Carbs fuel intense workouts; fats support hormones</li>
        <li><strong>Expensive</strong> — Protein-rich foods cost more than carbs</li>
        <li><strong>Can cause digestive issues</strong> — Too much protein can cause bloating</li>
        <li><strong>Not sustainable</strong> — Extreme targets are hard to maintain</li>
      </ul>

      <h2>When to Use the Higher End (1.0g/lb)</h2>

      <p>Some situations warrant higher protein:</p>

      <ul>
        <li><strong>Calorie deficit while building muscle</strong> — "Recomp" requires more protein</li>
        <li><strong>Natural lifters</strong> — May benefit from the upper range vs enhanced athletes</li>
        <li><strong>Older adults (40+)</strong> — Muscle protein synthesis becomes less efficient</li>
        <li><strong>Very high training volume</strong> — More damage = more repair needed</li>
        <li><strong>Preference</strong> — Some people feel better with higher protein</li>
      </ul>

      <h2>Protein Distribution Matters</h2>

      <p>
        For muscle building, how you spread protein throughout the day may matter more than 
        during fat loss:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Optimal distribution:</p>
        <ul className="space-y-1">
          <li>4-5 protein feedings per day</li>
          <li>25-50g protein per meal</li>
          <li>3-4 hours between protein meals</li>
          <li>Protein within a few hours of training</li>
        </ul>
      </div>

      <p>
        Why? Muscle protein synthesis (MPS) has a "refractory period" — it spikes after eating 
        protein, then becomes less responsive for a few hours. Spacing meals allows repeated MPS spikes.
      </p>

      <h2>Sample Day: 180g Protein for Muscle Gain</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li><strong>7am Breakfast:</strong> 4 eggs + 2 egg whites + toast = 35g</li>
          <li><strong>10am Snack:</strong> Greek yogurt + almonds = 25g</li>
          <li><strong>1pm Lunch:</strong> 8oz chicken breast + rice + veggies = 55g</li>
          <li><strong>4pm Pre-workout:</strong> Protein shake + banana = 25g</li>
          <li><strong>7pm Dinner:</strong> 8oz salmon + potatoes + salad = 45g</li>
          <li><strong>Total: ~185g protein</strong></li>
        </ul>
      </div>

      <h2>Best Protein Sources for Muscle Building</h2>

      <h3>Complete Proteins (contain all essential amino acids)</h3>
      <ul>
        <li><strong>Chicken breast:</strong> 31g protein per 4oz</li>
        <li><strong>Lean beef:</strong> 28g protein per 4oz</li>
        <li><strong>Fish:</strong> 25-30g protein per 4oz</li>
        <li><strong>Eggs:</strong> 6g protein per egg</li>
        <li><strong>Greek yogurt:</strong> 17g protein per cup</li>
        <li><strong>Whey protein:</strong> 24-30g per scoop</li>
      </ul>

      <h3>Plant Proteins (combine for complete amino profile)</h3>
      <ul>
        <li><strong>Tofu:</strong> 20g protein per cup</li>
        <li><strong>Tempeh:</strong> 31g protein per cup</li>
        <li><strong>Lentils + rice:</strong> complete amino acids</li>
        <li><strong>Pea protein:</strong> 20-25g per scoop</li>
      </ul>

      <h2>Common Muscle-Building Protein Mistakes</h2>

      <h3>Mistake 1: All protein at dinner</h3>
      <p>
        Eating 100g of protein at dinner and 20g the rest of the day isn't optimal. 
        Distribute protein evenly throughout the day.
      </p>

      <h3>Mistake 2: Obsessing over the "anabolic window"</h3>
      <p>
        You don't need to chug a shake within 30 minutes of training. Just eat protein 
        within a few hours before and after your workout.
      </p>

      <h3>Mistake 3: Ignoring total calories</h3>
      <p>
        You can't build muscle without enough total calories. If you're not gaining weight, 
        you need more food — not just more protein.
      </p>

      <h3>Mistake 4: Cutting fat too low</h3>
      <p>
        Dietary fat supports testosterone production. Keep fat at least 20-25% of calories 
        while bulking.
      </p>

      <h2>The Bottom Line</h2>

      <p>
        For muscle building, aim for <strong>0.7-1.0 grams of protein per pound</strong>. 
        Hit the lower end if you're in a calorie surplus; consider the higher end if you're 
        recomping or over 40.
      </p>

      <p>
        Distribute protein across 4-5 meals, prioritize complete proteins, and remember 
        that total calories and training matter as much as protein intake.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Track your gains:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> helps you 
          track protein per meal and daily totals. See exactly how much protein you're getting 
          to make sure you're fueling muscle growth.
        </p>
      </div>
    </div>
  );
}
