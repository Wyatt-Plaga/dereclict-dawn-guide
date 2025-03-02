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
 * Union type of all possible game actions
 */
export type GameActions = 
  | ClickResourceAction
  | PurchaseUpgradeAction; 