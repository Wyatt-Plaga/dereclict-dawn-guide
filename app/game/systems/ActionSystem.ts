import { GameState, RegionType } from '../types';
import { GameAction, GameActions, GameCategory } from '../types/actions';
import { GameSystemManager } from './index';
import { UpgradeSystem } from './UpgradeSystem';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

/**
 * ActionSystem
 * 
 * Processes user actions and updates the game state accordingly.
 * Think of this as the customer service department that handles requests.
 */
export class ActionSystem {
  /**
   * Reference to the GameSystemManager
   * This will be set when the ActionSystem is created by the GameSystemManager
   */
  private manager: GameSystemManager | null = null;

  /**
   * Set the GameSystemManager reference
   */
  setManager(manager: GameSystemManager): void {
    this.manager = manager;
    Logger.debug(LogCategory.ACTIONS, "ActionSystem manager set", LogContext.STARTUP);
  }

  /**
   * Process a game action and update the state accordingly
   */
  processAction(state: GameState, action: GameAction): GameState {
    Logger.debug(
      LogCategory.ACTIONS,
      `Processing action: ${action.type}`,
      LogContext.NONE
    );

    // Determine the context based on the action type
    switch (action.type) {
      case 'CLICK_RESOURCE':
        return this.handleResourceClick(state, action.payload.category);
        
      case 'PURCHASE_UPGRADE':
        return this.handleUpgradePurchase(
          state,
          action.payload.category,
          action.payload.upgradeType
        );
        
      case 'MARK_LOG_READ':
        return this.handleMarkLogRead(state, action.payload.logId);
        
      case 'MARK_ALL_LOGS_READ':
        return this.handleMarkAllLogsRead(state);
        
      case 'INITIATE_JUMP':
        return this.handleInitiateJump(state);
        
      case 'COMPLETE_ENCOUNTER':
        return this.handleCompleteEncounter(state);
        
      case 'SELECT_REGION':
        return this.handleSelectRegion(state, action.payload.region);
        
      default:
        Logger.warn(
          LogCategory.ACTIONS,
          `Unknown action type: ${action.type}`,
          LogContext.NONE
        );
        return state;
    }
  }
  
  /**
   * Handle resource click actions
   */
  private handleResourceClick(state: GameState, category: GameCategory): GameState {
    // Determine context based on category
    let context = LogContext.NONE;
    switch (category) {
      case 'reactor':
        context = LogContext.REACTOR_LIFECYCLE;
        break;
      case 'processor':
        context = LogContext.PROCESSOR_LIFECYCLE;
        break;
      case 'crewQuarters':
        context = LogContext.CREW_LIFECYCLE;
        break;
      case 'manufacturing':
        context = LogContext.MANUFACTURING_LIFECYCLE;
        break;
    }
    
    Logger.debug(LogCategory.ACTIONS, `Handling ${category} resource click`, context);
    
    switch (category) {
      case 'reactor':
        return this.handleReactorClick(state);
        
      case 'processor':
        return this.handleProcessorClick(state);
        
      case 'crewQuarters':
        return this.handleCrewClick(state);
        
      case 'manufacturing':
        return this.handleManufacturingClick(state);
    }
    return state;
  }
  
  /**
   * Handle reactor energy click
   */
  private handleReactorClick(state: GameState): GameState {
    const reactor = state.categories.reactor;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Reactor click - Before: ${reactor.resources.energy}/${reactor.stats.energyCapacity}`,
      LogContext.REACTOR_LIFECYCLE
    );
    
    // Add 1 energy (up to capacity)
    if (reactor.resources.energy < reactor.stats.energyCapacity) {
      reactor.resources.energy = Math.min(
        reactor.resources.energy + 1,
        reactor.stats.energyCapacity
      );
      Logger.debug(
        LogCategory.RESOURCES, 
        `Reactor click - After update: ${reactor.resources.energy}`,
        LogContext.REACTOR_LIFECYCLE
      );
      Logger.trace(
        LogCategory.STATE, 
        `State modified directly: energy=${state.categories.reactor.resources.energy}`,
        LogContext.REACTOR_LIFECYCLE
      );
    } else {
      Logger.info(
        LogCategory.RESOURCES, 
        `Reactor already at capacity (${reactor.stats.energyCapacity})`,
        LogContext.REACTOR_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle processor insight click
   */
  private handleProcessorClick(state: GameState): GameState {
    const processor = state.categories.processor;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Processor click - Before: ${processor.resources.insight}/${processor.stats.insightCapacity}`,
      LogContext.PROCESSOR_LIFECYCLE
    );
    
