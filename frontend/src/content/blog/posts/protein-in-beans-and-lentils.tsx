import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInBeansAndLentils() {
  return (
    <>
      <p>Beans and lentils are the cheapest protein sources on the planet — and a staple for vegetarians, vegans, and anyone on a budget. But how much protein do they actually provide, and how do they compare to meat?</p>
      
      <h2>Protein by Type (Cooked, Per 100g)</h2>
      <ul>
      <li><strong>Edamame (soybeans):</strong> 11g protein | 121 cal — highest protein, complete amino acids</li>
      <li><strong>Lentils (all colors):</strong> 9g protein | 116 cal — versatile, fast-cooking</li>
      <li><strong>Black beans:</strong> 9g protein | 132 cal — great in Mexican, Brazilian dishes</li>
      <li><strong>Chickpeas:</strong> 9g protein | 164 cal — hummus, curries, roasted snacks</li>
      <li><strong>Kidney beans:</strong> 9g protein | 127 cal — chili, stews</li>
      <li><strong>Pinto beans:</strong> 9g protein | 143 cal — refried beans, burritos</li>
      <li><strong>White beans (cannellini):</strong> 10g protein | 139 cal — soups, Italian dishes</li>
      <li><strong>Lima beans:</strong> 8g protein | 115 cal — side dish, succotash</li>
      <li><strong>Green peas:</strong> 5g protein | 81 cal — technically a legume, good protein for a "vegetable"</li>
      </ul>
      
      <h2>Dry vs. Canned: Macro Difference?</h2>
      <p>Minimal. Canned beans have similar macros to home-cooked dried beans. The main differences:</p>
      <ul>
      <li><strong>Sodium:</strong> Canned is higher — rinse to remove 40% of added sodium</li>
      <li><strong>Cost:</strong> Dry beans are 3-4× cheaper per serving</li>
      <li><strong>Convenience:</strong> Canned wins — no soaking or cooking required</li>
      <li><strong>Macros:</strong> Nearly identical when drained and rinsed</li>
      </ul>
      
      <h2>The Complete Protein Problem (and Solution)</h2>
      <p>Most beans are low in the amino acid methionine. Grains are low in lysine. Together, they form a complete protein. Classic combos:</p>
      <ul>
      <li><strong>Rice + beans</strong> (Latin America)</li>
      <li><strong>Lentils + bread</strong> (Middle East)</li>
      <li><strong>Hummus + pita</strong> (Mediterranean)</li>
      <li><strong>Tofu + rice</strong> (East Asia)</li>
      </ul>
      <p>You don't need to combine them at the same meal — just eat variety throughout the day.</p>
      
      <h2>How Much Beans for 30g Protein?</h2>
      <p>About <strong>330g cooked</strong> (roughly 1.5 cups). That's a lot of beans — and about 380-540 calories depending on the type. For comparison, you'd need only 100g of chicken breast for the same protein at half the calories.</p>
      <p>This is why beans work best as a <strong>protein supplement</strong>, not your sole source. Combine with other protein sources to hit your daily target. Track your bean-based meals with <Link to="/">ProteinLens</Link>.</p>
      
      <h2>Bean Meal Prep Ideas</h2>
      <ul>
      <li><strong>Lentil soup:</strong> 200g lentils + vegetables + spices = 18g protein per bowl</li>
      <li><strong>Chickpea curry:</strong> 200g chickpeas + coconut milk + rice = 18g protein per serving</li>
      <li><strong>Black bean burrito bowl:</strong> Beans + rice + salsa + avocado = 15g protein per bowl</li>
      <li><strong>Roasted chickpeas:</strong> Drain, season, bake at 200°C — crunchy high-protein snack (7g per 50g)</li>
      </ul>
      <p>See our <Link to="/blog/vegan-protein-sources-complete">complete vegan protein guide</Link> for more plant-based strategies.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/vegan-protein-sources-complete">Vegan Protein Sources</Link></li>
        <li><Link to="/blog/protein-in-eggs">Protein in Eggs</Link></li>
        <li><Link to="/blog/protein-in-chicken-breast">Protein in Chicken Breast</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
