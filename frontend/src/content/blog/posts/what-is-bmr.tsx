import React from 'react';
import { Link } from 'react-router-dom';

export default function WhatIsBmr() {
  return (
    <>
      <p>BMR (Basal Metabolic Rate) is the number of calories your body needs to stay alive — literally just to keep your heart beating, lungs breathing, and brain functioning while you do absolutely nothing.</p>
      <p>It's the foundation of all calorie calculations, and understanding it helps you set realistic nutrition targets.</p>
      
      <h2>BMR vs. TDEE: The Key Difference</h2>
      <ul>
      <li><strong>BMR:</strong> Calories burned at complete rest (lying in bed all day)</li>
      <li><strong>TDEE:</strong> BMR + activity calories (BMR × activity multiplier)</li>
      </ul>
      <p>Your TDEE is what you actually burn in a day. BMR is the baseline — typically 60-75% of TDEE for most people.</p>
      <p><strong>Example:</strong> If your BMR is 1,600 cal and you're moderately active, your TDEE is roughly 1,600 × 1.55 = <strong>2,480 cal</strong>. Use our <Link to="/tdee-calculator">TDEE calculator</Link> to get your number.</p>
      
      <h2>How BMR Is Calculated</h2>
      <p>The Mifflin-St Jeor equation (1990) is the most accurate for most people:</p>
      <ul>
      <li><strong>Men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5</li>
      <li><strong>Women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161</li>
      </ul>
      <h3>Example: 30-year-old male, 80 kg, 180 cm</h3>
      <p>BMR = (10 × 80) + (6.25 × 180) − (5 × 30) + 5 = 800 + 1125 − 150 + 5 = <strong>1,780 cal/day</strong></p>
      
      <h2>What Affects Your BMR?</h2>
      <ul>
      <li><strong>Muscle mass:</strong> The #1 factor you can control. Muscle burns ~6 cal/kg/day vs. fat's ~2 cal/kg/day. More muscle = higher BMR.</li>
      <li><strong>Body size:</strong> Larger bodies burn more energy just existing</li>
      <li><strong>Age:</strong> BMR decreases ~1-2% per decade after 20 (mostly from muscle loss)</li>
      <li><strong>Sex:</strong> Males typically have higher BMR due to more muscle mass</li>
      <li><strong>Genetics:</strong> ~5-10% variation between people of similar size/composition</li>
      <li><strong>Thyroid function:</strong> Hypo/hyperthyroidism significantly affects BMR</li>
      <li><strong>Crash dieting:</strong> Severe calorie restriction can drop BMR by 15-20% (metabolic adaptation)</li>
      </ul>
      
      <h2>Why You Should Never Eat Below Your BMR</h2>
      <p>Your BMR is the minimum energy your body needs to function. Eating below it for extended periods triggers:</p>
      <ul>
      <li><strong>Metabolic adaptation:</strong> Your body reduces non-essential energy expenditure (you feel cold, tired, brain-foggy)</li>
      <li><strong>Muscle loss:</strong> Your body breaks down muscle for energy when calories are too low</li>
      <li><strong>Hormonal disruption:</strong> Reduced thyroid function, lower testosterone/estrogen</li>
      <li><strong>Binge cycles:</strong> Extreme restriction often leads to binge eating</li>
      </ul>
      <p>A safe calorie deficit for fat loss is typically TDEE minus 300-500 cal — which should still be above your BMR.</p>
      
      <h2>How to Increase Your BMR</h2>
      <ol>
      <li><strong>Build muscle:</strong> Resistance training is the most effective way to raise resting metabolism</li>
      <li><strong>Eat enough protein:</strong> <Link to="/blog/how-much-protein-per-kg">1.6-2.2 g/kg</Link> preserves muscle during a deficit</li>
      <li><strong>Avoid crash diets:</strong> Moderate deficits preserve BMR better than extreme ones</li>
      <li><strong>Stay active:</strong> Regular exercise prevents age-related muscle loss</li>
      <li><strong>Sleep well:</strong> Sleep deprivation reduces BMR and increases hunger hormones</li>
      </ol>
      
      <h2>Calculate Your BMR and TDEE</h2>
      <p>Ready to find your numbers? Our <Link to="/calorie-calculator">calorie calculator</Link> uses the Mifflin-St Jeor equation to calculate your BMR, then applies your activity level to estimate your TDEE. From there, <Link to="/">ProteinLens</Link> helps you track your daily intake against those targets.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/what-is-tdee">What Is TDEE?</Link></li>
        <li><Link to="/blog/weight-loss-plateau-reasons">Why Your Weight Loss Has Stalled</Link></li>
        <li><Link to="/blog/how-many-calories-to-build-muscle">Calories for Muscle Building</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
