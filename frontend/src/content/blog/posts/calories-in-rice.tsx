import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInRice() {
  return (
    <>
      <p>Rice is a staple carb source for billions of people — and one of the most commonly tracked foods for macro counters. But rice calories vary significantly by type and whether you're measuring dry or cooked.</p>
      
      <h2>Rice Macros: Cooked (Per 100g)</h2>
      <ul>
      <li><strong>White rice (long grain):</strong> 130 cal | 2.7g protein | 28g carbs | 0.3g fat</li>
      <li><strong>Brown rice:</strong> 112 cal | 2.3g protein | 24g carbs | 0.8g fat</li>
      <li><strong>Basmati (white):</strong> 121 cal | 3.5g protein | 25g carbs | 0.4g fat</li>
      <li><strong>Jasmine (white):</strong> 129 cal | 2.4g protein | 28g carbs | 0.2g fat</li>
      <li><strong>Sushi rice:</strong> 130 cal | 2.4g protein | 29g carbs | 0.2g fat (+ sugar from seasoning)</li>
      <li><strong>Wild rice:</strong> 101 cal | 4.0g protein | 21g carbs | 0.3g fat</li>
      <li><strong>Cauliflower rice:</strong> 25 cal | 2.0g protein | 3g carbs | 0.3g fat</li>
      </ul>
      
      <h2>Dry vs. Cooked: The #1 Tracking Mistake</h2>
      <p><strong>Rice roughly triples in weight when cooked.</strong> This is the single biggest source of rice tracking errors:</p>
      <ul>
      <li><strong>100g dry white rice:</strong> 360 cal | 7g protein | 80g carbs</li>
      <li><strong>100g cooked white rice:</strong> 130 cal | 2.7g protein | 28g carbs</li>
      </ul>
      <p>If you log "100g rice" after cooking but select the dry entry, you're logging <strong>2.7x too many calories</strong>. Always specify cooked or dry. Better yet, snap a photo with <Link to="/">ProteinLens</Link> and let AI handle the estimation.</p>
      
      <h2>Which Rice Is Best for Your Goals?</h2>
      <ul>
      <li><strong>Fat loss:</strong> Cauliflower rice (80% fewer calories) or wild rice (highest protein, lowest cal)</li>
      <li><strong>Muscle building:</strong> White rice (fast-digesting carbs, low fiber = easy to eat in volume)</li>
      <li><strong>General health:</strong> Brown rice (more fiber, magnesium, B vitamins)</li>
      <li><strong>Post-workout:</strong> White rice or jasmine (higher glycemic index = faster glycogen replenishment)</li>
      </ul>
      
      <h2>Common Rice Portions</h2>
      <ul>
      <li><strong>Small side (75g cooked):</strong> ~98 cal | 2g protein | 21g carbs</li>
      <li><strong>Medium portion (150g cooked):</strong> ~195 cal | 4g protein | 42g carbs</li>
      <li><strong>Large portion (250g cooked):</strong> ~325 cal | 6.8g protein | 70g carbs</li>
      <li><strong>Restaurant portion:</strong> Often 300-400g cooked — always bigger than you think</li>
      </ul>
      
      <h2>The Resistant Starch Hack</h2>
      <p>Cooking rice, then <strong>cooling it in the fridge for 12+ hours</strong> increases resistant starch content. Resistant starch acts more like fiber — your body absorbs fewer calories (potentially 10-15% fewer). Reheating doesn't undo this effect (Sonia et al., 2015). So day-old rice from meal prep is actually slightly better for you.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
      </ul>
    </>
  );
}
