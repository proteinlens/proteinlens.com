/**
 * Blog Post: Common AI Food Scan Mistakes (And How to Fix Them)
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function CommonAIFoodScanMistakes() {
  return (
    <div className="blog-content">
      <p>
        AI food scanning isn't perfect. Sometimes estimates are off by a significant margin. 
        But most errors follow predictable patterns — and once you know them, you can easily 
        adjust.
      </p>

      <p>Here are the most common AI food scan mistakes and how to fix them.</p>

      <h2>Mistake #1: Missing Hidden Oils and Fats</h2>

      <h3>The Problem</h3>
      <p>
        AI can see the food but can't see what it was cooked in. A stir-fry might look like 
        lean chicken and vegetables, but it could have 3-4 tablespoons of oil (360-480 extra calories).
      </p>

      <h3>Signs to Watch For</h3>
      <ul>
        <li>Food looks shiny or glistening</li>
        <li>Liquid pooling on the plate</li>
        <li>Restaurant-prepared foods (they use more oil than you'd expect)</li>
        <li>Anything described as "sautéed," "pan-fried," or "crispy"</li>
      </ul>

      <h3>How to Fix It</h3>
      <p>
        Add 1-2 tablespoons of oil (120-240 calories, 14-28g fat) to your estimate for:
      </p>
      <ul>
        <li>Restaurant stir-fries and sautéed dishes</li>
        <li>Anything visibly oily or shiny</li>
        <li>Fried foods (even "lightly" fried)</li>
      </ul>

      <h2>Mistake #2: Underestimating Sauce Calories</h2>

      <h3>The Problem</h3>
      <p>
        Sauces and dressings are calorie bombs that AI often underestimates. A "light" 
        drizzle of ranch can be 200+ calories. Creamy pasta sauce adds 300-500 calories 
        to a dish.
      </p>

      <h3>Signs to Watch For</h3>
      <ul>
        <li>Creamy white or orange sauces (alfredo, queso, vodka sauce)</li>
        <li>Thick, glossy Asian sauces (teriyaki, orange chicken, General Tso's)</li>
        <li>Generous dressing on salads</li>
        <li>Dipping sauces served on the side</li>
      </ul>

      <h3>How to Fix It</h3>
      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Sauce calorie guide:</p>
        <ul className="space-y-1">
          <li>Creamy sauces (alfredo, queso): +200-300 cal per serving</li>
          <li>Sweet Asian sauces (teriyaki, orange): +150-200 cal</li>
          <li>Salad dressings: +100-200 cal per 2 tbsp</li>
          <li>Mayo-based sauces: +90 cal per tbsp</li>
          <li>Ketchup/mustard: +20-30 cal per tbsp</li>
        </ul>
      </div>

      <h2>Mistake #3: Confusing Similar-Looking Foods</h2>

      <h3>The Problem</h3>
      <p>
        Some foods look similar but have very different macros. AI might confuse:
      </p>
      <ul>
        <li>Cauliflower rice (25 cal/cup) vs white rice (200 cal/cup)</li>
        <li>Turkey burger vs beef burger (similar looks, ~100 cal difference)</li>
        <li>Zucchini noodles vs regular pasta (huge difference)</li>
        <li>Light mayo vs regular mayo (half the calories)</li>
      </ul>

      <h3>How to Fix It</h3>
      <p>
        If you know you're eating a lower-calorie substitute, adjust the estimate down. 
        Most AI tools let you edit the identified food after scanning.
      </p>

      <h2>Mistake #4: Portion Size Errors</h2>

      <h3>The Problem</h3>
      <p>
        Without a reference object, AI has to guess portion sizes based on plate proportions. 
        This can be off by 30-50% for:
      </p>
      <ul>
        <li>Unusually large or small plates</li>
        <li>Deep bowls that hide food</li>
        <li>Piled or stacked foods</li>
        <li>Extreme close-up photos</li>
      </ul>

      <h3>How to Fix It</h3>
      <p>
        Include a reference object in your photo — a standard fork, knife, or your hand. 
        If portions look wrong, adjust based on how many "palms" of protein or "fists" of 
        carbs you're actually eating.
      </p>

      <h2>Mistake #5: Not Accounting for Cooking Method</h2>

      <h3>The Problem</h3>
      <p>
        The same food can have vastly different calories depending on how it's cooked:
      </p>
      <ul>
        <li>Grilled chicken breast: 165 cal</li>
        <li>Breaded fried chicken: 320 cal (same size)</li>
        <li>Baked potato: 160 cal</li>
        <li>Loaded baked potato: 500+ cal</li>
      </ul>

      <h3>How to Fix It</h3>
      <p>
        If the AI identifies "chicken" but yours is clearly breaded and fried, adjust upward. 
        Look for visual cues: breading, crispy coating, or visible oil means more calories.
      </p>

      <h2>Mistake #6: Missing Toppings and Additions</h2>

      <h3>The Problem</h3>
      <p>
        Small additions add up fast and are easy for AI to miss:
      </p>
      <ul>
        <li>Cheese on anything: +100-150 cal per ounce</li>
        <li>Croutons on salad: +50-100 cal</li>
        <li>Bacon bits: +80 cal per 2 tbsp</li>
        <li>Guacamole: +150 cal per ¼ cup</li>
        <li>Sour cream: +60 cal per 2 tbsp</li>
      </ul>

      <h3>How to Fix It</h3>
      <p>
        Mentally note visible toppings and add them if the AI missed them. Most apps let 
        you add items to a scanned meal.
      </p>

      <h2>Mistake #7: Mixed Dishes with Hidden Ingredients</h2>

      <h3>The Problem</h3>
      <p>
        Casseroles, burritos, sandwiches, and layered dishes hide ingredients that AI can't see:
      </p>
      <ul>
        <li>Cheese melted inside a quesadilla</li>
        <li>Mayo spread on a sandwich</li>
        <li>Cream in a casserole</li>
        <li>Rice hidden under curry</li>
      </ul>

      <h3>How to Fix It</h3>
      <p>
        For mixed dishes, lean toward the higher estimate. If the AI says 500-700 calories, 
        assume 650-700. Restaurant mixed dishes especially tend to have more hidden fats.
      </p>

      <h2>When to Trust vs Adjust AI Estimates</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">✅ Trust the estimate when:</p>
        <ul className="space-y-1">
          <li>Simple, visible foods (grilled meat, steamed vegetables, plain rice)</li>
          <li>Home-cooked meals where you know the ingredients</li>
          <li>Foods you've tracked before with accurate results</li>
        </ul>

        <p className="font-semibold mb-2 mt-4">⚠️ Adjust the estimate when:</p>
        <ul className="space-y-1">
          <li>Restaurant meals (add 10-20% for hidden oils/butter)</li>
          <li>Anything with visible sauce or dressing</li>
          <li>Fried or breaded foods</li>
          <li>Mixed dishes with hidden layers</li>
        </ul>
      </div>

      <h2>The 80/20 Rule for AI Accuracy</h2>

      <p>
        Here's a practical approach: trust AI estimates for 80% of your meals (simple, 
        visible foods) and manually adjust for the 20% that are complex or restaurant-prepared.
      </p>

      <p>
        This gives you the speed benefit of AI scanning while catching the biggest potential errors.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Try it yourself:</p>
        <p>
          <Link to="/" className="text-primary hover:underline">ProteinLens</Link> lets you 
          scan meals and then edit the results if you spot any of these common mistakes. 
          The more you use it, the better you'll get at knowing when to trust vs adjust.
        </p>
      </div>
    </div>
  );
}
