import { GameState } from '../types';
import { GameAction } from '../types/actions';
import { ResourceSystem } from './ResourceSystem';
import { ActionSystem } from './ActionSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { LogSystem } from './LogSystem';
import { EncounterSystem } from './EncounterSystem';

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
   * Upgrade management system
   */
  public upgrade: UpgradeSystem;

  /**
   * Log management system
   */
  public log: LogSystem;

  /**
   * Encounter management system
   */
  public encounter: EncounterSystem;

  /**
   * Initialize all game systems
   */
  constructor() {
    this.resource = new ResourceSystem();
    this.upgrade = new UpgradeSystem();
    this.log = new LogSystem();
    this.encounter = new EncounterSystem();
    
    // Initialize the action system last since it depends on other systems
    this.action = new ActionSystem();
    
    // Set the manager reference in the ActionSystem
    this.action.setManager(this);
    
    // Initialize the game stats based on upgrades
    // This will be done during initialization when loading a game
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
    
    // Check for unlockable logs
    this.log.update(state, delta);
    
    // In the future, we'll add more system updates here
    // this.upgrade.update(state, delta);
    // this.achievement.update(state, delta);
    // etc.
  }
  
  /**
   * Process an action through the action system
   * 
   * @param state Current game state
   * @param action Action to process
   * @returns Updated game state
   */
  processAction(state: GameState, action: GameAction): GameState {
    return this.action.processAction(state, action);
  }
} 