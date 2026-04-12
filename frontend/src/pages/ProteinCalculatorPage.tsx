/**
 * Protein Calculator Page — SEO-optimized landing page
 * 
 * Targets: "protein calculator", "daily protein intake calculator",
 * "how much protein do I need", "protein calculator for muscle gain",
 * "protein intake calculator", and 100+ long-tail variants.
 * 
 * Structure: Interactive calculator up top, then comprehensive
 * educational content with internal links for SEO depth.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProteinCalculator } from '@/components/protein';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { Target, Dumbbell, Scale, TrendingDown, Baby, Heart, Brain, ChevronRight, ArrowRight, Calculator, Utensils, Camera } from 'lucide-react';

/** Protein reference table data */
const proteinByGoal = [
  { goal: 'Sedentary adult (maintenance)', range: '0.8 g/kg', example: '56g for 70kg person', source: 'RDA / WHO' },
  { goal: 'Recreational exercise', range: '1.0–1.2 g/kg', example: '70–84g for 70kg', source: 'ISSN 2017' },
  { goal: 'Endurance athlete', range: '1.2–1.4 g/kg', example: '84–98g for 70kg', source: 'ACSM' },
  { goal: 'Muscle building / strength', range: '1.6–2.2 g/kg', example: '112–154g for 70kg', source: 'Schoenfeld & Aragon 2018' },
  { goal: 'Fat loss (calorie deficit)', range: '1.6–2.4 g/kg', example: '112–168g for 70kg', source: 'Helms et al. 2014' },
  { goal: 'Older adults (60+)', range: '1.0–1.2 g/kg', example: '70–84g for 70kg', source: 'ESPEN 2019' },
  { goal: 'Pregnancy', range: '1.1–1.5 g/kg', example: '77–105g for 70kg', source: 'ACOG' },
];

const highProteinFoods = [
  { food: 'Chicken breast (cooked)', serving: '100g', protein: '31g', calories: '165 kcal' },
  { food: 'Greek yogurt (non-fat)', serving: '200g', protein: '20g', calories: '120 kcal' },
  { food: 'Eggs (whole)', serving: '2 large', protein: '12g', calories: '140 kcal' },
  { food: 'Salmon (cooked)', serving: '100g', protein: '25g', calories: '208 kcal' },
  { food: 'Lean ground beef (95%)', serving: '100g', protein: '26g', calories: '150 kcal' },
  { food: 'Cottage cheese (low-fat)', serving: '200g', protein: '24g', calories: '160 kcal' },
  { food: 'Lentils (cooked)', serving: '200g', protein: '18g', calories: '230 kcal' },
  { food: 'Tofu (firm)', serving: '150g', protein: '15g', calories: '130 kcal' },
  { food: 'Whey protein powder', serving: '1 scoop (30g)', protein: '24g', calories: '120 kcal' },
  { food: 'Tuna (canned in water)', serving: '100g', protein: '26g', calories: '116 kcal' },
];

