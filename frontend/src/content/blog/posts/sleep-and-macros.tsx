import React from 'react';
import { Link } from 'react-router-dom';

export default function SleepAndMacros() {
  return (
    <>
      <p>Sleep is the most underrated factor in body composition. Poor sleep doesn't just make you tired — it <strong>directly sabotages your macros</strong> by increasing hunger, reducing protein synthesis, and making your body store more fat.</p>

      <h2>How Sleep Affects Your Macros</h2>

      <h3>1. Hunger Hormones Go Haywire</h3>
      <p>Just one night of poor sleep (&lt;6 hours) causes:</p>
      <ul>
        <li><strong>Ghrelin increases 28%:</strong> You feel hungrier than normal</li>
        <li><strong>Leptin decreases 18%:</strong> You feel less satisfied after eating</li>
        <li><strong>Cortisol increases 37%:</strong> Drives cravings for high-carb, high-fat foods</li>
        <li><strong>Net effect:</strong> Sleep-deprived people eat <strong>300-400 extra calories/day</strong> on average (Al Khatib et al., 2017)</li>
      </ul>

      <h3>2. Muscle Protein Synthesis Drops</h3>
      <p>Growth hormone — essential for muscle repair — is primarily released during deep sleep. Less sleep means:</p>
      <ul>
        <li>Up to <strong>30% less growth hormone</strong> release</li>
        <li>Reduced muscle protein synthesis even with adequate protein intake</li>
        <li>During a calorie deficit: sleep-deprived dieters lost <strong>60% more muscle and 55% less fat</strong> compared to well-rested dieters (Nedeltcheva et al., 2010)</li>
      </ul>
      <p>Translation: if you sleep poorly during a cut, you're losing muscle instead of fat — even if your macros are perfect.</p>

      <h3>3. Insulin Sensitivity Crashes</h3>
      <p>After 4 nights of ~4.5 hours sleep, insulin sensitivity drops by <strong>30%</strong>. Your body handles carbs worse, partitions more energy toward fat storage, and you feel more lethargic. This is why sleep-deprived people often feel "carb-hungover" even on moderate carb intake.</p>

      <h2>Sleep Targets by Goal</h2>
      <ul>
        <li><strong>Fat loss:</strong> 7-9 hours (non-negotiable — sleep debt causes more fat retention)</li>
        <li><strong>Muscle building:</strong> 7-9 hours (growth hormone peaks in deep sleep stages 3-4)</li>
        <li><strong>Athletes:</strong> 8-10 hours (the NBA, NFL, and Premier League all mandate 8+ hours)</li>
        <li><strong>General health:</strong> 7-8 hours minimum</li>
      </ul>

      <h2>Nutrition for Better Sleep</h2>
      <p>What you eat affects how you sleep, and vice versa:</p>
      <h3>Foods That Help Sleep</h3>
      <ul>
        <li><strong>Casein protein before bed:</strong> Slow-digesting protein supports overnight recovery and keeps you full (cottage cheese, casein shake)</li>
        <li><strong>Carbs at dinner:</strong> Complex carbs increase serotonin → melatonin production. Contrary to "no carbs at night" myths, a moderate carb dinner improves sleep quality (Afaghi et al., 2007)</li>
        <li><strong>Tart cherry juice:</strong> Natural melatonin source — improves sleep duration by ~34 minutes</li>
        <li><strong>Kiwi:</strong> Two kiwis before bed improved sleep onset by 42% (Lin et al., 2011)</li>
        <li><strong>Magnesium-rich foods:</strong> Pumpkin seeds, spinach, dark chocolate — magnesium supports GABA activity</li>
      </ul>

      <h3>Things to Avoid Before Bed</h3>
      <ul>
        <li><strong>Caffeine after 2 PM:</strong> Half-life is 5-6 hours — afternoon coffee is still in your system at midnight</li>
        <li><strong>Heavy meals within 2 hours of bed:</strong> Digestion effort can disrupt sleep</li>
        <li><strong>Alcohol:</strong> Feels like it helps sleep but actually disrupts REM sleep and recovery (read our <Link to="/blog/calories-in-alcohol">alcohol guide</Link>)</li>
        <li><strong>High-sugar snacks:</strong> Blood sugar spike → crash → middle-of-night waking</li>
      </ul>

      <h2>The Sleep-Macro Protocol</h2>
      <ol>
        <li><strong>Hit your protein target daily</strong> — <Link to="/blog/how-much-protein-per-kg">1.6-2.2 g/kg</Link></li>
        <li><strong>20-30g casein before bed</strong> — cottage cheese or casein shake</li>
        <li><strong>Include carbs at dinner</strong> — sweet potato, rice, oats</li>
        <li><strong>No caffeine after 2 PM</strong></li>
        <li><strong>7-9 hours of sleep</strong></li>
        <li><strong>Track with <Link to="/">ProteinLens</Link></strong> — your evening meal matters for recovery</li>
      </ol>

      <h2>If You Can't Sleep 8 Hours</h2>
      <p>Not everyone can sleep 8 hours. If you're stuck at 6:</p>
      <ul>
        <li><strong>Increase protein:</strong> Compensate for reduced growth hormone with higher protein intake (+0.2 g/kg)</li>
        <li><strong>Reduce deficit:</strong> Sleep-deprived bodies lose more muscle during cuts — use a smaller deficit (−300 cal max)</li>
        <li><strong>Time carbs around sleep:</strong> Higher carb dinner, lower carb morning</li>
        <li><strong>Nap if possible:</strong> Even 20-minute naps partially restore growth hormone release</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/weight-loss-plateau-reasons">Why Weight Loss Has Stalled</Link></li>
        <li><Link to="/blog/protein-timing-does-it-matter">Protein Timing Guide</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
