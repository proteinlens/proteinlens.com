/**
 * T084: Loading skeleton components for better UX
 * Provides visual placeholders while content is loading
 */

import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

/**
 * Base skeleton block component
 */
export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '' 
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }}
    />
  );
}

/**
 * Skeleton for text content
 */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? '60%' : '100%'} 
          height="1rem" 
          className="skeleton-text__line"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for a single food item in analysis results
 */
export function SkeletonFoodItem() {
  return (
    <div className="skeleton-food-item">
      <div className="skeleton-food-item__details">
        <Skeleton width="60%" height="1.1rem" className="skeleton-food-item__name" />
        <Skeleton width="40%" height="0.9rem" className="skeleton-food-item__portion" />
      </div>
      <Skeleton width="60px" height="1.3rem" className="skeleton-food-item__protein" />
    </div>
  );
}

/**
 * Skeleton for the entire analysis results card
 */
export function SkeletonAnalysisResults() {
  return (
    <div className="skeleton-analysis">
      {/* Image placeholder */}
      <div className="skeleton-analysis__image">
        <Skeleton width="100%" height="200px" borderRadius="8px" />
      </div>

      {/* Total protein card */}
      <div className="skeleton-analysis__total">
        <Skeleton width="120px" height="4rem" className="skeleton-analysis__protein-value" />
        <Skeleton width="80px" height="1rem" />
      </div>

      {/* Confidence badge */}
      <div className="skeleton-analysis__confidence">
        <Skeleton width="100px" height="2rem" borderRadius="2rem" />
      </div>

      {/* Food items list */}
      <div className="skeleton-analysis__foods">
        <Skeleton width="150px" height="1.5rem" className="skeleton-analysis__title" />
        <SkeletonFoodItem />
        <SkeletonFoodItem />
        <SkeletonFoodItem />
      </div>

      {/* AI notes */}
      <div className="skeleton-analysis__notes">
        <Skeleton width="100px" height="1rem" className="skeleton-analysis__notes-title" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

/**
 * Skeleton for pricing card
 */
export function SkeletonPricingCard() {
  return (
    <div className="skeleton-pricing-card">
      <Skeleton width="60%" height="1.5rem" className="skeleton-pricing-card__name" />
      <Skeleton width="40%" height="2.5rem" className="skeleton-pricing-card__price" />
      <div className="skeleton-pricing-card__features">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width="90%" height="1rem" className="skeleton-pricing-card__feature" />
        ))}
      </div>
      <Skeleton width="100%" height="44px" borderRadius="8px" className="skeleton-pricing-card__button" />
    </div>
  );
}

/**
 * Skeleton for history list item
 */
export function SkeletonHistoryItem() {
  return (
    <div className="skeleton-history-item">
      <Skeleton width="60px" height="60px" borderRadius="8px" className="skeleton-history-item__image" />
      <div className="skeleton-history-item__content">
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="50%" height="0.9rem" />
      </div>
      <Skeleton width="50px" height="1.2rem" className="skeleton-history-item__protein" />
    </div>
  );
}

/**
 * Skeleton for meal history list
 */
export function SkeletonMealHistory({ count = 5 }: { count?: number }) {
  return (
    <div className="skeleton-meal-history">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonHistoryItem key={i} />
      ))}
    </div>
  );
}

/**
 * Full-page loading skeleton
 */
export function SkeletonPage() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-page__header">
        <Skeleton width="200px" height="2rem" />
        <Skeleton width="100px" height="36px" borderRadius="8px" />
      </div>
      <div className="skeleton-page__content">
        <SkeletonAnalysisResults />
      </div>
    </div>
  );
}
