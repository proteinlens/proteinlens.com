/**
 * Feature 017: Public Shared Meal Page
 * T021: Display shared meals to anyone (no auth required)
 * 
 * This page renders when someone clicks a shared meal URL.
 * Shows meal analysis results without requiring login.
 * Optimized for fast loading with caching and prefetching.
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from '../components/Skeleton';

interface FoodItem {
  name: string;
  portion: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface PublicMealData {
  shareId: string;
  uploadedAt: string;
  imageUrl: string;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
  confidence: 'high' | 'medium' | 'low';
  foods: FoodItem[];
  proTip?: string;
  dietStyleAtScan?: {
    name: string;
    slug: string;
  } | null;
}

type LoadingState = 'loading' | 'success' | 'error' | 'not-found' | 'private';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.proteinlens.com';
const API_PATH = `${API_BASE_URL}/api`;

async function fetchPublicMeal(shareId: string): Promise<PublicMealData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    console.log('[SharedMealPage] Fetching meal:', shareId);
    const response = await fetch(`${API_PATH}/meals/${shareId}/public`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br', // Enable compression
      },
    });
    
    console.log('[SharedMealPage] Response status:', response.status);
    
    if (response.status === 404) {
      console.log('[SharedMealPage] Meal not found');
      throw new Error('not-found');
    }
    
    if (response.status === 403) {
      console.log('[SharedMealPage] Meal is private');
      throw new Error('private');
    }
    
    if (!response.ok) {
      console.error('[SharedMealPage] Response not ok:', response.status, response.statusText);
      throw new Error('error');
    }
    
    const result = await response.json();
    console.log('[SharedMealPage] Response data:', result);
    
    // API returns { meal: {...} }, extract the meal object
    const meal = result.meal || result;
    console.log('[SharedMealPage] Extracted meal:', meal);
    
    return meal;
  } catch (error) {
    console.error('[SharedMealPage] Fetch error:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function SharedMealPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [meal, setMeal] = useState<PublicMealData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      console.log('[SharedMealPage] No shareId provided');
      setLoadingState('not-found');
      return;
    }

    console.log('[SharedMealPage] Starting fetch for shareId:', shareId);
    fetchPublicMeal(shareId)
      .then((data) => {
        console.log('[SharedMealPage] Fetch success, setting meal:', data);
        setMeal(data);
        setLoadingState('success');
      })
      .catch((err) => {
        console.error('[SharedMealPage] Fetch catch:', err.message, err);
        if (err.message === 'not-found') {
          setLoadingState('not-found');
        } else if (err.message === 'private') {
          setLoadingState('private');
        } else {
          setError(err.message);
          setLoadingState('error');
        }
      });
  }, [shareId]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return '✓ High Confidence';
      case 'medium':
        return '~ Medium Confidence';
      case 'low':
        return '! Low Confidence';
      default:
        return 'Unknown';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Loading state - Show skeleton for faster perceived load
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥩</span>
              <span className="font-bold text-lg text-foreground">ProteinLens</span>
            </div>
            <Skeleton width={140} height={40} borderRadius="8px" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* Meal Image Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
          >
            <Skeleton width="100%" height={320} borderRadius="0" className="w-full" />
            
            {/* Protein Badge Skeleton */}
            <div className="absolute top-4 left-4">
              <Skeleton width={140} height={32} borderRadius="20px" />
            </div>
          </motion.div>

          {/* Content Skeleton */}
          <div className="mt-6 space-y-4">
            <Skeleton width="100%" height={24} />
            <Skeleton width="80%" height={24} />
            <Skeleton width="100%" height={200} />
          </div>

          {/* Loading text */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground">Loading shared meal...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (loadingState === 'not-found') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Meal Not Found - ProteinLens</title>
        </Helmet>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Meal Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This meal may have been deleted or the link might be incorrect.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Try ProteinLens
          </Link>
        </div>
      </div>
    );
  }

  // Private meal state
  if (loadingState === 'private') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Private Meal - ProteinLens</title>
        </Helmet>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">This Meal is Private</h1>
          <p className="text-muted-foreground mb-6">
            The owner has made this meal private. You can scan your own meals for free!
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Scan Your Meal
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error' || !meal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Error - ProteinLens</title>
        </Helmet>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Something Went Wrong</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'Failed to load the shared meal. Please try again later.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Go to ProteinLens
          </Link>
        </div>
      </div>
    );
  }

  // Success state - show the meal (loadingState === 'success' and meal is defined)
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags and Performance Optimization */}
      <Helmet>
        <title>{meal.totalProtein}g Protein Meal - ProteinLens</title>
        <meta 
          name="description" 
          content={`This meal contains ${meal.totalProtein}g of protein from ${meal.foods.length} foods. Analyzed by ProteinLens AI.`} 
        />
        <meta property="og:title" content={`${meal.totalProtein}g Protein Meal - ProteinLens`} />
        <meta property="og:description" content={`Analyzed meal with ${meal.totalProtein}g protein and ${meal.foods.length} foods`} />
        <meta property="og:image" content={meal.imageUrl} />
        
        {/* Performance: Preload critical resources */}
        <link rel="preload" as="image" href={meal.imageUrl} />
        <link rel="dns-prefetch" href={API_BASE_URL} />
        <link rel="preconnect" href={API_BASE_URL} crossOrigin="anonymous" />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🥩</span>
            <span className="font-bold text-lg text-foreground">ProteinLens</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Scan Your Meal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Meal Image */}
          <div className="relative aspect-video bg-muted">
            <img
              src={meal.imageUrl}
              alt="Shared meal"
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Calories Badge */}
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground font-bold text-lg shadow-lg">
                {meal.totalCalories} cal
              </div>
            </div>
            {/* Confidence Badge */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1.5 rounded-full border backdrop-blur-sm text-sm font-medium ${getConfidenceColor(meal.confidence)}`}>
                {getConfidenceLabel(meal.confidence)}
              </div>
            </div>
          </div>

          {/* Meal Details */}
          <div className="p-6 space-y-6">
            {/* Timestamp */}
            <div className="text-sm text-muted-foreground">
              Scanned on {formatDate(meal.uploadedAt)}
            </div>

            {/* Foods List */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Food Items</h2>
              <div className="space-y-2">
                {meal.foods.map((food, index) => (
                  <div
                    key={index}
                    className="py-3 px-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-foreground">{food.name}</div>
                        <div className="text-sm text-muted-foreground">{food.portion}</div>
                      </div>
                      <div className="font-semibold text-primary">{food.calories} cal</div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">P: <span className="font-medium text-foreground">{food.protein}g</span></span>
                      <span className="text-muted-foreground">C: <span className="font-medium text-foreground">{food.carbs}g</span></span>
                      <span className="text-muted-foreground">F: <span className="font-medium text-foreground">{food.fat}g</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Macros */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{meal.totalCalories} cal</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                  <div className="text-lg font-bold text-foreground">{meal.totalProtein}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                  <div className="text-lg font-bold text-foreground">{meal.totalCarbs}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                  <div className="text-lg font-bold text-foreground">{meal.totalFat}g</div>
                </div>
              </div>
            </div>

            {/* Pro Tip / Notes */}
            {meal.proTip && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <div className="font-medium text-amber-400 mb-1">Pro Tip</div>
                    <p className="text-sm text-muted-foreground">{meal.proTip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Diet Style Badge */}
            {meal.dietStyleAtScan && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🍽️</span>
                <span>Diet: {meal.dietStyleAtScan.name}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA Section - Feature 017 Viral Loop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-2 text-center">
              Try This on Your Meal
            </h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Get instant protein analysis for any meal. Free, no signup required!
            </p>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-colors text-center"
            >
              📸 Scan Your Meal
            </Link>
          </div>

          {/* Watermark - Strava style */}
          <div className="text-center mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Analyzed with <span className="font-semibold text-foreground">ProteinLens</span> 🥩
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default React.memo(SharedMealPage);
