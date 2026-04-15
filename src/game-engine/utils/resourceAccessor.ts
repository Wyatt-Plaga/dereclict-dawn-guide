import { GameState } from '../types';
import { findResourceDef } from '../content/wingResources';

/**
 * Maps a resource id (e.g. 'energy', 'fuelRods', 'relics') to its storage
 * location in GameState. Wing resources delegate to findResourceDef so new
 * resource definitions are picked up automatically.
 */
export function getResourceAccessor(
  state: GameState,
  resourceType: string
): { obj: Record<string, number>; key: string } | null {
  if (resourceType === 'relics') {
    return { obj: state as unknown as Record<string, number>, key: 'relics' };
  }

  const def = findResourceDef(resourceType);
  if (!def) return null;

  return {
    obj: state.categories[def.wing.id].resources as unknown as Record<string, number>,
    key: def.slot,
  };
}
