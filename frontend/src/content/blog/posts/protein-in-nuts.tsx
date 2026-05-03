import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInNuts() {
  return (
    <>
      <p>Nuts are nutritional powerhouses — but they're a <strong>fat source that happens to have protein</strong>, not the other way around. Here's every nut ranked by protein and how to fit them into your macros without blowing your calorie budget.</p>

      <h2>Protein in Nuts (Per 30g / Small Handful)</h2>
      <ul>
        <li><strong>Peanuts*:</strong> 7.3g protein | 14g fat | 5g carbs | 170 cal</li>
        <li><strong>Almonds:</strong> 6g protein | 14g fat | 6g carbs | 164 cal</li>
        <li><strong>Pistachios:</strong> 6g protein | 13g fat | 8g carbs | 159 cal — lowest calorie nut</li>
        <li><strong>Cashews:</strong> 5g protein | 12g fat | 9g carbs | 157 cal</li>
        <li><strong>Walnuts:</strong> 4.3g protein | 18g fat | 4g carbs | 185 cal — highest omega-3</li>
        <li><strong>Brazil nuts:</strong> 4g protein | 19g fat | 3.5g carbs | 186 cal — selenium powerhouse</li>
        <li><strong>Pecans:</strong> 2.6g protein | 20g fat | 4g carbs | 196 cal — highest fat, lowest protein</li>
        <li><strong>Macadamia:</strong> 2.2g protein | 21g fat | 4g carbs | 204 cal — the calorie bomb of nuts</li>
        <li><strong>Hazelnuts:</strong> 4.2g protein | 17g fat | 5g carbs | 178 cal</li>
        <li><strong>Pine nuts:</strong> 3.9g protein | 20g fat | 4g carbs | 191 cal</li>
      </ul>
      <p><em>*Peanuts are technically legumes but always grouped with nuts.</em></p>

      <h2>The Nut Portion Problem</h2>
      <p><strong>30g of nuts looks tiny.</strong> It's about 23 almonds, 49 pistachios, or 14 walnut halves. Most people eat 60-90g in a sitting — that's 350-550 calories. Without measuring, nuts are one of the easiest ways to accidentally eat 500+ extra calories.</p>
      <p>Solutions:</p>
      <ul>
        <li><strong>Buy pre-portioned packs:</strong> More expensive but prevents mindless eating</li>
        <li><strong>Use pistachios:</strong> Shells slow you down — you eat 41% less (Kennedy-Hagan et al., 2011)</li>
        <li><strong>Weigh on a scale:</strong> Once you see what 30g looks like, you'll calibrate</li>
        <li><strong>Never eat from the bag:</strong> Put your portion in a bowl, bag goes away</li>
      </ul>

      <h2>Best Nuts for Protein Goals</h2>
      <ol>
        <li><strong>Peanuts:</strong> Highest protein per calorie, cheapest</li>
        <li><strong>Almonds:</strong> Second-highest protein, great as a snack</li>
        <li><strong>Pistachios:</strong> Good protein AND lowest calories — best all-round</li>
      </ol>
      <p>Worst for protein goals: macadamias and pecans (mostly fat, minimal protein).</p>

      <h2>When Nuts Make Sense in Your Diet</h2>
      <ul>
        <li><strong>Bulking:</strong> Eat freely — easy, portable, calorie-dense</li>
        <li><strong>Maintaining:</strong> 30g/day (one handful) adds healthy fats without excess</li>
        <li><strong>Cutting:</strong> Limit to 15-20g or skip entirely — the calories aren't worth it when protein sources like Greek yogurt give you more protein for fewer calories</li>
        <li><strong>Keto:</strong> Perfect — high fat, low carb (especially macadamias, pecans, walnuts)</li>
      </ul>

      <h2>Nuts vs. Seeds</h2>
      <ul>
        <li><strong>Hemp seeds (30g):</strong> 10g protein | 15g fat | 168 cal — highest protein "nut/seed"</li>
        <li><strong>Pumpkin seeds (30g):</strong> 8.5g protein | 13g fat | 163 cal — great on salads</li>
        <li><strong>Sunflower seeds (30g):</strong> 6g protein | 14g fat | 165 cal — snack classic</li>
        <li><strong>Chia seeds (30g):</strong> 5g protein | 9g fat | 146 cal — omega-3s + fiber</li>
        <li><strong>Flax seeds (30g):</strong> 5.5g protein | 13g fat | 160 cal — must grind for absorption</li>
      </ul>
      <p>Seeds generally have better protein-to-calorie ratios than nuts. Hemp seeds are the clear protein winner.</p>
      <p>Track your nut and seed portions with <Link to="/">ProteinLens</Link> — even small handfuls add up.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-in-peanut-butter">Protein in Peanut Butter</Link></li>
        <li><Link to="/blog/vegan-protein-sources-complete">Vegan Protein Sources</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
