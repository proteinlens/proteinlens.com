/**
 * SEO Data Configuration for Prerendering
 * 
 * Centralized SEO metadata for all public routes.
 * Used by both the prerender entry point and client-side SEOHead component.
 */

const BASE_URL = 'https://www.proteinlens.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
import { blogPosts } from '../content/blog/index';
const BRAND_SUFFIX = ' | ProteinLens';

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: object | object[];
}

// Schema generators
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ProteinLens',
  description: 'AI-powered macronutrient analyzer. Upload food photos to instantly analyze protein, carbohydrates, and fat content.',
  url: BASE_URL,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'AI-powered food image analysis with GPT Vision',
    'Complete macronutrient breakdown (protein, carbs, fat)',
    'Calorie calculation with macro percentages',
    'Daily nutrition tracking',
    'Shareable meal results',
    'Protein calculator',
    'Macro calculator',
    'TDEE calculator',
  ],
  author: {
    '@type': 'Organization',
    name: 'ProteinLens',
    url: BASE_URL,
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ProteinLens',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  image: `${BASE_URL}/og-image.png`,
  description: 'AI-powered macro nutrition tracking app. Snap photos to instantly analyze protein, carbs, and fat.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@proteinlens.com',
    contactType: 'customer service',
  },
  sameAs: [
    'https://www.youtube.com/@BertonLuca',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Track Macros from a Food Photo',
  description: 'Use ProteinLens to instantly analyze protein, carbs, fat, and calories from any food photo.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Take a photo of your meal',
      text: 'Open ProteinLens and snap a clear, well-lit photo of your plate. Top-down angle works best.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'AI identifies the foods',
      text: 'Our AI vision model identifies individual food items, estimates portion sizes, and recognizes preparation methods.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Get instant macro breakdown',
      text: 'View detailed protein, carbs, fat, and calorie counts for each food item and the entire meal.',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Track your daily progress',
      text: 'Results are saved to your history. Track daily totals against your protein and macro goals.',
      position: 4,
    },
  ],
  totalTime: 'PT30S',
  tool: {
    '@type': 'HowToTool',
    name: 'ProteinLens app',
  },
};

const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Calculator-specific FAQs for schema
const proteinCalculatorFAQs = [
  { question: 'How much protein do I need per day?', answer: 'Protein needs vary based on body weight and activity level. A general guideline is 1.6-2.2g per kg of body weight for active individuals, and 0.8g/kg as a minimum for sedentary adults. Use our calculator for a personalized estimate based on your weight, training level, and goals.' },
  { question: 'How much protein do I need to build muscle?', answer: 'Research shows 1.6-2.2g of protein per kg of body weight per day is optimal for muscle growth. For a 75kg person, that is 120-165g daily. Eating above 2.2g/kg provides minimal additional muscle-building benefit.' },
  { question: 'How much protein for weight loss?', answer: 'During a calorie deficit, aim for 1.6-2.4g/kg of body weight. Higher protein during weight loss preserves muscle mass, keeps you fuller longer, and has a higher thermic effect — your body burns more calories digesting protein than carbs or fat.' },
  { question: 'Is this protein calculator accurate?', answer: 'Our calculator uses evidence-based multipliers from peer-reviewed sports nutrition research including Schoenfeld & Aragon 2018, Helms et al. 2014, and ISSN Position Stands. Results are personalized estimates — individual needs may vary based on age, health conditions, and training intensity.' },
  { question: 'Can I eat too much protein?', answer: 'For healthy adults, protein intakes up to 3.5g/kg have been studied without adverse effects on kidney or liver function. Above 2.2g/kg, muscle-building benefits plateau. The main downside is opportunity cost — those calories could come from carbs or fats you also need.' },
  { question: 'How do I track my protein intake?', answer: 'ProteinLens makes it easy — snap a photo of your meal and get an instant breakdown of protein, carbs, fat, and calories. No manual logging or barcode scanning needed. You can also use food labels and a kitchen scale for precise tracking.' },
  { question: 'How much protein do older adults need?', answer: 'Older adults (60+) need more protein due to anabolic resistance. The European Society for Clinical Nutrition recommends 1.0-1.2g/kg for healthy older adults, and up to 1.5g/kg for those who are ill or recovering from injury.' },
  { question: 'What is the difference between a protein calculator and a macro calculator?', answer: 'A protein calculator focuses on your daily protein target. A macro calculator gives targets for all three macronutrients — protein, carbs, and fat — plus total calories. Use a protein calculator if protein is your priority; use a macro calculator for a complete nutrition plan.' },
];

