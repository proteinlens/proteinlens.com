import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInCoffee() {
  return (
    <>
      <p>Black coffee has 2 calories. A Starbucks Frappuccino has 400+. The difference is entirely in what you add — and most people have no idea how many calories their daily coffee habit contains.</p>

      <h2>Coffee Calories by Type</h2>
      <ul>
        <li><strong>Black coffee (240ml):</strong> 2 cal | 0g fat | 0g carbs | 0.3g protein</li>
        <li><strong>Espresso (30ml shot):</strong> 3 cal</li>
        <li><strong>Americano:</strong> 5 cal — espresso + water</li>
        <li><strong>Cappuccino (whole milk):</strong> 120 cal | 6g fat | 10g carbs | 8g protein</li>
        <li><strong>Latte (whole milk, 360ml):</strong> 190 cal | 7g fat | 18g carbs | 13g protein</li>
        <li><strong>Latte (oat milk):</strong> 170 cal | 5g fat | 24g carbs | 3g protein</li>
        <li><strong>Flat white:</strong> 120 cal | 7g fat | 9g carbs | 8g protein</li>
        <li><strong>Mocha:</strong> 290 cal | 12g fat | 35g carbs | 13g protein</li>
        <li><strong>Caramel macchiato:</strong> 250 cal | 7g fat | 34g carbs | 10g protein</li>
        <li><strong>Frappuccino (grande, with whip):</strong> 400-500 cal | 15-20g fat | 60-70g carbs</li>
        <li><strong>Cold brew (black):</strong> 5 cal</li>
        <li><strong>Cold brew (with cream + sugar):</strong> 100-200 cal</li>
      </ul>

      <h2>The "Daily Latte" Math</h2>
      <p>One daily latte = 190 cal × 365 days = <strong>69,350 extra calories per year</strong>. That's roughly 9 kg of body fat equivalent. Switch to black coffee or an americano and you've eliminated a significant calorie source without changing any food.</p>
      <p>Not ready for black? Try these lower-cal swaps:</p>
      <ul>
        <li>Latte with skim milk: 100 cal (vs. 190 with whole milk)</li>
        <li>Cappuccino with skim: 60 cal (less milk than a latte)</li>
        <li>Cold brew + splash of milk: 20-30 cal</li>
        <li>Americano + sugar-free syrup: 5 cal</li>
      </ul>

      <h2>Common Add-In Calories</h2>
      <ul>
        <li><strong>Sugar (1 tsp / 4g):</strong> 16 cal — adds up fast at 2-3 tsp</li>
        <li><strong>Whole milk (30ml splash):</strong> 18 cal</li>
        <li><strong>Half & half (30ml):</strong> 40 cal</li>
        <li><strong>Heavy cream (30ml):</strong> 100 cal — keto-friendly but calorie-dense</li>
        <li><strong>Flavored creamer (1 tbsp):</strong> 35 cal + 5g sugar</li>
        <li><strong>Whipped cream:</strong> 80-110 cal per dollop</li>
        <li><strong>Flavored syrup (1 pump):</strong> 20 cal | 5g sugar</li>
        <li><strong>Sugar-free syrup:</strong> 0 cal — best swap available</li>
      </ul>

      <h2>Coffee and Fat Loss</h2>
      <p>Caffeine has genuine fat-loss benefits:</p>
      <ul>
        <li><strong>Boosts metabolic rate 3-11%</strong> for several hours (Dulloo et al., 1989)</li>
        <li><strong>Increases fat oxidation by 10-29%</strong> during exercise</li>
        <li><strong>Appetite suppression:</strong> Moderate effect, especially in the morning</li>
        <li><strong>Pre-workout benefit:</strong> Improves exercise performance 5-15%</li>
      </ul>
      <p>But these benefits are wiped out if your coffee contains 300+ cal of milk, sugar, and syrups. <strong>Black coffee supports fat loss. Frappuccinos don't.</strong></p>

      <h2>Protein Coffee ("Proffee")</h2>
      <p>The TikTok trend that actually makes sense:</p>
      <ul>
        <li>Cold brew + 1 scoop protein powder (shaken) = ~130 cal, 25g protein</li>
        <li>Iced latte with protein powder = ~220 cal, 35g protein</li>
        <li>Espresso over protein shake = ~150 cal, 27g protein</li>
      </ul>
      <p>It transforms coffee from empty calories into a functional protein source. Track it with <Link to="/">ProteinLens</Link>.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-in-alcohol">Calories in Alcohol</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-to-count-macros-beginners">Beginner Macro Counting Guide</Link></li>
        <li><Link to="/blog/intermittent-fasting-macros">Intermittent Fasting & Macros</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
