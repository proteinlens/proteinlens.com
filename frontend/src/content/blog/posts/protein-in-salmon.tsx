import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInSalmon() {
  return (
    <>
      <p>Salmon is the protein source that also gives you omega-3 fatty acids — a rare two-for-one deal. But the macros vary significantly depending on the type and preparation.</p>
      
      <h2>Salmon Macros by Type (Cooked, Per 100g)</h2>
      <ul>
      <li><strong>Atlantic (farmed):</strong> 25g protein | 13g fat | 0g carbs | 208 cal</li>
      <li><strong>Atlantic (wild):</strong> 25g protein | 8g fat | 0g carbs | 182 cal</li>
      <li><strong>Sockeye (wild):</strong> 27g protein | 9g fat | 0g carbs | 190 cal</li>
      <li><strong>Chinook/King:</strong> 26g protein | 13g fat | 0g carbs | 231 cal</li>
      <li><strong>Pink (canned, drained):</strong> 24g protein | 5g fat | 0g carbs | 145 cal</li>
      <li><strong>Smoked salmon (lox):</strong> 18g protein | 4g fat | 0g carbs | 117 cal — high sodium</li>
      </ul>
      
      <h2>Wild vs. Farmed: Does It Matter for Macros?</h2>
      <p>Farmed salmon has <strong>~5g more fat per 100g</strong> than wild — they're fed high-energy diets and get less exercise. Both have similar protein content. Farmed is fattier (more calories) but also has slightly more omega-3s per serving due to higher total fat content.</p>
      <p>Nutritionally, both are excellent protein sources. Choose based on budget, sustainability preference, and taste.</p>
      
      <h2>Omega-3 Content (Why Salmon Is Special)</h2>
      <p>A typical 150g salmon fillet provides:</p>
      <ul>
      <li><strong>3-4g omega-3 (EPA + DHA)</strong> — the recommended weekly intake in a single meal</li>
      <li>Supports heart health, brain function, and reduces inflammation</li>
      <li>Far more bioavailable than plant-based omega-3 (ALA from flax/chia)</li>
      </ul>
      
      <h2>Best Salmon Meals for Protein Goals</h2>
      <ul>
      <li><strong>Baked salmon + sweet potato + veggies:</strong> 37g protein, 430 cal — perfect balanced meal</li>
      <li><strong>Salmon poke bowl:</strong> 30g protein, 450 cal — rice + salmon + avocado</li>
      <li><strong>Canned salmon salad:</strong> 36g protein, 250 cal — budget-friendly, lasts forever in the pantry</li>
      <li><strong>Smoked salmon + eggs:</strong> 28g protein, 250 cal — high-protein breakfast</li>
      </ul>
      <p>Track your salmon meals with <Link to="/">ProteinLens</Link> — AI handles different preparations accurately.</p>
      
      <h2>Salmon vs. Other Fish</h2>
      <ul>
      <li><strong>Salmon:</strong> 25g protein, 13g fat / 100g — highest omega-3</li>
      <li><strong>Tuna (canned):</strong> 26g protein, 1g fat / 100g — leaner but mercury concerns</li>
      <li><strong>Cod:</strong> 23g protein, 1g fat / 100g — very lean, mild flavor</li>
      <li><strong>Shrimp:</strong> 24g protein, 0.3g fat / 100g — lowest calorie</li>
      <li><strong>Tilapia:</strong> 26g protein, 2.3g fat / 100g — affordable, lean</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-in-chicken-breast">Protein in Chicken Breast</Link></li>
        <li><Link to="/blog/protein-in-eggs">Protein in Eggs</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
