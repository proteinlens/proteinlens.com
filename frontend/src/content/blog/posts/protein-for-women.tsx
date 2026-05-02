import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinForWomen() {
  return (
    <>
      <p>Most women chronically under-eat protein. The average woman consumes about 60g per day — well below the <Link to="/blog/how-much-protein-per-kg">1.2-2.0 g/kg</Link> recommended for active women.</p>
      <p>The result? Slower metabolism, harder fat loss, less muscle tone, and constant hunger. Here's why protein is especially important for women and how much you actually need.</p>
      
      <h2>Protein Targets for Women by Goal</h2>
      <ul>
      <li><strong>General health (sedentary):</strong> 0.8-1.0 g/kg (50-65g for a 65 kg woman)</li>
      <li><strong>Active / fitness:</strong> 1.2-1.6 g/kg (78-104g for a 65 kg woman)</li>
      <li><strong>Fat loss:</strong> 1.6-2.0 g/kg (104-130g) — higher protein preserves muscle during a deficit</li>
      <li><strong>Muscle building:</strong> 1.6-2.2 g/kg (104-143g) — same research applies to women as men</li>
      <li><strong>Pregnancy:</strong> 1.1-1.5 g/kg (71-98g minimum)</li>
      <li><strong>Menopause (50+):</strong> 1.2-1.5 g/kg — critical for preventing osteoporosis and sarcopenia</li>
      </ul>
      <p>Calculate your exact target with our <Link to="/protein-calculator">protein calculator</Link>.</p>
      
      <h2>"Won't Protein Make Me Bulky?"</h2>
      <p><strong>No.</strong> This is the most persistent myth in women's fitness. Building visible muscle requires:</p>
      <ul>
      <li>Years of progressive heavy resistance training</li>
      <li>A calorie surplus</li>
      <li>Testosterone levels 10-15× higher than women naturally have</li>
      </ul>
      <p>What protein <em>actually</em> does for women: leaner body composition, stronger bones, better skin/hair/nails, more energy, and easier fat loss. The "toned" look women want IS muscle with low body fat — and that requires protein.</p>
      
      <h2>Sample Day: 120g Protein for a 65 kg Woman</h2>
      <ul>
      <li><strong>Breakfast:</strong> Greek yogurt (200g) + protein granola + berries = 25g protein | 320 cal</li>
      <li><strong>Lunch:</strong> Chicken salad with quinoa + avocado = 35g protein | 480 cal</li>
      <li><strong>Snack:</strong> Protein shake + apple = 27g protein | 220 cal</li>
      <li><strong>Dinner:</strong> Salmon (150g) + sweet potato + veggies = 38g protein | 480 cal</li>
      <li><strong>Total: ~125g protein | ~1,500 cal</strong></li>
      </ul>
      <p>Track your daily intake with <Link to="/">ProteinLens</Link> — snap photos and watch your protein add up through the day.</p>
      
      <h2>Protein & the Menstrual Cycle</h2>
      <p>Emerging research suggests protein needs may vary slightly across the cycle:</p>
      <ul>
      <li><strong>Follicular phase (days 1-14):</strong> Better carb utilization — slightly higher carb, standard protein</li>
      <li><strong>Luteal phase (days 15-28):</strong> Metabolism increases ~100-300 cal/day, protein breakdown increases — consider adding 10-20g extra protein</li>
      <li><strong>Practical advice:</strong> If you're hungrier before your period, increase protein and fiber rather than carbs/fat — more satisfying per calorie</li>
      </ul>
      
      <h2>Protein During Pregnancy</h2>
      <p>Protein needs increase during pregnancy to support fetal development:</p>
      <ul>
      <li><strong>First trimester:</strong> ~1.0 g/kg (same as pre-pregnancy)</li>
      <li><strong>Second trimester:</strong> ~1.1 g/kg (+6g/day)</li>
      <li><strong>Third trimester:</strong> ~1.3-1.5 g/kg (+25g/day)</li>
      <li><strong>Breastfeeding:</strong> +25g/day above normal needs</li>
      </ul>
      <p>Always consult your healthcare provider for personalized advice during pregnancy.</p>
      
      <h2>Menopause & Protein</h2>
      <p>After menopause, women lose muscle mass faster due to declining estrogen. Higher protein intake (1.2-1.5 g/kg) combined with resistance training is the best evidence-based strategy to prevent:</p>
      <ul>
      <li>Sarcopenia (age-related muscle loss)</li>
      <li>Osteoporosis (protein + calcium = stronger bones)</li>
      <li>Metabolic slowdown</li>
      </ul>
      <p>Read our dedicated guide: <Link to="/blog/protein-calculator-for-seniors">Protein calculator for adults 60+</Link></p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/how-much-protein-per-day">How Much Protein Per Day?</Link></li>
        <li><Link to="/blog/best-macro-split-for-weight-loss">Best Macro Split for Fat Loss</Link></li>
        <li><Link to="/blog/protein-calculator-for-seniors">Protein for Seniors (60+)</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