const macroCalculatorFAQs = [
  { question: 'What is the best macro split for weight loss?', answer: 'A high-protein split (40% protein, 30% carbs, 30% fat) is often best for weight loss. Higher protein increases satiety, preserves muscle, and has the highest thermic effect. The best split is one you can stick to consistently.' },
  { question: 'How do I calculate my macros from scratch?', answer: 'Step 1: Calculate your TDEE. Step 2: Adjust for your goal (subtract 300-500 cal for fat loss, add 200-300 for muscle gain). Step 3: Split those calories into protein (4 cal/g), carbs (4 cal/g), and fat (9 cal/g).' },
  { question: 'Should I track macros or just calories?', answer: 'Tracking macros gives you more control. Two 2,000-calorie diets can produce very different results depending on the macro split. Adequate protein prevents muscle loss, while the carb/fat ratio affects energy and hormones.' },
  { question: 'What does IIFYM mean?', answer: "IIFYM stands for 'If It Fits Your Macros' — a flexible dieting approach where you can eat any food as long as it fits within your daily macro targets. Aim for 80% whole foods, 20% flexible choices." },
  { question: 'How much protein, carbs, and fat do I need per day?', answer: 'Protein: 1.6–2.2g per kg bodyweight. Fat: minimum 0.5g per kg for hormone health. Carbs: fill remaining calories. For a 75kg person at 2,400 cal: ~150g protein, ~67g fat, ~270g carbs.' },
  { question: 'Is keto better than a balanced diet for weight loss?', answer: 'Research shows no significant difference in fat loss between keto and other diets when calories and protein are equated. Keto can reduce appetite initially, but long-term adherence is often lower.' },
  { question: 'How do I know if my macro split is working?', answer: 'Track your weight weekly, take monthly progress photos, and monitor energy levels and gym performance. If weight is moving in the right direction and you feel good, your split is working.' },
  { question: 'Can I build muscle and lose fat at the same time?', answer: 'Yes — body recomposition is possible, especially for beginners or those returning after a break. Eat at maintenance or a slight deficit, keep protein high (2.0g/kg+), and do resistance training 3–5 days per week.' },
];

const tdeeCalculatorFAQs = [
  { question: 'What is TDEE and why does it matter?', answer: "TDEE (Total Daily Energy Expenditure) is the total number of calories you burn per day, including your basal metabolic rate, daily activity, exercise, and digestion. It's the foundation of any diet plan." },
  { question: 'How do you calculate TDEE?', answer: 'TDEE is calculated by first estimating your BMR using the Mifflin-St Jeor equation, then multiplying by an activity factor. For example: a 75kg, 175cm, 30-year-old male with moderate activity has a BMR of ~1,700 cal × 1.55 = ~2,635 TDEE.' },
  { question: 'How accurate are TDEE calculators?', answer: 'TDEE calculators provide estimates within 10–20% of your actual expenditure. The biggest variable is activity level. Use the result as a starting point and adjust based on 2–4 weeks of weight tracking.' },
  { question: 'What is the difference between BMR and TDEE?', answer: 'BMR is the calories your body needs at complete rest. TDEE adds everything on top: walking, exercise, digesting food, even fidgeting. For most people, TDEE is 1.4–1.9× their BMR.' },
  { question: 'Why is my TDEE different from other calculators?', answer: 'Different calculators use different formulas. We use Mifflin-St Jeor, the most accurate for non-obese adults. Others use Harris-Benedict (tends to overestimate) or Katch-McArdle (requires body fat %).' },
  { question: 'How does NEAT affect my TDEE?', answer: "NEAT (Non-Exercise Activity Thermogenesis) can vary by 500–2,000 calories per day between individuals. It includes all movement that isn't planned exercise: walking, standing, fidgeting, cooking." },
  { question: 'Should I eat below my TDEE to lose weight?', answer: 'Yes — a deficit of 300–500 calories below TDEE is ideal for sustainable weight loss (~0.25–0.5 kg per week). Keep protein high (1.6–2.4g/kg) to preserve muscle.' },
  { question: 'Does my TDEE change as I lose weight?', answer: "Yes — TDEE decreases as you lose weight because you have less body mass. Recalculate every 5–10 kg and consider periodic diet breaks at maintenance to counteract metabolic adaptation." },
];

