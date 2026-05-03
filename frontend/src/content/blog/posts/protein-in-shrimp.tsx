import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInShrimp() {
  return (
    <>
      <p>Shrimp is the leanest mainstream protein source — <strong>24g protein per 100g at only 99 calories</strong>. It has the best protein-to-calorie ratio of any commonly available food.</p>

      <h2>Shrimp Macros (Cooked, Per 100g)</h2>
      <ul>
        <li><strong>Boiled/steamed shrimp:</strong> 24g protein | 0.3g fat | 0.2g carbs | 99 cal</li>
        <li><strong>Grilled shrimp:</strong> 24g protein | 1g fat | 0g carbs | 110 cal</li>
        <li><strong>Sautéed (1 tsp butter):</strong> 24g protein | 5g fat | 0g carbs | 145 cal</li>
        <li><strong>Breaded & fried:</strong> 18g protein | 12g fat | 15g carbs | 242 cal — different food entirely</li>
        <li><strong>Coconut shrimp:</strong> 15g protein | 14g fat | 20g carbs | 270 cal</li>
      </ul>
      <p>That's <strong>24g protein per 100 calories</strong> for plain shrimp — higher than chicken breast (18.8g per 100 cal). The only catch: breading and frying can triple the calories.</p>

      <h2>Shrimp Sizing Guide</h2>
      <p>Shrimp are sold by count per pound. The macros are the same — larger just means fewer pieces:</p>
      <ul>
        <li><strong>Colossal (U/10):</strong> ~10 per pound, ~24g each</li>
        <li><strong>Jumbo (16/20):</strong> ~18 per pound, ~14g each</li>
        <li><strong>Large (26/30):</strong> ~28 per pound, ~9g each</li>
        <li><strong>Medium (36/40):</strong> ~38 per pound, ~7g each</li>
        <li><strong>Small (51/60):</strong> ~55 per pound, ~5g each</li>
      </ul>
      <p><strong>Quick math:</strong> 6-8 large shrimp ≈ 100g ≈ 24g protein.</p>

      <h2>High-Protein Shrimp Meals</h2>
      <ul>
        <li><strong>Shrimp stir-fry + rice:</strong> 200g shrimp + 150g rice + veggies = 48g protein, 460 cal</li>
        <li><strong>Shrimp salad:</strong> 200g shrimp + mixed greens + vinaigrette = 48g protein, 250 cal</li>
        <li><strong>Shrimp tacos (3):</strong> 150g shrimp + corn tortillas + slaw = 36g protein, 380 cal</li>
        <li><strong>Garlic shrimp pasta:</strong> 150g shrimp + 80g pasta + garlic butter = 40g protein, 520 cal</li>
        <li><strong>Shrimp cocktail (appetizer):</strong> 100g shrimp + cocktail sauce = 24g protein, 120 cal — the ultimate high-protein appetizer</li>
      </ul>

      <h2>Shrimp vs. Other Seafood</h2>
      <ul>
        <li><strong>Shrimp:</strong> 24g protein | 99 cal / 100g — leanest</li>
        <li><strong>Cod:</strong> 23g protein | 105 cal / 100g — very close</li>
        <li><strong>Tuna (canned):</strong> 26g protein | 116 cal / 100g — slightly higher protein</li>
        <li><strong>Salmon:</strong> 25g protein | 208 cal / 100g — more fat (but omega-3s)</li>
        <li><strong>Tilapia:</strong> 26g protein | 128 cal / 100g — cheap, mild</li>
        <li><strong>Crab:</strong> 19g protein | 97 cal / 100g — lean but lower protein</li>
        <li><strong>Lobster:</strong> 20g protein | 89 cal / 100g — lean, expensive</li>
      </ul>

      <h2>Is Shrimp Healthy?</h2>
      <p>Yes. Old concerns about shrimp cholesterol are outdated. While shrimp does contain cholesterol (189mg per 100g), dietary cholesterol has minimal impact on blood cholesterol for most people (2020 Dietary Guidelines). Shrimp is also:</p>
      <ul>
        <li>Rich in selenium (antioxidant support)</li>
        <li>Good source of iodine (thyroid function)</li>
        <li>Contains astaxanthin (powerful antioxidant)</li>
        <li>Low in mercury compared to larger fish</li>
      </ul>
      <p>Track your shrimp meals with <Link to="/">ProteinLens</Link> — AI recognizes different shrimp preparations accurately.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-in-salmon">Protein in Salmon</Link></li>
        <li><Link to="/blog/protein-in-chicken-breast">Protein in Chicken Breast</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
