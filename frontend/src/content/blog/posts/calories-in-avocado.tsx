import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInAvocado() {
  return (
    <>
      <p>Avocados are a superfood — but they're also one of the most calorie-dense fruits on the planet. Half an avocado has more calories than a banana. Here's the full breakdown.</p>

      <h2>Avocado Macros by Portion</h2>
      <ul>
        <li><strong>Whole avocado (200g):</strong> 320 cal | 4g protein | 17g carbs | 29g fat | 13g fiber</li>
        <li><strong>Half avocado (100g):</strong> 160 cal | 2g protein | 9g carbs | 15g fat | 7g fiber</li>
        <li><strong>1/4 avocado (50g):</strong> 80 cal | 1g protein | 4g carbs | 7g fat | 3g fiber</li>
        <li><strong>Guacamole (2 tbsp / 30g):</strong> 50 cal | 0.6g protein | 3g carbs | 4.5g fat</li>
      </ul>
      <p>Avocados are <strong>77% fat by calories</strong> — mostly heart-healthy monounsaturated fat (oleic acid, same as olive oil). High calorie but highly nutritious.</p>

      <h2>Why Avocados Are Worth the Calories</h2>
      <ul>
        <li><strong>20+ vitamins and minerals:</strong> Especially potassium (more than bananas), vitamin K, folate, vitamin E</li>
        <li><strong>Fiber:</strong> 7g per half — one of the highest-fiber fruits</li>
        <li><strong>Healthy fats:</strong> Reduce LDL cholesterol, improve nutrient absorption from other foods</li>
        <li><strong>Satiety:</strong> Studies show adding half an avocado to lunch reduces desire to eat for 3-5 hours (Wien et al., 2013)</li>
      </ul>

      <h2>Avocado for Different Goals</h2>
      <ul>
        <li><strong>Fat loss:</strong> Limit to 1/4–1/2 per day. High in calories but very satiating — good fat budget investment</li>
        <li><strong>Muscle building:</strong> Eat freely — easy calories, pairs with everything</li>
        <li><strong>Heart health:</strong> One avocado per day improves LDL particle size and reduces cardiovascular risk markers (JAHA, 2022)</li>
        <li><strong>Keto/low-carb:</strong> Perfect food — high fat, low net carbs (2g net per half after fiber)</li>
      </ul>

      <h2>Common Avocado Meals (Macros)</h2>
      <ul>
        <li><strong>Avocado toast (1 slice + 1/2 avo):</strong> 280 cal | 7g protein | 25g carbs | 18g fat</li>
        <li><strong>Avo toast + 2 eggs:</strong> 425 cal | 19g protein | 25g carbs | 23g fat — solid breakfast</li>
        <li><strong>Chicken + avo salad:</strong> 400 cal | 35g protein | 10g carbs | 25g fat</li>
        <li><strong>Guacamole + chips (50g chips):</strong> 350 cal | 4g protein | 40g carbs | 20g fat — snack territory</li>
        <li><strong>Smoothie + 1/4 avo:</strong> Adds 80 cal of creamy texture — replaces banana for lower carbs</li>
      </ul>
      <p>Track your avocado portions with <Link to="/">ProteinLens</Link> — AI estimates avo portions more accurately than eyeballing.</p>

      <h2>Ripeness and Storage</h2>
      <p><strong>Macros don't change with ripeness</strong> — but waste does. Tips:</p>
      <ul>
        <li>Firm = ripen on counter (2-4 days). Near banana speeds it up.</li>
        <li>Ripe = eat within 1-2 days or refrigerate for 2-3 more days</li>
        <li>Cut avocado = squeeze lime/lemon on surface, press plastic wrap directly on flesh</li>
        <li>Overripe = still fine for smoothies and guacamole</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-in-banana">Calories in Bananas</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/blog/track-macros-without-counting">Track Macros Without Counting</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