// SEO data for all public routes
const seoData: Record<string, PageSEO> = {
  '/': {
    title: 'ProteinLens — AI Macro Tracker | Snap & Track',
    description: 'Snap a photo, get instant macro breakdowns. Track protein, carbs, fat and calories with AI-powered nutrition tracking. Free to try.',
    canonical: `${BASE_URL}/`,
    keywords: 'macro tracker, protein tracker, AI food scanner, nutrition app, calorie counter, macronutrient calculator',
    jsonLd: [webApplicationSchema, organizationSchema],
  },

  '/features': {
    title: `Features - AI Macro Tracker App${BRAND_SUFFIX}`,
    description: 'Explore ProteinLens features: AI photo analysis, protein tracking, macro breakdown, daily totals, shareable results, diet profiles & more. Free to start.',
    canonical: `${BASE_URL}/features`,
    keywords: 'macro tracker app features, protein tracking app, nutrition AI features, food scanner app, calorie counter features',
    jsonLd: webApplicationSchema,
  },

  '/how-it-works': {
    title: `How It Works - AI Photo Macro Tracking${BRAND_SUFFIX}`,
    description: 'Learn how ProteinLens uses AI to track macros from food photos. Snap a picture, get instant protein, carbs, fat & calories. No manual logging required.',
    canonical: `${BASE_URL}/how-it-works`,
    keywords: 'how to track macros from photo, AI food scanner, photo macro tracker, automatic macro tracking, food photo analyzer',
    jsonLd: [webApplicationSchema, howToSchema],
  },

  '/about': {
    title: `About ProteinLens — AI Macro Tracker`,
    description: 'ProteinLens is an AI-powered nutrition tracking app that analyzes food photos to provide instant macro breakdowns. Track protein, carbs & fat the easy way.',
    canonical: `${BASE_URL}/about`,
    keywords: 'ProteinLens, AI nutrition tracker, food photo analyzer, macro tracking app, about ProteinLens',
    jsonLd: organizationSchema,
  },

  '/pricing': {
    title: `Pricing - ProteinLens Pro${BRAND_SUFFIX}`,
    description: 'ProteinLens pricing plans. Free tier with 10 scans/day. Pro plan for unlimited macro tracking, priority analysis, and advanced features.',
    canonical: `${BASE_URL}/pricing`,
    keywords: 'ProteinLens pricing, macro tracker subscription, nutrition app cost, protein tracker price',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'ProteinLens Pro',
      description: 'Unlimited AI-powered macro tracking with priority analysis',
      image: `${BASE_URL}/og-image.png`,
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          name: 'Pro Monthly',
          price: '9.99',
          priceCurrency: 'USD',
          priceValidUntil: '2027-12-31',
        },
      ],
    },
  },

  '/privacy': {
    title: `Privacy Policy — Data & Security${BRAND_SUFFIX}`,
    description: 'ProteinLens privacy policy. Learn how we collect, protect, and handle your data, meal photos, and personal information with transparency.',
    canonical: `${BASE_URL}/privacy`,
    noindex: false, // Privacy pages should be indexable for trust
  },

  '/terms': {
    title: `Terms of Service${BRAND_SUFFIX}`,
    description: 'ProteinLens terms of service. Read the usage terms, limitations, and legal information for our AI-powered nutrition tracking service.',
    canonical: `${BASE_URL}/terms`,
    noindex: false,
  },

  '/protein-calculator': {
    title: `Protein Calculator - Daily Protein Intake${BRAND_SUFFIX}`,
    description: 'Free protein calculator — find exactly how much protein you need per day for muscle gain, fat loss, or maintenance. Based on body weight, activity level, and science-backed multipliers.',
    canonical: `${BASE_URL}/protein-calculator`,
    keywords: 'protein calculator, daily protein intake calculator, how much protein do I need, protein per day calculator, protein calculator for muscle gain, protein intake calculator, protein calculator bodyweight, protein requirements calculator, protein for weight loss calculator',
    jsonLd: [webApplicationSchema, createFAQSchema(proteinCalculatorFAQs)],
  },

  '/macro-calculator': {
    title: `Macro Calculator - Calculate Your Macros${BRAND_SUFFIX}`,
    description: 'Free macro calculator to find your ideal protein, carbs, and fat split. Compare 6 popular diets (IIFYM, keto, low carb, high protein) with 8 FAQs.',
    canonical: `${BASE_URL}/macro-calculator`,
    keywords: 'macro calculator, macronutrient calculator, calculate macros, macro split calculator, IIFYM calculator, carb fat protein calculator, keto macros, flexible dieting',
    jsonLd: [webApplicationSchema, createFAQSchema(macroCalculatorFAQs)],
  },

  '/tdee-calculator': {
    title: `TDEE Calculator — Daily Energy${BRAND_SUFFIX}`,
    description: 'Calculate your TDEE (Total Daily Energy Expenditure) with the Mifflin-St Jeor formula. Free TDEE calculator with activity multipliers, reference tables, and 8 FAQs.',
    canonical: `${BASE_URL}/tdee-calculator`,
    keywords: 'TDEE calculator, total daily energy expenditure, how many calories do I burn, BMR calculator, metabolism calculator, maintenance calories calculator',
    jsonLd: [webApplicationSchema, createFAQSchema(tdeeCalculatorFAQs)],
  },

  '/calorie-calculator': {
    title: `Calorie Calculator - Daily Calorie Needs${BRAND_SUFFIX}`,
    description: 'Calculate how many calories you need per day for weight loss, maintenance, or muscle gain. Free calorie calculator using the Mifflin-St Jeor equation with 8 FAQs.',
    canonical: `${BASE_URL}/calorie-calculator`,
    keywords: 'calorie calculator, daily calorie needs, how many calories should I eat, calorie deficit calculator, calories for weight loss, maintenance calories, calorie calculator for muscle gain',
    jsonLd: [webApplicationSchema, createFAQSchema([
      { question: 'How many calories should I eat to lose weight?', answer: 'To lose weight at a safe, sustainable rate (~0.5 kg per week), eat about 500 calories below your TDEE. For most adults, this means 1,500–2,000 calories per day. Never go below 1,200 calories without medical supervision.' },
      { question: 'What formula does this calorie calculator use?', answer: 'We use the Mifflin-St Jeor equation, which research shows is the most accurate formula for estimating BMR (Basal Metabolic Rate). Your BMR is multiplied by an activity factor to estimate total daily calories burned.' },
      { question: 'What is a calorie deficit and how big should it be?', answer: 'A calorie deficit means eating fewer calories than you burn. A 300–500 calorie deficit per day is recommended for steady weight loss. Larger deficits (750+) can lead to muscle loss, fatigue, and metabolic adaptation.' },
      { question: 'How accurate are calorie calculators?', answer: 'Calorie calculators provide estimates with about 10–20% accuracy. Individual factors like genetics, muscle mass, hormones, and NEAT affect actual needs. Use the result as a starting point and adjust based on 2–4 weeks of tracking.' },
      { question: 'How many calories do I need to build muscle?', answer: 'To build muscle, eat 200–300 calories above your TDEE (a lean bulk). Combined with resistance training and adequate protein (1.6–2.2g/kg), this supports muscle growth while minimizing fat gain.' },
      { question: 'What is the difference between BMR and TDEE?', answer: 'BMR is the calories your body burns at complete rest. TDEE includes BMR plus calories burned through exercise, daily movement, and digesting food. TDEE is always higher than BMR.' },
      { question: 'Should I eat back exercise calories?', answer: "If your TDEE already accounts for your exercise via the activity multiplier, don't eat back additional calories. If you're using BMR only and tracking exercise separately, eat back about 50–75% of estimated exercise calories." },
      { question: 'Why am I not losing weight even in a calorie deficit?', answer: 'Common reasons: underestimating portion sizes (most people undercount by 20–50%), metabolic adaptation from prolonged dieting, water retention masking fat loss, or your activity level is lower than selected.' },
    ])],
  },

  '/guides': {
    title: `Nutrition Guides - Macro Tracking Tips${BRAND_SUFFIX}`,
    description: 'Learn macro tracking, protein targets, meal planning, and nutrition fundamentals. Free step-by-step guides and tips from ProteinLens.',
    canonical: `${BASE_URL}/guides`,
    keywords: 'nutrition guides, macro tracking tips, protein guide, how to track macros, nutrition education',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'ProteinLens Nutrition Guides',
      description: 'Educational guides on macro tracking, protein, and nutrition',
      url: `${BASE_URL}/guides`,
    },
  },

  '/methodology': {
    title: `Methodology - How ProteinLens AI Works${BRAND_SUFFIX}`,
    description: 'Learn how ProteinLens estimates macros from food photos. Our methodology, data sources, accuracy notes, and limitations explained.',
    canonical: `${BASE_URL}/methodology`,
    keywords: 'ProteinLens accuracy, AI food recognition, macro estimation methodology, nutrition AI explained',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'ProteinLens Methodology',
      description: 'Technical explanation of how ProteinLens AI estimates macronutrients from food photos',
      author: organizationSchema,
    },
  },

  '/blog': {
    title: `Macro & Nutrition Blog${BRAND_SUFFIX}`,
    description: 'Expert nutrition advice on macro tracking, protein intake, TDEE, weight loss, and AI food tracking. Practical tips for better nutrition habits.',
    canonical: `${BASE_URL}/blog`,
    keywords: 'macro tracking blog, protein tips, nutrition advice, weight loss tips, TDEE guide, calorie tracking blog',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'ProteinLens Nutrition Blog',
      description: 'Expert nutrition advice on macro tracking, protein intake, and AI-powered food tracking',
      url: `${BASE_URL}/blog`,
      publisher: organizationSchema,
    },
  },

  // 404 page (noindex)
  '/404': {
    title: `Page Not Found${BRAND_SUFFIX}`,
    description: 'The page you\'re looking for doesn\'t exist. Return to ProteinLens home.',
    canonical: BASE_URL,
    noindex: true,
  },
};

