import React from 'react';
import { Link } from 'react-router-dom';

export default function HowMuchProteinPerKg() {
  return (
    <>
      <p>
        The most important number in sports nutrition isn't your total daily protein — it's your <strong>protein per kilogram of body weight</strong>. This ratio personalizes your intake to your body, making it far more useful than generic "eat 100g of protein" advice.
      </p>
      <p>
        Here's the evidence-based breakdown of how much protein per kg you actually need, organized by goal.
      </p>

      <h2>The Quick Answer</h2>
      <p>
        For most active adults: <strong>1.6–2.2 grams of protein per kilogram of body weight per day</strong>. That's the range supported by the most comprehensive sports nutrition research (Schoenfeld & Aragon, 2018; ISSN Position Stand, 2017).
      </p>
      <p>
        Use our <Link to="/protein-calculator">protein calculator</Link> to get your exact target based on your weight, activity, and goals.
      </p>

      <h2>Protein Per Kg by Goal</h2>

      <h3>General Health (Sedentary Adults)</h3>
      <p>
        <strong>0.8 g/kg/day</strong> — This is the RDA (Recommended Dietary Allowance), set by WHO and national health agencies. It's the <em>minimum</em> to prevent deficiency in healthy adults, not the optimal amount for anyone who exercises or wants to maintain muscle.
      </p>
      <ul>
        <li>60 kg person → 48g protein/day</li>
        <li>75 kg person → 60g protein/day</li>
        <li>90 kg person → 72g protein/day</li>
      </ul>

      <h3>Regular Exercise / General Fitness</h3>
      <p>
        <strong>1.0–1.2 g/kg/day</strong> — If you exercise 2-3 times per week (running, cycling, gym classes), you need more protein than the RDA to support recovery and maintain lean mass. The ISSN recommends at least 1.4g/kg for exercising individuals, but even 1.0-1.2g/kg is a significant improvement over 0.8.
      </p>
      <ul>
        <li>60 kg person → 60–72g protein/day</li>
        <li>75 kg person → 75–90g protein/day</li>
        <li>90 kg person → 90–108g protein/day</li>
      </ul>

      <h3>Muscle Building / Strength Training</h3>
      <p>
        <strong>1.6–2.2 g/kg/day</strong> — The landmark meta-analysis by Schoenfeld & Aragon (2018) analyzed 49 studies and concluded that protein intakes up to 1.6g/kg maximized muscle protein synthesis in most individuals. Going up to 2.2g/kg may provide small additional benefits, especially during intense training blocks.
      </p>
      <ul>
        <li>60 kg person → 96–132g protein/day</li>
        <li>75 kg person → 120–165g protein/day</li>
        <li>90 kg person → 144–198g protein/day</li>
      </ul>
      <p>
        Read our full guide on <Link to="/blog/protein-for-muscle-gain">protein targets for muscle gain</Link>.
      </p>

      <h3>Fat Loss / Calorie Deficit</h3>
      <p>
        <strong>1.6–2.4 g/kg/day</strong> — When you're cutting calories, protein becomes <em>more</em> important, not less. Higher protein during a deficit preserves muscle mass, increases satiety, and has a higher thermic effect. Helms et al. (2014) recommend up to 2.4g/kg for natural bodybuilders in a cut.
      </p>
      <ul>
        <li>60 kg person → 96–144g protein/day</li>
        <li>75 kg person → 120–180g protein/day</li>
        <li>90 kg person → 144–216g protein/day</li>
      </ul>
      <p>
        Learn more: <Link to="/blog/protein-for-fat-loss">How protein helps you lose fat</Link>.
      </p>

      <h3>Older Adults (60+)</h3>
      <p>
        <strong>1.0–1.2 g/kg/day</strong> — Aging causes "anabolic resistance" — your muscles become less responsive to protein. The ESPEN guidelines (2019) recommend older adults eat at least 1.0g/kg, ideally 1.2g/kg, to slow muscle loss (sarcopenia). This is 25-50% more than the standard RDA.
      </p>
      <p>
        Read our dedicated guide: <Link to="/blog/protein-calculator-for-seniors">Protein calculator for adults over 60</Link>.
      </p>

      <h3>Pregnancy</h3>
      <p>
        <strong>1.1–1.5 g/kg/day</strong> — Protein needs increase during pregnancy to support fetal development, placental growth, and maternal tissue expansion. The ACOG recommends at least 71g/day, but many researchers suggest personalizing based on pre-pregnancy weight.
      </p>

      <h2>Should You Use Total Body Weight or Lean Mass?</h2>
      <p>
        Most research uses <strong>total body weight</strong> — that's what the g/kg recommendations above are based on. However, if you're significantly overweight (BMI &gt; 30), using total body weight may overestimate your needs.
      </p>
      <p>
        <strong>Practical rule:</strong> If your body fat percentage is under 25% (men) or 35% (women), use total body weight. If higher, use your goal weight or an adjusted body weight formula.
      </p>

      <h2>Can You Eat Too Much Protein?</h2>
      <p>
        For healthy adults, protein intakes up to <strong>3.5 g/kg/day</strong> have been studied without adverse effects on kidney or liver function (Antonio et al., 2016). However, above 2.2g/kg, the muscle-building benefits plateau. The main downside of excessive protein is opportunity cost — those calories could come from carbs or fats you also need for energy and hormones.
      </p>
      <p>
        <strong>If you have pre-existing kidney disease</strong>, consult your doctor before significantly increasing protein intake.
      </p>

      <h2>How to Track Your Protein Per Kg</h2>
      <ol>
        <li>Weigh yourself in the morning (kg)</li>
        <li>Multiply by your target multiplier (e.g., 1.8 for muscle building)</li>
        <li>That's your daily protein target in grams</li>
        <li>Track your meals — <Link to="/">ProteinLens</Link> makes this effortless with AI photo scanning</li>
      </ol>
      <p>
        <strong>Example:</strong> 80 kg × 1.8 g/kg = 144g protein per day, split across 4 meals = ~36g per meal.
      </p>

      <h2>Summary Table</h2>
      <ul>
        <li><strong>Sedentary:</strong> 0.8 g/kg — bare minimum</li>
        <li><strong>Recreational exercise:</strong> 1.0–1.2 g/kg</li>
        <li><strong>Endurance athlete:</strong> 1.2–1.4 g/kg</li>
        <li><strong>Muscle building:</strong> 1.6–2.2 g/kg — optimal range</li>
        <li><strong>Fat loss:</strong> 1.6–2.4 g/kg — highest needs</li>
        <li><strong>Older adults (60+):</strong> 1.0–1.2 g/kg</li>
        <li><strong>Pregnancy:</strong> 1.1–1.5 g/kg</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
        <li><Link to="/blog/how-much-protein-per-day">How Much Protein Per Day?</Link></li>
        <li><Link to="/blog/protein-for-muscle-gain">Protein Targets for Muscle Gain</Link></li>
        <li><Link to="/blog/protein-for-fat-loss">Protein for Fat Loss</Link></li>
        <li><Link to="/blog/protein-calculator-for-seniors">Protein Calculator for Seniors</Link></li>
        <li><Link to="/blog/fifty-grams-protein-breakfast">50g Protein Breakfast Ideas</Link></li>
      </ul>
    </>
  );
}
