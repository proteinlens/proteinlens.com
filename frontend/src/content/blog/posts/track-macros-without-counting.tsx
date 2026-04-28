import React from 'react';
import { Link } from 'react-router-dom';

export default function TrackMacrosWithoutCounting() {
  return (
    <>
      <p>
        You know macro tracking works. You've seen the results other people get. But <strong>manually counting every gram of protein, carbs, and fat feels like a part-time job</strong> — and you don't want to become the person who weighs their chicken breast at a restaurant.
      </p>
      <p>
        Good news: you don't have to. Here are practical ways to hit your macro targets without obsessive counting.
      </p>

      <h2>The Hand Portion Method</h2>
      <p>
        Precision Nutrition popularized this approach, and it's backed by research showing it achieves ~85% accuracy compared to weighed food — without any measuring tools.
      </p>
      <ul>
        <li><strong>Palm = 1 serving protein</strong> (~25-30g protein) — chicken breast, fish fillet, tofu block</li>
        <li><strong>Fist = 1 serving carbs</strong> (~30-40g carbs) — rice, pasta, potatoes, fruit</li>
        <li><strong>Thumb = 1 serving fat</strong> (~10-15g fat) — oil, butter, nut butter, cheese</li>
        <li><strong>Cupped hand = 1 serving starchy carbs/grains</strong></li>
      </ul>
      <h3>Example Daily Plan (75 kg Active Male)</h3>
      <ul>
        <li><strong>Target:</strong> ~2,400 cal | 160g protein | 80g fat | 260g carbs</li>
        <li><strong>Per meal (4 meals):</strong> 1.5 palms protein + 2 fists carbs + 1 thumb fat + unlimited veggies</li>
        <li><strong>No app, no scale, no barcode scanning</strong></li>
      </ul>

      <h2>The Plate Method</h2>
      <p>
        Even simpler than the hand method — just divide your plate:
      </p>
      <ul>
        <li><strong>1/4 plate = lean protein</strong> (chicken, fish, eggs, tofu)</li>
        <li><strong>1/4 plate = complex carbs</strong> (rice, potato, bread, pasta)</li>
        <li><strong>1/2 plate = vegetables</strong> (any kind, as much as you want)</li>
        <li><strong>+ 1 thumb of fat</strong> (dressing, oil, avocado)</li>
      </ul>
      <p>
        This naturally creates a high-protein, high-fiber, moderate-calorie meal without any math. For weight loss, use a slightly smaller plate. For muscle gain, add an extra serving of carbs and protein.
      </p>

      <h2>Build a Meal Rotation</h2>
      <p>
        Most people eat the same 10-15 meals repeatedly. Instead of tracking every meal forever, track your favorites once, then repeat them:
      </p>
      <ol>
        <li>Spend one week scanning your usual meals with <Link to="/">ProteinLens</Link></li>
        <li>Identify 4-5 breakfasts, 4-5 lunches, and 4-5 dinners that hit your macros</li>
        <li>Write them down or save them as favorites</li>
        <li>Rotate through these meals without tracking daily</li>
        <li>Re-scan occasionally when you add new meals</li>
      </ol>
      <p>
        This "track once, eat repeatedly" approach gives you 90% of the benefit with 10% of the effort. See our <Link to="/blog/high-protein-meal-prep">meal prep guide</Link> for ready-made options.
      </p>

      <h2>Focus on Protein Only</h2>
      <p>
        If tracking three macros feels overwhelming, <strong>just track protein</strong>. Here's why this works:
      </p>
      <ul>
        <li>Protein is the hardest macro to hit for most people</li>
        <li>When you prioritize protein, you naturally eat less processed food</li>
        <li>High-protein meals are more satiating, so you eat fewer total calories</li>
        <li>Carbs and fat tend to self-regulate when protein is adequate</li>
      </ul>
      <p>
        Use our <Link to="/protein-calculator">protein calculator</Link> to get your daily target, then make sure every meal has at least 30g of protein. Don't worry about the rest.
      </p>

      <h2>Use AI Scanning as a Spot-Check</h2>
      <p>
        You don't have to scan every meal. Use photo tracking strategically:
      </p>
      <ul>
        <li><strong>New meals:</strong> Scan once to learn the macros, then file away</li>
        <li><strong>Restaurant meals:</strong> Snap a photo when eating out — the biggest source of tracking errors</li>
        <li><strong>Weekly audits:</strong> Track everything for one random day per week to calibrate</li>
        <li><strong>When you're stuck:</strong> If weight loss stalls, track accurately for a week to find hidden calories</li>
      </ul>
      <p>
        This "spot-check" approach costs maybe 2 minutes per day and catches the biggest errors.
      </p>

      <h2>Habit Stacking: The No-Tracking Approach</h2>
      <p>
        Instead of tracking numbers, build habits that naturally produce good macros:
      </p>
      <ul>
        <li><strong>Every meal starts with protein:</strong> Eat the protein source first</li>
        <li><strong>Protein at every meal:</strong> No "carb-only" meals (cereal, plain pasta, toast)</li>
        <li><strong>Vegetables at every meal:</strong> Fill volume with low-calorie, high-fiber foods</li>
        <li><strong>One starchy carb source per meal:</strong> Not two (no bread AND rice)</li>
        <li><strong>Fat as a condiment, not a main:</strong> A drizzle of olive oil, not half the plate of cheese</li>
      </ul>
      <p>
        These habits won't give you exact macro numbers, but they'll get you within 80-90% of optimal for most goals.
      </p>

      <h2>When You Should Actually Count</h2>
      <p>
        The methods above work for general health, moderate weight loss, and muscle maintenance. But some situations benefit from precise tracking:
      </p>
      <ul>
        <li>The last 10 lbs of a cut (when margins are thin)</li>
        <li>Competition or photoshoot prep</li>
        <li>Medical conditions requiring specific macro ratios</li>
        <li>When you've been "eyeballing" for months with no progress</li>
      </ul>
      <p>
        Even then, <Link to="/blog/photo-vs-manual-calorie-counting">AI photo scanning</Link> makes precise tracking far faster than manual entry.
      </p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/macro-tracking-busy-people">Macro Tracking for Busy People</Link></li>
        <li><Link to="/blog/why-you-quit-macro-tracking">Why You Keep Quitting Macro Tracking</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Weight Loss</Link></li>
        <li><Link to="/blog/track-macros-without-food-scale">Track Macros Without a Food Scale</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
      </ul>
    </>
  );
}
