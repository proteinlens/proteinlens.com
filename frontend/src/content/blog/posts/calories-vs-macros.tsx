/**
 * Blog Post: Calories vs. Macros – What's More Important?
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesVsMacros() {
  return (
    <div className="blog-content">
      <p>
        Should you count calories or track macros? The debate rages on in fitness circles, 
        but the answer is simpler than most people think: <strong>both matter, but for 
        different reasons</strong>.
      </p>

      <h2>The Short Answer</h2>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li><strong>Calories</strong> determine whether you lose, gain, or maintain weight</li>
          <li><strong>Macros</strong> determine what that weight is made of (fat vs. muscle)</li>
        </ul>
      </div>

      <p>
        If you only care about the number on the scale, calories are what matter. If you 
        care about how your body looks, performs, and feels, macros become important.
      </p>

      <h2>What Calories Control</h2>

      <p>
        Calories are simply units of energy. The fundamental rule of weight change is:
      </p>

      <ul>
        <li><strong>Eat fewer calories than you burn</strong> = Weight loss</li>
        <li><strong>Eat more calories than you burn</strong> = Weight gain</li>
        <li><strong>Eat the same as you burn</strong> = Weight maintenance</li>
      </ul>

      <p>
        This is thermodynamics — it's physics, and it applies to everyone regardless of 
        metabolism, genetics, or food choices.
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">The Twinkie Diet Study</p>
        <p className="mt-2">
          In 2010, nutrition professor Mark Haub lost 27 pounds eating mostly Twinkies, 
          Doritos, and Oreos — but staying in a calorie deficit. This proved that for 
          weight loss specifically, calories are king.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          (Note: This doesn't mean it's healthy — just that it works for weight loss)
        </p>
      </div>

      <h2>What Macros Control</h2>

      <p>
        While calories control total weight, macros control body composition — the ratio 
        of muscle to fat on your body.
      </p>

      <h3>Two 1,500 Calorie Diets</h3>

      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2"></th>
              <th className="text-left p-2">Diet A: Low Protein</th>
              <th className="text-left p-2">Diet B: High Protein</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-semibold">Protein</td>
              <td className="p-2">50g (13%)</td>
              <td className="p-2">150g (40%)</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Carbs</td>
              <td className="p-2">225g (60%)</td>
              <td className="p-2">125g (33%)</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Fat</td>
              <td className="p-2">45g (27%)</td>
              <td className="p-2">45g (27%)</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Weight Loss</td>
              <td className="p-2">Yes</td>
              <td className="p-2">Yes</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Muscle Preserved?</td>
              <td className="p-2 text-red-500">No — loses muscle</td>
              <td className="p-2 text-green-500">Yes — preserves muscle</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Both diets produce the same weight loss on the scale, but Diet B preserves muscle 
        while Diet A loses muscle along with fat.
      </p>

      <h2>Why This Matters</h2>

      <h3>1. Metabolism</h3>
      <p>
        Muscle burns more calories at rest than fat. Losing muscle lowers your metabolic rate, 
        making future weight loss harder. This is why crash dieters often regain weight — 
        they lose muscle, metabolism drops, and their "new" maintenance calories are lower.
      </p>

      <h3>2. Appearance</h3>
      <p>
        Two people at the same weight and height can look completely different based on body 
        composition. "Skinny fat" is when someone is thin but has low muscle and high body fat 
        percentage. Building/preserving muscle creates the toned, athletic look most people want.
      </p>

      <h3>3. Health</h3>
      <p>
        Muscle mass is associated with better insulin sensitivity, bone density, and longevity. 
        It's not just about appearance — it's about metabolic health.
      </p>

      <h2>When Calories Alone Are Enough</h2>

      <p>
        Calorie counting (without macro tracking) works fine if:
      </p>

      <ul>
        <li>You just want to lose weight and don't care about muscle</li>
        <li>You naturally eat enough protein already (rare)</li>
        <li>You're not exercising, especially resistance training</li>
        <li>You want simplicity over optimization</li>
      </ul>

      <h2>When You Should Track Macros</h2>

      <ul>
        <li><strong>You lift weights</strong> — Protein timing and intake affect gains</li>
        <li><strong>You want to lose fat but keep muscle</strong> — Requires adequate protein</li>
        <li><strong>You've hit a plateau</strong> — Macro adjustments can break through</li>
        <li><strong>You want optimal energy</strong> — Carb/fat balance affects energy levels</li>
        <li><strong>You're an athlete</strong> — Performance requires strategic macro timing</li>
      </ul>

      <h2>The Practical Approach</h2>

      <p>
        Here's what I recommend for most people:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">The 80/20 Macro Tracking Method:</p>
        <ol className="mt-2 space-y-2">
          <li>1. <strong>Set a calorie target</strong> based on your goal</li>
          <li>2. <strong>Track protein precisely</strong> — hit 0.8-1g per pound body weight</li>
          <li>3. <strong>Don't stress carbs vs. fat</strong> — let them fill the rest</li>
          <li>4. <strong>Stay within 100 calories</strong> of your target most days</li>
        </ol>
      </div>

      <p>
        This approach gives you 80% of the benefits with 20% of the effort. Protein is the 
        macro that matters most for body composition.
      </p>

      <h2>Calories vs. Macros: A Hierarchy</h2>

      <p>
        Here's the order of importance for body composition:
      </p>

      <ol>
        <li><strong>Total calories</strong> — Without a deficit, no fat loss happens</li>
        <li><strong>Protein intake</strong> — Preserves muscle, controls hunger</li>
        <li><strong>Carb/fat balance</strong> — Affects energy and satiety</li>
        <li><strong>Meal timing</strong> — Minor effect, mostly preference</li>
        <li><strong>Supplements</strong> — 1-2% difference at most</li>
      </ol>

      <p>
        Don't optimize #4 and #5 while ignoring #1 and #2. Most people overthink meal timing 
        and supplements while under-eating protein.
      </p>

      <h2>Common Questions</h2>

      <h3>"Do I need to track both?"</h3>
      <p>
        If you track macros, you're automatically tracking calories (since macros contain 
        calories). So technically, tracking macros includes calorie tracking.
      </p>

      <h3>"What if my macros are perfect but I'm over on calories?"</h3>
      <p>
        Then you'll gain weight. Calories always win for weight change. The "perfect" 
        macros include staying within your calorie target.
      </p>

      <h3>"Can I eat 'unhealthy' food if it fits my macros?"</h3>
      <p>
        For body composition, yes. This is the "If It Fits Your Macros" (IIFYM) approach. 
        For overall health, you should still eat mostly whole foods, but occasional treats 
        won't derail your progress if they fit your macros.
      </p>

      <h2>The Bottom Line</h2>

      <p>
        <strong>Calories determine weight change. Macros determine body composition.</strong> 
        For most people, the best approach is to track calories and protein, letting carbs 
        and fat fall into place naturally.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Track calories AND macros effortlessly:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> shows you 
          both calories and macros from a single photo. No separate tracking needed — see 
          everything at once.
        </p>
      </div>

      <p>
        <Link to="/calculators/calorie" className="text-primary hover:underline">
          → Calculate your calorie needs
        </Link>
        {' • '}
        <Link to="/calculators/macro" className="text-primary hover:underline">
          → Calculate your macro targets
        </Link>
      </p>
    </div>
  );
}
