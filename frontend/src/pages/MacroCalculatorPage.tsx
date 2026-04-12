/**
 * Macro Calculator Page — SEO-optimized landing page
 * 
 * Targets: "macro calculator", "macronutrient calculator", "calculate macros",
 * "macro split calculator", "carb fat protein calculator", "IIFYM calculator"
 * 
 * Structure: Interactive calculator → educational content → expandable FAQs → cross-links
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateFAQSchema, generateWebApplicationSchema } from '@/components/seo/SEOHead';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { Calculator, ChevronRight, Camera, Activity, Flame, Scale, Dumbbell, TrendingDown, Heart, Zap } from 'lucide-react';

type Goal = 'lose' | 'maintain' | 'gain';
type Split = 'balanced' | 'lowCarb' | 'highProtein' | 'keto';

const goalLabels: Record<Goal, string> = { lose: 'Lose Weight', maintain: 'Maintain', gain: 'Build Muscle' };
const splitLabels: Record<Split, string> = { balanced: 'Balanced', lowCarb: 'Low Carb', highProtein: 'High Protein', keto: 'Keto' };

const splits: Record<Split, { protein: number; carbs: number; fat: number; desc: string }> = {
  balanced: { protein: 30, carbs: 40, fat: 30, desc: 'The most versatile and sustainable split for general fitness and health' },
  lowCarb: { protein: 35, carbs: 25, fat: 40, desc: 'Good for insulin sensitivity, fat loss, and reducing water retention' },
  highProtein: { protein: 40, carbs: 30, fat: 30, desc: 'Ideal for muscle building, high satiety, and preserving lean mass during a cut' },
  keto: { protein: 25, carbs: 5, fat: 70, desc: 'Very low carb, high fat — induces ketosis for fat adaptation' },
};

/** Macro split comparison table */
const splitCompare = [
  { diet: 'Balanced / IIFYM', protein: '30%', carbs: '40%', fat: '30%', bestFor: 'General fitness, sustainability' },
  { diet: 'Low Carb', protein: '35%', carbs: '25%', fat: '40%', bestFor: 'Fat loss, insulin sensitivity' },
  { diet: 'High Protein', protein: '40%', carbs: '30%', fat: '30%', bestFor: 'Muscle gain, satiety' },
  { diet: 'Keto', protein: '25%', carbs: '5%', fat: '70%', bestFor: 'Fat adaptation, epilepsy' },
  { diet: 'Zone Diet', protein: '30%', carbs: '40%', fat: '30%', bestFor: 'Hormonal balance, inflammation' },
  { diet: 'Mediterranean', protein: '20%', carbs: '45%', fat: '35%', bestFor: 'Heart health, longevity' },
];

const faqs = [
  {
    q: 'What is the best macro split for weight loss?',
    a: 'A high-protein split (40% protein, 30% carbs, 30% fat) is often best for weight loss. Higher protein increases satiety, preserves muscle mass in a deficit, and has the highest thermic effect. However, the best split is one you can stick to consistently.',
  },
  {
    q: 'How do I calculate my macros from scratch?',
    a: "Step 1: Calculate your TDEE (total daily energy expenditure). Step 2: Choose your goal — subtract 300-500 cal for fat loss, add 200-300 for muscle gain. Step 3: Split those calories into protein (4 cal/g), carbs (4 cal/g), and fat (9 cal/g) based on your preferred ratio.",
  },
  {
    q: 'Should I track macros or just calories?',
    a: "Tracking macros gives you more control than calories alone. Two 2,000-calorie diets can produce very different results depending on the macro split. Adequate protein prevents muscle loss, while the carb/fat ratio affects energy, hormones, and performance.",
  },
  {
    q: 'What does IIFYM mean?',
    a: "IIFYM stands for 'If It Fits Your Macros' — a flexible dieting approach where you can eat any food as long as it fits within your daily macro targets. It's effective for adherence but doesn't mean you should eat only junk food. Aim for 80% whole foods, 20% flexible choices.",
  },
  {
    q: 'How much protein, carbs, and fat do I need per day?',
    a: "A common guideline: Protein 1.6–2.2g per kg bodyweight, Fat minimum 0.5g per kg (for hormone health), Carbs fill the remaining calories. For a 75kg person at 2,400 cal: ~150g protein, ~67g fat, ~270g carbs is a solid starting point.",
  },
  {
    q: 'Is keto better than a balanced diet for weight loss?',
    a: "Research shows no significant difference in fat loss between keto and other diets when calories and protein are equated. Keto can reduce appetite and water weight initially, but long-term adherence is often lower. Choose the approach you can sustain.",
  },
  {
    q: 'How do I know if my macro split is working?',
    a: "Track your weight weekly (same time, same conditions), take progress photos monthly, and monitor your energy levels and gym performance. If weight is moving in the right direction and you feel good, your split is working. Adjust after 3–4 weeks if needed.",
  },
  {
    q: 'Can I build muscle and lose fat at the same time?',
    a: "Yes — body recomposition is possible, especially for beginners, overweight individuals, or those returning after a break. Eat at maintenance calories or a slight deficit, keep protein high (2.0g/kg+), and do resistance training 3–5 days per week.",
  },
];

