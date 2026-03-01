/**
 * Blog Content Index
 * 
 * Centralized blog post metadata and content for SEO.
 * Posts are organized by category for easy management.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  category: 'ai-tracking' | 'protein-goals' | 'macro-basics' | 'tdee-calories' | 'real-life-tracking';
  publishedAt: string;
  updatedAt: string;
  readingTime: number; // minutes
  featured?: boolean;
}

// Blog post metadata (content is in separate files)
export const blogPosts: BlogPost[] = [
  // === AI + Photo Tracking (High Intent, Unique Angle) ===
  {
    slug: 'how-to-track-macros-from-photo',
    title: 'How to Track Macros from a Photo (And What Accuracy to Expect)',
    description: 'Learn how AI photo macro tracking works, what accuracy you can realistically expect, and tips for getting the best results from food photo analysis.',
    keywords: 'track macros from photo, AI macro tracking, food photo analysis, macro tracking app, photo nutrition tracker',
    category: 'ai-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
    featured: true,
  },
  {
    slug: 'photo-macro-tracking-vs-barcode-scanning',
    title: 'Photo Macro Tracking vs Barcode Scanning: Which Is Faster and More Accurate?',
    description: 'Compare AI photo macro tracking to barcode scanning. Discover which method is faster, more accurate, and better suited for different meal types.',
    keywords: 'photo macro tracking, barcode scanning, macro tracking comparison, food tracking methods, AI vs barcode',
    category: 'ai-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 7,
  },
  {
    slug: 'best-lighting-angles-food-photo-macros',
    title: 'The Best Lighting and Angles for Accurate Food Photo Macro Estimates',
    description: 'Get more accurate macro estimates from food photos with these simple lighting and angle tips. Improve your AI food tracking results instantly.',
    keywords: 'food photo tips, macro tracking accuracy, food photography for tracking, AI food scan tips, better food photos',
    category: 'ai-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 5,
  },
  {
    slug: 'estimate-portion-sizes-from-photos',
    title: 'How to Estimate Portion Sizes from Photos (Simple Visual Tricks)',
    description: 'Master portion estimation with visual comparison tricks. Learn to estimate serving sizes accurately using everyday objects and hand measurements.',
    keywords: 'estimate portion sizes, visual portion guide, portion size photos, serving size estimation, portion control',
    category: 'ai-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 6,
  },
  {
    slug: 'common-ai-food-scan-mistakes',
    title: 'Common AI Food Scan Mistakes (And How to Fix Them)',
    description: 'Avoid the most common AI food scanning errors. Learn why macro estimates can be off and simple fixes to improve your tracking accuracy.',
    keywords: 'AI food scan mistakes, macro tracking errors, food tracking accuracy, fix macro estimates, AI nutrition errors',
    category: 'ai-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 7,
  },
  {
    slug: 'track-restaurant-meals-unknown-ingredients',
    title: 'How to Track Restaurant Meals When You Don\'t Know the Ingredients',
    description: 'Track macros at restaurants without stressing over hidden ingredients. Practical strategies for eating out while staying on track with your goals.',
    keywords: 'track restaurant meals, macros eating out, restaurant macro tracking, dining out macros, unknown ingredients tracking',
    category: 'ai-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
  },
  
  // === Protein Goals (High Search Volume) ===
  {
    slug: 'how-much-protein-per-day',
    title: 'How Much Protein Do I Need Per Day? (Simple Calculator + Examples)',
    description: 'Calculate your daily protein needs based on your weight, activity level, and goals. Includes practical examples and a free calculator.',
    keywords: 'how much protein per day, daily protein intake, protein calculator, protein requirements, protein needs',
    category: 'protein-goals',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 9,
    featured: true,
  },
  {
    slug: 'protein-for-fat-loss',
    title: 'Protein Per Day for Fat Loss: Does More Always Help?',
    description: 'Discover the optimal protein intake for fat loss. Learn why protein matters for preserving muscle, controlling hunger, and burning more calories.',
    keywords: 'protein for fat loss, protein while dieting, high protein weight loss, protein cutting, lose fat keep muscle',
    category: 'protein-goals',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
  },
  {
    slug: 'protein-for-muscle-gain',
    title: 'Protein Per Day for Muscle Gain: Practical Targets by Bodyweight',
    description: 'Find your optimal protein intake for building muscle. Science-backed recommendations with practical targets based on your bodyweight.',
    keywords: 'protein for muscle gain, protein bodybuilding, muscle building protein, protein bulking, how much protein muscle',
    category: 'protein-goals',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
  },
  {
    slug: 'high-protein-breakfast-ideas',
    title: 'High-Protein Breakfast Ideas (Quick, Cheap, Easy to Track)',
    description: '15+ high-protein breakfast ideas that are quick to make, budget-friendly, and easy to track. Start your day with 30-50g protein.',
    keywords: 'high protein breakfast, protein breakfast ideas, quick protein breakfast, easy high protein breakfast, breakfast macros',
    category: 'protein-goals',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 10,
  },
  
  // === Macro Basics (Beginner Traffic) ===
  {
    slug: 'what-are-macros',
    title: 'What Are Macros? (Protein, Carbs, Fat Explained with Examples)',
    description: 'Learn what macros are and why they matter. Simple explanations of protein, carbohydrates, and fat with real food examples.',
    keywords: 'what are macros, macronutrients explained, protein carbs fat, macro basics, macros for beginners',
    category: 'macro-basics',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 7,
    featured: true,
  },
  {
    slug: 'how-to-calculate-macros-weight-loss',
    title: 'How to Calculate Macros for Weight Loss (Step-by-Step)',
    description: 'A complete guide to calculating your macros for weight loss. Step-by-step instructions with examples and a free calculator.',
    keywords: 'calculate macros weight loss, macro calculator, weight loss macros, macro diet, counting macros to lose weight',
    category: 'macro-basics',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 10,
  },
  {
    slug: 'calories-vs-macros',
    title: 'Calories vs Macros: What Matters Most for Results?',
    description: 'Should you count calories or macros? Learn which approach works better for different goals and how to decide what to track.',
    keywords: 'calories vs macros, count calories or macros, macro tracking vs calorie counting, what to track for weight loss',
    category: 'macro-basics',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
  },
  
  // === TDEE & Calories (Evergreen) ===
  {
    slug: 'what-is-tdee',
    title: 'What Is TDEE? (And How to Calculate It Accurately)',
    description: 'Understand TDEE (Total Daily Energy Expenditure) and learn how to calculate yours accurately. The foundation for any diet plan.',
    keywords: 'what is TDEE, TDEE calculator, total daily energy expenditure, calculate TDEE, daily calorie burn',
    category: 'tdee-calories',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
  },
  {
    slug: 'weight-loss-plateau-reasons',
    title: 'Weight Loss Plateau: 9 Reasons the Scale Stopped Moving',
    description: 'Stuck at a weight loss plateau? Discover the 9 most common reasons your weight stopped dropping and exactly how to break through.',
    keywords: 'weight loss plateau, scale not moving, plateau weight loss, stuck losing weight, break weight loss plateau',
    category: 'tdee-calories',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 11,
  },
  
  // === Real-Life Tracking (High Conversion) ===
  {
    slug: 'track-macros-without-food-scale',
    title: 'How to Track Macros with No Food Scale (And Still Be Consistent)',
    description: 'Track macros accurately without weighing everything. Learn practical estimation methods that keep you consistent without obsessing.',
    keywords: 'track macros without scale, no food scale macros, estimate portions, macro tracking without weighing',
    category: 'real-life-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 7,
  },
  {
    slug: 'track-macros-eating-out',
    title: 'How to Track Macros When You Eat Out 3+ Times a Week',
    description: 'Love eating out? Learn practical strategies to track macros at restaurants, fast food, and social dinners without derailing your progress.',
    keywords: 'track macros eating out, restaurant macro tracking, macros dining out, eating out on a diet',
    category: 'real-life-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 9,
  },
  {
    slug: 'macro-tracking-busy-people',
    title: 'Macro Tracking for Busy People: The 80/20 Approach That Works',
    description: 'Too busy to track every gram? Learn the 80/20 approach to macro tracking that gets results without taking over your life.',
    keywords: 'macro tracking busy, simple macro tracking, easy macro counting, 80/20 macro tracking, quick macro tracking',
    category: 'real-life-tracking',
    publishedAt: '2026-02-03',
    updatedAt: '2026-02-03',
    readingTime: 8,
  },
  // === Comparison / Alternatives (High Intent, Bottom of Funnel) ===
  {
    slug: 'proteinlens-vs-myfitnesspal',
    title: 'ProteinLens vs MyFitnessPal — Which Macro Tracker Is Better in 2026?',
    description: 'Honest comparison of ProteinLens AI photo tracking vs MyFitnessPal manual entry. Features, accuracy, pricing, and who should use what.',
    keywords: 'proteinlens vs myfitnesspal, myfitnesspal alternative, best macro tracker 2026, AI food tracker vs myfitnesspal, photo macro tracker',
    category: 'ai-tracking',
    publishedAt: '2026-02-26',
    updatedAt: '2026-02-26',
    readingTime: 7,
    featured: true,
  },
  {
    slug: 'proteinlens-vs-cronometer',
    title: 'ProteinLens vs Cronometer — Best Macro Tracker for 2026?',
    description: 'Comparing ProteinLens AI photo tracking with Cronometer\'s detailed micronutrient database. Speed vs precision — which tracker fits your goals?',
    keywords: 'proteinlens vs cronometer, cronometer alternative, best macro tracker 2026, AI macro tracker vs cronometer, fast nutrition tracker',
    category: 'ai-tracking',
    publishedAt: '2026-02-27',
    updatedAt: '2026-02-27',
    readingTime: 7,
  },
  {
    slug: 'proteinlens-vs-lose-it',
    title: 'ProteinLens vs Lose It! — Which Food Tracker Is Right for You?',
    description: 'ProteinLens AI photo tracking vs Lose It! barcode scanning. Compare speed, accuracy, pricing, and which approach keeps you consistent.',
    keywords: 'proteinlens vs lose it, lose it alternative, best food tracker 2026, AI food tracker vs lose it, photo macro tracker',
    category: 'ai-tracking',
    publishedAt: '2026-02-27',
    updatedAt: '2026-02-27',
    readingTime: 8,
  },
  {
    slug: 'best-macro-tracking-apps-2026',
    title: 'Best Macro Tracking Apps 2026 — Top 7 Compared',
    description: 'We tested the 7 best macro tracking apps of 2026 — from AI photo scanning to barcode trackers. Find out which fits your goals and lifestyle.',
    keywords: 'best macro tracking app 2026, best nutrition tracker, macro counting app comparison, top food tracking apps, calorie counter app review',
    category: 'ai-tracking',
    publishedAt: '2026-03-01',
    updatedAt: '2026-03-01',
    readingTime: 10,
    featured: true,
  },
  {
    slug: 'how-ai-food-scanning-works',
    title: 'How AI Food Scanning Actually Works — The Tech Behind ProteinLens',
    description: 'Curious how AI identifies food from a photo and estimates macros? We break down the image recognition, portion estimation, and nutritional mapping behind it.',
    keywords: 'how AI food scanning works, AI nutrition tracker technology, food image recognition, AI macro estimation, photo food tracking explained',
    category: 'ai-tracking',
    publishedAt: '2026-03-01',
    updatedAt: '2026-03-01',
    readingTime: 7,
  },
  {
    slug: 'why-you-quit-macro-tracking',
    title: 'Why You Keep Quitting Macro Tracking (And How to Fix It)',
    description: 'Most people abandon macro tracking within a week. Here are the 6 real reasons why — and practical fixes that actually make tracking stick.',
    keywords: 'why I quit macro tracking, macro tracking too hard, how to stick with macro tracking, food tracking motivation, easiest way to track macros',
    category: 'macro-basics',
    publishedAt: '2026-03-01',
    updatedAt: '2026-03-01',
    readingTime: 8,
  },
];

// Helper functions
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getBlogPostsByCategory(category: BlogPost['category']): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured);
}

export function getRecentPosts(limit: number = 10): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export const categoryLabels: Record<BlogPost['category'], string> = {
  'ai-tracking': 'AI & Photo Tracking',
  'protein-goals': 'Protein Goals',
  'macro-basics': 'Macro Basics',
  'tdee-calories': 'TDEE & Calories',
  'real-life-tracking': 'Real-Life Tracking',
};
