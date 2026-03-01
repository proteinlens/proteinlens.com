/**
 * Blog Post: How AI Food Scanning Actually Works — The Tech Behind ProteinLens
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function HowAiFoodScanningWorks() {
  return (
    <div className="blog-content">
      <p>
        You snap a photo of your lunch, and within seconds you get a full macro breakdown — protein,
        carbs, fat, and calories. But how does AI actually identify food from a photo and estimate
        its nutritional content? Let's break it down.
      </p>

      <h2>Step 1: Image Recognition — What's on the Plate?</h2>
      <p>
        Modern food recognition uses <strong>deep learning models</strong> trained on millions of
        food images. When you take a photo, the AI doesn't just see pixels — it identifies distinct
        food items, even when they're mixed together on a plate.
      </p>
      <p>
        The model recognizes textures, colors, shapes, and context clues. A pile of white grains next
        to grilled meat? That's rice and chicken. A golden-brown disc with syrup? Pancakes. The AI
        draws on patterns from its training data to make these identifications.
      </p>

      <h2>Step 2: Portion Estimation — How Much Is There?</h2>
      <p>
        Identifying <em>what</em> food is on the plate is only half the challenge. The AI also needs
        to estimate <em>how much</em> of each food is present.
      </p>
      <p>
        This is done through <strong>visual volume estimation</strong> — analyzing the apparent size
        of each food item relative to the plate, utensils, and other items in frame. The model has
        learned typical serving sizes and portion-to-weight ratios from its training data.
      </p>
      <p>
        Is it perfect? No — and that's why apps like <Link to="/">ProteinLens</Link> show confidence
        levels and let you know when an estimate might be less reliable (like dense sauces or hidden
        ingredients).
      </p>

      <h2>Step 3: Nutritional Mapping — From Food to Macros</h2>
      <p>
        Once the AI knows "200g of grilled chicken breast" and "150g of white rice," it maps these
        to nutritional databases (like USDA FoodData Central) to calculate macros:
      </p>
      <ul>
        <li><strong>Protein:</strong> Based on food type and estimated weight</li>
        <li><strong>Carbohydrates:</strong> Accounting for starches, sugars, and fiber</li>
        <li><strong>Fat:</strong> Including visible fats, oils, and cooking methods</li>
        <li><strong>Calories:</strong> Calculated from the macro totals (4/4/9 kcal per gram)</li>
      </ul>

      <h2>How Accurate Is It?</h2>
      <p>
        Studies on AI food recognition show accuracy rates of <strong>85-95% for food identification</strong>
        and <strong>±20% for portion estimation</strong>. That's comparable to human estimates — most
        people are surprisingly bad at eyeballing portions too.
      </p>
      <p>Key factors that affect accuracy:</p>
      <ul>
        <li><strong>Lighting:</strong> Good lighting dramatically improves recognition</li>
        <li><strong>Visibility:</strong> Foods that are visible (not buried under sauce) are easier to identify</li>
        <li><strong>Common vs. niche:</strong> A chicken salad is easier than a regional specialty</li>
        <li><strong>Single vs. mixed:</strong> Individual items are easier than blended casseroles</li>
      </ul>
      <p>
        <em>For tips on getting better results, read our guide on{' '}
        <Link to="/blog/common-ai-food-scan-mistakes">common AI food scan mistakes to avoid</Link>.</em>
      </p>

      <h2>AI Scanning vs. Manual Logging</h2>
      <p>
        Traditional macro tracking requires you to search a database, find the right entry, estimate
        the portion, and manually log it — for every single food item. A typical meal takes
        <strong> 2-5 minutes</strong> to log manually.
      </p>
      <p>
        AI photo scanning takes <strong>under 5 seconds</strong>. Even if the estimate is slightly
        less precise than weighing every ingredient on a food scale, the massive reduction in friction
        means you're far more likely to <em>actually track consistently</em>.
      </p>
      <p>
        And consistency beats precision every time. A rough estimate of every meal is infinitely more
        useful than a precise log of the one meal you bothered to track before giving up.
      </p>

      <h2>What's Next for AI Food Tracking?</h2>
      <p>
        The technology is improving rapidly. Here's what's coming:
      </p>
      <ul>
        <li><strong>Multi-angle scanning:</strong> Taking 2-3 photos for better depth estimation</li>
        <li><strong>Learning from corrections:</strong> AI that improves based on your feedback</li>
        <li><strong>Recipe recognition:</strong> Identifying specific dishes and their preparation methods</li>
        <li><strong>Real-time video:</strong> Point your camera and see macros update live</li>
      </ul>
      <p>
        Want to try AI macro tracking yourself?{' '}
        <Link to="/">Scan your next meal with ProteinLens</Link> — it's free for up to 3 scans per day.
      </p>
    </div>
  );
}
