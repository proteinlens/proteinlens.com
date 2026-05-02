import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInChickenBreast() {
  return (
    <>
      <p>Chicken breast is the bodybuilder's staple for good reason — it's one of the highest protein-per-calorie foods available. Here's every number you need.</p>
      
      <h2>Chicken Breast Macros (Cooked, Skinless)</h2>
      <ul>
      <li><strong>Per 100g:</strong> 31g protein | 3.6g fat | 0g carbs | 165 cal</li>
      <li><strong>Per 150g (typical serving):</strong> 46.5g protein | 5.4g fat | 0g carbs | 248 cal</li>
      <li><strong>Per 200g (large serving):</strong> 62g protein | 7.2g fat | 0g carbs | 330 cal</li>
      </ul>
      <p>That's <strong>18.8g protein per 100 calories</strong> — one of the best ratios of any whole food.</p>
      
      <h2>Skin On vs. Skin Off</h2>
      <ul>
      <li><strong>Skinless:</strong> 31g protein, 3.6g fat per 100g (165 cal)</li>
      <li><strong>With skin:</strong> 29g protein, 7.8g fat per 100g (197 cal)</li>
      </ul>
      <p>Skin adds about 4g fat and 32 extra calories per 100g. If you're cutting, go skinless. If you're bulking or maintaining, the skin adds flavor without a huge calorie hit.</p>
      
      <h2>Cooking Method Comparison</h2>
      <ul>
      <li><strong>Grilled:</strong> No added fat — purest macro profile</li>
      <li><strong>Baked/Roasted:</strong> Same as grilled if no oil added</li>
      <li><strong>Pan-fried (1 tsp oil):</strong> Adds ~5g fat (45 cal)</li>
      <li><strong>Breaded & deep-fried:</strong> Adds 10-15g fat + 15-20g carbs — completely different food</li>
      <li><strong>Poached/boiled:</strong> Leanest option, great for meal prep</li>
      </ul>
      <p>The protein content doesn't change with cooking method — only the added fats/carbs change. Use <Link to="/">ProteinLens</Link> to scan your cooked chicken and get accurate macros regardless of preparation.</p>
      
      <h2>Chicken Breast vs. Other Cuts</h2>
      <ul>
      <li><strong>Breast (skinless):</strong> 31g protein, 3.6g fat / 100g — leanest</li>
      <li><strong>Thigh (skinless):</strong> 26g protein, 10g fat / 100g — more flavor, more fat</li>
      <li><strong>Drumstick:</strong> 28g protein, 5.7g fat / 100g — good middle ground</li>
      <li><strong>Wing:</strong> 30g protein, 8g fat / 100g — but edible portion is small</li>
      </ul>
      
      <h2>Chicken vs. Other Proteins</h2>
      <ul>
      <li><strong>Chicken breast:</strong> 31g protein / 165 cal</li>
      <li><strong>Turkey breast:</strong> 29g protein / 135 cal — slightly leaner</li>
      <li><strong>Lean beef (sirloin):</strong> 27g protein / 200 cal — more iron, more fat</li>
      <li><strong>Salmon:</strong> 25g protein / 208 cal — omega-3s but more fat</li>
      <li><strong>Tofu (firm):</strong> 8g protein / 76 cal — vegan option, lower density</li>
      </ul>
      
      <h2>Meal Prep Tips</h2>
      <p>Chicken breast is meal prep royalty. Cook 1-2 kg on Sunday and you're set for the week:</p>
      <ul>
      <li>Bake at 200°C / 400°F for 20-25 minutes (internal temp 74°C / 165°F)</li>
      <li>Slice and store in glass containers — lasts 4-5 days refrigerated</li>
      <li>Season differently each batch: Greek, Mexican, Asian, BBQ — same protein, different meals</li>
      </ul>
      <p>Check our <Link to="/blog/high-protein-meal-prep">complete meal prep guide</Link> for full recipes.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-in-eggs">Protein in Eggs: Complete Guide</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/protein-for-muscle-gain">Protein for Muscle Gain</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
