import { ActionSystem } from './ActionSystem';
import { EncounterSystem } from './EncounterSystem';
import { ResourceSystem } from './ResourceSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { LogSystem } from './LogSystem';
import { CombatSystem } from './CombatSystem';
import { EventBus } from '../core/EventBus';
import { GameState, RegionType } from '../types';
import { GameAction } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

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
   * Initialize all game systems
   */
  constructor(private eventBus: EventBus) {
    this.resource = new ResourceSystem();
    this.upgrade = new UpgradeSystem();
    this.log = new LogSystem();
    this.encounter = new EncounterSystem(eventBus);
    this.combat = new CombatSystem(eventBus);
    
    // Initialize the action system last since it depends on other systems
    this.action = new ActionSystem();
    
    // Set the manager reference in the ActionSystem
    this.action.setManager(this);
    
    // Configure system dependencies where needed
    this.setupSystemDependencies();
    this.setupEventListeners();
    
    // Initialize the game stats based on upgrades
    // This will be done during initialization when loading a game
  }

  /**
   * Set up dependencies between systems
   */
  private setupSystemDependencies() {
    // We're gradually moving away from direct dependencies 
    // and toward event-based communication, so this method will
    // eventually be removed
  }

  /**
   * Set up event listeners for cross-system communication
   */
  private setupEventListeners() {
    // Listen for resource change events and update resources accordingly
    this.eventBus.on('resourceChange', (data: {
      state: GameState;
      resourceType: string;
      amount: number;
      source: string;
    }) => {
      const { state, resourceType, amount, source } = data;
      
      // Update the resources based on the resourceType
      switch (resourceType) {
        case 'energy':
          state.categories.reactor.resources.energy = Math.min(
            state.categories.reactor.resources.energy + amount,
            state.categories.reactor.stats.energyCapacity
          );
          break;
        case 'insight':
          state.categories.processor.resources.insight = Math.min(
            state.categories.processor.resources.insight + amount,
            state.categories.processor.stats.insightCapacity
          );
          break;
        case 'crew':
          if (amount >= 1 || amount < 0) { // Only modify crew if adding at least 1 or removing any
            state.categories.crewQuarters.resources.crew = Math.min(
              state.categories.crewQuarters.resources.crew + (amount >= 1 ? Math.floor(amount) : amount),
              state.categories.crewQuarters.stats.crewCapacity
            );
          }
          break;
        case 'scrap':
          state.categories.manufacturing.resources.scrap = Math.min(
            state.categories.manufacturing.resources.scrap + amount,
            state.categories.manufacturing.stats.scrapCapacity
          );
          break;
        default:
          Logger.warn(
            LogCategory.RESOURCES,
            `Unknown resource type: ${resourceType}`,
            LogContext.NONE
          );
      }
    });

    // Listen for combat encounters triggered by the EncounterSystem
    this.eventBus.on('combatEncounterTriggered', (data: {
      state: GameState;
      enemyId: string;
      regionId: RegionType;
    }) => {
      const { state, enemyId, regionId } = data;
      if (enemyId && regionId) {
        this.combat.startCombatEncounter(state, enemyId, regionId);
      }
    });
  }

  /**
   * Update all game systems
   * @param state - Current game state
   * @param delta - Time since last update
   * @param automationHasPower - Optional flag indicating if automation has energy
   */
  update(state: GameState, delta: number, automationHasPower: boolean = true): void {
    // Update systems that depend on automation power status first
    this.resource.update(state, delta, automationHasPower);
    
    // Update other systems (order might matter)
    this.log.update(state, delta);
    // this.encounter.update(state, delta); // Removed - No update method
    // If there's an active combat, update it
    if (state.combat && state.combat.active) {
      this.combat.update(state, delta);
    }
  }

  /**
   * Process an action through the appropriate system
   */
  processAction(state: GameState, action: GameAction): GameState {
    // Pass action to the ActionSystem
    // Note: ActionSystem might need access to other systems via this manager
    return this.action.processAction(state, action);
  }
} 