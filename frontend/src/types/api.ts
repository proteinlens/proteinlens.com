import type { Meal } from './meal'

export interface UploadMealRequest {
  file: File
  userId?: string
}

export interface UploadMealResponse {
  mealId: string
  blobUrl: string
  uploadUrl: string
}

export interface GetMealsRequest {
  userId: string
  limit?: number
  offset?: number
}

export interface GetMealsResponse {
  meals: Meal[]
  total: number
}

export interface GetMealRequest {
  mealId: string
}

export interface GetMealResponse {
  meal: Meal
}

export interface EditFoodItemRequest {
  foodItemId: string
  name?: string
  portion?: string
  proteinGrams?: number
}

export interface EditFoodItemResponse {
  foodItem: any
  mealId: string
  newTotalProtein: number
}

export interface DeleteMealRequest {
  mealId: string
}

export interface DeleteMealResponse {
  success: boolean
  mealId: string
}
