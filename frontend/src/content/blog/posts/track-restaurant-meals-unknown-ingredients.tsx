/**
 * Blog Post: How to Track Restaurant Meals When You Don't Know the Ingredients
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function TrackRestaurantMeals() {
  return (
    <div className="blog-content">
      <p>
        Restaurant meals are the #1 tracking challenge. Hidden oils, mystery sauces, and 
        unknown portions make it feel impossible to log accurately. But you don't need to 
        know every ingredient — you just need good estimation strategies.
      </p>

      <h2>Why Restaurant Meals Are Tricky</h2>

      <p>Restaurant kitchens are designed for taste, not calorie control:</p>

      <ul>
        <li><strong>Butter on everything</strong> — Vegetables, steaks, bread, pasta</li>
        <li><strong>Generous oil use</strong> — 2-4 tablespoons per dish is common</li>
        <li><strong>Large portions</strong> — 2-3x what you'd serve at home</li>
        <li><strong>Hidden ingredients</strong> — Cream in sauces, sugar in dressings</li>
        <li><strong>No nutrition labels</strong> — Unless it's a chain with published info</li>
      </ul>

      <h2>Strategy #1: The Photo + Estimate Method</h2>

      <p>
        The fastest approach for most restaurant meals:
      </p>

      <ol>
        <li><strong>Snap a photo</strong> of your meal before eating</li>
        <li><strong>Use AI tracking</strong> (like <Link to="/" className="text-primary hover:underline">ProteinLens</Link>) to get a baseline estimate</li>
        <li><strong>Add 15-25%</strong> to account for hidden oils and butter</li>
        <li><strong>Done</strong> — don't overthink it</li>
      </ol>

      <p>
        This method takes 30 seconds and gets you within 20-25% accuracy — good enough 
        for consistent progress.
      </p>

      <h2>Strategy #2: The Component Breakdown</h2>

      <p>
        For important meals or when you want more precision, break down the dish:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Example: Restaurant Chicken Stir-Fry</p>
        <ul className="space-y-1">
          <li>Chicken breast (about 6oz cooked): ~280 cal, 52g protein</li>
          <li>Mixed vegetables (2 cups): ~80 cal</li>
          <li>Rice (looks like 1.5 cups): ~300 cal, 65g carbs</li>
          <li>Cooking oil (estimate 2 tbsp): ~240 cal, 28g fat</li>
          <li>Stir-fry sauce (looks like 3 tbsp): ~60 cal, 12g carbs</li>
          <li><strong>Total estimate: ~960 cal, 52g protein, 77g carbs, 28g fat</strong></li>
        </ul>
      </div>

      <h2>Strategy #3: Use Chain Restaurant Data</h2>

      <p>
        Many chain restaurants publish nutrition info. Even if you're not eating there, 
        their data gives useful benchmarks:
      </p>

      <ul>
        <li>Chipotle burrito bowl: 600-1000 cal depending on toppings</li>
        <li>Cheesecake Factory chicken: often 1200-1800 cal (seriously)</li>
        <li>Olive Garden pasta: 800-1500 cal depending on sauce</li>
        <li>Steakhouse ribeye (12oz): 800-1000 cal for just the meat</li>
      </ul>

      <p>
        If your meal looks similar to a chain's version, use their numbers as a starting point.
      </p>

      <h2>Restaurant Food Categories: What to Expect</h2>

      <h3>Grilled Protein (Safest Choice)</h3>
      <ul>
        <li>Grilled chicken breast (6-8oz): 250-350 cal</li>
        <li>Grilled salmon (6oz): 350-400 cal</li>
        <li>Grilled steak (8oz): 500-600 cal</li>
      </ul>
      <p><em>Watch for: butter brushed on top (add 100 cal)</em></p>

      <h3>Salads (Deceptively High)</h3>
      <ul>
        <li>Side salad with dressing: 200-400 cal</li>
        <li>Entrée salad with protein: 600-1200 cal</li>
        <li>Caesar salad: 500-800 cal (cheese, croutons, dressing add up)</li>
      </ul>
      <p><em>Watch for: dressing is often 200-400 cal alone</em></p>

      <h3>Pasta (Highest Variance)</h3>
      <ul>
        <li>Marinara-based: 600-900 cal</li>
        <li>Cream-based (alfredo, vodka): 1000-1600 cal</li>
        <li>With protein added: +200-400 cal</li>
      </ul>
      <p><em>Watch for: portions are usually 2-3 servings of pasta</em></p>

      <h3>Asian Food</h3>
      <ul>
        <li>Stir-fry with rice: 700-1100 cal</li>
        <li>Fried rice: 800-1200 cal</li>
        <li>Sweet sauces (orange, teriyaki): add 150-250 cal</li>
      </ul>
      <p><em>Watch for: oil in stir-fries, sugar in sauces</em></p>

      <h3>Mexican Food</h3>
      <ul>
        <li>Burrito: 800-1400 cal</li>
        <li>Tacos (3): 500-900 cal</li>
        <li>Burrito bowl (no tortilla): 500-800 cal</li>
      </ul>
      <p><em>Watch for: cheese, sour cream, chips add 300+ cal</em></p>

      <h2>The "I Have No Idea" Fallback</h2>

      <p>
        When you truly can't estimate, use these conservative defaults:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li><strong>Light meal</strong> (salad, simple protein + veg): 500-700 cal</li>
          <li><strong>Medium meal</strong> (entrée with sides): 800-1100 cal</li>
          <li><strong>Heavy meal</strong> (pasta, fried foods, dessert): 1200-1600 cal</li>
          <li><strong>Special occasion</strong> (multiple courses, drinks): 1800-2500 cal</li>
        </ul>
      </div>

      <p>
        These aren't precise, but they're better than not logging at all. Over time, 
        overestimates and underestimates balance out.
      </p>

      <h2>Practical Tips for Eating Out</h2>

      <h3>Before You Order</h3>
      <ul>
        <li>Check the restaurant's website for nutrition info</li>
        <li>Look for "grilled," "steamed," or "broiled" options</li>
        <li>Ask for dressing/sauce on the side</li>
      </ul>

      <h3>When You Order</h3>
      <ul>
        <li>"Can I get that grilled instead of fried?"</li>
        <li>"Dressing on the side, please"</li>
        <li>"Can I substitute vegetables for fries?"</li>
      </ul>

      <h3>At the Table</h3>
      <ul>
        <li>Take a photo before eating</li>
        <li>Eat protein first (easiest to estimate)</li>
        <li>Consider boxing half for later (you'll know exactly what you ate)</li>
      </ul>

      <h2>The Mindset Shift</h2>

      <p>
        Restaurant tracking doesn't need to be perfect. The goal is to maintain awareness, 
        not obsessive precision. Here's the mindset that works:
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li>✅ "This is probably about 900 calories" (good enough)</li>
          <li>❌ "I need to know the exact grams of oil they used" (impossible)</li>
          <li>✅ Log something, even if imperfect</li>
          <li>❌ Skip logging because you can't be precise</li>
        </ul>
      </div>

      <p>
        Consistency beats precision. A rough estimate logged is infinitely more useful 
        than a perfect estimate you never made.
      </p>

      <h2>Try It: Photo Track Your Next Restaurant Meal</h2>

      <p>
        Next time you eat out, snap a photo and <Link to="/" className="text-primary hover:underline">try 
        ProteinLens</Link>. You'll get an instant estimate that you can adjust with the 
        strategies above. It takes 10 seconds and keeps you on track.
      </p>
    </div>
  );
}
