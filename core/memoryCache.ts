// Re-export existing memoryCache; moved from app/game/core
export const CACHE_KEY = '__APP_GAME_STATE_CACHE__';

export function cacheState(state: any) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {}
}

export function getCachedState(): any | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
} 