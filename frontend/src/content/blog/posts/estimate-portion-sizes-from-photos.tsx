/**
 * Blog Post: How to Estimate Portion Sizes from Photos
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function EstimatePortionSizes() {
  return (
    <div className="blog-content">
      <p>
        You don't need a food scale to track macros effectively. With a few simple visual tricks, 
        you can estimate portions accurately enough to hit your goals. Here's how.
      </p>

      <h2>The Hand Measurement System</h2>

      <p>
        Your hand is always with you and scales proportionally to your body size. Use these 
        simple comparisons:
      </p>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-3">
          <li>
            <strong>Palm = 1 serving of protein (3-4 oz cooked)</strong>
            <br />
            <span className="text-sm text-muted-foreground">About 20-25g protein for chicken, fish, or lean meat</span>
          </li>
          <li>
            <strong>Fist = 1 serving of carbs (1 cup)</strong>
            <br />
            <span className="text-sm text-muted-foreground">About 30-45g carbs for rice, pasta, or potatoes</span>
          </li>
          <li>
            <strong>Cupped hand = 1 serving of carbs (½ cup dry)</strong>
            <br />
            <span className="text-sm text-muted-foreground">About 30g carbs for oats, granola, or nuts</span>
          </li>
          <li>
            <strong>Thumb = 1 serving of fats (1 tbsp)</strong>
            <br />
            <span className="text-sm text-muted-foreground">About 10-14g fat for oils, butter, or nut butters</span>
          </li>
          <li>
            <strong>Two hands cupped = 1 serving of vegetables</strong>
            <br />
            <span className="text-sm text-muted-foreground">Low calorie, high volume — eat freely</span>
          </li>
        </ul>
      </div>

      <h2>Common Object Comparisons</h2>

      <p>
        When your hand isn't a good reference (like in photos), use everyday objects:
      </p>

      <h3>For Protein</h3>
      <ul>
        <li><strong>Deck of cards</strong> = 3 oz cooked meat (~21g protein)</li>
        <li><strong>Checkbook</strong> = 3 oz fish fillet (~21g protein)</li>
        <li><strong>2 eggs</strong> = about 12g protein</li>
      </ul>

      <h3>For Carbs</h3>
      <ul>
        <li><strong>Tennis ball</strong> = ½ cup cooked rice or pasta (~20g carbs)</li>
        <li><strong>Computer mouse</strong> = medium baked potato (~35g carbs)</li>
        <li><strong>Hockey puck</strong> = 1 serving bagel or large roll (~45g carbs)</li>
      </ul>

      <h3>For Fats</h3>
      <ul>
        <li><strong>Dice</strong> = 1 tsp butter or oil (~5g fat)</li>
        <li><strong>Thumb tip to first knuckle</strong> = 1 tbsp nut butter (~8g fat)</li>
        <li><strong>Golf ball</strong> = 2 tbsp peanut butter (~16g fat)</li>
      </ul>

      <h2>Plate Method for Quick Estimates</h2>

      <p>
        For a standard 10-inch dinner plate:
      </p>

      <ul>
        <li><strong>½ plate vegetables</strong> — fills you up with minimal calories</li>
        <li><strong>¼ plate protein</strong> — about 4-5 oz cooked (30-40g protein)</li>
        <li><strong>¼ plate carbs</strong> — about 1 cup cooked (40-50g carbs)</li>
      </ul>

      <p>
        This simple split naturally creates a balanced, moderate-calorie meal without any measuring.
      </p>

      <h2>Visual Portion Tricks for Common Foods</h2>

      <h3>Rice and Grains</h3>
      <p>
        Cooked rice "fluffs" to about 3x its dry volume. One cup of cooked rice (tennis ball size) 
        is about 45g carbs and 200 calories. Restaurant portions are often 2-3 cups.
      </p>

      <h3>Pasta</h3>
      <p>
        A "serving" on the box (2 oz dry, 1 cup cooked) looks tiny on a plate. Most people eat 
        2-3 servings. If pasta covers more than ¼ of your plate, it's probably 2+ servings.
      </p>

      <h3>Meat</h3>
      <p>
        Raw meat shrinks 20-25% when cooked. A 6 oz raw chicken breast becomes about 4.5 oz cooked. 
        Restaurant steaks are often 8-12 oz — that's 2-3 "servings."
      </p>

      <h3>Cheese</h3>
      <p>
        1 oz of cheese (1 serving) is about the size of 4 dice or your thumb. Most people use 
        2-3x this amount on sandwiches or salads.
      </p>

      <h3>Nuts</h3>
      <p>
        A 1 oz serving of almonds is about 23 nuts (160 calories). A "handful" is usually 1.5-2 oz. 
        Nuts are the easiest food to accidentally overeat.
      </p>

      <h2>Common Estimation Mistakes</h2>

      <h3>1. Underestimating cooking oils</h3>
      <p>
        A "drizzle" of olive oil is often 2-3 tablespoons (240-360 calories). If food looks 
        shiny or wet, oil was used liberally.
      </p>

      <h3>2. Ignoring sauces and dressings</h3>
      <p>
        Creamy sauces add 100-200 calories per serving. "Light" dressing on a restaurant salad 
        is usually 2-3 servings.
      </p>

      <h3>3. Overestimating protein portions</h3>
      <p>
        That "huge" chicken breast is often exactly one serving (4 oz cooked, ~35g protein). 
        We tend to think protein portions are bigger than they are.
      </p>

      <h3>4. Underestimating carb portions</h3>
      <p>
        The opposite problem: that "small" bowl of rice is often 2-3 cups (90-135g carbs). 
        Carbs look smaller than they are.
      </p>

      <h2>Practice Makes Better</h2>

      <p>
        Visual estimation is a skill that improves with practice. Here's how to calibrate:
      </p>

      <ol>
        <li><strong>Weigh foods occasionally</strong> to check your estimates</li>
        <li><strong>Use measuring cups</strong> for rice, pasta, and cereal a few times</li>
        <li><strong>Compare to your hand</strong> consistently to build muscle memory</li>
        <li><strong>Take photos</strong> and review them — you'll start noticing patterns</li>
      </ol>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Pro tip:</p>
        <p>
          Combine visual estimation with <Link to="/" className="text-primary hover:underline">AI photo 
          tracking</Link>. The AI gives you a baseline estimate, and your visual skills help you 
          adjust if something looks off.
        </p>
      </div>

      <h2>The Bottom Line</h2>

      <p>
        You don't need to weigh every meal to track macros successfully. Visual estimation 
        with hand measurements and common objects gets you within 15-20% accuracy — which 
        is plenty for most goals.
      </p>

      <p>
        The key is consistency: slightly overestimating or underestimating doesn't matter 
        if you do it the same way every day. Your body responds to patterns, not individual meals.
      </p>
    </div>
  );
}
