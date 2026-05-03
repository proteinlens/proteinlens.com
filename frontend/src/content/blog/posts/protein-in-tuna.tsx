import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInTuna() {
  return (
    <>
      <p>Tuna is the protein world's MVP for convenience — canned tuna gives you 26g protein per 100g with almost zero fat. But mercury concerns, fresh vs. canned differences, and oil vs. water packing all affect the macros.</p>

      <h2>Tuna Macros by Type (Per 100g)</h2>
      <ul>
        <li><strong>Canned tuna in water (drained):</strong> 26g protein | 1g fat | 0g carbs | 116 cal</li>
        <li><strong>Canned tuna in oil (drained):</strong> 26g protein | 8g fat | 0g carbs | 186 cal</li>
        <li><strong>Fresh tuna steak (cooked):</strong> 30g protein | 6g fat | 0g carbs | 184 cal</li>
        <li><strong>Sashimi-grade tuna (raw):</strong> 24g protein | 5g fat | 0g carbs | 144 cal</li>
        <li><strong>Tuna salad (with mayo):</strong> 16g protein | 14g fat | 4g carbs | 210 cal — mayo doubles the calories</li>
      </ul>
      <p>Canned in water is the leanest convenient protein source available — <strong>22.4g protein per 100 cal</strong>. Only egg whites are leaner.</p>

      <h2>Water vs. Oil: The 70-Calorie Difference</h2>
      <p>Even after draining, oil-packed tuna retains significant oil:</p>
      <ul>
        <li><strong>In water:</strong> 116 cal per 100g — choose this for cutting</li>
        <li><strong>In oil:</strong> 186 cal per 100g — 70 extra calories from fat</li>
        <li><strong>In oil (not drained):</strong> ~220 cal per 100g — adds even more</li>
      </ul>
      <p>Oil-packed does taste better and the oil adds healthy fats. If you're bulking or maintaining, it's fine. If every calorie counts, go with water.</p>

      <h2>Mercury: How Much Tuna Is Safe?</h2>
      <p>Tuna contains more mercury than most fish due to its size and predatory position in the food chain. Guidelines:</p>
      <ul>
        <li><strong>Light/skipjack tuna (canned):</strong> Lowest mercury — 2-3 servings per week is safe for most adults</li>
        <li><strong>Albacore/white tuna:</strong> ~3× more mercury — limit to 1 serving per week</li>
        <li><strong>Yellowfin/ahi tuna (fresh):</strong> Higher mercury — 1 serving per week max</li>
        <li><strong>Pregnant/nursing women:</strong> Stick to light tuna, max 2 servings/week (FDA guidance)</li>
      </ul>
      <p><strong>Practical rule:</strong> Don't eat tuna every day. 3-4 cans per week of light tuna is fine. Rotate with <Link to="/blog/protein-in-salmon">salmon</Link>, <Link to="/blog/protein-in-shrimp">shrimp</Link>, and <Link to="/blog/protein-in-chicken-breast">chicken</Link>.</p>

      <h2>Quick Tuna Meals</h2>
      <ul>
        <li><strong>Tuna + rice + soy sauce:</strong> 1 can + 150g rice = 38g protein, 380 cal — 5 min meal</li>
        <li><strong>Tuna salad (light mayo):</strong> 1 can + 1 tbsp light mayo + celery + crackers = 30g protein, 280 cal</li>
        <li><strong>Tuna melt:</strong> 1 can on bread + cheese + broil = 35g protein, 400 cal</li>
        <li><strong>Tuna poke bowl:</strong> Fresh tuna + rice + avocado + edamame = 40g protein, 500 cal</li>
        <li><strong>Tuna stuffed avocado:</strong> 1 can + 1/2 avocado = 30g protein, 280 cal — keto-friendly</li>
      </ul>
      <p>Track your tuna meals with <Link to="/">ProteinLens</Link> — especially useful for eyeballing mayo amounts.</p>

      <h2>Tuna Meal Prep</h2>
      <p>Canned tuna is the ultimate meal prep shortcut — no cooking, no refrigeration (until opened), shelf-stable for years. Stock 10-12 cans and you have emergency protein for a month. Mix up the seasonings:</p>
      <ul>
        <li><strong>Mediterranean:</strong> Olive oil, lemon, capers, red onion</li>
        <li><strong>Asian:</strong> Soy sauce, sesame oil, ginger, rice vinegar</li>
        <li><strong>Mexican:</strong> Lime, jalapeño, cilantro, black beans</li>
        <li><strong>Classic:</strong> Light mayo, mustard, celery, dill</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-in-salmon">Protein in Salmon</Link></li>
        <li><Link to="/blog/protein-in-shrimp">Protein in Shrimp</Link></li>
        <li><Link to="/blog/protein-in-chicken-breast">Protein in Chicken Breast</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
