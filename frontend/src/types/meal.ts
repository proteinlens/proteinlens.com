export interface FoodItem {
  id: string
  mealId: string
  name: string
  portion: string
  proteinGrams: number
  carbsGrams?: number      // NEW - macro ingredients analysis (optional for legacy meals)
  fatGrams?: number        // NEW - macro ingredients analysis (optional for legacy meals)
  confidence: number // 0-100
  aiDetected: boolean
  isEdited: boolean
}

export interface MealAnalysis {
  foods: FoodItem[]
  totalProtein: number
  totalCarbs?: number      // NEW - macro ingredients analysis (optional for legacy meals)
  totalFat?: number        // NEW - macro ingredients analysis (optional for legacy meals)
  totalCalories?: number
  macros?: {
    carbs: number
    fat: number
    protein: number
  }
}

export interface Correction {
  id: string
  foodItemId: string
  fieldEdited: 'name' | 'portion' | 'proteinGrams'
  originalValue: string | number
  newValue: string | number
  savedAt: string
}

export interface Meal {
  id: string
  userId: string
  uploadedAt: string
  imageUrl: string
  analysis: MealAnalysis
  corrections: Correction[]
  notes?: string
}
