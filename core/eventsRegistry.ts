// Canonical event registry introduced in Phase 3 hardening.
// Keys follow kebab-case `feature:verb` pattern.

import type { GameState } from '@/app/game/types';
import type { RegionType } from '@/app/game/types/combat';

export type EventMap = {
  'resource:changed': { category: string; delta: number; state: GameState }; // emitted by ResourceSystem
  'upgrade:purchased': { category: string; upgrade: string; newLevel?: number; state: GameState };
  'encounter:completed': { encounterId: string; result: string; state: GameState };
  'combat:started': { enemyId: string; region: RegionType; state: GameState };
  'combat:ended': { victory: boolean; enemyId?: string; state: GameState };
  // add more granular keys as refactors progress
};

export type EventKey = keyof EventMap; 
