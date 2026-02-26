/**
 * SEO Data Configuration for Prerendering
 * 
 * Centralized SEO metadata for all public routes.
 * Used by both the prerender entry point and client-side SEOHead component.
 */

const BASE_URL = 'https://www.proteinlens.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.svg`;
const BRAND_SUFFIX = ' | ProteinLens - AI Macro Nutrition Tracker';

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
  description: 'AI-powered macro nutrition tracking app. Snap photos to instantly analyze protein, carbs, and fat.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@proteinlens.com',
    contactType: 'customer service',
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
  { question: 'How much protein do I need per day?', answer: 'Protein needs vary based on body weight and activity level. A general guideline is 1.6-2.2g per kg of body weight for active individuals. Use our calculator for a personalized estimate.' },
  { question: 'Does protein intake differ for muscle building vs weight loss?', answer: 'Yes. For muscle building, aim for the higher end (2.0-2.2g/kg). For weight loss, maintain high protein (1.6-2.0g/kg) to preserve muscle mass while in a caloric deficit.' },
  { question: 'How accurate is this protein calculator?', answer: 'Our calculator uses evidence-based multipliers from sports nutrition research. Results are estimates - individual needs may vary based on age, health conditions, and specific goals.' },
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
    title: 'ProteinLens - AI Macro Nutrition Tracker | Protein, Carbs & Fat Analysis',
    description: 'Upload food photos for instant AI-powered macronutrient analysis. Track protein, carbs, and fat with calorie breakdowns. Free nutrition tracker with shareable meal insights.',
    canonical: BASE_URL,
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
    jsonLd: webApplicationSchema,
  },

  '/about': {
    title: `About ProteinLens - AI Macro Nutrition Tracker`,
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
    title: `Privacy Policy${BRAND_SUFFIX}`,
    description: 'ProteinLens privacy policy. Learn how we protect your data, handle meal photos, and respect your privacy.',
    canonical: `${BASE_URL}/privacy`,
    noindex: false, // Privacy pages should be indexable for trust
  },

  '/terms': {
    title: `Terms of Service${BRAND_SUFFIX}`,
    description: 'ProteinLens terms of service. Usage terms, limitations, and legal information for our AI nutrition tracking service.',
    canonical: `${BASE_URL}/terms`,
    noindex: false,
  },

  '/protein-calculator': {
    title: `Protein Calculator - Daily Protein Intake${BRAND_SUFFIX}`,
    description: 'Calculate your daily protein needs based on body weight and fitness goals. Free protein calculator for muscle building, weight loss, and maintenance.',
    canonical: `${BASE_URL}/protein-calculator`,
    keywords: 'protein calculator, daily protein intake, how much protein do I need, protein per day calculator, protein requirements',
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
    title: `TDEE Calculator - Total Daily Energy Expenditure${BRAND_SUFFIX}`,
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
    description: 'Learn macro tracking, protein targets, meal planning, and nutrition fundamentals. Free guides from ProteinLens.',
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
    title: `Nutrition Blog - Macro Tracking, Protein & Weight Loss Tips${BRAND_SUFFIX}`,
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

  return {
    title: isBlogPost
      ? `${path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}${BRAND_SUFFIX}`
      : `ProteinLens - AI Macro Nutrition Tracker`,
    description: 'AI-powered nutrition tracking. Upload food photos for instant macro analysis.',
    canonical: `${BASE_URL}${path}`,
    noindex: !isBlogPost, // Blog posts should be indexed; unknown pages should not
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
  '/404',
];

export default seoData;
