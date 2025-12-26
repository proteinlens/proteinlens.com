/**
 * useDebounce Hook
 * Feature 010 - User Signup Process
 * 
 * Debounces a value to reduce unnecessary updates.
 * Used for real-time validation with 300ms delay.
 */

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the value that only updates
 * after the specified delay has passed without changes.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
