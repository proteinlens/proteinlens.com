/**
 * Blog Post: Weight Loss Plateau Reasons (And How to Break Through)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function WeightLossPlateauReasons() {
  return (
    <div className="blog-content">
      <p>
        You've been losing weight consistently, then suddenly — nothing. The scale won't 
        budge for weeks. Before you panic, know this: plateaus are normal, and they're 
        almost always fixable. Here's why they happen and exactly how to break through.
      </p>

      <h2>First: Are You Actually Plateaued?</h2>

      <p>
        A true plateau is <strong>3+ weeks with no weight change</strong> (not just scale 
        fluctuations). Before troubleshooting, make sure you're actually stuck:
      </p>

      <ul>
        <li><strong>Weigh daily, but look at weekly averages</strong> — Daily fluctuations of 2-5 lbs are normal</li>
        <li><strong>Consider body composition</strong> — You might be gaining muscle while losing fat</li>
        <li><strong>Take measurements</strong> — Waist, hips, and chest can change even when weight doesn't</li>
        <li><strong>Check progress photos</strong> — Visual changes often precede scale changes</li>
      </ul>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold">Not a Plateau:</p>
        <ul className="mt-2">
          <li>Scale went up 2 lbs from yesterday (water weight)</li>
          <li>Weight stable for 1-2 weeks (normal fluctuation period)</li>
          <li>Losing inches but not pounds (recomposition)</li>
        </ul>
      </div>

      <h2>Why Plateaus Happen</h2>

      <h3>1. Your TDEE Has Decreased</h3>
      <p>
        <strong>The #1 reason for plateaus.</strong> As you lose weight, your body burns 
        fewer calories. The deficit that worked at 200 lbs doesn't work at 175 lbs.
      </p>
      <p className="text-sm text-muted-foreground">
        Solution: Recalculate TDEE every 10-15 lbs of weight loss. Reduce calories or 
        increase activity to restore the deficit.
      </p>

      <h3>2. You're Eating More Than You Think</h3>
      <p>
        Studies show people underestimate calorie intake by 30-50%. As you diet longer, 
        "portion creep" sets in — servings gradually get bigger without you noticing.
      </p>
      <p className="text-sm text-muted-foreground">
        Solution: Re-tighten your tracking. Weigh food instead of eyeballing. Track 
        every bite, including cooking oils and "tastes."
      </p>

      <h3>3. Weekend Overeating</h3>
      <p>
        Five days of deficit can be erased by two days of excess. A 500 cal/day deficit 
        Monday-Friday (2,500 total) is wiped out by two 1,250+ calorie surplus days.
      </p>
      <p className="text-sm text-muted-foreground">
        Solution: Track weekends just as carefully as weekdays. Budget for treats 
        instead of going off-plan.
      </p>

      <h3>4. Metabolic Adaptation</h3>
      <p>
        After prolonged dieting, your body reduces energy expenditure. You move less 
        unconsciously (lower NEAT), and your metabolism adjusts to the deficit.
      </p>
      <p className="text-sm text-muted-foreground">
        Solution: Take a diet break — eat at maintenance for 1-2 weeks. This can help 
        reset metabolic rate before resuming the deficit.
      </p>

      <h3>5. Not Enough Protein</h3>
      <p>
        Low protein = muscle loss. Less muscle = lower metabolic rate. This creates a 
        downward spiral where you need to eat less and less to keep losing weight.
      </p>
      <p className="text-sm text-muted-foreground">
        Solution: Ensure 0.8-1g protein per pound of body weight. This preserves muscle 
        and metabolism.
      </p>

      <h3>6. Water Retention Masking Fat Loss</h3>
      <p>
        You might be losing fat but retaining water due to:
      </p>
      <ul>
        <li>High sodium intake</li>
        <li>New exercise routine (muscle inflammation)</li>
        <li>Menstrual cycle (women can retain 3-5 lbs)</li>
        <li>Stress and cortisol</li>
        <li>Not enough sleep</li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Solution: Often resolves itself. A "whoosh" effect can happen where you suddenly 
        drop 3-5 lbs of water overnight.
      </p>

      <h2>How to Break Through a Plateau</h2>

      <h3>Option 1: Re-Tighten Tracking (Free)</h3>
      <p>
        The most common fix. Spend one week being extremely precise:
      </p>
      <ul>
        <li>Weigh everything, including cooking oils</li>
        <li>Track every bite, even "just a taste"</li>
        <li>Track weekends with the same rigor as weekdays</li>
        <li>Use verified database entries (not user-submitted)</li>
      </ul>

      <h3>Option 2: Reduce Calories by 10%</h3>
      <p>
        If tracking is already tight, cut 100-200 calories. Remove from carbs or fat, 
        not protein.
      </p>
      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p><strong>Example:</strong> If eating 1,800 cal/day, drop to 1,600-1,650</p>
      </div>

      <h3>Option 3: Increase Activity</h3>
      <p>
        Adding movement burns calories without cutting food:
      </p>
      <ul>
        <li>Add 2,000-4,000 daily steps</li>
        <li>Add one cardio session per week</li>
        <li>Take stairs instead of elevator</li>
        <li>Walk during phone calls</li>
      </ul>

      <h3>Option 4: Take a Diet Break</h3>
      <p>
        If you've been dieting for 12+ weeks, take 1-2 weeks at maintenance calories. 
        This helps reset hormones and metabolism, making your next deficit more effective.
      </p>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
        <p className="font-semibold">Diet Break ≠ Cheat Week</p>
        <p className="mt-2">
          A diet break means eating at maintenance (TDEE), not going off-plan. You won't 
          lose weight, but you shouldn't gain either.
        </p>
      </div>

      <h3>Option 5: Add Strength Training</h3>
      <p>
        If you're not lifting weights, start. Resistance training preserves muscle, 
        supports metabolism, and can break plateaus even without calorie changes.
      </p>

      <h2>What NOT to Do</h2>

      <ul>
        <li><strong>Don't crash diet</strong> — Eating 800 calories causes muscle loss and metabolic damage</li>
        <li><strong>Don't do excessive cardio</strong> — Hours of cardio increases hunger and cortisol</li>
        <li><strong>Don't buy "fat burner" supplements</strong> — They don't work</li>
        <li><strong>Don't give up</strong> — Plateaus are temporary if you stay consistent</li>
      </ul>

      <h2>Plateau-Breaking Checklist</h2>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <ol className="space-y-2">
          <li>☐ Confirmed it's a true plateau (3+ weeks, not just fluctuation)</li>
          <li>☐ Recalculated TDEE at current weight</li>
          <li>☐ Tightened food tracking (weighing food, tracking everything)</li>
          <li>☐ Checked weekend intake</li>
          <li>☐ Verified protein intake is adequate (0.8-1g/lb)</li>
          <li>☐ Considered water retention factors</li>
          <li>☐ If dieting 12+ weeks, considered a diet break</li>
        </ol>
      </div>

      <h2>The Mindset Shift</h2>

      <p>
        Plateaus feel frustrating, but they're actually evidence that your body is 
        adapting — which is a good thing. The same mechanisms that cause plateaus also 
        helped your ancestors survive famines.
      </p>

      <p>
        The people who succeed long-term don't panic at plateaus. They troubleshoot 
        systematically, make small adjustments, and trust the process.
      </p>

      <h2>The Bottom Line</h2>

      <p>
        Most plateaus are solved by tighter tracking or recalculating TDEE at your new, 
        lower weight. Stay patient, make one change at a time, and give each adjustment 
        2 weeks before trying something else.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Tighten your tracking:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> helps you 
          track more accurately with AI-powered photo recognition. No more guessing portion 
          sizes or searching databases for the right entry.
        </p>
      </div>

      <p>
        <Link to="/calculators/tdee" className="text-primary hover:underline">
          → Recalculate your TDEE at your current weight
        </Link>
      </p>
    </div>
  );
}
