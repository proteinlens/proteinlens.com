import React from 'react';
import { Link } from 'react-router-dom';

export default function IntermittentFastingMacros() {
  return (
    <>
      <p>Intermittent fasting (IF) doesn't change <em>what</em> you eat — but it dramatically changes <em>when</em> and <em>how much per meal</em>. The biggest challenge? <strong>Hitting your protein target in a compressed eating window.</strong></p>
      <p>Here's how to do IF without sacrificing your macro goals.</p>
      
      <h2>IF Protocols and Macro Planning</h2>
      
      <h3>16:8 (Most Popular)</h3>
      <p>Fast 16 hours, eat in an 8-hour window. Example: eat from 12 PM to 8 PM.</p>
      <ul>
      <li><strong>Meals:</strong> 2-3 meals + 1 snack</li>
      <li><strong>Protein per meal (150g target):</strong> ~50g × 3 meals or ~37g × 4 eating occasions</li>
      <li><strong>Best for:</strong> Most people — enough meals to distribute protein well</li>
      </ul>
      
      <h3>20:4 (Warrior Diet)</h3>
      <p>Fast 20 hours, eat in a 4-hour window.</p>
      <ul>
      <li><strong>Meals:</strong> 1-2 large meals</li>
      <li><strong>Protein per meal:</strong> 60-75g per meal — challenging but doable</li>
      <li><strong>Best for:</strong> People who prefer large meals, lower calorie targets</li>
      </ul>
      
      <h3>OMAD (One Meal a Day)</h3>
      <p>All calories in a single meal.</p>
      <ul>
      <li><strong>Protein challenge:</strong> 120-150g in one sitting is extremely difficult</li>
      <li><strong>Absorption limit?</strong> Contrary to the "30g per meal" myth, your body can absorb more — but MPS (muscle protein synthesis) is suboptimal with a single bolus (Schoenfeld & Aragon, 2018)</li>
      <li><strong>Best for:</strong> Fat loss simplicity, but not ideal for muscle preservation</li>
      </ul>
      
      <h2>The IF Protein Problem</h2>
      <p>Research shows that <strong>distributing protein across 3-4 meals produces ~25% more muscle protein synthesis</strong> than the same amount in 1-2 meals (Mamerow et al., 2014). This means:</p>
      <ul>
      <li><strong>16:8 is fine</strong> — you can still eat 3-4 times</li>
      <li><strong>20:4 is acceptable</strong> — 2 high-protein meals work</li>
      <li><strong>OMAD is suboptimal for muscle</strong> — consider switching to 20:4 minimum if muscle matters to you</li>
      </ul>
      
      <h2>Sample 16:8 Macro Day (2,000 cal, 160g protein)</h2>
      <ul>
      <li><strong>12:00 — Meal 1:</strong> Protein oatmeal + eggs (40g protein, 550 cal)</li>
      <li><strong>15:00 — Snack:</strong> Greek yogurt + protein bar (25g protein, 300 cal)</li>
      <li><strong>18:00 — Meal 2:</strong> Chicken stir-fry + rice (45g protein, 600 cal)</li>
      <li><strong>19:30 — Meal 3:</strong> Casein shake + nuts (30g protein, 350 cal)</li>
      <li><strong>Total:</strong> 140g protein, 1,800 cal — room for 200 more cal of carbs/fat</li>
      </ul>
      
      <h2>Common IF Macro Mistakes</h2>
      <ul>
      <li><strong>Breaking the fast with carbs only:</strong> Starting with toast/fruit → blood sugar spike → crash. Break your fast with protein first.</li>
      <li><strong>Not eating enough:</strong> IF makes it easy to under-eat, especially protein. Use <Link to="/">ProteinLens</Link> to track.</li>
      <li><strong>Thinking IF = automatic fat loss:</strong> Calories still matter. A 2,500 cal window is still 2,500 cal.</li>
      <li><strong>Skipping post-workout protein:</strong> If you train fasted, get protein within 1-2 hours. Read our <Link to="/blog/protein-timing-does-it-matter">protein timing guide</Link>.</li>
      </ul>
      
      <h2>Does Fasting Burn Muscle?</h2>
      <p>Not if you do it right. A 2020 study by Moro et al. found that 16:8 IF with resistance training maintained lean mass equal to normal eating patterns — <strong>as long as total protein intake was adequate</strong>. The key: hit your protein target and train with progressive overload.</p>
      
      <h2>Should You Fast?</h2>
      <p>IF is a meal timing strategy, not magic. It works for fat loss because most people eat less in a shorter window. But if you can't hit your protein target, it's doing more harm than good. Calculate your needs with our <Link to="/protein-calculator">protein calculator</Link>, then decide if IF fits your lifestyle.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-timing-does-it-matter">Protein Timing: Does It Matter?</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/track-macros-without-counting">Track Macros Without Counting</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
