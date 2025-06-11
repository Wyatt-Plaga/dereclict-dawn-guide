/**
 * Result type for better error handling
 * 
 * Represents either a successful result with a value,
 * or a failure with an error. This pattern makes error
 * handling explicit and type-safe.
 */

export type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Helper functions for working with Result types
 */
export const Result = {
  /**
   * Create a successful result
   */
  ok<T>(value: T): Result<T> {
    return { success: true, value };
  },

  /**
   * Create a failed result
   */
  err<E = Error>(error: E): Result<never, E> {
    return { success: false, error };
  },

  /**
   * Check if a result is successful
   */
  isOk<T, E>(result: Result<T, E>): result is { success: true; value: T } {
    return result.success;
  },

  /**
   * Check if a result is an error
   */
  isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return !result.success;
  },

  /**
   * Map a successful value to a new value
   */
  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    if (result.success) {
      return { success: true, value: fn(result.value) };
    }
    return { success: false, error: result.error };
  },

  /**
   * Chain operations that might fail
   */
  flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
    if (result.success) {
      return fn(result.value);
    }
    return result;
  },

  /**
   * Provide a default value for errors
   */
  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (result.success) {
      return result.value;
    }
    return defaultValue;
  }
}; 