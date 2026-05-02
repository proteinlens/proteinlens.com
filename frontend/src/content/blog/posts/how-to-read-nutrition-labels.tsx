import React from 'react';
import { Link } from 'react-router-dom';

export default function HowToReadNutritionLabels() {
  return (
    <>
      <p>
        Nutrition labels contain everything you need to track your macros — but they're designed by regulators, not regular people. <strong>Most people look at calories and ignore everything else</strong>, missing the information that actually matters for their goals.
      </p>
      <p>
        Here's how to read a nutrition label like a macro tracker — quickly, accurately, and without a food science degree.
      </p>

      <h2>The 5 Numbers That Matter</h2>
      <p>
        A nutrition label has 15+ numbers. For macro tracking, you only need five:
      </p>
      <ol>
        <li><strong>Serving size</strong> — everything else depends on this</li>
        <li><strong>Calories</strong> — your energy budget</li>
        <li><strong>Protein (g)</strong> — the priority macro for most people</li>
        <li><strong>Total Carbohydrates (g)</strong> — including fiber and sugars</li>
        <li><strong>Total Fat (g)</strong> — including saturated and unsaturated</li>
      </ol>

      <h2>Step 1: Check the Serving Size (Most People Skip This)</h2>
      <p>
        This is where most tracking errors happen. A bag of chips might say "130 calories per serving" — but the serving is 15 chips, and you ate 45. That's 390 calories, not 130.
      </p>
      <ul>
        <li><strong>Compare to what you actually eat:</strong> If the serving is 30g but you pour 60g, double everything</li>
        <li><strong>"Servings per container"</strong> tells you how many servings are in the whole package</li>
        <li><strong>Common trap:</strong> Drinks that look single-serve but contain 2-2.5 servings</li>
      </ul>

      <h2>Step 2: Calories — But Context Matters</h2>
      <p>
        Calories tell you the total energy, but two foods with 200 calories can have wildly different macro profiles:
      </p>
      <ul>
        <li><strong>200 cal of chicken breast:</strong> 46g protein, 0g carbs, 2g fat</li>
        <li><strong>200 cal of peanut butter:</strong> 8g protein, 6g carbs, 16g fat</li>
        <li><strong>200 cal of white rice:</strong> 4g protein, 44g carbs, 0.4g fat</li>
      </ul>
      <p>
        Same calories, completely different impact on your body. That's why <Link to="/blog/calories-vs-macros">macros matter more than just calories</Link>.
      </p>

      <h2>Step 3: Protein — Your Priority Number</h2>
      <p>
        For most people tracking nutrition, protein is the number to optimize. Look for:
      </p>
      <ul>
        <li><strong>Protein per calorie ratio:</strong> &gt;10g protein per 100 cal = high protein food</li>
        <li><strong>Protein source quality:</strong> Complete vs. incomplete proteins (animal sources and soy are complete)</li>
        <li><strong>Quick math:</strong> Your daily target (from our <Link to="/protein-calculator">protein calculator</Link>) ÷ number of meals = target per meal</li>
      </ul>

      <h2>Step 4: Carbs — Look Beyond Total</h2>
      <p>
        "Total Carbohydrates" includes fiber, sugars, and starches. The breakdown matters:
      </p>
      <ul>
        <li><strong>Dietary Fiber:</strong> The higher the better. Fiber fills you up, feeds gut bacteria, and slows sugar absorption. Aim for 25-35g/day.</li>
        <li><strong>Total Sugars:</strong> Includes natural (fruit, dairy) and added sugars. Context matters — sugar in yogurt is less concerning than sugar in soda.</li>
        <li><strong>Added Sugars:</strong> The one to minimize. WHO recommends &lt;25g/day for women, &lt;36g/day for men.</li>
        <li><strong>Net carbs</strong> (Total Carbs − Fiber): Used by low-carb and keto dieters.</li>
      </ul>

      <h2>Step 5: Fat — Quality Over Quantity</h2>
      <p>
        Total fat matters for your calorie budget, but the <em>type</em> matters for health:
      </p>
      <ul>
        <li><strong>Saturated fat:</strong> Keep under 10% of daily calories (AHA recommendation). Found in butter, cheese, red meat.</li>
        <li><strong>Trans fat:</strong> Avoid completely. Even "0g" can mean up to 0.5g per serving (check ingredients for "partially hydrogenated").</li>
        <li><strong>Unsaturated fat:</strong> The healthy kind — olive oil, nuts, avocado, fish. Usually not listed separately, but you can calculate: Total Fat − Saturated − Trans = Unsaturated.</li>
      </ul>

      <h2>What You Can Safely Ignore (for Macro Tracking)</h2>
      <ul>
        <li><strong>% Daily Value:</strong> Based on a generic 2,000 cal diet that probably isn't yours. Use your own targets from our <Link to="/macro-calculator">macro calculator</Link> instead.</li>
        <li><strong>Cholesterol:</strong> Dietary cholesterol has minimal impact on blood cholesterol for most people (2020 Dietary Guidelines).</li>
        <li><strong>Sodium:</strong> Important for blood pressure but not for macro tracking specifically.</li>
        <li><strong>Vitamins/minerals:</strong> Important for overall health but not your macro split.</li>
      </ul>

      <h2>Label Reading Speed Hack</h2>
      <p>
        Or just skip the label entirely: <strong>snap a photo with <Link to="/">ProteinLens</Link></strong> and get calories + macros in seconds. Works for packaged foods, home-cooked meals, and restaurant plates alike. For packaged foods, you can photograph the nutrition label directly for maximum accuracy.
      </p>

      <h2>Common Label Traps to Watch For</h2>
      <ul>
        <li><strong>"Low fat" products:</strong> Often compensate with added sugar (check the carbs)</li>
        <li><strong>"High protein" marketing:</strong> Sometimes only 10-15g per serving — not actually high</li>
        <li><strong>"Natural" and "organic":</strong> Say nothing about macro content</li>
        <li><strong>Rounding:</strong> Labels can round down below 0.5g to "0g" — a "0 calorie" spray can have 4-5 cal per serving if you use multiple sprays</li>
        <li><strong>Multi-serving containers:</strong> That "healthy" smoothie bottle might be 2.5 servings</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-vs-macros">Calories vs Macros: What Matters More?</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/what-are-macros">What Are Macros? Complete Beginner Guide</Link></li>
        <li><Link to="/blog/track-macros-without-counting">Track Macros Without Counting</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
