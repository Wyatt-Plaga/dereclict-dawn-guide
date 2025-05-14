import { GameState } from '@/app/game/types';
import { RegionType } from '@/app/game/types/combat';
import { GameActions } from '@/app/game/types/actions';

export interface GameEventMap {
  stateUpdated: GameState;
  resourceChange: { state: GameState; resourceType: string; amount: number; source: string };
  combatEncounterTriggered: { state: GameState; enemyId: string; regionId: RegionType; subRegionId?: string };
  resourceClick: { state: GameState; category: string };
  // Modular action events (Phase 5)
  combatAction: { state: GameState; actionId: string };
  retreatFromBattle: { state: GameState };
  storyChoice: { state: GameState; choiceId?: string };
  adjustAutomation: {
    state: GameState;
    category: string;
    automationType: string;
    direction: 'increase' | 'decrease';
  };
  DISPATCH_ACTION: GameActions;
} 