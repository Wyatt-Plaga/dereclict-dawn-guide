/**
 * Action Types
 * 
 * These are all the possible actions that can be dispatched to modify the game state.
 * Think of these as the different types of requests that can be made.
 */

/**
 * Categories in the game
 */
export type GameCategory = 'reactor' | 'processor' | 'crewQuarters' | 'manufacturing';

/**
 * Base Action interface
 * All actions must have a type
 */
export interface GameAction {
  type: string;
  payload?: any;
}

/**
 * Click Resource Action
 * Triggered when the player clicks on a resource generator button
 */
export interface ClickResourceAction extends GameAction {
  type: 'CLICK_RESOURCE';
  payload: {
    category: GameCategory;
  };
}

/**
 * Purchase Upgrade Action
 * Triggered when the player buys an upgrade
 */
export interface PurchaseUpgradeAction extends GameAction {
  type: 'PURCHASE_UPGRADE';
  payload: {
    category: GameCategory;
    upgradeType: string;
  };
}

/**
 * Mark Log as Read Action
 * Triggered when a player views a log
 */
export interface MarkLogReadAction extends GameAction {
  type: 'MARK_LOG_READ';
  payload: {
    logId: string;
  };
}

/**
 * Mark All Logs as Read Action
 * Triggered when a player clicks "Mark All as Read"
 */
export interface MarkAllLogsReadAction extends GameAction {
  type: 'MARK_ALL_LOGS_READ';
}

/**
 * Initiate Jump Action
 * Triggered when player initiates a jump in navigation
 */
export interface InitiateJumpAction extends GameAction {
  type: 'INITIATE_JUMP';
  payload: {
    fromRegion: string;
    toRegion?: string; // Optional, if not provided, will be randomly selected
  };
}

/**
 * Start Combat Action
 * Triggered when an encounter is generated
 */
export interface StartCombatAction extends GameAction {
  type: 'START_COMBAT';
  payload: {
    enemyId: string;
    regionId: string;
  };
}

/**
 * Perform Combat Action
 * Triggered when player uses a combat ability
 */
export interface PerformCombatAction extends GameAction {
  type: 'PERFORM_COMBAT_ACTION';
  payload: {
    actionId: string;
  };
}

/**
 * End Combat Action
 * Triggered when combat ends
 */
export interface EndCombatAction extends GameAction {
  type: 'END_COMBAT';
  payload: {
    outcome: 'victory' | 'defeat' | 'retreat';
  };
}

/**
 * Retreat from Combat Action
 * Triggered when player chooses to retreat
 */
export interface RetreatFromCombatAction extends GameAction {
  type: 'RETREAT_FROM_COMBAT';
}

/**
 * Select Region Action
 * Triggered when player selects a region to jump to
 */
export interface SelectRegionAction extends GameAction {
  type: 'SELECT_REGION';
  payload: {
    regionId: string;
  };
}

/**
 * Union type of all possible game actions
 */
export type GameActions = 
  | ClickResourceAction
  | PurchaseUpgradeAction
  | MarkLogReadAction
  | MarkAllLogsReadAction
  | InitiateJumpAction
  | StartCombatAction
  | PerformCombatAction
  | EndCombatAction
  | RetreatFromCombatAction
  | SelectRegionAction; 