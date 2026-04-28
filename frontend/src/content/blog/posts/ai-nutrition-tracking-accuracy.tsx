import React from 'react';
import { Link } from 'react-router-dom';

export default function AiNutritionTrackingAccuracy() {
  return (
    <>
      <p>
        "How accurate is AI nutrition tracking, really?" It's the first question everyone asks — and the answer is more nuanced than a single number. <strong>AI food recognition accuracy depends on what you're scanning, how you scan it, and what metric you care about.</strong>
      </p>
      <p>
        Here's an honest breakdown of where AI tracking excels, where it struggles, and how to get the best results.
      </p>

      <h2>What "Accuracy" Actually Means</h2>
      <p>
        When people ask about accuracy, they usually mean one of three things:
      </p>
      <ul>
        <li><strong>Food identification accuracy:</strong> Does the AI correctly recognize what you're eating? (e.g., chicken breast vs. pork loin)</li>
        <li><strong>Portion estimation accuracy:</strong> Does it estimate the right amount? (e.g., 150g vs. 200g)</li>
        <li><strong>Macro/calorie accuracy:</strong> Are the final numbers close to reality?</li>
      </ul>
      <p>
        Each has different error margins, and the combined effect determines your overall tracking accuracy.
      </p>

      <h2>Food Identification: 85-95% Accurate</h2>
      <p>
        Modern AI vision models are remarkably good at identifying foods. In research studies, top models achieve 85-95% accuracy on standard food recognition benchmarks (Food-101, ISIA Food-500). <Link to="/">ProteinLens</Link> uses state-of-the-art multimodal AI that can identify hundreds of foods, including mixed dishes.
      </p>
      <h3>Where AI Excels</h3>
      <ul>
        <li>Distinct, visually clear foods (grilled chicken, rice, broccoli, eggs)</li>
        <li>Common Western and Asian dishes</li>
        <li>Plated meals with separated components</li>
        <li>Foods with recognizable textures and colors</li>
      </ul>
      <h3>Where AI Struggles</h3>
      <ul>
        <li>Visually similar foods (chicken vs. turkey, cod vs. tilapia)</li>
        <li>Heavily mixed dishes (casseroles, stews with hidden ingredients)</li>
        <li>Foods covered in sauce or breading</li>
        <li>Regional or unusual dishes the model hasn't seen often</li>
      </ul>

      <h2>Portion Estimation: ±15-25% Typical</h2>
      <p>
        This is the harder problem. Estimating volume and weight from a 2D photo is fundamentally challenging — even for humans. Studies show that trained dietitians estimating portions visually are off by 10-20% on average.
      </p>
      <p>
        AI portion estimation typically falls within ±15-25% of actual weight. The error is comparable to human visual estimation and significantly better than most people's untrained guesses (which can be off by 40-60%).
      </p>
      <h3>Tips for Better Portion Estimates</h3>
      <ul>
        <li><strong>Include a reference object:</strong> A fork, plate, or your hand gives the AI scale</li>
        <li><strong>Photograph from above:</strong> Top-down shots show the full plate surface area</li>
        <li><strong>Good lighting:</strong> Shadows can obscure food edges and volume. Read our <Link to="/blog/best-lighting-angles-food-photo-macros">lighting guide</Link></li>
        <li><strong>Separate foods when possible:</strong> Don't pile everything into a single mound</li>
      </ul>

      <h2>Overall Macro Accuracy: ±15-30%</h2>
      <p>
        Combining identification and portion errors, overall calorie and macro estimates are typically within ±15-30% of lab-measured values. That sounds imperfect — but context matters:
      </p>
      <ul>
        <li><strong>Manual logging without a scale:</strong> ±20-50% (most people significantly underestimate)</li>
        <li><strong>Manual logging with a scale:</strong> ±5-10% (gold standard but time-consuming)</li>
        <li><strong>AI photo tracking:</strong> ±15-30% (faster than manual, more consistent than eyeballing)</li>
        <li><strong>No tracking at all:</strong> people consume 20-40% more than they think (Lichtman et al., 1992)</li>
      </ul>
      <p>
        The real comparison isn't "AI vs. perfect tracking" — it's "AI vs. what you'd actually do without it." For most people, <Link to="/blog/photo-vs-manual-calorie-counting">photo tracking beats manual logging</Link> because the consistency gain outweighs the precision gap.
      </p>

      <h2>How AI Accuracy Improves Over Time</h2>
      <p>
        Unlike manual logging, AI models get better with every update:
      </p>
      <ul>
        <li><strong>Model updates:</strong> As multimodal AI improves (GPT-4o, Claude, Gemini), food recognition gets more accurate</li>
        <li><strong>User feedback:</strong> When you adjust a meal's macros, that signal helps improve future estimates</li>
        <li><strong>Better cameras:</strong> Higher resolution phone cameras provide more visual detail</li>
        <li><strong>Depth sensing:</strong> Future phones with LiDAR/ToF sensors will enable 3D volume estimation</li>
      </ul>

      <h2>Is AI Tracking Accurate Enough?</h2>
      <p>
        For the vast majority of people — <strong>yes</strong>. If your goal is weight loss, muscle gain, or general health improvement, you don't need lab-grade precision. You need <em>consistent directional awareness</em> of what you're eating.
      </p>
      <p>
        Think of it like a speedometer: whether it reads 61 or 63 km/h doesn't matter if you're trying to stay under 80. What matters is that you have a gauge at all.
      </p>
      <p>
        <strong>When AI tracking may not be enough:</strong> Competition bodybuilding prep, clinical nutrition research, or medical dietary management. In those cases, weigh everything with a food scale.
      </p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/how-to-track-macros-from-photo">Track Macros from a Photo: Accuracy Guide</Link></li>
        <li><Link to="/blog/common-ai-food-scan-mistakes">Common AI Food Scan Mistakes to Avoid</Link></li>
        <li><Link to="/blog/photo-vs-manual-calorie-counting">Photo vs Manual Calorie Counting</Link></li>
        <li><Link to="/blog/best-lighting-angles-food-photo-macros">Best Lighting & Angles for Food Photos</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
