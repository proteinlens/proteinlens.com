import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInPizza() {
  return (
    <>
      <p>Pizza is the most tracked — and most underestimated — food in calorie counting. A single slice can range from 200 to 500+ calories depending on size, crust, and toppings. Here's how to track pizza without guessing.</p>

      <h2>Pizza Calories by Type (Per Slice, ~1/8 of Large)</h2>
      <ul>
        <li><strong>Cheese (thin crust):</strong> 200 cal | 9g protein | 24g carbs | 7g fat</li>
        <li><strong>Cheese (regular crust):</strong> 270 cal | 11g protein | 33g carbs | 10g fat</li>
        <li><strong>Cheese (deep dish):</strong> 370 cal | 14g protein | 38g carbs | 17g fat</li>
        <li><strong>Pepperoni (regular):</strong> 310 cal | 13g protein | 33g carbs | 14g fat</li>
        <li><strong>Meat lovers:</strong> 370 cal | 16g protein | 33g carbs | 18g fat</li>
        <li><strong>Veggie (regular):</strong> 240 cal | 10g protein | 30g carbs | 9g fat — lightest topping</li>
        <li><strong>Margherita (Neapolitan):</strong> 200 cal | 8g protein | 25g carbs | 7g fat — thinner, lighter</li>
        <li><strong>Hawaiian:</strong> 280 cal | 12g protein | 35g carbs | 10g fat</li>
        <li><strong>BBQ chicken:</strong> 290 cal | 14g protein | 36g carbs | 10g fat</li>
        <li><strong>Stuffed crust (cheese):</strong> 350 cal | 15g protein | 38g carbs | 15g fat</li>
      </ul>

      <h2>Why Pizza Is So Hard to Track</h2>
      <ul>
        <li><strong>Slice sizes vary wildly:</strong> A NYC slice can be 2× the size of a chain pizza slice</li>
        <li><strong>Oil pooling:</strong> Extra oil on the surface adds 50-100 cal per slice you don't see</li>
        <li><strong>Crust weight:</strong> Thin crust saves 70-100 cal per slice vs. regular</li>
        <li><strong>"Extra cheese":</strong> Adds 60-80 cal per slice (30g more mozzarella)</li>
        <li><strong>Nobody eats one slice:</strong> 3 slices of pepperoni = 930 cal — nearly half a day's budget</li>
      </ul>
      <p>This is exactly where AI tracking shines. Snap a photo of your pizza plate with <Link to="/">ProteinLens</Link> before eating — it estimates slice size and toppings visually.</p>

      <h2>The Pizza-Friendly Macro Strategy</h2>
      <p>Pizza night doesn't have to wreck your macros. The key is planning:</p>
      <ul>
        <li><strong>Eat protein-heavy meals earlier in the day:</strong> High-protein breakfast + lunch = room for pizza at dinner</li>
        <li><strong>Limit to 2-3 slices:</strong> Pair with a side salad for volume and fiber</li>
        <li><strong>Choose thin crust:</strong> Saves 70-100 cal per slice with the same toppings</li>
        <li><strong>Add protein toppings:</strong> Chicken, ham, or ground beef add 3-5g protein per slice</li>
        <li><strong>Skip the garlic bread/breadsticks:</strong> That's 200-400 cal of empty carbs on top of pizza</li>
      </ul>

      <h2>Homemade Pizza: The Macro Hack</h2>
      <p>Making pizza at home gives you full macro control:</p>
      <ul>
        <li><strong>Protein crust:</strong> Greek yogurt + flour dough (Oops All Protein) = 15g protein in the crust</li>
        <li><strong>Cauliflower crust:</strong> ~50% fewer calories than regular dough</li>
        <li><strong>Light cheese:</strong> Use half mozzarella + sprinkle of Parmesan for flavor with less fat</li>
        <li><strong>Load veggies:</strong> Mushrooms, peppers, onions, spinach — volume + micronutrients + minimal calories</li>
      </ul>
      <p>Homemade 10" pizza with protein crust: ~600 cal total with 35g protein. That's less than 2 slices at a chain restaurant.</p>

      <h2>Chain Restaurant Comparison (Per Slice, Large)</h2>
      <ul>
        <li><strong>Domino's cheese (hand-tossed):</strong> 290 cal</li>
        <li><strong>Pizza Hut cheese (pan):</strong> 290 cal</li>
        <li><strong>Papa John's cheese (original):</strong> 290 cal</li>
        <li><strong>Little Caesars cheese:</strong> 250 cal</li>
        <li><strong>Costco cheese:</strong> 700 cal — the Costco slice is HUGE (essentially 2.5 normal slices)</li>
      </ul>
      <p>That Costco slice deserves special attention — at 700 cal and 44g carbs, it's one of the most calorie-dense single slices available.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-in-pasta">Calories in Pasta</Link></li>
        <li><Link to="/blog/track-macros-while-traveling">Track Macros While Traveling</Link></li>
        <li><Link to="/blog/how-to-count-macros-beginners">Beginner Macro Counting Guide</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