const faqs = [
  {
    q: 'How much protein do I need per day?',
    a: 'Most adults need 0.8g of protein per kilogram of body weight as a minimum. If you exercise regularly, you need more — typically 1.2–2.2g/kg depending on your activity level and goals. Our calculator gives you a personalized target based on your weight, training level, and fitness goal.',
  },
  {
    q: 'How much protein do I need to build muscle?',
    a: 'Research consistently shows that 1.6–2.2g of protein per kg of body weight per day is optimal for muscle growth. For a 75kg person, that\'s 120–165g of protein daily. Eating above 2.2g/kg provides minimal additional benefit for most people.',
  },
  {
    q: 'How much protein for weight loss?',
    a: 'During a calorie deficit, aim for the higher end of protein intake: 1.6–2.4g/kg. Higher protein during weight loss helps preserve muscle mass, keeps you fuller for longer, and has a higher thermic effect (your body burns more calories digesting protein than carbs or fat).',
  },
  {
    q: 'Is this protein calculator accurate?',
    a: 'Our calculator uses evidence-based multipliers from peer-reviewed sports nutrition research (Schoenfeld & Aragon 2018, Helms et al. 2014, ISSN Position Stands). The results are personalized estimates — individual needs can vary based on age, body composition, health conditions, and training intensity.',
  },
  {
    q: 'Does protein timing matter?',
    a: 'Total daily protein matters most. However, distributing protein across 3–5 meals (20–40g per meal) may slightly optimize muscle protein synthesis. Post-workout protein is beneficial but not as critical as once thought — the "anabolic window" is much wider than the old 30-minute myth.',
  },
  {
    q: 'Can I eat too much protein?',
    a: 'For healthy adults, protein intakes up to 3.5g/kg have been studied without adverse effects on kidney or liver function. However, more isn\'t always better — above 2.2g/kg, the muscle-building benefits plateau. The main downside of excessive protein is opportunity cost: those calories could come from carbs or fats you also need.',
  },
  {
    q: 'How do I track my protein intake?',
    a: 'You can track protein by reading nutrition labels, using a food scale, or using an app. ProteinLens makes it easiest — just snap a photo of your meal and our AI instantly estimates the protein, carbs, fat, and calories. No manual logging or barcode scanning needed.',
  },
  {
    q: 'What\'s the difference between protein calculator and macro calculator?',
    a: 'A protein calculator focuses specifically on your daily protein target. A macro calculator gives you targets for all three macronutrients — protein, carbs, and fat — plus total calories. If you only care about protein, use this calculator. If you want a complete nutrition plan, try our macro calculator.',
  },
];

