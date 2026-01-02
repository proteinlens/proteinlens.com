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
}

interface PublicMealData {
  shareId: string;
  uploadedAt: string;
  imageUrl: string;
  totalProtein: number;
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
    const response = await fetch(`${API_PATH}/meals/${shareId}/public`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br', // Enable compression
      },
    });
    
    if (response.status === 404) {
      throw new Error('not-found');
    }
    
    if (response.status === 403) {
      throw new Error('private');
    }
    
    if (!response.ok) {
      throw new Error('error');
    }
    
    const result = await response.json();
    // API returns { meal: {...} }, extract the meal object
    return result.meal || result;
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
      setLoadingState('not-found');
      return;
    }

    fetchPublicMeal(shareId)
      .then((data) => {
        setMeal(data);
        setLoadingState('success');
      })
      .catch((err) => {
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

  // Success state - show the meal
  if (!meal) {
    return null; // Safety check
  }

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
            {/* Protein Badge */}
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground font-bold text-lg shadow-lg">
                {meal.totalProtein}g protein
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
                    className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-foreground">{food.name}</div>
                      <div className="text-sm text-muted-foreground">{food.portion}</div>
                    </div>
                    <div className="font-semibold text-primary">{food.protein}g</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-3 px-4 bg-primary/10 rounded-xl border border-primary/20">
              <span className="font-semibold text-foreground">Total Protein</span>
              <span className="text-2xl font-bold text-primary">{meal.totalProtein}g</span>
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

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Track Your Protein Intake
            </h2>
            <p className="text-muted-foreground mb-4">
              Snap a photo of any meal and get instant AI-powered protein analysis.
              Free, no signup required!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
            >
              📸 Analyze Your Meal
            </Link>
          </div>
        </motion.div>

        {/* Attribution */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Analyzed by <Link to="/" className="text-primary hover:underline">ProteinLens</Link> AI</p>
        </div>
      </main>
    </div>
  );
}

export default React.memo(SharedMealPage);
