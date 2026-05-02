import React from 'react';
import { Link } from 'react-router-dom';

export default function WhatIsTdee() {
  return (
    <>
      <p>TDEE (Total Daily Energy Expenditure) is the total number of calories you burn in a day — from breathing, walking, exercising, and even digesting food. It's the single most important number for any nutrition goal.</p>

      <h2>TDEE = BMR + Activity</h2>
      <p>Your TDEE is made up of four components:</p>
      <ul>
        <li><strong>BMR (60-70%):</strong> Calories burned at complete rest — <Link to="/blog/what-is-bmr">learn more about BMR</Link></li>
        <li><strong>NEAT (15-30%):</strong> Non-Exercise Activity Thermogenesis — walking, fidgeting, standing, housework</li>
        <li><strong>EAT (5-10%):</strong> Exercise Activity Thermogenesis — deliberate workouts</li>
        <li><strong>TEF (8-10%):</strong> Thermic Effect of Food — energy to digest what you eat</li>
      </ul>
      <p><strong>Surprise:</strong> Your gym session (EAT) is typically only 5-10% of daily calorie burn. NEAT — the walking, stairs, and fidgeting — often burns more than your workout.</p>

      <h2>How to Calculate Your TDEE</h2>
      <p>Use our <Link to="/tdee-calculator">TDEE calculator</Link> or calculate manually:</p>
      <ol>
        <li><strong>Calculate BMR</strong> using Mifflin-St Jeor:
          <ul>
            <li>Men: (10 × kg) + (6.25 × cm) − (5 × age) + 5</li>
            <li>Women: (10 × kg) + (6.25 × cm) − (5 × age) − 161</li>
          </ul>
        </li>
        <li><strong>Multiply by activity factor:</strong>
          <ul>
            <li>Sedentary (desk job, no exercise): BMR × 1.2</li>
            <li>Lightly active (1-3 workouts/week): BMR × 1.375</li>
            <li>Moderately active (3-5 workouts/week): BMR × 1.55</li>
            <li>Very active (6-7 workouts/week): BMR × 1.725</li>
            <li>Extremely active (athlete/physical job + training): BMR × 1.9</li>
          </ul>
        </li>
      </ol>

      <h3>Example</h3>
      <p>30-year-old woman, 65 kg, 165 cm, works out 4×/week:</p>
      <ul>
        <li>BMR = (10 × 65) + (6.25 × 165) − (5 × 30) − 161 = 1,370 cal</li>
        <li>TDEE = 1,370 × 1.55 = <strong>2,124 cal/day</strong></li>
      </ul>

      <h2>Using TDEE for Your Goals</h2>
      <ul>
        <li><strong>Fat loss:</strong> Eat TDEE − 300 to 500 cal (moderate deficit = sustainable loss of 0.3-0.5 kg/week)</li>
        <li><strong>Maintenance:</strong> Eat at TDEE (weight stays stable)</li>
        <li><strong>Muscle gain:</strong> Eat TDEE + 200 to 400 cal (<Link to="/blog/how-many-calories-to-build-muscle">lean bulk guide</Link>)</li>
      </ul>
      <p><strong>Never eat below your BMR</strong> for extended periods — this triggers metabolic adaptation, muscle loss, and hormonal issues.</p>

      <h2>Why TDEE Calculators Are Only Estimates</h2>
      <p>All TDEE calculators have a margin of error of ±200-300 cal. The activity multiplier is the weakest link — most people overestimate their activity level.</p>
      <p>The fix: <strong>use the calculator as a starting point, then adjust based on results</strong>:</p>
      <ul>
        <li>Losing 0.3-0.5 kg/week → you're in the right deficit</li>
        <li>Not losing → reduce by 200 cal</li>
        <li>Losing too fast (&gt;1 kg/week) → increase by 200 cal</li>
        <li>Track daily weight and take <strong>weekly averages</strong> — daily fluctuations are meaningless</li>
      </ul>

      <h2>How to Increase Your TDEE</h2>
      <p>Higher TDEE means you can eat more while still losing/maintaining. Strategies:</p>
      <ol>
        <li><strong>Walk more:</strong> 10,000 steps/day burns 300-500 extra calories — the single biggest lever</li>
        <li><strong>Build muscle:</strong> More muscle mass raises BMR (the 60-70% baseline)</li>
        <li><strong>Stand more:</strong> Standing desks burn 50-100 more cal/day than sitting</li>
        <li><strong>Eat more protein:</strong> Higher TEF — protein uses 20-30% of its calories in digestion vs. 5-10% for carbs and 0-3% for fat</li>
      </ol>

      <h2>TDEE vs. Calorie Counting</h2>
      <p>TDEE gives you the target. <Link to="/">ProteinLens</Link> helps you hit it — snap photos of your meals and track against your daily budget. Calculate your number with our <Link to="/tdee-calculator">free TDEE calculator</Link>.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/what-is-bmr">What Is BMR?</Link></li>
        <li><Link to="/blog/how-many-calories-to-build-muscle">Calories for Muscle Building</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-to-count-macros-beginners">Beginner Macro Counting Guide</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
