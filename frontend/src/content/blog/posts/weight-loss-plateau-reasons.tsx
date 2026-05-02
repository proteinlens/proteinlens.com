import React from 'react';
import { Link } from 'react-router-dom';

export default function WeightLossPlateauReasons() {
  return (
    <>
      <p>You've been losing weight steadily, and then... nothing. The scale won't budge for 2-3 weeks despite sticking to your plan. <strong>You've hit a plateau — and it's completely normal.</strong></p>
      <p>Here are the 8 real reasons your weight loss has stalled, and how to break through each one.</p>

      <h2>1. You're Eating More Than You Think</h2>
      <p>This is the #1 reason, and it's not your fault — humans are terrible at estimating calories. Studies show people underestimate intake by <strong>30-50%</strong> (Lichtman et al., 1992).</p>
      <p>Common culprits:</p>
      <ul>
        <li>Cooking oils (1 tbsp = 120 cal, and most people pour 2-3 tbsp)</li>
        <li>Sauces, dressings, condiments</li>
        <li>"Healthy" snacks (nuts, avocado, granola — calorie-dense)</li>
        <li>Weekend overeating that erases the weekday deficit</li>
      </ul>
      <p><strong>Fix:</strong> Track everything for one strict week. Use <Link to="/">ProteinLens</Link> to photograph every meal — even the handful of nuts and the "taste" while cooking.</p>

      <h2>2. Metabolic Adaptation Is Real</h2>
      <p>As you lose weight, your body burns fewer calories:</p>
      <ul>
        <li><strong>Lower body mass = lower BMR:</strong> A 70 kg person burns ~150 cal/day less than an 80 kg person</li>
        <li><strong>Adaptive thermogenesis:</strong> Your body becomes more efficient — moving costs less energy</li>
        <li><strong>Reduced NEAT:</strong> You subconsciously move less (fewer fidgets, less standing, shorter walks)</li>
      </ul>
      <p><strong>Fix:</strong> Recalculate your <Link to="/tdee-calculator">TDEE</Link> every 5 kg lost. You may need to reduce calories by 100-200 or increase activity.</p>

      <h2>3. Water Retention Is Masking Fat Loss</h2>
      <p>You might still be losing fat but retaining water from:</p>
      <ul>
        <li><strong>High sodium meal:</strong> Can cause 1-2 kg water retention overnight</li>
        <li><strong>New exercise routine:</strong> Muscles retain water for repair (can last 2-4 weeks)</li>
        <li><strong>Menstrual cycle:</strong> 1-3 kg fluctuation is normal in the luteal phase</li>
        <li><strong>Cortisol from stress/sleep deprivation:</strong> Causes water retention</li>
        <li><strong>Increased carb intake:</strong> Every 1g glycogen stored holds 3-4g water</li>
      </ul>
      <p><strong>Fix:</strong> Trust the process. Track weekly averages, not daily weights. Take measurements and progress photos — the scale is a terrible short-term metric.</p>

      <h2>4. You've Lost Muscle, Not Just Fat</h2>
      <p>If you're not eating enough protein or resistance training during a deficit, up to 25% of weight lost can be muscle. Less muscle = lower BMR = smaller deficit = plateau.</p>
      <p><strong>Fix:</strong></p>
      <ul>
        <li>Eat <Link to="/blog/how-much-protein-per-kg">1.6-2.2 g/kg protein</Link> — non-negotiable during a deficit</li>
        <li>Resistance train 3-4×/week — the #1 muscle preservation signal</li>
        <li>Don't exceed a 500 cal/day deficit — larger deficits sacrifice more muscle</li>
      </ul>

      <h2>5. Your Deficit Is Too Aggressive</h2>
      <p>Paradoxically, eating too little can stall weight loss. Extreme restriction (&gt;750 cal deficit) triggers:</p>
      <ul>
        <li>Cortisol spike → water retention</li>
        <li>Thyroid downregulation → lower metabolic rate</li>
        <li>Binge-restrict cycles → net zero deficit over the week</li>
      </ul>
      <p><strong>Fix:</strong> Moderate deficit (300-500 cal below <Link to="/blog/what-is-tdee">TDEE</Link>). Slower but sustainable. If you've been under 1,200 cal, try a "diet break" — eat at maintenance for 1-2 weeks, then resume your deficit.</p>

      <h2>6. You're Not Sleeping Enough</h2>
      <p>Sleep deprivation (&lt;7 hours) increases ghrelin (hunger hormone) by 28% and decreases leptin (satiety hormone) by 18%. You eat more, move less, and store more fat — a triple hit.</p>
      <p><strong>Fix:</strong> Prioritize 7-9 hours. This isn't optional wellness advice — it's a direct driver of body composition.</p>

      <h2>7. Weekend Calories Are Erasing Weekday Progress</h2>
      <p>Example: 500 cal/day deficit Mon-Fri = 2,500 cal deficit. Two "cheat meals" Saturday and Sunday at +1,000 each = +2,000. Net weekly deficit: only 500 cal → minimal weight loss.</p>
      <p><strong>Fix:</strong> Track weekends too. You don't have to be perfect — but be aware. A 300 cal surplus on Saturday is fine; a 1,500 cal surplus isn't.</p>

      <h2>8. It's Not Actually a Plateau</h2>
      <p>A true plateau is <strong>3+ weeks of zero weight change</strong> at the same calorie intake. If it's been 1-2 weeks, that's normal fluctuation. Weight loss is never linear — expect stalls, whooshes, and daily swings of 1-2 kg.</p>

      <h2>The Plateau-Breaking Checklist</h2>
      <ol>
        <li>Track everything strictly for 7 days (no estimates)</li>
        <li>Recalculate TDEE at current weight</li>
        <li>Check protein intake (&gt;1.6 g/kg?)</li>
        <li>Assess sleep (7+ hours?)</li>
        <li>Add 2,000 steps/day (easiest calorie increase)</li>
        <li>If still stuck after 3 weeks: reduce calories by 200 or add one cardio session</li>
      </ol>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/what-is-tdee">What Is TDEE?</Link></li>
        <li><Link to="/blog/what-is-bmr">What Is BMR?</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
