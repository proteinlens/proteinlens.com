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
  { question: 'What is the best macro split for weight loss?', answer: 'A common starting point is 40% protein, 30% carbs, 30% fat. However, the best split depends on your preferences, activity level, and how your body responds. Consistency matters more than the exact split.' },
  { question: 'How do I calculate my macros?', answer: 'First calculate your TDEE (total daily energy expenditure), then divide calories among protein, carbs, and fat based on your goals. Our calculator handles the math for you.' },
  { question: 'Should I track macros or just calories?', answer: 'Tracking macros provides more insight than calories alone. It ensures adequate protein for muscle, and helps balance energy from carbs and fats. However, tracking calories is better than tracking nothing.' },
];

const tdeeCalculatorFAQs = [
  { question: 'What is TDEE?', answer: 'TDEE (Total Daily Energy Expenditure) is the total number of calories you burn per day, including your basal metabolic rate plus activity. It\'s the starting point for any diet plan.' },
  { question: 'How accurate are TDEE calculators?', answer: 'TDEE calculators provide estimates based on formulas like Mifflin-St Jeor. Actual needs can vary by 10-20%. Use the result as a starting point and adjust based on real-world results over 2-4 weeks.' },
  { question: 'Should I eat above or below my TDEE?', answer: 'To lose weight, eat below TDEE (deficit of 300-500 calories). To gain muscle, eat slightly above (surplus of 200-300 calories). To maintain, eat at TDEE.' },
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
    description: 'Free macro calculator to find your ideal protein, carbs, and fat split. Calculate macros for weight loss, muscle gain, or maintenance.',
    canonical: `${BASE_URL}/macro-calculator`,
    keywords: 'macro calculator, macronutrient calculator, calculate macros, macro split calculator, carb fat protein calculator',
    jsonLd: [webApplicationSchema, createFAQSchema(macroCalculatorFAQs)],
  },

  '/tdee-calculator': {
    title: `TDEE Calculator — Daily Energy${BRAND_SUFFIX}`,
    description: 'Calculate your TDEE (Total Daily Energy Expenditure) to find how many calories you burn per day. Free TDEE calculator with activity multipliers.',
    canonical: `${BASE_URL}/tdee-calculator`,
    keywords: 'TDEE calculator, total daily energy expenditure, how many calories do I burn, calorie calculator, BMR calculator',
    jsonLd: [webApplicationSchema, createFAQSchema(tdeeCalculatorFAQs)],
  },

  '/calorie-calculator': {
    title: `Calorie Calculator - Daily Calorie Needs${BRAND_SUFFIX}`,
    description: 'Calculate how many calories you need per day for weight loss, maintenance, or muscle gain. Free calorie calculator with goal-based recommendations.',
    canonical: `${BASE_URL}/calorie-calculator`,
    keywords: 'calorie calculator, daily calorie needs, how many calories should I eat, calorie deficit calculator',
    jsonLd: webApplicationSchema,
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
