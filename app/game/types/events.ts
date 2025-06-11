import { GameState, RegionType } from './index';
import { GameCategory } from './actions';

export interface EventMap {
  'PURCHASE_UPGRADE': { state: GameState; category: GameCategory; upgradeType: string };
  'MARK_LOG_READ': { state: GameState; logId: string };
  'MARK_ALL_LOGS_READ': { state: GameState };
  'INITIATE_JUMP': { state: GameState };
  'COMPLETE_ENCOUNTER': { state: GameState; choiceId?: string };
  'START_COMBAT': { state: GameState; enemyId: string; regionId: RegionType };
  'COMBAT_ACTION': { state: GameState; actionId: string };
  'RETREAT_FROM_BATTLE': { state: GameState };
  'DISPATCH_ACTION': import('./actions').GameAction;
  'stateUpdated': GameState;
}

export type EventName = keyof EventMap; 