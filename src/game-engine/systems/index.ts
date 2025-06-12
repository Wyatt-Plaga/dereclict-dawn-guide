import { GameState } from '../types';
import { GameAction } from '../types/actions';
import { ResourceSystem } from './ResourceSystem';
import { ActionSystem } from './ActionSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { LogSystem } from './LogSystem';
import { EncounterSystem } from './EncounterSystem';
import { CombatSystem } from './CombatSystem';

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
   * Combat management system
   */
  public combat: CombatSystem;

  /**
   * Initialize all game systems
   */
  constructor(eventBus?: import('../core/EventBus').EventBus<import('../types/events').EventMap>) {
    // Share one EventBus instance across all systems
    this.resource = new ResourceSystem();
    this.upgrade = new UpgradeSystem(eventBus);
    this.log = new LogSystem(eventBus);
    this.encounter = new EncounterSystem(eventBus);
    this.combat = new CombatSystem(eventBus);
    
    // Initialize the action system last since it depends on other systems
    this.action = new ActionSystem(eventBus);
    
    // Dependency injection
    this.combat.setResourceSystem(this.resource);
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
    
    // If there's an active combat, update it
    if (state.combat && state.combat.active) {
      this.combat.update(state, delta);
    }
    
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
