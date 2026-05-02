import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInAlcohol() {
  return (
    <>
      <p>Alcohol is the hidden macro saboteur. It contains <strong>7 calories per gram</strong> — almost as much as fat — and your body prioritizes burning it over everything else. Here's what alcohol really does to your macros.</p>

      <h2>Calories by Drink Type</h2>
      <ul>
        <li><strong>Beer (330ml / 5%):</strong> 150 cal | 0g protein | 13g carbs | 14g alcohol</li>
        <li><strong>Light beer (330ml / 4%):</strong> 100 cal | 0g protein | 5g carbs | 11g alcohol</li>
        <li><strong>Red wine (150ml / 13%):</strong> 125 cal | 0g protein | 4g carbs | 16g alcohol</li>
        <li><strong>White wine (150ml / 12%):</strong> 121 cal | 0g protein | 4g carbs | 15g alcohol</li>
        <li><strong>Champagne (150ml / 12%):</strong> 90 cal | 0g protein | 2g carbs | 14g alcohol</li>
        <li><strong>Vodka/gin/rum shot (44ml / 40%):</strong> 97 cal | 0g everything — pure alcohol calories</li>
        <li><strong>Whiskey (44ml / 40%):</strong> 97 cal | same as above</li>
        <li><strong>Margarita (240ml):</strong> 275 cal | 0g protein | 36g carbs (mostly sugar)</li>
        <li><strong>Piña colada (240ml):</strong> 490 cal | 1g protein | 60g carbs — a dessert in a glass</li>
        <li><strong>Long Island Iced Tea:</strong> 290 cal | mostly from 4 spirits combined</li>
      </ul>

      <h2>The 4th Macro Nobody Talks About</h2>
      <p>Alcohol is technically the 4th macronutrient:</p>
      <ul>
        <li>Protein: 4 cal/g</li>
        <li>Carbs: 4 cal/g</li>
        <li>Fat: 9 cal/g</li>
        <li><strong>Alcohol: 7 cal/g</strong></li>
      </ul>
      <p>But unlike the other three, alcohol provides <strong>zero nutritional value</strong>. No vitamins, no minerals, no muscle repair. It's pure energy that your body treats as a toxin and prioritizes metabolizing — pausing fat burning while it processes the alcohol.</p>

      <h2>How Alcohol Kills Fat Loss</h2>
      <ol>
        <li><strong>Pauses fat oxidation:</strong> Your body stops burning fat while processing alcohol (can last 12+ hours)</li>
        <li><strong>Lowers inhibitions:</strong> "I'll just have some pizza" — alcohol-induced eating adds 300-1000+ cal</li>
        <li><strong>Disrupts sleep:</strong> Worse sleep = higher cortisol = water retention = scale confusion</li>
        <li><strong>Empty calories:</strong> 3 beers = 450 cal with zero protein or useful nutrients</li>
        <li><strong>Next-day effects:</strong> Hangover = less activity, more comfort food, skipped workout</li>
      </ol>

      <h2>The Fitness-Friendly Drinking Guide</h2>
      <p>You don't have to quit alcohol entirely. Just be strategic:</p>
      <h3>Best Choices (Lowest Calorie)</h3>
      <ul>
        <li>Vodka/gin + soda water + lime: ~97 cal</li>
        <li>Light beer: ~100 cal</li>
        <li>Champagne/prosecco: ~90 cal</li>
        <li>Dry red or white wine: ~120 cal</li>
      </ul>
      <h3>Worst Choices (Calorie Bombs)</h3>
      <ul>
        <li>Piña colada: 490 cal</li>
        <li>Frozen margarita: 400 cal</li>
        <li>Long Island Iced Tea: 290 cal</li>
        <li>Any "dessert" cocktail: 300-600 cal</li>
      </ul>

      <h2>How to Track Alcohol in Your Macros</h2>
      <p>Most tracking apps don't handle alcohol well. Two approaches:</p>
      <ul>
        <li><strong>Count as carbs:</strong> Take alcohol calories ÷ 4 and add as "carbs" — simplest method</li>
        <li><strong>Count as fat:</strong> Take alcohol calories ÷ 9 and add as "fat" — more conservative</li>
        <li><strong>Borrow from fat + carbs:</strong> If having 300 cal of alcohol, reduce fat by 15g and carbs by 37g from your daily targets</li>
      </ul>
      <p><strong>Never reduce protein to make room for alcohol.</strong> Protein is always priority #1. Use <Link to="/">ProteinLens</Link> to track your food and keep protein on target even on drinking days.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/weight-loss-plateau-reasons">Why Your Weight Loss Has Stalled</Link></li>
        <li><Link to="/blog/track-macros-while-traveling">Track Macros While Traveling</Link></li>
        <li><Link to="/blog/how-to-count-macros-beginners">Beginner Macro Counting Guide</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
