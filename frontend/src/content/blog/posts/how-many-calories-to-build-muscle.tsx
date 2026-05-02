import React from 'react';
import { Link } from 'react-router-dom';

export default function HowManyCaloriesToBuildMuscle() {
  return (
    <>
      <p>Building muscle requires two things: progressive resistance training and eating enough food. But "enough" doesn't mean "as much as possible." <strong>A controlled surplus of 200-500 calories above your TDEE is the sweet spot for building muscle while minimizing fat gain.</strong></p>
      
      <h2>Step 1: Find Your Maintenance Calories</h2>
      <p>Use our <Link to="/tdee-calculator">TDEE calculator</Link> to find your maintenance level. This is the number of calories where your weight stays stable.</p>
      <p>For most active adults:</p>
      <ul>
      <li><strong>Sedentary (desk job, no exercise):</strong> Body weight (kg) × 26-28</li>
      <li><strong>Moderately active (3-4 workouts/week):</strong> Body weight (kg) × 31-33</li>
      <li><strong>Very active (5-6 workouts + active job):</strong> Body weight (kg) × 35-38</li>
      </ul>
      <p><strong>Example:</strong> 75 kg × 32 = 2,400 cal maintenance</p>
      
      <h2>Step 2: Add Your Surplus</h2>
      <ul>
      <li><strong>Conservative surplus (+200-300 cal):</strong> Slower muscle gain, minimal fat gain. Best for intermediate/advanced lifters or those prone to fat gain.</li>
      <li><strong>Moderate surplus (+300-500 cal):</strong> Standard recommendation. Good balance of muscle growth and manageable fat gain. Best for most people.</li>
      <li><strong>Aggressive surplus (+500-1000 cal):</strong> Faster scale weight but much of it is fat. Only useful for underweight beginners ("hardgainers").</li>
      </ul>
      <p><strong>Example:</strong> 2,400 maintenance + 350 surplus = <strong>2,750 cal bulking target</strong></p>
      
      <h2>The Natural Muscle Growth Rate</h2>
      <p>Even with perfect training and nutrition, natural muscle growth has limits (McDonald/Lyle model):</p>
      <ul>
      <li><strong>Beginner (year 1):</strong> ~1 kg muscle per month (12 kg/year)</li>
      <li><strong>Intermediate (year 2-3):</strong> ~0.5 kg per month (6 kg/year)</li>
      <li><strong>Advanced (year 4+):</strong> ~0.25 kg per month (3 kg/year)</li>
      </ul>
      <p>1 kg of muscle requires ~5,000-7,000 extra calories to build (including training energy). So a 300-500 cal daily surplus is more than enough for even beginners. Going higher just builds more fat.</p>
      
      <h2>Macro Split for Bulking</h2>
      <ul>
      <li><strong>Protein:</strong> <Link to="/blog/how-much-protein-per-kg">1.6-2.2 g/kg</Link> — 120-165g for a 75kg person</li>
      <li><strong>Fat:</strong> 0.8-1.2 g/kg — 60-90g — supports hormones</li>
      <li><strong>Carbs:</strong> Fill the rest — usually 50-60% of total calories — fuels training</li>
      </ul>
      <p>Use our <Link to="/macro-calculator">macro calculator</Link> to get your personalized split.</p>
      
      <h2>How to Track Your Bulk</h2>
      <ul>
      <li><strong>Weigh daily, track weekly averages:</strong> Daily weight fluctuates ±1-2 kg from water/food</li>
      <li><strong>Target weight gain:</strong> 0.5-1% of body weight per month (0.4-0.75 kg for a 75kg person)</li>
      <li><strong>Gaining faster?</strong> Reduce surplus by 100-200 cal — you're adding too much fat</li>
      <li><strong>Not gaining?</strong> Add 200 cal — your TDEE estimate may be low</li>
      <li><strong>Track meals:</strong> Snap photos with <Link to="/">ProteinLens</Link> to ensure you're actually eating your target</li>
      </ul>
      
      <h2>Common Bulking Mistakes</h2>
      <ul>
      <li><strong>"Dirty bulk" (eating everything):</strong> You'll gain weight, but mostly fat. A 1,000 cal surplus doesn't build muscle faster than a 400 cal surplus.</li>
      <li><strong>Not tracking protein:</strong> Surplus without adequate protein = fat gain, not muscle</li>
      <li><strong>Bulking when already high body fat:</strong> If you're above 18-20% body fat (men) or 28-30% (women), cut first. Leaner bodies partition calories better toward muscle.</li>
      <li><strong>Never adjusting:</strong> As you gain weight, your TDEE increases. Recalculate every 4-6 weeks.</li>
      </ul>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/protein-for-muscle-gain">Protein for Muscle Gain</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Cutting</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/tdee-calculator">Free TDEE Calculator</Link></li>
        <li><Link to="/calorie-calculator">Free Calorie Calculator</Link></li>
      </ul>
    </>
  );
}
