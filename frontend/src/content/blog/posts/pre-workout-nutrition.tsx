import React from 'react';
import { Link } from 'react-router-dom';

export default function PreWorkoutNutrition() {
  return (
    <>
      <p>What you eat before training affects your energy, performance, and recovery. But the advice ranges from "eat a full meal 3 hours before" to "train fasted for fat loss." Here's what the research actually recommends.</p>
      
      <h2>The Pre-Workout Macro Formula</h2>
      <p>The ISSN (International Society of Sports Nutrition) recommends:</p>
      <ul>
      <li><strong>Protein:</strong> 0.3-0.5 g/kg body weight (20-40g for most people)</li>
      <li><strong>Carbs:</strong> 0.5-1.0 g/kg body weight (35-75g for most people)</li>
      <li><strong>Fat:</strong> Keep low (&lt;15g) — fat slows digestion</li>
      </ul>
      <p><strong>Timing:</strong> 1-3 hours before training, depending on meal size.</p>
      
      <h2>Timing Guide</h2>
      
      <h3>3 Hours Before: Full Meal</h3>
      <ul>
      <li>Chicken + rice + vegetables</li>
      <li>Eggs + toast + avocado</li>
      <li>Salmon + sweet potato + salad</li>
      <li>~400-600 cal | 30-40g protein | 50-80g carbs</li>
      </ul>
      
      <h3>1-2 Hours Before: Moderate Snack</h3>
      <ul>
      <li>Greek yogurt + banana + granola</li>
      <li>Protein bar + piece of fruit</li>
      <li>Turkey sandwich on white bread</li>
      <li>~200-400 cal | 20-30g protein | 30-50g carbs</li>
      </ul>
      
      <h3>30-60 Minutes Before: Light Snack</h3>
      <ul>
      <li>Banana + protein shake</li>
      <li>Rice cake + honey</li>
      <li>Handful of cereal</li>
      <li>~100-200 cal | 10-20g protein | 20-30g carbs</li>
      </ul>
      
      <h2>What About Training Fasted?</h2>
      <p>Fasted training is popular for morning workouts. The evidence:</p>
      <ul>
      <li><strong>For fat loss:</strong> Fasted training does NOT burn more fat over 24 hours (Schoenfeld et al., 2014). What matters is total daily deficit.</li>
      <li><strong>For performance:</strong> You'll likely have 5-15% less strength/endurance when fasted</li>
      <li><strong>For muscle:</strong> If you train fasted, get protein within 1-2 hours after (see our <Link to="/blog/protein-timing-does-it-matter">protein timing guide</Link>)</li>
      <li><strong>Verdict:</strong> If you prefer it and don't notice performance drops, it's fine. But it's not superior.</li>
      </ul>
      
      <h2>Pre-Workout by Training Type</h2>
      <ul>
      <li><strong>Strength training:</strong> Higher carbs (1 g/kg) — glycogen is primary fuel for heavy lifts</li>
      <li><strong>Endurance/cardio:</strong> Moderate carbs (0.5-1 g/kg) — longer duration needs sustained energy</li>
      <li><strong>HIIT:</strong> Moderate carbs — uses both glycogen and fat</li>
      <li><strong>Light/yoga:</strong> Don't overthink it — a small snack or nothing is fine</li>
      </ul>
      
      <h2>Foods to Avoid Pre-Workout</h2>
      <ul>
      <li><strong>High fiber:</strong> Beans, raw broccoli, bran cereal — GI distress during training</li>
      <li><strong>High fat:</strong> Cheese, nuts in large amounts, fried food — slow digestion</li>
      <li><strong>Spicy food:</strong> Acid reflux risk during intense exercise</li>
      <li><strong>Unfamiliar foods:</strong> Don't experiment on race/competition day</li>
      </ul>
      <p>Snap your pre-workout meal with <Link to="/">ProteinLens</Link> to verify you're fueling properly before training.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-timing-does-it-matter">Protein Timing Guide</Link></li>
        <li><Link to="/blog/intermittent-fasting-macros">IF & Macros Guide</Link></li>
        <li><Link to="/blog/how-many-calories-to-build-muscle">Calories for Muscle Building</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">Protein Per Kg Guide</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
