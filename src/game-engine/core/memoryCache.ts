import { GameState } from '../types';

declare global {
  interface Window {
    __GAME_STATE_CACHE__?: GameState;
  }
}

let cachedGameState: GameState | null = null;

if (typeof window !== 'undefined' && window.__GAME_STATE_CACHE__) {
  cachedGameState = window.__GAME_STATE_CACHE__;
}

export function getCachedState(): GameState | null {
  return cachedGameState;
}

export function cacheState(state: GameState): void {
  cachedGameState = state;

  if (typeof window !== 'undefined') {
    window.__GAME_STATE_CACHE__ = state;
  }
}

export function clearCachedState(): void {
  cachedGameState = null;

  if (typeof window !== 'undefined') {
    window.__GAME_STATE_CACHE__ = undefined;
  }
}
