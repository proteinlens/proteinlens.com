/**
 * TDEE Calculator Page — SEO-optimized landing page
 * 
 * Targets: "TDEE calculator", "total daily energy expenditure",
 * "how many calories do I burn", "BMR calculator", "metabolism calculator"
 * 
 * Structure: Interactive calculator → educational content → expandable FAQs → cross-links
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateFAQSchema, generateWebApplicationSchema } from '@/components/seo/SEOHead';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { Flame, Activity, Calculator, ChevronRight, Camera, Scale, Zap, Brain, Heart } from 'lucide-react';

type Gender = 'male' | 'female';
type Unit = 'metric' | 'imperial';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

const activityOptions: { key: ActivityLevel; label: string; description: string; multiplier: number; examples: string }[] = [
  { key: 'sedentary', label: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2, examples: 'Desk job, driving, TV' },
  { key: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week', multiplier: 1.375, examples: 'Walking, light yoga' },
  { key: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55, examples: 'Jogging, cycling, gym' },
  { key: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725, examples: 'CrossFit, sports, heavy lifting' },
  { key: 'veryActive', label: 'Extremely Active', description: 'Very hard exercise + physical job', multiplier: 1.9, examples: 'Athlete, construction, 2x/day training' },
];

/** TDEE breakdown table by weight and activity level */
const tdeeRefTable = [
  { weight: '55 kg', sedentary: '1,550', light: '1,770', moderate: '2,000', active: '2,230', veryActive: '2,460' },
  { weight: '65 kg', sedentary: '1,720', light: '1,970', moderate: '2,220', active: '2,470', veryActive: '2,720' },
  { weight: '75 kg', sedentary: '1,900', light: '2,170', moderate: '2,440', active: '2,720', veryActive: '3,000' },
  { weight: '85 kg', sedentary: '2,070', light: '2,370', moderate: '2,670', active: '2,970', veryActive: '3,270' },
  { weight: '95 kg', sedentary: '2,240', light: '2,560', moderate: '2,890', active: '3,210', veryActive: '3,540' },
];

/** TDEE components breakdown */
const tdeeComponents = [
  { name: 'BMR (Basal Metabolic Rate)', pct: '60–70%', desc: 'Calories burned at complete rest — breathing, circulation, cell repair' },
  { name: 'NEAT (Non-Exercise Activity)', pct: '15–30%', desc: 'Fidgeting, walking, standing, cooking — varies hugely between people' },
  { name: 'TEF (Thermic Effect of Food)', pct: '8–12%', desc: 'Energy to digest food — protein costs the most (20–30% of its calories)' },
  { name: 'EAT (Exercise Activity)', pct: '5–10%', desc: 'Planned workouts — a smaller portion than most people think' },
];

const faqs = [
  {
    q: 'What is TDEE and why does it matter?',
    a: "TDEE (Total Daily Energy Expenditure) is the total number of calories you burn per day, including your basal metabolic rate, daily activity, exercise, and digestion. It's the foundation of any diet plan — eat below TDEE to lose weight, above to gain, or at TDEE to maintain.",
  },
  {
    q: 'How do you calculate TDEE?',
    a: "TDEE is calculated by first estimating your BMR (Basal Metabolic Rate) using the Mifflin-St Jeor equation, then multiplying by an activity factor. For example: a 75kg, 175cm, 30-year-old male with moderate activity has a BMR of ~1,700 cal × 1.55 activity = ~2,635 TDEE.",
  },
  {
    q: 'How accurate are TDEE calculators?',
    a: 'TDEE calculators provide estimates within 10–20% of your actual expenditure. The biggest variable is your activity level — most people overestimate. Use the result as a starting point and adjust based on 2–4 weeks of weight tracking. If your weight stays stable, your TDEE estimate is close.',
  },
  {
    q: 'What is the difference between BMR and TDEE?',
    a: "BMR is the calories your body needs at complete rest — just to keep your organs functioning. TDEE adds everything on top: walking, exercise, digesting food, even fidgeting (NEAT). For most people, TDEE is 1.4–1.9× their BMR depending on activity level.",
  },
  {
    q: 'Why is my TDEE different from other calculators?',
    a: "Different calculators use different formulas. We use Mifflin-St Jeor, which is the most accurate for non-obese adults. Others may use Harris-Benedict (tends to overestimate) or Katch-McArdle (requires body fat %). Small formula differences can mean 100–200 calorie variations.",
  },
  {
    q: 'How does NEAT affect my TDEE?',
    a: "NEAT (Non-Exercise Activity Thermogenesis) can vary by 500–2,000 calories per day between individuals. It includes all movement that isn't planned exercise: walking, standing, fidgeting, cooking, cleaning. People who move more throughout the day burn significantly more calories regardless of exercise habits.",
  },
  {
    q: 'Should I eat below my TDEE to lose weight?',
    a: "Yes — a calorie deficit of 300–500 calories below TDEE is ideal for sustainable weight loss (~0.25–0.5 kg per week). Larger deficits are faster but risk muscle loss and metabolic adaptation. Keep protein high (1.6–2.4g/kg) during a deficit.",
  },
  {
    q: 'Does my TDEE change as I lose weight?',
    a: "Yes — TDEE decreases as you lose weight because you have less body mass to maintain. This is why weight loss plateaus occur. Recalculate your TDEE every 5–10 kg of weight loss, and consider periodic 'diet breaks' at maintenance calories to counteract metabolic adaptation.",
  },
];

