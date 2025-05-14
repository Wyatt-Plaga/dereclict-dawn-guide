import { ActionSystem } from './ActionSystem';
import { EncounterSystem } from './EncounterSystem';
import { ResourceSystem } from './ResourceSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { LogSystem } from './LogSystem';
import { CombatSystem } from './CombatSystem';
import { EventBus } from 'core/EventBus';
import { GameState } from '../types';
import { GameActions } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { ResourceManager } from 'core/managers/ResourceManager';
import { CombatEncounterManager } from 'core/managers/CombatEncounterManager';
import { IGameSystem } from './IGameSystem';

/**
 * GameSystemManager
 * 
 * Manages all game systems and their interactions
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
   * Resource manager
   */
  public resourceManager: ResourceManager;

  /**
   * Combat encounter manager
   */
  public combatEncounterManager: CombatEncounterManager;

  /**
   * Internal list of systems that expose an update(delta) method. Enables generic iteration.
   */
  private systemsList: IGameSystem[] = [];

  /**
   * Initialize all game systems
   */
  constructor(private eventBus: EventBus) {
    this.resource = new ResourceSystem(eventBus);
    this.upgrade = new UpgradeSystem();
    this.log = new LogSystem();
    this.encounter = new EncounterSystem(eventBus);
    this.combat = new CombatSystem(eventBus);
    
    // Initialize the action system last since it depends on other systems
    this.action = new ActionSystem(eventBus);
    
    // Set the manager reference in the ActionSystem
    this.action.setManager(this);
    
    // Configure system dependencies where needed (now handled by dedicated managers)
    // this.setupSystemDependencies();
    // this.setupEventListeners();
    
    // Initialize the game stats based on upgrades
    // This will be done during initialization when loading a game

    // Create resource manager to handle resourceChange events
    this.resourceManager = new ResourceManager(eventBus);

    this.combatEncounterManager = new CombatEncounterManager(eventBus, this.combat);

    // Register updatable systems
    this.systemsList.push(this.resource);
    this.systemsList.push(this.log);
    this.systemsList.push(this.combat);
  }

  /**
   * Update all game systems
   * @param state - Current game state
   * @param delta - Time since last update
   * @param automationHasPower - Optional flag indicating if automation has energy
   */
  update(state: GameState, delta: number, automationHasPower: boolean = true): void {
    // Allow ResourceSystem to know about power status separately
    if (this.resource.update.length === 3) {
      (this.resource as any).update(state, delta, automationHasPower);
    }

    // Generic update over registered systems (order: resource already called, others follow)
    this.systemsList.forEach(sys => {
      if (sys !== this.resource) {
        sys.update(state, delta);
      }
    });
  }

  /**
   * Process an action through the appropriate system
   */
  processAction(state: GameState, action: GameActions): GameState {
    // Pass action to the ActionSystem
    // Note: ActionSystem might need access to other systems via this manager
    return this.action.processAction(state, action);
  }
} 