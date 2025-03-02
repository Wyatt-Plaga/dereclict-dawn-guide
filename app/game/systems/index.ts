import { GameState } from '../types';
import { GameAction } from '../types/actions';
import { ResourceSystem } from './ResourceSystem';
import { ActionSystem } from './ActionSystem';

/**
 * GameSystemManager
 * 
 * Coordinates all game systems and provides a central access point.
 * Think of this as the management team that coordinates all departments.
 */
export class GameSystemManager {
  /**
   * Resource production system
   */
  public resource: ResourceSystem;
  
  /**
   * Action handling system
   */
  public action: ActionSystem;

  /**
   * Initialize all game systems
   */
  constructor() {
    this.resource = new ResourceSystem();
    this.action = new ActionSystem();
  }

  /**
   * Update all systems
   * 
   * @param state - Current game state
   * @param delta - Time passed in seconds
   */
  update(state: GameState, delta: number) {
    // Update resources based on production rates
    this.resource.update(state, delta);
    
    // In the future, we'll add more system updates here
    // this.upgrade.update(state, delta);
    // this.achievement.update(state, delta);
    // etc.
  }
  
  /**
   * Process a game action
   * 
   * @param state - Current game state
   * @param action - Action to process
   */
  processAction(state: GameState, action: GameAction) {
    this.action.processAction(state, action);
  }
} 