export default function ProteinCalculatorPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero + Calculator ── */}
      <section className="bg-gradient-to-b from-primary-50 to-background">
        <div className="max-w-lg mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Protein Calculator
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Calculate exactly how much protein you need per day based on your body weight, training level, and fitness goals. Backed by sports nutrition research.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-lg"
          >
            <ProteinCalculator />
          </motion.div>
        </div>
      </section>

      {/* ── Educational Content ── */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">

        {/* How much protein do you need */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            How Much Protein Do You Really Need?
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            The answer depends on who you are and what you're trying to achieve. The government-recommended <strong>RDA of 0.8g per kilogram</strong> of body weight is the <em>minimum</em> to avoid deficiency — not the optimal amount for anyone who exercises, wants to build muscle, or is trying to lose weight.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-6">
            Modern sports nutrition research has consistently shown that <strong>active people need significantly more protein</strong> than the RDA suggests. Here's what the science says for different goals:
          </p>

          {/* Protein reference table - rendered as cards for mobile */}
          <div className="space-y-3">
            {proteinByGoal.map((row) => (
              <div key={row.goal} className="bg-muted/50 rounded-xl p-4 border border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{row.goal}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">{row.range}</p>
                    <p className="text-xs text-muted-foreground">{row.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Protein for muscle gain */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            Protein for Muscle Building
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            If your goal is to build muscle, protein is the most important macronutrient to get right. The landmark meta-analysis by <strong>Schoenfeld & Aragon (2018)</strong> found that protein intakes of <strong>1.6–2.2g per kg of body weight</strong> maximized muscle protein synthesis in resistance-trained individuals.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-4">
            Here's the practical breakdown:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              { label: '60 kg / 132 lbs', value: '96–132g protein per day' },
              { label: '70 kg / 154 lbs', value: '112–154g protein per day' },
              { label: '80 kg / 176 lbs', value: '128–176g protein per day' },
              { label: '90 kg / 198 lbs', value: '144–198g protein per day' },
              { label: '100 kg / 220 lbs', value: '160–220g protein per day' },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3 bg-primary/5 rounded-lg px-4 py-2.5">
                <span className="text-sm text-muted-foreground w-32 shrink-0">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </li>
            ))}
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            Spreading your protein across <strong>3–5 meals per day</strong> (20–40g per meal) may further optimize muscle protein synthesis. Our calculator splits your target across your preferred number of meals. For more detail, read our guide on <Link to="/blog/protein-for-muscle-gain" className="text-primary hover:underline">protein targets for muscle gain by bodyweight</Link>.
          </p>
        </section>

        {/* Protein for weight loss */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" />
            Protein for Weight Loss & Fat Loss
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            When you're in a calorie deficit, protein becomes even <em>more</em> important. Research by <strong>Helms et al. (2014)</strong> recommends <strong>1.6–2.4g/kg</strong> during a cut to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground/90 mb-4 ml-2">
            <li><strong>Preserve muscle mass</strong> — without enough protein, you lose muscle along with fat</li>
            <li><strong>Stay fuller longer</strong> — protein is the most satiating macronutrient</li>
            <li><strong>Boost metabolism</strong> — protein has a thermic effect of ~20–30% (vs 5–10% for carbs and 0–3% for fat)</li>
            <li><strong>Reduce cravings</strong> — stable blood sugar from protein-rich meals means fewer energy crashes</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            This is why many people hit a <Link to="/blog/weight-loss-plateau-reasons" className="text-primary hover:underline">weight loss plateau</Link> — they cut calories but also cut protein, losing muscle and slowing their metabolism. Learn more about <Link to="/blog/protein-for-fat-loss" className="text-primary hover:underline">how protein affects fat loss</Link>.
          </p>
        </section>

        {/* High protein foods */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            Top 10 High-Protein Foods
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-6">
            Once you know your target, the next step is hitting it. These are the most protein-dense foods per calorie:
          </p>
          <div className="space-y-2">
            {highProteinFoods.map((item, i) => (
              <div key={item.food} className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-muted/30 border border-border/30">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground text-sm">{item.food}</span>
                  <span className="text-xs text-muted-foreground ml-2">({item.serving})</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-primary text-sm">{item.protein}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{item.calories}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Need breakfast ideas? Check out our <Link to="/blog/high-protein-breakfast-ideas" className="text-primary hover:underline">high-protein breakfast guide</Link> with quick, cheap, easy-to-track options.
          </p>
        </section>

        {/* How to track protein */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            How to Track Your Protein Intake
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            Knowing your protein target is only half the battle — you need to actually track what you eat. Most people overestimate their protein intake by 20–30% when guessing.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              { method: 'Food scale + labels', pros: 'Most accurate', cons: 'Slow, tedious' },
              { method: 'Manual food diary app', pros: 'Flexible', cons: 'Easy to forget, prone to errors' },
              { method: 'AI photo scanning', pros: 'Instant, zero effort', cons: 'Slightly less precise for complex dishes' },
            ].map((m) => (
              <div key={m.method} className="bg-card border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground text-sm mb-2">{m.method}</p>
                <p className="text-xs text-green-600 mb-1">✓ {m.pros}</p>
                <p className="text-xs text-muted-foreground">✗ {m.cons}</p>
              </div>
            ))}
          </div>
          <p className="text-foreground/90 leading-relaxed">
            <strong>ProteinLens</strong> uses AI photo scanning — just <Link to="/" className="text-primary hover:underline">snap a photo of your meal</Link> and get an instant breakdown of protein, carbs, fat, and calories. No manual logging, no barcode scanning, no food diary. The fastest way to check if you're hitting your protein target.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Struggling with consistency? Read <Link to="/blog/why-you-quit-macro-tracking" className="text-primary hover:underline">why most people quit tracking</Link> and <Link to="/blog/macro-tracking-busy-people" className="text-primary hover:underline">the 80/20 approach for busy people</Link>.
          </p>
        </section>

        {/* Special populations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Protein Needs for Special Populations
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Older Adults (60+)</h3>
              <p className="text-foreground/90 leading-relaxed">
                Aging leads to <strong>anabolic resistance</strong> — your muscles become less responsive to protein. The European Society for Clinical Nutrition (ESPEN) recommends <strong>1.0–1.2g/kg</strong> for healthy older adults, and up to <strong>1.5g/kg</strong> for those who are ill or recovering. Higher protein intake combined with resistance training is the most effective strategy to prevent sarcopenia (age-related muscle loss).
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pregnancy & Breastfeeding</h3>
              <p className="text-foreground/90 leading-relaxed">
                Protein needs increase during pregnancy to support fetal growth — especially in the second and third trimesters. The ACOG recommends <strong>1.1–1.5g/kg</strong>, with higher needs during breastfeeding. Always consult your healthcare provider for personalized advice during pregnancy.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Vegetarians & Vegans</h3>
              <p className="text-foreground/90 leading-relaxed">
                Plant proteins are generally less digestible and have different amino acid profiles than animal proteins. Vegetarians and vegans may benefit from aiming <strong>10–20% higher</strong> than the standard recommendations. Combining protein sources (e.g., rice + beans, tofu + quinoa) ensures a complete amino acid profile.
              </p>
            </div>
          </div>
        </section>

        {/* The science */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            How Our Protein Calculator Works
          </h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            Our calculator uses a <strong>g/kg body weight multiplier</strong> model based on the latest sports nutrition research. Here's the methodology:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-foreground/90 mb-4 ml-2">
            <li><strong>Body weight input</strong> — enter your current weight in kg or lbs (auto-converted)</li>
            <li><strong>Training level</strong> — sedentary, light, moderate, or intense exercise. This adjusts the base multiplier</li>
            <li><strong>Fitness goal</strong> — muscle gain, fat loss, or maintenance. Each shifts the range higher or lower</li>
            <li><strong>Meal distribution</strong> — your daily target is split across your preferred number of meals, with larger portions at lunch and dinner</li>
          </ol>
          <p className="text-foreground/90 leading-relaxed">
            The multiplier ranges are drawn from position stands by the <strong>International Society of Sports Nutrition (ISSN)</strong>, the <strong>American College of Sports Medicine (ACSM)</strong>, and meta-analyses published in the <em>Journal of the International Society of Sports Nutrition</em> and the <em>British Journal of Sports Medicine</em>. For a deeper look at our AI methodology, visit our <Link to="/methodology" className="text-primary hover:underline">methodology page</Link>.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary-50 to-background border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Know your target. Now hit it.
          </h2>
          <p className="text-muted-foreground mb-5 max-w-md mx-auto">
            Use ProteinLens to track your protein intake effortlessly. Snap a photo of any meal and see how close you are to your daily goal.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Camera className="w-5 h-5" />
            Try ProteinLens Free
          </Link>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/macro-calculator" className="hover:text-primary transition-colors flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Macro Calculator
            </Link>
            <Link to="/tdee-calculator" className="hover:text-primary transition-colors flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> TDEE Calculator
            </Link>
            <Link to="/calorie-calculator" className="hover:text-primary transition-colors flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Calorie Calculator
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-card border border-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-foreground font-medium hover:bg-muted/30 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-4 text-foreground/80 leading-relaxed text-sm">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Related content links */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: '/blog/how-much-protein-per-day', label: 'How Much Protein Per Day? Calculator + Examples' },
              { to: '/blog/protein-for-muscle-gain', label: 'Protein for Muscle Gain: Targets by Bodyweight' },
              { to: '/blog/protein-for-fat-loss', label: 'Protein for Fat Loss: Does More Help?' },
              { to: '/blog/high-protein-breakfast-ideas', label: 'High-Protein Breakfast Ideas' },
              { to: '/blog/what-are-macros', label: 'What Are Macros? Protein, Carbs & Fat Explained' },
              { to: '/blog/how-to-calculate-macros-weight-loss', label: 'How to Calculate Macros for Weight Loss' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm"
              >
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
