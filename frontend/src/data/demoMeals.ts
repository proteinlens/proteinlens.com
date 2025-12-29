// Demo meal data for "See an example" feature
// Allows users to see what results look like without uploading a photo

export interface DemoMeal {
  id: string;
  name: string;
  imageUrl: string;
  foods: {
    name: string;
    portion: string;
    protein: number;
  }[];
  totalProtein: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export const demoMeals: DemoMeal[] = [
  {
    id: 'grilled-chicken-salad',
    name: 'Grilled Chicken Salad',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    foods: [
      { name: 'Grilled Chicken Breast', portion: '150g (about 1 breast)', protein: 46 },
      { name: 'Mixed Greens', portion: '2 cups', protein: 2 },
      { name: 'Cherry Tomatoes', portion: '1/2 cup', protein: 1 },
      { name: 'Feta Cheese', portion: '30g', protein: 4 },
    ],
    totalProtein: 53,
    confidence: 'high',
    notes: 'Great post-workout meal! The chicken provides complete protein with all essential amino acids.',
  },
  {
    id: 'breakfast-eggs',
    name: 'Protein-Packed Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
    foods: [
      { name: 'Scrambled Eggs', portion: '3 large eggs', protein: 18 },
      { name: 'Turkey Bacon', portion: '3 slices', protein: 9 },
      { name: 'Whole Wheat Toast', portion: '2 slices', protein: 8 },
      { name: 'Greek Yogurt', portion: '150g', protein: 15 },
    ],
    totalProtein: 50,
    confidence: 'high',
    notes: 'Starting your day with protein helps reduce cravings and keeps you fuller longer!',
  },
  {
    id: 'salmon-dinner',
    name: 'Grilled Salmon Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    foods: [
      { name: 'Atlantic Salmon Fillet', portion: '170g (6oz)', protein: 39 },
      { name: 'Quinoa', portion: '1 cup cooked', protein: 8 },
      { name: 'Steamed Broccoli', portion: '1 cup', protein: 3 },
      { name: 'Lemon Butter Sauce', portion: '2 tbsp', protein: 0 },
    ],
    totalProtein: 50,
    confidence: 'high',
    notes: 'Salmon is rich in omega-3 fatty acids and provides high-quality protein!',
  },
];

// Get a random demo meal
export function getRandomDemoMeal(): DemoMeal {
  return demoMeals[Math.floor(Math.random() * demoMeals.length)];
}

// Default protein goal (can be personalized later)
export const DEFAULT_PROTEIN_GOAL = 130; // grams per day
