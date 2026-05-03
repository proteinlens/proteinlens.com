import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInSushi() {
  return (
    <>
      <p>Sushi looks healthy — and it can be — but calories vary from 40 per piece (sashimi) to 500+ for a deep-fried specialty roll. Here's the full breakdown so you can enjoy sushi without the macro mystery.</p>

      <h2>Sushi Calories by Type (Per Piece/Roll)</h2>

      <h3>Nigiri (Per Piece — 1 slice of fish over rice)</h3>
      <ul>
        <li><strong>Salmon nigiri:</strong> 60 cal | 3.5g protein | 8g carbs | 1.5g fat</li>
        <li><strong>Tuna nigiri:</strong> 55 cal | 4g protein | 8g carbs | 0.5g fat</li>
        <li><strong>Shrimp nigiri:</strong> 50 cal | 3g protein | 8g carbs | 0.3g fat</li>
        <li><strong>Eel (unagi) nigiri:</strong> 75 cal | 3g protein | 9g carbs | 2.5g fat</li>
        <li><strong>Egg (tamago) nigiri:</strong> 65 cal | 2g protein | 9g carbs | 1.5g fat</li>
      </ul>

      <h3>Maki Rolls (Per 6-8 Piece Roll)</h3>
      <ul>
        <li><strong>Cucumber roll:</strong> 135 cal | 3g protein | 30g carbs | 0g fat — lightest</li>
        <li><strong>Avocado roll:</strong> 200 cal | 3g protein | 28g carbs | 7g fat</li>
        <li><strong>Tuna roll:</strong> 185 cal | 10g protein | 27g carbs | 2g fat</li>
        <li><strong>Salmon roll:</strong> 200 cal | 9g protein | 27g carbs | 5g fat</li>
        <li><strong>California roll:</strong> 255 cal | 9g protein | 38g carbs | 7g fat</li>
        <li><strong>Spicy tuna roll:</strong> 290 cal | 11g protein | 32g carbs | 11g fat — mayo adds fat</li>
        <li><strong>Dragon roll:</strong> 350 cal | 10g protein | 40g carbs | 15g fat — eel + avocado</li>
        <li><strong>Tempura shrimp roll:</strong> 400 cal | 10g protein | 50g carbs | 18g fat — fried</li>
        <li><strong>Rainbow roll:</strong> 400 cal | 16g protein | 45g carbs | 14g fat — multiple fish</li>
        <li><strong>Philadelphia roll:</strong> 320 cal | 10g protein | 32g carbs | 14g fat — cream cheese</li>
      </ul>

      <h3>Sashimi (Per 5 Slices — No Rice)</h3>
      <ul>
        <li><strong>Tuna sashimi:</strong> 90 cal | 18g protein | 0g carbs | 1g fat</li>
        <li><strong>Salmon sashimi:</strong> 120 cal | 16g protein | 0g carbs | 5g fat</li>
        <li><strong>Yellowtail sashimi:</strong> 100 cal | 17g protein | 0g carbs | 3g fat</li>
      </ul>
      <p>Sashimi is the macro champion — pure protein, no rice carbs.</p>

      <h2>The Real Calorie Problem: Rice</h2>
      <p>Most of a sushi roll's calories come from rice, not fish. A typical roll uses 90-120g of <strong>seasoned rice</strong> (rice + sugar + vinegar). That's 130-170 cal of carbs before any filling.</p>
      <p>If you order 3 rolls = 270-360g rice = 390-510 cal from rice alone. That's why a "light sushi dinner" can easily hit 800-1,200 cal.</p>

      <h2>How to Order Sushi for Your Goals</h2>

      <h3>Fat Loss</h3>
      <ul>
        <li>Start with sashimi or edamame (11g protein per 100g)</li>
        <li>Order 1 simple maki roll (tuna or salmon)</li>
        <li>Skip deep-fried rolls, dragon rolls, spicy mayo</li>
        <li>Ask for brown rice or less rice (naruto-style = wrapped in cucumber, no rice)</li>
        <li>Use low-sodium soy sauce</li>
      </ul>

      <h3>Muscle Building</h3>
      <ul>
        <li>Sashimi platters = high protein, moderate calories</li>
        <li>Add edamame and miso soup for extra protein</li>
        <li>Rolls are fine — the rice provides post-workout carbs</li>
      </ul>

      <h2>Typical Sushi Dinner Macros</h2>
      <ul>
        <li><strong>Light order:</strong> 5 pcs sashimi + 1 maki roll + edamame = 450 cal | 40g protein</li>
        <li><strong>Medium order:</strong> 6 nigiri + 2 maki rolls = 750 cal | 35g protein</li>
        <li><strong>Heavy order:</strong> 3 specialty rolls = 1,000-1,200 cal | 30g protein — lots of rice and fried elements</li>
      </ul>
      <p>Snap your sushi spread with <Link to="/">ProteinLens</Link> before eating — AI handles individual pieces well.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-in-salmon">Protein in Salmon</Link></li>
        <li><Link to="/blog/protein-in-tuna">Protein in Tuna</Link></li>
        <li><Link to="/blog/protein-in-shrimp">Protein in Shrimp</Link></li>
        <li><Link to="/blog/calories-in-rice">Calories in Rice</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
