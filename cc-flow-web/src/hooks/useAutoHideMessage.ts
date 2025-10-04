import { useState, useEffect } from 'react';

/**
 * Custom hook for auto-hiding messages with smooth animation
 *
 * This hook manages a two-state animation system:
 * 1. `isVisible` - Controls DOM presence (mount/unmount)
 * 2. `isAnimating` - Controls CSS transition state (opacity, height, etc.)
 *
 * @param trigger - Boolean trigger to show the message (usually based on data availability)
 * @param duration - Total duration in milliseconds before hiding (default: 5000ms)
 * @returns Object containing `isVisible` (DOM presence) and `isAnimating` (CSS state)
 *
 * @example
 * ```tsx
 * const { isVisible, isAnimating } = useAutoHideMessage(!!successData, 5000);
 *
 * {isVisible && (
 *   <div className={isAnimating ? 'opacity-100' : 'opacity-0'}>
 *     Success message
 *   </div>
 * )}
 * ```
 */
export function useAutoHideMessage(trigger: boolean, duration = 5000) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      // Show the message
      setIsVisible(true);
      // Trigger animation after small delay
      setTimeout(() => setIsAnimating(true), 10);

      // Start fade out animation
      const fadeOutTimer = setTimeout(() => {
        setIsAnimating(false);
      }, duration - 500);

      // Remove from DOM after animation completes
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [trigger, duration]);

  return { isVisible, isAnimating };
}
