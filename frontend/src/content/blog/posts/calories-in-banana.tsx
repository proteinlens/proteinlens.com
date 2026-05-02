import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInBanana() {
  return (
    <>
      <p>Bananas are nature's energy bar — convenient, cheap, and packed with carbs for fuel. But the calorie count varies significantly by size, and most people underestimate how big their banana actually is.</p>
      
      <h2>Banana Macros by Size</h2>
      <ul>
      <li><strong>Extra small (&lt;15cm / 6"):</strong> 72 cal | 0.9g protein | 19g carbs | 0.3g fat</li>
      <li><strong>Small (15-18cm / 6-7"):</strong> 90 cal | 1.1g protein | 23g carbs | 0.3g fat</li>
      <li><strong>Medium (18-20cm / 7-8"):</strong> 105 cal | 1.3g protein | 27g carbs | 0.4g fat</li>
      <li><strong>Large (20-23cm / 8-9"):</strong> 121 cal | 1.5g protein | 31g carbs | 0.5g fat</li>
      <li><strong>Extra large (&gt;23cm / 9"+):</strong> 135 cal | 1.6g protein | 35g carbs | 0.5g fat</li>
      </ul>
      <p>The difference between a small and large banana is <strong>31 extra calories and 8g more carbs</strong>. Over a daily banana habit, that adds up.</p>
      
      <h2>Does Ripeness Affect Macros?</h2>
      <p>Total calories stay the same regardless of ripeness. What changes is the <em>type</em> of carb:</p>
      <ul>
      <li><strong>Green (unripe):</strong> Higher resistant starch — slower digestion, lower blood sugar spike, more fiber-like</li>
      <li><strong>Yellow (ripe):</strong> Starch converts to sugar — sweeter, faster energy, easier to digest</li>
      <li><strong>Brown (overripe):</strong> Nearly all sugar — fastest energy, highest glycemic response</li>
      </ul>
      <p><strong>For pre-workout:</strong> Ripe yellow or brown — fast energy. <strong>For satiety/fat loss:</strong> Slightly green — slower release.</p>
      
      <h2>Banana for Fitness Goals</h2>
      <ul>
      <li><strong>Pre-workout (30-60 min before):</strong> 1 medium banana = 27g fast carbs for energy</li>
      <li><strong>Post-workout:</strong> Banana + protein shake = carbs for glycogen + protein for recovery</li>
      <li><strong>Weight loss:</strong> Fine in moderation, but track it — a large banana has as many carbs as a slice of bread</li>
      <li><strong>Muscle building:</strong> Easy calorie source when struggling to eat enough</li>
      </ul>
      
      <h2>Banana vs. Other Fruits</h2>
      <ul>
      <li><strong>Banana (medium):</strong> 105 cal | 27g carbs</li>
      <li><strong>Apple (medium):</strong> 95 cal | 25g carbs</li>
      <li><strong>Orange (medium):</strong> 62 cal | 15g carbs</li>
      <li><strong>Strawberries (150g):</strong> 48 cal | 12g carbs</li>
      <li><strong>Blueberries (100g):</strong> 57 cal | 14g carbs</li>
      </ul>
      <p>Bananas are higher calorie than most fruits. If you're cutting, berries give you more volume for fewer calories. Track everything with <Link to="/">ProteinLens</Link> — just snap a photo.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-in-rice">Calories & Macros in Rice</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
      </ul>
    </>
  );
}
