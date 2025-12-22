export interface DailyGoal {
  userId: string
  goalGrams: number
  lastUpdated: string
}

export interface ProteinGap {
  goalGrams: number
  consumedGrams: number
  gapGrams: number
  percentComplete: number
  isMet: boolean
}

export interface HighProteinSuggestion {
  id: string
  name: string
  proteinPer100g: number
  servingSize: string
  category: 'meat' | 'dairy' | 'legume' | 'grain' | 'other'
}
