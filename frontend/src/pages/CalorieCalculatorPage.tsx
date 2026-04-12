/**
 * Calorie Calculator Page — SEO-optimized landing page
 * 
 * Targets: "calorie calculator", "daily calorie needs", "how many calories should I eat",
 * "calorie deficit calculator", "calorie calculator for weight loss", "maintenance calories"
 * 
 * Structure: Interactive calculator up top, then educational content with
 * research-backed tables, FAQs, and internal cross-links.
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead, generateWebApplicationSchema } from '@/components/seo/SEOHead';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { Scale, TrendingDown, TrendingUp, Minus, Flame, Calculator, Camera, ChevronRight, Activity } from 'lucide-react';

type Goal = 'lose' | 'maintain' | 'gain';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

const activityOptions: { key: ActivityLevel; label: string; desc: string; multiplier: number }[] = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Desk job, no exercise', multiplier: 1.2 },
  { key: 'light', label: 'Lightly Active', desc: '1-2 workouts/week', multiplier: 1.375 },
  { key: 'moderate', label: 'Moderately Active', desc: '3-5 workouts/week', multiplier: 1.55 },
  { key: 'active', label: 'Very Active', desc: '6-7 workouts/week', multiplier: 1.725 },
  { key: 'veryActive', label: 'Extremely Active', desc: 'Athlete or physical job', multiplier: 1.9 },
];

/** Calorie needs by goal & bodyweight (for reference table) */
const calorieRefTable = [
  { weight: '55 kg / 121 lbs', lose: '1,400–1,600', maintain: '1,800–2,100', gain: '2,100–2,400' },
  { weight: '65 kg / 143 lbs', lose: '1,600–1,800', maintain: '2,000–2,400', gain: '2,300–2,700' },
  { weight: '75 kg / 165 lbs', lose: '1,800–2,000', maintain: '2,200–2,600', gain: '2,500–2,900' },
  { weight: '85 kg / 187 lbs', lose: '2,000–2,200', maintain: '2,400–2,800', gain: '2,700–3,100' },
  { weight: '95 kg / 209 lbs', lose: '2,100–2,400', maintain: '2,600–3,000', gain: '2,900–3,300' },
  { weight: '105 kg / 231 lbs', lose: '2,300–2,600', maintain: '2,800–3,200', gain: '3,100–3,500' },
];

const faqs = [
  {
    q: 'How many calories should I eat to lose weight?',
    a: 'To lose weight at a safe, sustainable rate (~0.5 kg per week), eat about 500 calories below your TDEE (Total Daily Energy Expenditure). For most adults, this means 1,500–2,000 calories per day. Never go below 1,200 calories without medical supervision.',
  },
  {
    q: 'What formula does this calorie calculator use?',
    a: 'We use the Mifflin-St Jeor equation, which research shows is the most accurate formula for estimating BMR (Basal Metabolic Rate). Your BMR is multiplied by an activity factor to estimate total daily calories burned.',
  },
  {
    q: 'What is a calorie deficit and how big should it be?',
    a: 'A calorie deficit means eating fewer calories than you burn. A 300–500 calorie deficit per day is recommended for steady weight loss. Larger deficits (750+) can lead to muscle loss, fatigue, and metabolic adaptation.',
  },
  {
    q: 'How accurate are calorie calculators?',
    a: 'Calorie calculators provide estimates with about 10–20% accuracy. Individual factors like genetics, muscle mass, hormones, and NEAT (Non-Exercise Activity Thermogenesis) affect actual needs. Use the result as a starting point and adjust based on 2–4 weeks of tracking your weight.',
  },
  {
    q: 'How many calories do I need to build muscle?',
    a: 'To build muscle, eat 200–300 calories above your TDEE (a lean bulk). Combined with resistance training and adequate protein (1.6–2.2g/kg), this supports muscle growth while minimizing fat gain. A larger surplus builds muscle faster but adds more fat.',
  },
  {
    q: 'What is the difference between BMR and TDEE?',
    a: 'BMR (Basal Metabolic Rate) is the calories your body burns at complete rest — just to keep you alive. TDEE (Total Daily Energy Expenditure) includes BMR plus calories burned through exercise, daily movement, and digesting food. TDEE is always higher than BMR.',
  },
  {
    q: 'Should I eat back exercise calories?',
    a: 'It depends. If your TDEE already accounts for your exercise (via the activity multiplier), don\'t eat back additional calories — that would be double-counting. If you\'re using BMR only and tracking exercise separately, eat back about 50–75% of estimated exercise calories (trackers tend to overestimate).',
  },
  {
    q: 'Why am I not losing weight even in a calorie deficit?',
    a: 'Common reasons: underestimating portion sizes (most people undercount by 20–50%), metabolic adaptation from prolonged dieting, water retention masking fat loss, or your activity level is lower than selected. Try tracking food more precisely with a tool like ProteinLens for 2 weeks.',
  },
];

