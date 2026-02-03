/**
 * Blog Post: How to Track Macros When Eating Out
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function TrackMacrosEatingOut() {
  return (
    <div className="blog-content">
      <p>
        Restaurants are where most diets go off-track. Between hidden oils, oversized portions, 
        and "I'll start fresh tomorrow" thinking, eating out can derail weeks of progress. 
        But it doesn't have to. Here's how to track macros at restaurants — without being 
        the weird person at the table.
      </p>

      <h2>The Restaurant Tracking Challenge</h2>

      <p>
        Restaurant meals are hard to track because:
      </p>

      <ul>
        <li><strong>Hidden fats</strong> — Butter and oil are added liberally</li>
        <li><strong>Portion sizes</strong> — Often 2-3x a normal serving</li>
        <li><strong>No nutrition labels</strong> — Unless it's a chain</li>
        <li><strong>Social pressure</strong> — Everyone else is eating freely</li>
        <li><strong>Decision fatigue</strong> — Huge menus make healthy choices harder</li>
      </ul>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">Reality check:</p>
        <p className="mt-2">
          A typical restaurant entrée has 1,000-1,500 calories. Add an appetizer, drink, 
          and dessert, and you're looking at 2,000-3,000 calories in one meal.
        </p>
      </div>

      <h2>Strategy 1: Use Chain Restaurant Nutrition Data</h2>

      <p>
        Chain restaurants (Chipotle, Olive Garden, Applebee's, etc.) publish nutrition 
        information. Use it.
      </p>

      <h3>Best chain options by protein:</h3>
      <ul>
        <li><strong>Chipotle:</strong> Burrito bowl with double chicken (60g+ protein)</li>
        <li><strong>Chick-fil-A:</strong> Grilled nuggets + side salad (35g protein)</li>
        <li><strong>Subway:</strong> 6" Turkey or Chicken (25-30g protein)</li>
        <li><strong>Panera:</strong> Half sandwich + salad combos</li>
      </ul>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold">Pro tip:</p>
        <p>
          Build your go-to meals at chains you frequent. Know the macros by heart so you 
          can order on autopilot without checking every time.
        </p>
      </div>

      <h2>Strategy 2: The Estimation Framework</h2>

      <p>
        For non-chain restaurants, use this framework:
      </p>

      <h3>Estimate Protein</h3>
      <p>
        Look at your protein source and compare to known sizes:
      </p>
      <ul>
        <li>Palm-sized portion = ~25-30g protein</li>
        <li>Deck of cards = ~21-25g protein (3 oz cooked)</li>
        <li>6oz steak = ~42g protein (common restaurant size)</li>
        <li>Salmon fillet = ~35-40g protein (typical 5-6oz)</li>
        <li>Chicken breast = ~30-40g protein (varies by size)</li>
      </ul>

      <h3>Estimate Carbs</h3>
      <ul>
        <li>Fist of rice/pasta = ~45g carbs</li>
        <li>Bread basket roll = ~25-30g carbs each</li>
        <li>Baked potato = ~35-40g carbs (medium)</li>
        <li>Side of fries = ~50-70g carbs</li>
      </ul>

      <h3>Estimate Fats (This Is Where It Gets Tricky)</h3>
      <p>
        Restaurants use WAY more fat than home cooking. Assume:
      </p>
      <ul>
        <li>Sautéed vegetables = +10-15g fat (from butter/oil)</li>
        <li>Grilled protein = +5-10g fat (even "dry" cooking)</li>
        <li>Any sauce = +10-20g fat</li>
        <li>Fried items = +15-25g fat minimum</li>
      </ul>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
        <p className="font-semibold">⚠️ When in doubt, estimate higher</p>
        <p className="mt-2">
          Studies show people underestimate restaurant calories by 30-50%. If you think 
          your meal is 800 calories, it's probably 1,000-1,200.
        </p>
      </div>

      <h2>Strategy 3: Smart Menu Choices</h2>

      <h3>Look for These Keywords:</h3>
      <ul>
        <li><strong>Grilled, steamed, baked, broiled</strong> — Lower fat cooking methods</li>
        <li><strong>"Sauce on the side"</strong> — Control how much you use</li>
        <li><strong>"Light prep" or "dry"</strong> — Less butter/oil</li>
      </ul>

      <h3>Avoid These Keywords:</h3>
      <ul>
        <li><strong>Crispy, fried, breaded, battered</strong> — High fat</li>
        <li><strong>Creamy, alfredo, carbonara</strong> — Fat bombs</li>
        <li><strong>Loaded, smothered, stuffed</strong> — Extra everything</li>
      </ul>

      <h3>Order Smart:</h3>
      <ul>
        <li>Appetizer-sized protein + large salad (dressing on side)</li>
        <li>Grilled protein + two veggie sides</li>
        <li>Ask for butter/oil on the side</li>
        <li>Share entrées or box half immediately</li>
      </ul>

      <h2>Strategy 4: The "Bank" Method</h2>

      <p>
        If you know you're eating out tonight, "bank" calories earlier:
      </p>

      <ol>
        <li>Eat lighter breakfast and lunch (high protein, low calorie)</li>
        <li>Skip snacks</li>
        <li>Save 500-800 calories for dinner</li>
        <li>At dinner, prioritize protein, enjoy without stress</li>
      </ol>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">Example Day:</p>
        <ul className="mt-2">
          <li>Breakfast: Greek yogurt + fruit (200 cal, 25g protein)</li>
          <li>Lunch: Big salad with chicken (400 cal, 35g protein)</li>
          <li>Dinner budget: 1,000-1,200 calories</li>
          <li>Daily total: 1,600-1,800 calories, 100g+ protein</li>
        </ul>
      </div>

      <h2>Strategy 5: Specific Restaurant Scenarios</h2>

      <h3>Italian Restaurant</h3>
      <ul>
        <li>Order: Grilled chicken or fish with vegetables</li>
        <li>Avoid: Pasta with cream sauce, bread basket</li>
        <li>Ask: "Light on the oil" or "prepared light"</li>
        <li>Estimate: 600-900 calories for a reasonable entrée</li>
      </ul>

      <h3>Mexican Restaurant</h3>
      <ul>
        <li>Order: Fajitas (skip tortillas or have 1-2), chicken tacos</li>
        <li>Avoid: Cheese dip, chimichangas, refried beans</li>
        <li>Ask: Protein over a salad instead of rice/beans</li>
        <li>Estimate: 700-1,000 calories for fajitas with 2 tortillas</li>
      </ul>

      <h3>Asian Restaurant</h3>
      <ul>
        <li>Order: Steamed dishes, sashimi, stir-fry (less sauce)</li>
        <li>Avoid: Fried rice, tempura, sweet sauces</li>
        <li>Ask: Sauce on the side, steamed instead of fried</li>
        <li>Estimate: 600-1,000 calories for protein + rice + veggies</li>
      </ul>

      <h3>Steakhouse</h3>
      <ul>
        <li>Order: Filet mignon (leaner), steamed broccoli, side salad</li>
        <li>Avoid: Loaded potato, creamed spinach, ribeye</li>
        <li>Ask: Dry-seasoned, butter on the side</li>
        <li>Estimate: 6oz filet = ~350 cal, 42g protein (add sides)</li>
      </ul>

      <h2>Strategy 6: Social Situations</h2>

      <p>
        Sometimes the bigger challenge isn't the food — it's the people.
      </p>

      <h3>What to Say:</h3>
      <ul>
        <li>"I'm not super hungry, gonna keep it light"</li>
        <li>"I had a big lunch, just getting something small"</li>
        <li>"That sounds good but I'm good with this"</li>
      </ul>

      <h3>What NOT to Do:</h3>
      <ul>
        <li>Lecture others about their food choices</li>
        <li>Pull out a food scale (please don't)</li>
        <li>Complain about how hard tracking is</li>
        <li>Apologize for your choices</li>
      </ul>

      <p>
        Nobody cares what you order as much as you think they do.
      </p>

      <h2>The 80/20 Approach</h2>

      <p>
        Here's a realistic mindset for eating out:
      </p>

      <ul>
        <li><strong>80% of meals:</strong> At home, precisely tracked</li>
        <li><strong>20% of meals:</strong> Restaurants, estimated reasonably</li>
      </ul>

      <p>
        If you eat 21 meals per week and 17 are on-point, you'll make progress even if 
        restaurant estimates are off.
      </p>

      <h2>Quick Reference: Common Restaurant Foods</h2>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Food</th>
              <th className="text-left p-2">Calories</th>
              <th className="text-left p-2">Protein</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">6oz grilled chicken breast</td>
              <td className="p-2">280</td>
              <td className="p-2">52g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">6oz salmon</td>
              <td className="p-2">350</td>
              <td className="p-2">40g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">6oz sirloin steak</td>
              <td className="p-2">350</td>
              <td className="p-2">46g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Cup of pasta with marinara</td>
              <td className="p-2">300-400</td>
              <td className="p-2">10g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Side of rice (restaurant size)</td>
              <td className="p-2">200-300</td>
              <td className="p-2">4g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">House salad with dressing</td>
              <td className="p-2">200-350</td>
              <td className="p-2">3g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Bread roll with butter</td>
              <td className="p-2">150-200</td>
              <td className="p-2">3g</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Glass of wine</td>
              <td className="p-2">120-150</td>
              <td className="p-2">0g</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>The Bottom Line</h2>

      <p>
        Eating out doesn't have to wreck your macros. Use chain nutrition data when available, 
        estimate conservatively when it's not, and bank calories earlier in the day for 
        bigger dinners. Most importantly, don't stress — one meal doesn't make or break 
        your progress.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Track restaurant meals with a photo:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> makes 
          restaurant tracking easy — snap a photo of your meal and get an instant macro 
          estimate. No database searching required.
        </p>
      </div>
    </div>
  );
}