/**
 * Get SEO data for a URL path
 */
export function getSeoForUrl(url: string): PageSEO {
  // Normalize URL
  const path = url.split('?')[0].replace(/\/$/, '') || '/';
  
  // Return specific SEO data or default
  if (seoData[path]) {
    return seoData[path];
  }

  // Blog posts should be indexed even without explicit SEO entries
  const isBlogPost = path.startsWith('/blog/');

  if (isBlogPost) {
    const slug = path.split('/').pop() || '';
    const post = blogPosts.find(p => p.slug === slug);
    if (post) {
      // Keep title ≤ 60 chars: use suffix only if it fits
      const withSuffix = `${post.title}${BRAND_SUFFIX}`;
      const title = withSuffix.length <= 60 ? withSuffix : post.title;
      return {
        title,
        description: post.description,
        canonical: `${BASE_URL}${path}`,
        keywords: post.keywords,
        noindex: false,
      };
    }
  }

  return {
    title: isBlogPost
      ? `${path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}${BRAND_SUFFIX}`
      : `ProteinLens — AI Macro Tracker`,
    description: 'Snap a photo, get instant macro breakdowns. Track protein, carbs, fat and calories with AI-powered nutrition tracking.',
    canonical: `${BASE_URL}${path}`,
    noindex: !isBlogPost,
  };
}

