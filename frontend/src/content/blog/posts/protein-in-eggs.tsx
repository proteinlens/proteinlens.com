import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInEggs() {
  return (
    <>
      <p>Eggs are the gold standard of affordable, high-quality protein. But how much protein is actually in an egg, and does it matter how you cook them?</p>
      
      <h2>Protein in Eggs by Size</h2>
      <ul>
      <li><strong>Small (38g):</strong> 4.8g protein | 54 cal</li>
      <li><strong>Medium (44g):</strong> 5.5g protein | 63 cal</li>
      <li><strong>Large (50g):</strong> 6.3g protein | 72 cal</li>
      <li><strong>Extra Large (56g):</strong> 7.0g protein | 80 cal</li>
      <li><strong>Jumbo (63g):</strong> 7.9g protein | 90 cal</li>
      </ul>
      
      <h2>Whole Egg vs. Egg White</h2>
      <ul>
      <li><strong>Whole large egg:</strong> 6.3g protein, 5g fat, 72 cal</li>
      <li><strong>Egg white only:</strong> 3.6g protein, 0g fat, 17 cal</li>
      <li><strong>Egg yolk only:</strong> 2.7g protein, 4.5g fat, 55 cal</li>
      </ul>
      <p>The white has more protein by volume, but the yolk contains essential nutrients (vitamin D, choline, B12) that support overall health. For most people, whole eggs are the better choice unless you're in a deep calorie cut.</p>
      
      <h2>Does Cooking Method Affect Protein?</h2>
      <p>Cooking doesn't destroy egg protein — in fact, cooked eggs have <strong>higher protein bioavailability (91-94%) than raw eggs (51-65%)</strong> according to a study by Evenepoel et al. (1998). Heat denatures the protein structure, making it easier to digest.</p>
      <ul>
      <li><strong>Boiled:</strong> No added fat, full protein — the leanest option</li>
      <li><strong>Poached:</strong> Same as boiled — no added fat</li>
      <li><strong>Scrambled (no butter):</strong> Same protein, minimal added calories</li>
      <li><strong>Fried (in oil/butter):</strong> Same protein, but 3-5g added fat per egg</li>
      <li><strong>Raw:</strong> Lower bioavailability + salmonella risk — not recommended</li>
      </ul>
      
      <h2>How Many Eggs to Hit 30g Protein?</h2>
      <p><strong>5 large eggs = 31.5g protein</strong> at 360 calories. That's a solid breakfast or post-workout meal. If that's too many whole eggs, try:</p>
      <ul>
      <li>2 whole eggs + 4 egg whites = 23.4g protein, 184 cal</li>
      <li>3 whole eggs + 3 egg whites = 29.7g protein, 267 cal</li>
      </ul>
      <p>Track your egg-based meals easily — snap a photo with <Link to="/">ProteinLens</Link> and get instant macros.</p>
      
      <h2>Are Eggs Bad for Cholesterol?</h2>
      <p>The 2020 Dietary Guidelines and recent meta-analyses show that <strong>dietary cholesterol has minimal impact on blood cholesterol for most people</strong>. Eating 1-3 eggs per day is considered safe for healthy adults (Blesso & Fernandez, 2018). If you have specific cardiac conditions, consult your doctor.</p>
      
      <h2>Eggs vs. Other Protein Sources</h2>
      <ul>
      <li><strong>Eggs:</strong> 6.3g protein / 72 cal = 8.8g per 100 cal</li>
      <li><strong>Chicken breast:</strong> 31g protein / 165 cal = 18.8g per 100 cal</li>
      <li><strong>Greek yogurt:</strong> 10g protein / 59 cal = 16.9g per 100 cal</li>
      <li><strong>Whey protein:</strong> 25g protein / 120 cal = 20.8g per 100 cal</li>
      </ul>
      <p>Eggs aren't the most protein-dense food, but they're cheap (~$0.30/egg), versatile, and nutrient-rich — one of the best protein-per-dollar foods available.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/fifty-grams-protein-breakfast">50g Protein Breakfast Ideas</Link></li>
        <li><Link to="/blog/high-protein-breakfast-ideas">Quick High-Protein Breakfasts</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/blog/how-much-protein-per-day">How Much Protein Per Day?</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