export default function TDEECalculatorPage() {
  const [gender, setGender] = useState<Gender>('male');
  const [unit, setUnit] = useState<Unit>('metric');
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const weightKg = unit === 'imperial' ? weight * 0.453592 : weight;
  const heightCm = unit === 'imperial' ? height * 2.54 : height;

  const bmr = useMemo(() => {
    if (gender === 'male') return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }, [gender, weightKg, heightCm, age]);

  const tdee = useMemo(() => {
    const mult = activityOptions.find((a) => a.key === activity)?.multiplier ?? 1.55;
    return Math.round(bmr * mult);
  }, [bmr, activity]);

  const goals = useMemo(() => ({
    lose: Math.round(tdee - 500),
    maintain: tdee,
    gain: Math.round(tdee + 300),
  }), [tdee]);

  return (
    <>
      <SEOHead
        title="TDEE Calculator — Daily Energy Expenditure"
        description="Calculate your TDEE (Total Daily Energy Expenditure) to find how many calories you burn per day. Free TDEE calculator with Mifflin-St Jeor formula and 8 FAQs."
        canonical="https://www.proteinlens.com/tdee-calculator"
        keywords="TDEE calculator, total daily energy expenditure, how many calories do I burn, BMR calculator, metabolism calculator, maintenance calories calculator"
      />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* ── Hero + Calculator ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">TDEE Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Calculate how many calories you burn per day — your Total Daily Energy Expenditure
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8">
            {/* Unit Toggle */}
            <div className="flex gap-2 mb-6">
              {(['metric', 'imperial'] as Unit[]).map((u) => (
                <button key={u} onClick={() => setUnit(u)} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${unit === u ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                  {u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lb/in)'}
                </button>
              ))}
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${gender === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>{g}</button>
                ))}
              </div>
            </div>

            {/* Age, Weight, Height */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" min={15} max={100} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight ({unit === 'metric' ? 'kg' : 'lb'})</label>
                <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" min={30} max={300} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Height ({unit === 'metric' ? 'cm' : 'in'})</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" min={100} max={250} />
              </div>
            </div>

            {/* Activity Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Activity Level</label>
              <div className="space-y-2">
                {activityOptions.map((a) => (
                  <button key={a.key} onClick={() => setActivity(a.key)} className={`w-full px-4 py-3 rounded-xl text-left transition-all ${activity === a.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                    <div className="flex justify-between items-center">
                      <span><span className="font-medium">{a.label}</span> <span className="text-sm opacity-80">— {a.description}</span></span>
                      <span className="text-xs opacity-70">×{a.multiplier}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-muted/50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">BMR</p>
                  <p className="text-2xl font-bold text-foreground">{bmr}</p>
                  <p className="text-xs text-muted-foreground">cal/day at rest</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">TDEE</p>
                  <p className="text-3xl font-bold text-primary">{tdee}</p>
                  <p className="text-xs text-muted-foreground">cal/day total</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-3 text-center">Goal-Based Calories</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-card rounded-lg p-3"><p className="text-lg font-bold text-foreground">{goals.lose}</p><p className="text-xs text-muted-foreground">Lose Weight</p></div>
                  <div className="bg-card rounded-lg p-3 ring-2 ring-primary"><p className="text-lg font-bold text-primary">{goals.maintain}</p><p className="text-xs text-muted-foreground">Maintain</p></div>
                  <div className="bg-card rounded-lg p-3"><p className="text-lg font-bold text-foreground">{goals.gain}</p><p className="text-xs text-muted-foreground">Build Muscle</p></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Educational Content ── */}
          <section className="space-y-8 mb-10">
            {/* What is TDEE */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" /> What Is TDEE?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>TDEE (Total Daily Energy Expenditure)</strong> is the total number of calories your body burns in a 24-hour period. It includes everything: your <strong>basal metabolism</strong>, daily movement, planned exercise, and the energy cost of digesting food.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Understanding your TDEE is essential because it determines how much you should eat. Eat below your TDEE and you'll lose weight. Eat above and you'll gain. It's the single most important number for any nutrition plan.
              </p>
            </div>

            {/* Components of TDEE */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> The 4 Components of TDEE
              </h3>
              <div className="space-y-3">
                {tdeeComponents.map((c) => (
                  <div key={c.name} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-foreground text-sm">{c.name}</span>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c.pct}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Notice that <strong>exercise is actually the smallest component</strong>. Your BMR and NEAT (daily movement) account for 75–95% of your TDEE. This is why "you can't outrun a bad diet" — and why accurate calorie tracking with a tool like <Link to="/" className="text-primary hover:underline">ProteinLens</Link> matters more than gym time for weight management.
              </p>
            </div>

            {/* TDEE by weight table */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> TDEE by Body Weight & Activity Level
              </h3>
              <p className="text-sm text-muted-foreground mb-3">Estimated daily calories for a 30-year-old, 175cm male:</p>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1.5 text-xs font-semibold text-muted-foreground px-2 py-1">
                  <span>Weight</span><span>Sedentary</span><span>Light</span><span>Moderate</span><span>Active</span><span>V. Active</span>
                </div>
                {tdeeRefTable.map((row) => (
                  <div key={row.weight} className="grid grid-cols-6 gap-1.5 bg-card border border-border rounded-lg px-2 py-2 text-xs">
                    <span className="font-medium text-foreground">{row.weight}</span>
                    <span className="text-muted-foreground">{row.sedentary}</span>
                    <span className="text-muted-foreground">{row.light}</span>
                    <span className="text-muted-foreground">{row.moderate}</span>
                    <span className="text-muted-foreground">{row.active}</span>
                    <span className="text-muted-foreground">{row.veryActive}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Female values are typically 200–400 cal lower. These are estimates — for precise targets, use the calculator above with your exact stats.
              </p>
            </div>

            {/* Using TDEE for goals */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" /> Using TDEE to Reach Your Goals
              </h3>
              <div className="space-y-2">
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="font-medium text-foreground text-sm">Weight Loss: TDEE − 300 to 500 cal</p>
                  <p className="text-sm text-muted-foreground mt-1">Produces ~0.25–0.5 kg/week loss. Keep <Link to="/protein-calculator" className="text-primary hover:underline">protein high</Link> (1.6–2.4g/kg) to preserve muscle.</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="font-medium text-foreground text-sm">Maintenance: Eat at TDEE</p>
                  <p className="text-sm text-muted-foreground mt-1">Your body weight stays stable. Useful for body recomposition when combined with strength training.</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="font-medium text-foreground text-sm">Muscle Gain: TDEE + 200 to 300 cal</p>
                  <p className="text-sm text-muted-foreground mt-1">A lean surplus for maximum muscle with minimal fat. Use our <Link to="/macro-calculator" className="text-primary hover:underline">macro calculator</Link> to split into protein, carbs, and fat.</p>
                </div>
              </div>
            </div>

            {/* Metabolic adaptation */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> Metabolic Adaptation: Why TDEE Decreases Over Time
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                As you lose weight, your TDEE naturally decreases — you have <strong>less mass to maintain</strong>, and your body becomes more efficient. This is called <strong>metabolic adaptation</strong> and it's the primary reason for <Link to="/blog/weight-loss-plateau-reasons" className="text-primary hover:underline">weight loss plateaus</Link>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                To counteract this: <strong>recalculate TDEE every 5–10 kg</strong>, take periodic "diet breaks" at maintenance for 1–2 weeks, maintain or increase exercise, and prioritize protein and resistance training to preserve muscle mass.
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
              <Link to="/calorie-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <Flame className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">Calories</p>
                <p className="text-xs text-muted-foreground">Daily needs</p>
              </Link>
              <Link to="/macro-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <Calculator className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">Macros</p>
                <p className="text-xs text-muted-foreground">P/C/F split</p>
              </Link>
              <Link to="/protein-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <EmojiIcon emoji="🎯" className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">Protein</p>
                <p className="text-xs text-muted-foreground">Daily target</p>
              </Link>
            </div>
          </section>

          {/* ── Related Blog Posts ── */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Learn More</h2>
            <div className="space-y-2">
              {[
                { to: '/blog/weight-loss-plateau-reasons', title: 'Hit a Weight Loss Plateau? Here\'s Why' },
                { to: '/blog/protein-for-fat-loss', title: 'How Protein Helps You Lose Fat (Not Just Weight)' },
                { to: '/blog/protein-for-muscle-gain', title: 'How Much Protein for Muscle Gain?' },
                { to: '/blog/high-protein-meal-prep', title: 'High-Protein Meal Prep for the Week' },
                { to: '/blog/photo-vs-manual-calorie-counting', title: 'Photo vs Manual Calorie Counting' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ChevronRight className="w-4 h-4" /> {link.title}
                </Link>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Know your TDEE? Now track your meals with AI.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
              <Camera className="w-5 h-5" /> Try ProteinLens Free
            </Link>
          </div>

          {/* ── Methodology ── */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Methodology:</strong> BMR calculated using the Mifflin-St Jeor equation (Mifflin et al., 1990). Activity multipliers based on the Harris-Benedict activity scale. NEAT estimates from Levine et al. (2006). Results are personalized estimates — individual variation depends on body composition, genetics, and adaptive thermogenesis. See our <Link to="/methodology" className="text-primary hover:underline">full methodology</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
