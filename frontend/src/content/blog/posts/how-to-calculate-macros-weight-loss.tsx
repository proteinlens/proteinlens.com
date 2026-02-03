/**
 * Blog Post: How to Calculate Macros for Weight Loss
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function HowToCalculateMacrosWeightLoss() {
  return (
    <div className="blog-content">
      <p>
        Calculating macros for weight loss isn't complicated — it's just math. This guide 
        walks you through the exact formulas to find your personal macro targets, plus a 
        ready-to-use calculator at the bottom.
      </p>

      <h2>The Quick Version</h2>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold">Weight Loss Macro Formula:</p>
        <ol className="mt-2 space-y-1">
          <li>1. Find your TDEE (maintenance calories)</li>
          <li>2. Subtract 300-500 calories</li>
          <li>3. Set protein at 1g per pound of goal body weight</li>
          <li>4. Set fat at 0.35g per pound of body weight</li>
          <li>5. Fill remaining calories with carbs</li>
        </ol>
      </div>

      <h2>Step 1: Calculate Your TDEE</h2>

      <p>
        TDEE (Total Daily Energy Expenditure) is how many calories you burn per day. 
        Start with your BMR and multiply by an activity factor.
      </p>

      <h3>Calculate BMR (Mifflin-St Jeor Equation)</h3>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p><strong>Men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5</p>
        <p><strong>Women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161</p>
      </div>

      <h3>Multiply by Activity Level</h3>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Activity Level</th>
              <th className="text-left p-2">Multiplier</th>
              <th className="text-left p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Sedentary</td>
              <td className="p-2">1.2</td>
              <td className="p-2">Desk job, minimal exercise</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Lightly Active</td>
              <td className="p-2">1.375</td>
              <td className="p-2">Light exercise 1-3 days/week</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Moderately Active</td>
              <td className="p-2">1.55</td>
              <td className="p-2">Moderate exercise 3-5 days/week</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Very Active</td>
              <td className="p-2">1.725</td>
              <td className="p-2">Hard exercise 6-7 days/week</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Extremely Active</td>
              <td className="p-2">1.9</td>
              <td className="p-2">Physical job + hard training</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        <strong>Tip:</strong> Most people overestimate their activity level. When in doubt, round down.
      </p>

      <h2>Step 2: Create a Calorie Deficit</h2>

      <p>
        For sustainable fat loss, subtract 300-500 calories from your TDEE:
      </p>

      <ul>
        <li><strong>Slow & steady (recommended):</strong> -300 calories = ~0.6 lb/week loss</li>
        <li><strong>Moderate:</strong> -500 calories = ~1 lb/week loss</li>
        <li><strong>Aggressive (short-term only):</strong> -750 calories = ~1.5 lb/week loss</li>
      </ul>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
        <p className="font-semibold">⚠️ Don't Go Too Low</p>
        <p className="mt-2">
          Women shouldn't go below 1,200 calories; men shouldn't go below 1,500. Eating too 
          little causes muscle loss, metabolic adaptation, and is hard to sustain.
        </p>
      </div>

      <h2>Step 3: Set Your Protein</h2>

      <p>
        Protein is the most important macro for weight loss. It preserves muscle, keeps you 
        full, and has the highest thermic effect (you burn calories digesting it).
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold">Protein Target: 0.8-1g per pound of GOAL body weight</p>
        <p className="text-sm text-muted-foreground mt-1">
          If you're 200lbs wanting to get to 160lbs, aim for 128-160g protein.
        </p>
      </div>

      <p>
        <strong>Why goal weight?</strong> Because protein needs are based on lean mass, not 
        total body weight. Using goal weight is a simple proxy.
      </p>

      <h2>Step 4: Set Your Fat</h2>

      <p>
        Fat is essential for hormone production (including testosterone and estrogen) and 
        vitamin absorption. Don't go too low.
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p><strong>Fat Target: 0.3-0.4g per pound of body weight</strong></p>
        <p className="text-sm text-muted-foreground mt-1">
          For a 180lb person: 54-72g fat daily
        </p>
      </div>

      <p>
        If you're coming from a high-fat diet, 0.4g is more sustainable. If you prefer 
        more carbs, 0.3g is the minimum for hormone health.
      </p>

      <h2>Step 5: Calculate Carbs</h2>

      <p>
        Carbs are what's left after protein and fat. Here's the math:
      </p>

      <ol>
        <li>Protein grams × 4 = protein calories</li>
        <li>Fat grams × 9 = fat calories</li>
        <li>Total calories − protein calories − fat calories = carb calories</li>
        <li>Carb calories ÷ 4 = carb grams</li>
      </ol>

      <h2>Full Example: 180lb Person Wanting to Reach 160lb</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Step-by-Step Calculation:</p>
        <ul className="space-y-2">
          <li><strong>BMR:</strong> 1,800 calories (calculated)</li>
          <li><strong>TDEE (moderately active × 1.55):</strong> 2,790 calories</li>
          <li><strong>Deficit (−500):</strong> 2,290 calories</li>
          <li><strong>Protein (160lb goal × 1):</strong> 160g = 640 calories</li>
          <li><strong>Fat (180lb × 0.35):</strong> 63g = 567 calories</li>
          <li><strong>Carbs:</strong> (2,290 − 640 − 567) ÷ 4 = 271g</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="font-semibold">Final Macros:</p>
          <p>160g protein | 271g carbs | 63g fat | 2,290 calories</p>
        </div>
      </div>

      <h2>Adjusting Based on Results</h2>

      <p>
        Your calculated macros are a starting point. Adjust every 2-4 weeks based on results:
      </p>

      <h3>If You're Losing Weight Too Fast (More Than 1.5% body weight/week)</h3>
      <ul>
        <li>You're likely losing muscle too</li>
        <li>Add 100-200 calories (mostly carbs)</li>
        <li>Make sure protein is at 1g per pound goal weight</li>
      </ul>

      <h3>If You're Not Losing Weight</h3>
      <ul>
        <li>First, make sure you're tracking accurately (weighing food, not eyeballing)</li>
        <li>If tracking is accurate, reduce by 100-200 calories</li>
        <li>Don't reduce below minimum calorie thresholds</li>
      </ul>

      <h3>If You're Always Hungry</h3>
      <ul>
        <li>Increase protein (even if over target)</li>
        <li>Shift carbs toward fiber-rich vegetables</li>
        <li>Make sure you're not in too aggressive a deficit</li>
      </ul>

      <h2>Common Mistakes</h2>

      <ol>
        <li><strong>Eating too few calories</strong> — Leads to muscle loss and metabolic adaptation</li>
        <li><strong>Not enough protein</strong> — You'll lose muscle along with fat</li>
        <li><strong>Overestimating activity level</strong> — Be honest about how much you move</li>
        <li><strong>Not adjusting over time</strong> — As you lose weight, your TDEE decreases</li>
        <li><strong>Weekend splurges</strong> — One big day can erase a week's deficit</li>
      </ol>

      <h2>Macro Tracking Tips for Weight Loss</h2>

      <ul>
        <li><strong>Weigh your food</strong> — Visual estimates are usually wrong by 30-50%</li>
        <li><strong>Track before you eat</strong> — Plan meals in advance when possible</li>
        <li><strong>Prioritize protein</strong> — Hit protein target even if other macros are off</li>
        <li><strong>Stay consistent</strong> — Same deficit every day beats big swings</li>
        <li><strong>Trust the process</strong> — Weight fluctuates daily; focus on weekly trends</li>
      </ul>

      <h2>The Bottom Line</h2>

      <p>
        Calculate your TDEE, create a moderate deficit, prioritize protein, and adjust based 
        on results. Perfect macro tracking isn't necessary — consistency is what drives results.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Track your macros effortlessly:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> lets you 
          track macros by photo — no weighing required, no database searching. Just snap 
          and see your macros instantly.
        </p>
      </div>

      <p>
        <Link to="/calculators/macro" className="text-primary hover:underline">
          → Use our free Macro Calculator to get your personal targets
        </Link>
      </p>
    </div>
  );
}