export default function MacroCalculatorPage() {
  const [calories, setCalories] = useState(2000);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [split, setSplit] = useState<Split>('balanced');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const adjustedCalories = useMemo(() => {
    switch (goal) {
      case 'lose': return Math.round(calories * 0.8);
      case 'gain': return Math.round(calories * 1.1);
      default: return calories;
    }
  }, [calories, goal]);

  const macros = useMemo(() => {
    const { protein, carbs, fat } = splits[split];
    return {
      protein: Math.round((adjustedCalories * (protein / 100)) / 4),
      carbs: Math.round((adjustedCalories * (carbs / 100)) / 4),
      fat: Math.round((adjustedCalories * (fat / 100)) / 9),
      percentages: { protein, carbs, fat },
    };
  }, [adjustedCalories, split]);

  return (
    <>
      <SEOHead
        title="Macro Calculator - Calculate Your Macros"
        description="Free macro calculator to find your ideal protein, carbs, and fat split. Compare 6 popular macro splits for weight loss, muscle gain, or maintenance with 8 FAQs."
        canonical="https://www.proteinlens.com/macro-calculator"
        keywords="macro calculator, macronutrient calculator, calculate macros, macro split calculator, IIFYM calculator, carb fat protein calculator, keto macros, flexible dieting"
      />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* ── Hero ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Macro Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Calculate your ideal protein, carbs, and fat based on your goals and preferences
            </p>
          </motion.div>

          {/* ── Calculator Card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8">
            {/* Daily Calories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Daily Calories (TDEE)</label>
              <input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary" min={1000} max={6000} />
              <p className="text-xs text-muted-foreground mt-1">Don't know your TDEE? <Link to="/tdee-calculator" className="text-primary hover:underline">Calculate it here</Link></p>
            </div>

            {/* Goal */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(goalLabels) as Goal[]).map((g) => (
                  <button key={g} onClick={() => setGoal(g)} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${goal === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                    {g === 'lose' && <TrendingDown className="w-4 h-4" />}
                    {g === 'maintain' && <Scale className="w-4 h-4" />}
                    {g === 'gain' && <Dumbbell className="w-4 h-4" />}
                    {goalLabels[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Split */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Macro Split</label>
              <div className="space-y-2">
                {(Object.keys(splitLabels) as Split[]).map((s) => (
                  <button key={s} onClick={() => setSplit(s)} className={`w-full px-4 py-3 rounded-xl text-left transition-all ${split === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{splitLabels[s]}</span>
                      <span className="text-xs opacity-80">{splits[s].protein}P / {splits[s].carbs}C / {splits[s].fat}F</span>
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{splits[s].desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-muted/50 rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Adjusted Daily Calories</p>
                <p className="text-3xl font-bold text-primary">{adjustedCalories} cal</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-card rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{macros.protein}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xs text-primary">{macros.percentages.protein}% • {macros.protein * 4} cal</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{macros.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xs text-primary">{macros.percentages.carbs}% • {macros.carbs * 4} cal</p>
                </div>
                <div className="bg-card rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{macros.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-xs text-primary">{macros.percentages.fat}% • {macros.fat * 9} cal</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Educational Content ── */}
          <section className="space-y-8 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" /> What Are Macros and Why Do They Matter?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Macronutrients</strong> — protein, carbohydrates, and fat — are the three types of nutrients that provide energy (calories). While total calories determine whether you gain or lose weight, your <strong>macro split determines the quality of that change</strong>: how much is muscle vs. fat, your energy levels, and your hormonal health.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><Dumbbell className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong>Protein (4 cal/g):</strong> Builds and repairs muscle, highest satiety, highest thermic effect (20–30% of calories burned during digestion)</span></li>
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong>Carbohydrates (4 cal/g):</strong> Primary energy source for high-intensity exercise and brain function</span></li>
                <li className="flex items-start gap-2"><Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong>Fat (9 cal/g):</strong> Essential for hormones (testosterone, estrogen), vitamin absorption, and cell membranes. Minimum 0.5g/kg/day</span></li>
              </ul>
            </div>

            {/* Split comparison table */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Popular Macro Splits Compared
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold text-muted-foreground px-2 py-1">
                  <span>Diet</span><span>Protein</span><span>Carbs</span><span>Fat</span><span>Best For</span>
                </div>
                {splitCompare.map((row) => (
                  <div key={row.diet} className="grid grid-cols-5 gap-1.5 bg-card border border-border rounded-lg px-2 py-2.5 text-xs">
                    <span className="font-medium text-foreground">{row.diet}</span>
                    <span className="text-muted-foreground">{row.protein}</span>
                    <span className="text-muted-foreground">{row.carbs}</span>
                    <span className="text-muted-foreground">{row.fat}</span>
                    <span className="text-muted-foreground">{row.bestFor}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Research shows no single split is universally "best." Adherence and consistency matter more than the exact percentages.
              </p>
            </div>

            {/* High protein importance */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" /> Why Protein Is the Most Important Macro
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Regardless of which macro split you choose, <strong>protein should be your priority</strong>. Research consistently shows that higher protein diets (1.6–2.2g/kg) lead to better outcomes for both <Link to="/blog/protein-for-muscle-gain" className="text-primary hover:underline">muscle gain</Link> and <Link to="/blog/protein-for-fat-loss" className="text-primary hover:underline">fat loss</Link>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Use our <Link to="/protein-calculator" className="text-primary hover:underline">protein calculator</Link> to find your exact target, then distribute remaining calories between carbs and fat based on your preference and activity level.
              </p>
            </div>

            {/* Tracking macros */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> How to Actually Track Your Macros
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Knowing your macro targets is step one. <strong>Actually hitting them requires tracking</strong>. Most people who "eyeball" their intake are off by 30–50%.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                <strong>ProteinLens eliminates the friction</strong>: snap a photo of your meal and instantly get protein, carbs, fat, and calories. No searching databases, no scanning barcodes, no weighing every ingredient. It's the fastest way to track macros consistently. Compare with <Link to="/blog/photo-vs-manual-calorie-counting" className="text-primary hover:underline">manual tracking methods</Link>.
              </p>
            </div>
          </section>

          {/* ── FAQ (expandable) ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-4 py-3 text-left flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground text-sm">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4"><p className="text-sm text-muted-foreground">{faq.a}</p></div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Related Calculators ── */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Related Calculators</h2>
            <div className="grid grid-cols-3 gap-4">
              <Link to="/protein-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <EmojiIcon emoji="🎯" className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">Protein</p>
                <p className="text-xs text-muted-foreground">Daily target</p>
              </Link>
              <Link to="/tdee-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <Activity className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">TDEE</p>
                <p className="text-xs text-muted-foreground">Energy expenditure</p>
              </Link>
              <Link to="/calorie-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <Flame className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">Calories</p>
                <p className="text-xs text-muted-foreground">Daily needs</p>
              </Link>
            </div>
          </section>

          {/* ── Related Blog Posts ── */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Learn More</h2>
            <div className="space-y-2">
              {[
                { to: '/blog/protein-for-muscle-gain', title: 'How Much Protein Do You Need for Muscle Gain?' },
                { to: '/blog/protein-for-fat-loss', title: 'How Protein Helps You Lose Fat (Not Just Weight)' },
                { to: '/blog/high-protein-meal-prep', title: 'High-Protein Meal Prep for the Week' },
                { to: '/blog/photo-vs-manual-calorie-counting', title: 'Photo vs Manual Calorie Counting' },
                { to: '/blog/fifty-grams-protein-breakfast', title: '50g Protein Breakfast: 10 Easy Recipes' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ChevronRight className="w-4 h-4" /> {link.title}
                </Link>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Know your macros? Now track them effortlessly.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
              <Camera className="w-5 h-5" /> Try ProteinLens Free
            </Link>
          </div>

          {/* ── Methodology ── */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Methodology:</strong> Macro splits based on evidence-based nutrition guidelines from ISSN (International Society of Sports Nutrition), ACSM, and systematic reviews. Calorie-per-gram values: protein 4 kcal/g (Atwater), carbohydrates 4 kcal/g, fat 9 kcal/g. Individual needs vary — consult a registered dietitian for personalized plans. See our <Link to="/methodology" className="text-primary hover:underline">full methodology</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
