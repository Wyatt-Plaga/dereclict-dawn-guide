import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * A custom hook that creates a debounced version of a function.
 * 
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @param dependencies Array of dependencies that should trigger recreation of the debounced function
 * @returns A debounced version of the callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: any[] = []
): (...args: Parameters<T>) => void {
  // Use refs to store the callback and timer between renders
  const callbackRef = useRef(callback);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update the callback ref whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Create a memoized debounced function
  return useCallback(
    (...args: Parameters<T>) => {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new timer
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies, delay]
  );
}

/**
 * A hook that debounces a value, returning a stable reference that only changes
 * after the specified delay has elapsed without the value changing again.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
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

/**
 * A hook that returns true for a specified duration after a value changes.
 * Useful for showing loading indicators during debounced operations.
 * 
 * @param value The value to watch
 * @param duration The duration to show the indicator for (in ms)
 * @returns Whether the indicator should be shown
 */
export function useDebounceIndicator<T>(value: T, duration: number = 500): boolean {
  const [indicator, setIndicator] = useState(false);
  
  useEffect(() => {
    setIndicator(true);
    
    const timer = setTimeout(() => {
      setIndicator(false);
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, duration]);
  
  return indicator;
} 