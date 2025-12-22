/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get animation variants that respect user preferences
 */
export const getPageVariants = () => {
  const reduced = prefersReducedMotion()
  
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, y: -20 }
  }
}

/**
 * Get transition settings that respect user preferences
 */
export const getPageTransition = () => {
  const reduced = prefersReducedMotion()
  
  return {
    duration: reduced ? 0.15 : 0.3,
    ease: 'easeInOut'
  }
}

/**
 * Get card animation variants
 */
export const getCardVariants = () => {
  const reduced = prefersReducedMotion()
  
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 }
  }
}

/**
 * Get hover/tap scale values
 */
export const getInteractionScale = () => {
  const reduced = prefersReducedMotion()
  
  return {
    hover: reduced ? 1 : 1.01,
    tap: reduced ? 1 : 0.99
  }
}

/**
 * Get stagger animation settings
 */
export const getStaggerSettings = () => {
  const reduced = prefersReducedMotion()
  
  return {
    staggerChildren: reduced ? 0 : 0.1
  }
}
