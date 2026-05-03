import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinForRunners() {
  return (
    <>
      <p>Runners chronically under-eat protein. The "carb-loading" mentality pushes protein to the side — but research shows <strong>adequate protein reduces injury risk, speeds recovery, and improves performance</strong> for endurance athletes.</p>

      <h2>Protein Needs for Runners</h2>
      <ul>
        <li><strong>Recreational runners (3-4 runs/week):</strong> 1.2-1.4 g/kg — higher than sedentary, lower than bodybuilders</li>
        <li><strong>Competitive / high-mileage (60+ km/week):</strong> 1.4-1.7 g/kg — increased muscle repair demands</li>
        <li><strong>Marathon/ultra training:</strong> 1.6-1.8 g/kg — peak demands during heavy training blocks</li>
        <li><strong>During calorie deficit (cutting weight):</strong> 1.8-2.2 g/kg — preserve lean mass at all costs</li>
      </ul>
      <p><strong>Example:</strong> 70 kg runner training for a marathon: 1.6 × 70 = <strong>112g protein/day</strong>. Calculate your exact needs with our <Link to="/protein-calculator">protein calculator</Link>.</p>

      <h2>Why Runners Need More Protein Than They Think</h2>
      <ul>
        <li><strong>Muscle repair:</strong> Running causes more micro-damage than most people realize — especially downhill running and long runs</li>
        <li><strong>Injury prevention:</strong> Higher protein intake strengthens connective tissue, reducing stress fracture and tendon injury risk (Sale & Elliott-Sale, 2019)</li>
        <li><strong>Immune function:</strong> Hard training suppresses immunity. Protein supports immune cell production.</li>
        <li><strong>Body composition:</strong> Runners who prioritize protein maintain more lean mass at the same body weight = better power-to-weight ratio</li>
        <li><strong>Oxidation during long runs:</strong> During runs over 90 minutes, your body uses amino acids for 3-6% of fuel — this needs replacement</li>
      </ul>

      <h2>Carbs vs. Protein: Finding the Balance</h2>
      <p>Runners DO need more carbs than strength athletes. But it's not either/or:</p>
      <ul>
        <li><strong>Carbs:</strong> 5-8 g/kg for moderate training, 8-12 g/kg for heavy/race week</li>
        <li><strong>Protein:</strong> 1.4-1.7 g/kg — non-negotiable</li>
        <li><strong>Fat:</strong> 1.0 g/kg minimum — supports hormones and joint health</li>
      </ul>
      <p>For a 70 kg runner eating 2,800 cal/day: 420g carbs (60%) + 112g protein (16%) + 75g fat (24%). Use our <Link to="/macro-calculator">macro calculator</Link> for your personalized split.</p>

      <h2>Protein Timing for Runners</h2>
      <ul>
        <li><strong>Pre-run (2-3 hours):</strong> Include 15-20g protein with your carb-heavy meal — slows digestion, provides amino acids</li>
        <li><strong>During runs &lt;90 min:</strong> No protein needed — just water or electrolytes</li>
        <li><strong>Post-run (within 60 min):</strong> 20-30g protein + carbs. The classic: chocolate milk (24g carbs, 8g protein per 240ml) or protein shake + banana</li>
        <li><strong>Before bed:</strong> 20-30g slow-digesting protein (cottage cheese, casein shake) — overnight recovery</li>
      </ul>

      <h2>Best Protein Sources for Runners</h2>
      <ul>
        <li><strong>Chicken breast:</strong> Lean, versatile, pairs with any carb source</li>
        <li><strong>Greek yogurt:</strong> Post-run with granola + fruit = protein + carbs + probiotics</li>
        <li><strong>Eggs:</strong> Cheap, quick, nutrient-dense — hard-boiled for on-the-go</li>
        <li><strong>Salmon:</strong> Protein + omega-3s (anti-inflammatory = faster recovery)</li>
        <li><strong>Whey protein:</strong> Post-run convenience — fastest absorption</li>
        <li><strong>Beans + rice:</strong> Complete plant protein with carbs built in</li>
      </ul>
      <p>Track your runner nutrition with <Link to="/">ProteinLens</Link> to make sure you're fueling recovery properly.</p>

      <h2>Common Runner Nutrition Mistakes</h2>
      <ul>
        <li><strong>All carbs, no protein:</strong> The pasta-only mentality leaves muscles under-recovered</li>
        <li><strong>Skipping post-run nutrition:</strong> The 60-minute window matters for glycogen and muscle repair</li>
        <li><strong>Under-eating during high mileage:</strong> REDs (Relative Energy Deficiency in Sport) causes hormonal disruption, bone loss, and impaired performance</li>
        <li><strong>Ignoring protein on rest days:</strong> Recovery happens on rest days — protein is equally important</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/pre-workout-nutrition">Pre-Workout Nutrition Guide</Link></li>
        <li><Link to="/blog/protein-timing-does-it-matter">Protein Timing Guide</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/intermittent-fasting-macros">IF & Macros Guide</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
      </ul>
    </>
  );
}