/**
 * List of all public routes to prerender
 */
export const PUBLIC_ROUTES = [
  '/',
  '/features',
  '/how-it-works',
  '/about',
  '/pricing',
  '/privacy',
  '/terms',
  '/protein-calculator',
  '/macro-calculator',
  '/tdee-calculator',
  '/calorie-calculator',
  '/guides',
  '/methodology',
  '/blog',
  // Blog posts - these will be prerendered
  '/blog/how-to-track-macros-from-photo',
  '/blog/photo-macro-tracking-vs-barcode-scanning',
  '/blog/best-lighting-angles-food-photo-macros',
  '/blog/estimate-portion-sizes-from-photos',
  '/blog/common-ai-food-scan-mistakes',
  '/blog/track-restaurant-meals-unknown-ingredients',
  '/blog/how-much-protein-per-day',
  '/blog/protein-for-fat-loss',
  '/blog/protein-for-muscle-gain',
  '/blog/high-protein-breakfast-ideas',
  '/blog/what-are-macros',
  '/blog/how-to-calculate-macros-weight-loss',
  '/blog/calories-vs-macros',
  '/blog/what-is-tdee',
  '/blog/weight-loss-plateau-reasons',
  '/blog/track-macros-without-food-scale',
  '/blog/track-macros-eating-out',
  '/blog/macro-tracking-busy-people',
  '/blog/proteinlens-vs-myfitnesspal',
  '/blog/proteinlens-vs-cronometer',
  '/blog/proteinlens-vs-lose-it',
  '/blog/best-macro-tracking-apps-2026',
  '/blog/how-ai-food-scanning-works',
  '/blog/why-you-quit-macro-tracking',
  '/blog/scan-menu-for-protein',
  '/blog/protein-calculator-for-seniors',
  '/blog/fifty-grams-protein-breakfast',
  '/404',
];

export default seoData;
