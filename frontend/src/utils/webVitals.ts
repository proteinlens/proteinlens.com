/**
 * Web Vitals Integration
 * Feature 011: Observability
 * 
 * T027: Integrate web-vitals library
 * T028: Send Core Web Vitals to Application Insights
 * 
 * Tracks:
 * - LCP (Largest Contentful Paint) - loading performance
 * - FID (First Input Delay) - interactivity (deprecated, use INP)
 * - CLS (Cumulative Layout Shift) - visual stability
 * - FCP (First Contentful Paint) - initial render
 * - TTFB (Time to First Byte) - server response time
 * - INP (Interaction to Next Paint) - responsiveness (replaces FID)
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { getAppInsights, trackMetric, trackEvent } from './telemetry';

/**
 * Web Vitals metric rating thresholds
 * Based on Google's Core Web Vitals thresholds
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // milliseconds
  FID: { good: 100, poor: 300 },         // milliseconds
  CLS: { good: 0.1, poor: 0.25 },        // unitless
  FCP: { good: 1800, poor: 3000 },       // milliseconds
  TTFB: { good: 800, poor: 1800 },       // milliseconds
  INP: { good: 200, poor: 500 },         // milliseconds
};

type MetricName = keyof typeof THRESHOLDS;

/**
 * Get rating for a metric value
 */
function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Send a Web Vitals metric to Application Insights
 */
function sendToAppInsights(metric: Metric): void {
  const { name, value, id, rating, navigationType, delta } = metric;
  
  // Track as custom metric for aggregation
  trackMetric(`WebVitals.${name}`, value, {
    rating: rating || getRating(name as MetricName, value),
    navigationType: navigationType || 'unknown',
  });
  
  // Track as event for detailed analysis
  trackEvent('proteinlens.performance.web_vital', {
    metricName: name,
    metricId: id,
    rating: rating || getRating(name as MetricName, value),
    navigationType: navigationType || 'unknown',
  }, {
    value,
    ...(delta !== undefined && { delta }),
  });
  
  // Log in development for debugging
  if (import.meta.env.DEV) {
    const ratingEmoji = rating === 'good' ? '✅' : rating === 'poor' ? '❌' : '⚠️';
    console.log(`[WebVitals] ${ratingEmoji} ${name}: ${value.toFixed(2)} (${rating})`);
  }
}

/**
 * Initialize Web Vitals tracking
 * Must be called after telemetry initialization
 */
export function initWebVitals(): void {
  // Only initialize if browser supports Performance API
  if (typeof window === 'undefined' || !window.performance) {
    console.warn('[WebVitals] Performance API not available');
    return;
  }
  
  try {
    // Core Web Vitals
    onLCP(sendToAppInsights);
    onINP(sendToAppInsights);  // INP replaces FID as Core Web Vital
    onCLS(sendToAppInsights);
    
    // Other Web Vitals
    onFCP(sendToAppInsights);
    onTTFB(sendToAppInsights);
    // Note: FID is deprecated in web-vitals v4, use INP instead
    
    console.log('[WebVitals] Initialized - tracking LCP, INP, CLS, FCP, TTFB');
  } catch (error) {
    console.error('[WebVitals] Failed to initialize:', error);
  }
}

/**
 * Manual metric reporting for custom measurements
 */
export function reportCustomMetric(
  name: string,
  value: number,
  properties?: Record<string, string>
): void {
  trackMetric(`WebVitals.Custom.${name}`, value, properties);
}

/**
 * Report resource timing for specific resources
 * Useful for tracking individual asset load times
 */
export function reportResourceTiming(resourceName: string): void {
  if (typeof window === 'undefined' || !window.performance) return;
  
  const entries = performance.getEntriesByName(resourceName, 'resource');
  if (entries.length === 0) return;
  
  const entry = entries[entries.length - 1] as PerformanceResourceTiming;
  
  trackMetric('WebVitals.ResourceTiming', entry.duration, {
    resourceName,
    initiatorType: entry.initiatorType,
    transferSize: String(entry.transferSize),
  });
}

/**
 * Report long tasks (>50ms) that block the main thread
 */
export function observeLongTasks(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {  // Tasks longer than 50ms
          trackMetric('WebVitals.LongTask', entry.duration, {
            entryType: entry.entryType,
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // Long task observation not supported
    console.debug('[WebVitals] Long task observation not supported');
  }
}

/**
 * Get current Core Web Vitals summary (for debugging)
 */
export function getWebVitalsSummary(): void {
  console.group('[WebVitals Summary]');
  console.log('Thresholds:');
  Object.entries(THRESHOLDS).forEach(([name, { good, poor }]) => {
    console.log(`  ${name}: good ≤${good}, poor ≥${poor}`);
  });
  console.log('\nMetrics are tracked automatically and sent to Application Insights.');
  console.log('View in Azure Portal > Application Insights > Metrics > Custom Metrics');
  console.groupEnd();
}
