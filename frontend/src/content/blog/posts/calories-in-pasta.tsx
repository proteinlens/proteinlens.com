import React from 'react';
import { Link } from 'react-router-dom';

export default function CaloriesInPasta() {
  return (
    <>
      <p>Pasta is the ultimate comfort food — and one of the most commonly over-portioned. A restaurant serving can easily pack 600+ calories before sauce. Here's the real macro breakdown for every pasta type.</p>

      <h2>Pasta Macros: Cooked (Per 100g)</h2>
      <ul>
        <li><strong>Regular spaghetti:</strong> 131 cal | 5g protein | 25g carbs | 1.1g fat</li>
        <li><strong>Penne/fusilli:</strong> 131 cal | 5g protein | 25g carbs | 1.1g fat</li>
        <li><strong>Whole wheat pasta:</strong> 124 cal | 5.3g protein | 24g carbs | 0.5g fat</li>
        <li><strong>Egg noodles:</strong> 138 cal | 4.5g protein | 25g carbs | 2.1g fat</li>
        <li><strong>Chickpea pasta (Banza):</strong> 170 cal | 11g protein | 27g carbs | 3g fat</li>
        <li><strong>Lentil pasta:</strong> 170 cal | 12g protein | 28g carbs | 1g fat</li>
        <li><strong>Konjac/shirataki:</strong> 10 cal | 0g protein | 3g carbs | 0g fat</li>
        <li><strong>Zucchini noodles:</strong> 17 cal | 1.2g protein | 3g carbs | 0.3g fat</li>
      </ul>

      <h2>Dry vs. Cooked: Critical Difference</h2>
      <p><strong>Pasta roughly doubles in weight when cooked</strong> (absorbs water). This is the most common pasta tracking error:</p>
      <ul>
        <li><strong>100g dry pasta:</strong> 350 cal | 12g protein | 71g carbs</li>
        <li><strong>100g cooked pasta:</strong> 131 cal | 5g protein | 25g carbs</li>
      </ul>
      <p>If you log "100g pasta" from the box but weigh it cooked, you're overcounting by <strong>2.7×</strong>. Always specify dry or cooked. Or snap a photo of your plate with <Link to="/">ProteinLens</Link>.</p>

      <h2>Real-World Portions</h2>
      <ul>
        <li><strong>Italian portion (80g dry):</strong> ~160g cooked | 280 cal — what Italians actually eat</li>
        <li><strong>Diet portion (60g dry):</strong> ~120g cooked | 210 cal — sensible for fat loss</li>
        <li><strong>Standard US/UK (100g dry):</strong> ~200g cooked | 350 cal</li>
        <li><strong>Restaurant portion:</strong> 150-200g dry → 300-400g cooked → 520-700 cal <em>before sauce</em></li>
      </ul>

      <h2>Sauce Changes Everything</h2>
      <ul>
        <li><strong>Marinara (tomato):</strong> +50-80 cal per serving — lowest calorie</li>
        <li><strong>Bolognese (meat):</strong> +150-250 cal — adds protein (+15-20g)</li>
        <li><strong>Pesto:</strong> +200-300 cal — mostly fat (olive oil, pine nuts, cheese)</li>
        <li><strong>Alfredo (cream):</strong> +300-500 cal — the calorie bomb</li>
        <li><strong>Carbonara:</strong> +350-450 cal — egg + cheese + pancetta</li>
      </ul>
      <p>A "simple bowl of pasta" can range from 350 cal (marinara, small portion) to 1,200 cal (alfredo, restaurant-sized). That's why tracking matters.</p>

      <h2>High-Protein Pasta Options</h2>
      <p>Traditional pasta has only 5g protein per 100g cooked. Protein pasta alternatives:</p>
      <ul>
        <li><strong>Chickpea pasta:</strong> 11g protein / 100g — 2× the protein, tastes closest to regular</li>
        <li><strong>Lentil pasta:</strong> 12g protein / 100g — highest protein, slightly different texture</li>
        <li><strong>Edamame pasta:</strong> 13g protein / 100g — very high protein but soy flavor</li>
        <li><strong>Protein-fortified pasta:</strong> 10-15g / 100g — varies wildly by brand</li>
      </ul>
      <p>Or just pair regular pasta with a protein source: 80g pasta + 150g chicken breast = 50g protein, 530 cal. Check our <Link to="/blog/high-protein-meal-prep">meal prep guide</Link> for batch-cooking ideas.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/calories-in-rice">Calories & Macros in Rice</Link></li>
        <li><Link to="/blog/how-to-read-nutrition-labels">How to Read Nutrition Labels</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/how-to-count-macros-beginners">Beginner Macro Counting Guide</Link></li>
        <li><Link to="/macro-calculator">Free Macro Calculator</Link></li>
      </ul>
    </>
  );
}
