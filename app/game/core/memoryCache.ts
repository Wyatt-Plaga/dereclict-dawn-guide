import { GameState } from '../types';

/**
 * Memory cache for preserving game state during in-app navigation
 * 
 * This provides immediate state availability while the persistent
 * storage is still loading, preventing UI flicker.
 */

// In-memory store that persists between route changes
let cachedGameState: GameState | null = null;

// Window-level cache for improved resilience during development
if (typeof window !== 'undefined') {
  // @ts-expect-error - Using a non-standard property
  if (window.__GAME_STATE_CACHE__) {
    // @ts-expect-error
    cachedGameState = window.__GAME_STATE_CACHE__;
  }
}

/**
 * Get the cached game state, if available
 */
export function getCachedState(): GameState | null {
  return cachedGameState;
}

/**
 * Cache the current game state for quick access
 */
export function cacheState(state: GameState): void {
  // Store in module-level variable for in-app navigation
  cachedGameState = JSON.parse(JSON.stringify(state));
  
  // Also store in window object for more resilience
  if (typeof window !== 'undefined') {
    // @ts-expect-error
    window.__GAME_STATE_CACHE__ = JSON.parse(JSON.stringify(state));
  }
} 