    // Add 0.5 insight (up to capacity)
    if (processor.resources.insight < processor.stats.insightCapacity) {
      processor.resources.insight = Math.min(
        processor.resources.insight + processor.stats.insightPerClick,
        processor.stats.insightCapacity
      );
      
      Logger.debug(
        LogCategory.RESOURCES, 
        `Processor click - After update: ${processor.resources.insight}`,
        LogContext.PROCESSOR_LIFECYCLE
      );
    } else {
      Logger.info(
        LogCategory.RESOURCES, 
        `Processor already at capacity (${processor.stats.insightCapacity})`,
        LogContext.PROCESSOR_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle crew awakening click
   */
  private handleCrewClick(state: GameState): GameState {
    const crewQuarters = state.categories.crewQuarters;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Crew click - Progress: ${crewQuarters.stats.awakeningProgress}/10, Crew: ${crewQuarters.resources.crew}/${crewQuarters.stats.crewCapacity}`,
      LogContext.CREW_LIFECYCLE
    );
    
    // Don't proceed if already at capacity
    if (crewQuarters.resources.crew >= crewQuarters.stats.crewCapacity) {
      Logger.info(
        LogCategory.RESOURCES, 
        `Cannot awaken more crew - at capacity (${crewQuarters.stats.crewCapacity})`,
        LogContext.CREW_LIFECYCLE
      );
      return state;
    }
    
    // Increment awakening progress
    crewQuarters.stats.awakeningProgress += 1;
    
    // If reached 10 clicks, add 1 crew member (up to capacity)
    if (crewQuarters.stats.awakeningProgress >= 10) {
      crewQuarters.resources.crew = Math.min(
        crewQuarters.resources.crew + 1,
        crewQuarters.stats.crewCapacity
      );
      
      Logger.info(
        LogCategory.RESOURCES, 
        `Crew member awakened! Current crew: ${crewQuarters.resources.crew}`,
        LogContext.CREW_LIFECYCLE
      );
      
      // Reset progress
      crewQuarters.stats.awakeningProgress = 0;
      Logger.debug(
        LogCategory.RESOURCES, 
        "Awakening progress reset to 0",
        LogContext.CREW_LIFECYCLE
      );
    } else {
      // Cap awakening progress at 10
      crewQuarters.stats.awakeningProgress = Math.min(crewQuarters.stats.awakeningProgress, 10);
      
      Logger.debug(
        LogCategory.RESOURCES, 
        `Awakening progress increased to ${crewQuarters.stats.awakeningProgress}/10`,
        LogContext.CREW_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle manufacturing scrap click
   */
  private handleManufacturingClick(state: GameState): GameState {
    const manufacturing = state.categories.manufacturing;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Manufacturing click - Before: ${manufacturing.resources.scrap}/${manufacturing.stats.scrapCapacity}`,
      LogContext.MANUFACTURING_LIFECYCLE
    );
    
    // Add 1 scrap (up to capacity)
    if (manufacturing.resources.scrap < manufacturing.stats.scrapCapacity) {
      manufacturing.resources.scrap = Math.min(
        manufacturing.resources.scrap + 1,
        manufacturing.stats.scrapCapacity
      );
      
      Logger.debug(
        LogCategory.RESOURCES, 
        `Manufacturing click - After update: ${manufacturing.resources.scrap}`,
        LogContext.MANUFACTURING_LIFECYCLE
      );
    } else {
      Logger.info(
        LogCategory.RESOURCES, 
        `Manufacturing already at capacity (${manufacturing.stats.scrapCapacity})`,
        LogContext.MANUFACTURING_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle upgrade purchases
   * Uses the UpgradeSystem to process the purchase
   */
  private handleUpgradePurchase(
    state: GameState, 
    category: GameCategory, 
    upgradeType: string
  ): GameState {
    Logger.debug(
      LogCategory.UPGRADES, 
      `Attempting purchase: ${category} - ${upgradeType}`,
      LogContext.UPGRADE_PURCHASE
    );
    
    // Use the UpgradeSystem from the manager if available
    let upgradeSystem: UpgradeSystem;
    
    if (this.manager) {
      upgradeSystem = this.manager.upgrade;
    } else {
      // Fallback to a new instance if manager is not set
      Logger.warn(
        LogCategory.ACTIONS, 
        'GameSystemManager not set in ActionSystem, creating temporary UpgradeSystem',
        LogContext.UPGRADE_PURCHASE
      );
      upgradeSystem = new UpgradeSystem();
    }
    
    // Attempt to purchase the upgrade
    const success = upgradeSystem.purchaseUpgrade(state, category, upgradeType);
    
    if (success) {
      Logger.info(
        LogCategory.UPGRADES, 
        `Successfully purchased ${upgradeType} for ${category}`,
        LogContext.UPGRADE_PURCHASE
      );
    } else {
      Logger.warn(
        LogCategory.UPGRADES, 
        `Failed to purchase ${upgradeType} for ${category} - insufficient resources`,
        LogContext.UPGRADE_PURCHASE
      );
    }
    return state;
  }

  /**
   * Mark a log as read
   */
  private handleMarkLogRead(state: GameState, logId: string): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot mark log read: ActionSystem manager not set",
        LogContext.LOG_INTERACTION
      );
      return state;
    }

    // Use the log system to mark the log as read
    return this.manager.log.markLogRead(state, logId);
  }

  /**
   * Mark all logs as read
   */
  private handleMarkAllLogsRead(state: GameState): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot mark all logs read: ActionSystem manager not set",
        LogContext.LOG_INTERACTION
      );
      return state;
    }

    // Use the log system to mark all logs as read
    return this.manager.log.markAllLogsRead(state);
  }

  /**
   * Handle initiating a jump to start an encounter
   */
  private handleInitiateJump(state: GameState): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot initiate jump: ActionSystem manager not set",
        LogContext.NONE
      );
      return state;
    }

    Logger.info(
      LogCategory.ACTIONS,
      'Initiating jump sequence',
      LogContext.NONE
    );
    
    // Generate an encounter based on the current region
    const encounter = this.manager.encounter.generateEncounter(state);
    
    // Update the game state
    return {
      ...state,
      encounters: {
        ...state.encounters,
        active: true,
        encounter
      }
    };
  }
  
  /**
   * Handle completing an encounter
   */
  private handleCompleteEncounter(state: GameState): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot complete encounter: ActionSystem manager not set",
        LogContext.NONE
      );
      return state;
    }

    Logger.info(
      LogCategory.ACTIONS,
      'Completing encounter',
      LogContext.NONE
    );
    
    // Delegate to the encounter system
    return this.manager.encounter.completeEncounter(state);
  }
  
  /**
   * Handle selecting a region to navigate to
   */
  private handleSelectRegion(state: GameState, region: RegionType): GameState {
    Logger.info(
      LogCategory.ACTIONS,
      `Navigating to ${region} region`,
      LogContext.NONE
    );
    
    return {
      ...state,
      navigation: {
        ...state.navigation,
        currentRegion: region
      }
    };
  }
} 