export default function CalorieCalculatorPage() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const bmr = useMemo(() => {
    if (gender === 'male') return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }, [weight, height, age, gender]);

  const maintenance = useMemo(() => {
    const mult = activityOptions.find((a) => a.key === activity)?.multiplier ?? 1.55;
    return Math.round(bmr * mult);
  }, [bmr, activity]);

  const calories = useMemo(() => {
    switch (goal) {
      case 'lose': return Math.round(maintenance - 500);
      case 'gain': return Math.round(maintenance + 300);
      default: return maintenance;
    }
  }, [maintenance, goal]);

  return (
    <>
      <SEOHead
        title="Calorie Calculator - Daily Calorie Needs"
        description="Calculate how many calories you need per day for weight loss, maintenance, or muscle gain. Free calorie calculator using the Mifflin-St Jeor equation with 8 FAQs."
        canonical="https://www.proteinlens.com/calorie-calculator"
        keywords="calorie calculator, daily calorie needs, how many calories should I eat, calorie deficit calculator, calories for weight loss, maintenance calories, TDEE, calorie calculator for muscle gain"
        structuredData={generateWebApplicationSchema()}
      />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* ── Hero + Calculator ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Calorie Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Find your daily calorie target for weight loss, maintenance, or muscle gain
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8">
            {/* Gender */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 px-4 py-2 rounded-xl capitalize ${gender === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>{g}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary" min={15} max={100} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary" min={30} max={250} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary" min={100} max={250} />
              </div>
            </div>

            {/* Activity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Activity Level</label>
              <div className="space-y-2">
                {activityOptions.map((a) => (
                  <button key={a.key} onClick={() => setActivity(a.key)} className={`w-full px-4 py-3 rounded-xl text-left transition-all ${activity === a.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                    <span className="font-medium">{a.label}</span>
                    <span className="text-sm opacity-80 ml-2">({a.desc})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setGoal('lose')} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm ${goal === 'lose' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}><TrendingDown className="w-4 h-4" /> Lose Weight</button>
                <button onClick={() => setGoal('maintain')} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm ${goal === 'maintain' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}><Minus className="w-4 h-4" /> Maintain</button>
                <button onClick={() => setGoal('gain')} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm ${goal === 'gain' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}><TrendingUp className="w-4 h-4" /> Build Muscle</button>
              </div>
            </div>

            {/* Result */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Daily Calorie Target</p>
              <p className="text-5xl font-bold text-primary">{calories}</p>
              <p className="text-sm text-muted-foreground mt-1">calories per day</p>
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-center">
                <div><p className="text-xs text-muted-foreground">BMR</p><p className="text-lg font-bold text-foreground">{bmr} cal</p></div>
                <div><p className="text-xs text-muted-foreground">Maintenance (TDEE)</p><p className="text-lg font-bold text-foreground">{maintenance} cal</p></div>
              </div>
            </div>
          </motion.div>

          {/* ── Educational Content ── */}
          <section className="space-y-8 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" /> How Many Calories Do You Need?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your daily calorie needs depend on your <strong>body size, age, gender, and activity level</strong>. The Mifflin-St Jeor equation calculates your <strong>Basal Metabolic Rate (BMR)</strong> — the calories you burn just being alive — then multiplies it by an activity factor to estimate your <strong>Total Daily Energy Expenditure (TDEE)</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                From there, you adjust based on your goal: eat <strong>below TDEE to lose weight</strong>, at TDEE to maintain, or <strong>above TDEE to build muscle</strong>. For detailed energy expenditure analysis, try our <Link to="/tdee-calculator" className="text-primary hover:underline">TDEE calculator</Link>.
              </p>
            </div>

            {/* Calorie reference table */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Calorie Needs by Body Weight
              </h3>
              <p className="text-sm text-muted-foreground mb-3">Approximate daily calories for a moderately active adult (3–5 workouts/week):</p>
              <div className="overflow-x-auto">
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground px-3 py-2">
                    <span>Body Weight</span><span>Weight Loss</span><span>Maintenance</span><span>Muscle Gain</span>
                  </div>
                  {calorieRefTable.map((row) => (
                    <div key={row.weight} className="grid grid-cols-4 gap-2 bg-card border border-border rounded-lg px-3 py-2.5 text-sm">
                      <span className="font-medium text-foreground">{row.weight}</span>
                      <span className="text-muted-foreground">{row.lose}</span>
                      <span className="text-muted-foreground">{row.maintain}</span>
                      <span className="text-muted-foreground">{row.gain}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Values assume moderate activity. Sedentary individuals need ~300 fewer calories; very active individuals ~400 more.
              </p>
            </div>

            {/* Weight loss section */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" /> Calories for Weight Loss
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A <strong>500-calorie daily deficit</strong> produces about 0.5 kg (1 lb) of weight loss per week. This is the rate recommended by most health organizations for sustainable fat loss without excessive muscle loss.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong>Mild deficit (250 cal):</strong> ~0.25 kg/week — easiest to maintain, minimal hunger</span></li>
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong>Moderate deficit (500 cal):</strong> ~0.5 kg/week — the sweet spot for most people</span></li>
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong>Aggressive deficit (750+ cal):</strong> faster loss but higher risk of muscle loss and metabolic slowdown</span></li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Crucially, <strong>keep protein high during a deficit</strong> (1.6–2.4g per kg of body weight) to preserve muscle mass. Read our <Link to="/blog/protein-for-fat-loss" className="text-primary hover:underline">protein for fat loss guide</Link> and use our <Link to="/protein-calculator" className="text-primary hover:underline">protein calculator</Link> to set your target.
              </p>
            </div>

            {/* Muscle gain section */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Calories for Muscle Gain
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Building muscle requires a <strong>calorie surplus</strong> — eating more than you burn. A <strong>lean bulk (200–300 cal surplus)</strong> minimizes fat gain while providing enough energy for muscle protein synthesis.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Pair your surplus with <strong>resistance training 3–5 days per week</strong> and adequate protein (1.6–2.2g/kg). Without training, extra calories just become fat. For your optimal protein/carb/fat split, try our <Link to="/macro-calculator" className="text-primary hover:underline">macro calculator</Link>.
              </p>
            </div>

            {/* Tracking section */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> The Easiest Way to Track Calories
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Most people <strong>underestimate their calorie intake by 20–50%</strong> (Lichtman et al., 1992). That's why tracking matters — even imperfect tracking beats guessing.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                <strong>ProteinLens makes tracking effortless</strong>: snap a photo of your meal and get instant calorie, protein, carb, and fat estimates. No barcode scanning, no manual database searches. Learn more about <Link to="/blog/photo-vs-manual-calorie-counting" className="text-primary hover:underline">photo vs manual calorie counting</Link>.
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
              <Link to="/tdee-calculator" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors">
                <Activity className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium mt-2">TDEE</p>
                <p className="text-xs text-muted-foreground">Energy expenditure</p>
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
                { to: '/blog/protein-for-fat-loss', title: 'How Protein Helps You Lose Fat (Not Just Weight)' },
                { to: '/blog/weight-loss-plateau-reasons', title: 'Hit a Weight Loss Plateau? Here\'s Why' },
                { to: '/blog/high-protein-meal-prep', title: 'High-Protein Meal Prep for the Week' },
                { to: '/blog/photo-vs-manual-calorie-counting', title: 'Photo vs Manual Calorie Counting: Which Is Better?' },
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
            <p className="text-muted-foreground mb-4">Know your calorie target? Now track your meals effortlessly.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
              <Camera className="w-5 h-5" /> Track Calories with AI
            </Link>
          </div>

          {/* ── Methodology note ── */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Methodology:</strong> This calculator uses the Mifflin-St Jeor equation (Mifflin et al., 1990), widely regarded as the most accurate BMR formula for non-obese adults. Activity multipliers follow the Harris-Benedict activity scale. Results are personalized estimates — individual needs vary based on body composition, genetics, metabolic adaptation, and NEAT. For our full methodology, see our <Link to="/methodology" className="text-primary hover:underline">methodology page</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
