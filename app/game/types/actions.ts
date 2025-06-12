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
 * Triggered when a player initiates a jump to start an encounter
 */
export interface InitiateJumpAction extends GameAction {
  type: 'INITIATE_JUMP';
}

/**
 * Complete Encounter Action
 * Triggered when a player completes an encounter
 */
export interface CompleteEncounterAction extends GameAction {
  type: 'COMPLETE_ENCOUNTER';
  payload?: {
    choiceId?: string;
  };
}

/**
 * Select Region Action
 * Triggered when a player selects a region to navigate to
 */
export interface SelectRegionAction extends GameAction {
  type: 'SELECT_REGION';
  payload: {
    region: string;
  };
}

/**
 * Make Story Choice Action
 * Triggered when a player makes a story choice
 */
export interface MakeStoryChoiceAction extends GameAction {
  type: 'MAKE_STORY_CHOICE';
  payload: {
    choiceId: string;
  };
}

/**
 * Enemy Action Resolve
 * Triggered internally by the UI after the enemy has finished charging
 */
export interface EnemyActionResolveAction extends GameAction {
  type: 'ENEMY_ACTION_RESOLVE';
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
  | CompleteEncounterAction
  | SelectRegionAction
  | MakeStoryChoiceAction
  | EnemyActionResolveAction; 