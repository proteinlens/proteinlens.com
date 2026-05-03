import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInBread() {
  return (
    <>
      <p>Bread is one of the most consumed — and most feared — foods in the diet world. But not all bread is equal. A slice of white bread and a slice of sourdough have very different nutritional profiles. Here's the full picture.</p>

      <h2>Bread Macros by Type (Per Slice, ~30g)</h2>
      <ul>
        <li><strong>White bread:</strong> 79 cal | 2.7g protein | 15g carbs | 1g fat</li>
        <li><strong>Whole wheat:</strong> 81 cal | 4g protein | 14g carbs | 1.1g fat | 2g fiber</li>
        <li><strong>Sourdough:</strong> 90 cal | 3.8g protein | 17g carbs | 0.6g fat</li>
        <li><strong>Rye bread:</strong> 83 cal | 2.7g protein | 15g carbs | 1.1g fat | 1.9g fiber</li>
        <li><strong>Multigrain:</strong> 80 cal | 3.5g protein | 14g carbs | 1.3g fat | 2g fiber</li>
        <li><strong>Ezekiel (sprouted):</strong> 80 cal | 5g protein | 15g carbs | 0.5g fat | 3g fiber</li>
        <li><strong>Brioche:</strong> 120 cal | 3g protein | 15g carbs | 5g fat — enriched with butter/eggs</li>
        <li><strong>Bagel (whole, ~100g):</strong> 270 cal | 10g protein | 53g carbs | 1.5g fat</li>
        <li><strong>Pita (whole, ~60g):</strong> 165 cal | 5.5g protein | 33g carbs | 0.7g fat</li>
        <li><strong>Tortilla (flour, large):</strong> 210 cal | 5.5g protein | 36g carbs | 5g fat</li>
        <li><strong>Low-calorie/thin slice:</strong> 40-50 cal | 2g protein | 9g carbs — half the calories</li>
      </ul>

      <h2>Is Bread Bad for You?</h2>
      <p><strong>No.</strong> Bread is not inherently fattening. It's a moderate-calorie carb source (70-90 cal/slice) that becomes a problem when:</p>
      <ul>
        <li>You add calorie-dense toppings (butter = +100 cal, cheese = +110 cal, PB = +190 cal)</li>
        <li>You eat 4-6 slices without tracking</li>
        <li>You choose enriched/sweetened varieties (brioche, Hawaiian rolls)</li>
      </ul>
      <p>2 slices of whole wheat bread = 160 cal, 8g protein, 4g fiber. That's a perfectly fine part of any meal plan.</p>

      <h2>Best Bread for Your Goals</h2>
      <ul>
        <li><strong>Fat loss:</strong> Ezekiel or thin-sliced (40-50 cal/slice) — lowest calorie, highest fiber/protein</li>
        <li><strong>Muscle building:</strong> Any bread works — sourdough or bagels for easy calories</li>
        <li><strong>Blood sugar control:</strong> Sourdough (lower glycemic index due to fermentation) or whole grain/rye</li>
        <li><strong>Budget:</strong> Standard whole wheat — cheap, nutritious, widely available</li>
      </ul>

      <h2>The Sandwich Macro Breakdown</h2>
      <p>A sandwich's macros are mostly determined by the filling, not the bread:</p>
      <ul>
        <li><strong>Turkey + lettuce + mustard:</strong> 280 cal | 25g protein — lean and clean</li>
        <li><strong>Chicken + avocado:</strong> 420 cal | 30g protein — higher fat from avo</li>
        <li><strong>BLT:</strong> 400 cal | 15g protein — mostly from mayo and bacon fat</li>
        <li><strong>PB&J:</strong> 380 cal | 12g protein — classic but calorie-dense</li>
        <li><strong>Grilled cheese:</strong> 440 cal | 16g protein — butter + cheese adds up fast</li>
      </ul>
      <p>Track your sandwiches with <Link to="/">ProteinLens</Link> — AI sees what's between the bread too.</p>

      <h2>Sourdough: The Best Bread?</h2>
      <p>Sourdough has gained popularity for good reasons:</p>
      <ul>
        <li><strong>Lower glycemic index:</strong> Fermentation breaks down some starches → slower blood sugar rise</li>
        <li><strong>Better mineral absorption:</strong> Fermentation reduces phytic acid (which blocks mineral absorption)</li>
        <li><strong>Easier to digest:</strong> The fermentation process pre-digests some gluten and FODMAPs</li>
        <li><strong>Longer shelf life:</strong> Natural acidity inhibits mold</li>
      </ul>
      <p>Macros are similar to white bread, but the metabolic response is meaningfully better.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-in-rice">Calories in Rice</Link></li>
        <li><Link to="/blog/calories-in-pasta">Calories in Pasta</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
      </ul>
    </>
  );
}
