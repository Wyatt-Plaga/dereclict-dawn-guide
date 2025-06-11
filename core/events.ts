import { GameState } from '@/app/game/types';
import { RegionType } from '@/app/game/types/combat';
import { ActionMap } from '@/app/game/actions';

// Legacy / core event definitions (non-action events)
interface CoreEventMap {
  stateUpdated: GameState;
  resourceChange: { state: GameState; resourceType: string; amount: number; source: string };
  combatEncounterTriggered: { state: GameState; enemyId: string; regionId: RegionType; subRegionId?: string };
  resourceClick: { state: GameState; category: string };
  // Modular action events (pre-Phase-5 names – will be removed later)
  combatAction: { state: GameState; actionId: string };
  retreatFromBattle: { state: GameState };
  storyChoice: { state: GameState; choiceId?: string };
  adjustAutomation: {
    state: GameState;
    category: string;
    automationType: string;
    direction: 'increase' | 'decrease';
  };
  purchaseUpgrade: {
    state: GameState;
    category: string;
    upgradeType: string;
  };
  markLogRead: { state: GameState; logId: string };
  markAllLogsRead: { state: GameState };
  // Cross-system lifecycle events
  combatEnded: { state: GameState; outcome: 'victory' | 'defeat' | 'retreat'; enemyId?: string };
  encounterCompleted: {
    state: GameState;
    encounterId: string;
    encounterType: string;
    result: string;
  };
  upgradePurchased: {
    state: GameState;
    category: string;
    upgradeType: string;
  };
  initiateJump: { state: GameState };
}

// ---------------------------------------------------------------------------
// New domain events – produced by systems, consumed by any interested listener
// ---------------------------------------------------------------------------

export const GameDomainEvents = {
  // Storage changed in any entity. Positive = gain, negative = spend.
  'resource:changed': {} as { entityId: string; delta: number; state?: GameState },
  // An upgrade level was purchased.
  'upgrade:purchased': {} as { entityId: string; upgradeId: string; newLevel: number; state?: GameState },
  // Combat finished
  'combat:ended': {} as { victory: boolean; enemyId?: string; state?: GameState },
} as const;

export type GameDomainEventMap = {
  [K in keyof typeof GameDomainEvents]: (typeof GameDomainEvents)[K]
};

// ---------------------------------------------------------------------------
// Unified event map: core events PLUS the new namespaced action events.
// ---------------------------------------------------------------------------
export type GameEventMap = CoreEventMap & ActionMap & GameDomainEventMap; 
