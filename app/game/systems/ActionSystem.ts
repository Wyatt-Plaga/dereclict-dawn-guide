import { GameState, RegionType } from '../types';
import { GameAction, GameActions, GameCategory } from '../types/actions';
import { GameSystemManager } from './index';
import { UpgradeSystem } from './UpgradeSystem';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EncounterSystem } from './EncounterSystem';
import { v4 as uuidv4 } from 'uuid';

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
   * Process an action and update the game state
   */
  processAction(state: GameState, action: GameAction): GameState {
    Logger.trace(
      LogCategory.ACTIONS, 
      `Processing action: ${action.type}`,
      LogContext.NONE
    );
    
    // Create a copy of the state to update
    let newState = { ...state };
    
    // Process the action based on its type
    switch (action.type) {
      case 'CLICK_RESOURCE':
        newState = this.handleResourceClick(newState, action);
        break;

      case 'PURCHASE_UPGRADE':
        newState = this.handleUpgradePurchase(
          newState, 
          action.payload.category, 
          action.payload.upgradeType
        );
        break;

      case 'MARK_LOG_READ':
        newState = this.handleMarkLogRead(newState, action.payload.logId);
        break;

      case 'SELECT_REGION': 
        newState = this.handleSelectRegion(newState, action.payload.regionId);
        break;
        
      case 'INITIATE_JUMP':
        newState = this.handleInitiateJump(newState);
        break;
        
      case 'COMPLETE_ENCOUNTER':
        newState = this.handleCompleteEncounter(newState, action);
        break;
        
      case 'STORY_CHOICE':
        newState = this.handleStoryChoice(newState, action);
        break;
        
      case 'COMBAT_ACTION':
        newState = this.handleCombatAction(newState, action);
        break;
        
      case 'RETREAT_FROM_BATTLE':
        newState = this.handleRetreatFromBattle(newState);
        break;
        
      default:
        Logger.warn(
          LogCategory.ACTIONS, 
          `Unknown action type: ${action.type}`,
          LogContext.NONE
        );
    }
    
    return newState;
  }
  
  /**
   * Handle resource click actions
   */
  private handleResourceClick(state: GameState, action: GameAction): GameState {
    const category = action.payload?.category;
    
    if (!category) {
      Logger.warn(
        LogCategory.ACTIONS,
        'No category specified for resource click',
        LogContext.NONE
      );
      return state;
    }
    
    Logger.debug(
      LogCategory.ACTIONS,
      `Processing resource click for ${category}`,
      LogContext.NONE
    );
    
    // Create a shallow copy of the state to modify
    const newState = { ...state };
    
    switch (category) {
      case 'reactor':
        return this.handleReactorClick(newState);
      case 'processor':
        return this.handleProcessorClick(newState);
      case 'manufacturing':
        return this.handleManufacturingClick(newState);
      default:
        Logger.warn(
          LogCategory.ACTIONS,
          `Unknown resource category: ${category}`,
          LogContext.NONE
        );
        return state;
    }
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
  private handleCompleteEncounter(state: GameState, action: any): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        'Game system manager not set',
        LogContext.NONE
      );
      return state;
    }

    Logger.info(
      LogCategory.ACTIONS,
      'Completing encounter',
      LogContext.NONE
    );
    
    // Use the encounter system to process the encounter
    const encounterSystem = this.manager.encounter;
    return encounterSystem.completeEncounter(state, action.payload?.choiceId);
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

  /**
   * Handle a player's choice in a story encounter
   */
  private handleStoryChoice(state: GameState, action: any): GameState {
    Logger.debug(
      LogCategory.ACTIONS,
      `Making story choice: ${action.payload?.choiceId}`,
      LogContext.NONE
    );
    
    if (!action.payload?.choiceId) {
      Logger.error(
        LogCategory.ACTIONS,
        'No choice ID provided for story choice action',
        LogContext.NONE
      );
      return state;
    }
    
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        'Game system manager not set',
        LogContext.NONE
      );
      return state;
    }
    
    // Use the encounter system to process the choice
    const encounterSystem = this.manager.encounter;
    return encounterSystem.completeEncounter(state, action.payload.choiceId);
  }

  /**
   * Handle combat actions
   */
  private handleCombatAction(state: GameState, action: any): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        'Game system manager not set',
        LogContext.COMBAT_ACTION
      );
      return state;
    }

    Logger.info(
      LogCategory.COMBAT,
      `Processing combat action: ${action.payload?.actionId}`,
      LogContext.COMBAT_ACTION
    );
    
    // Use the combat system to process the action
    const actionId = action.payload?.actionId;
    if (!actionId) {
      Logger.error(
        LogCategory.COMBAT,
        'No action ID provided for combat action',
        LogContext.COMBAT_ACTION
      );
      return state;
    }
    
    // Create a copy of the state to update
    const newState = { ...state };
    
    // Perform the combat action
    const result = this.manager.combat.performCombatAction(newState, actionId);
    
    // Update the combat state with the result
    if (result.success) {
      // Record the action result in the combat state
      newState.combat.lastActionResult = result;
      
      // Add a log entry if provided
      if (result.message) {
        newState.combat.battleLog.push({
          id: uuidv4(),
          text: result.message,
          type: 'PLAYER',
          timestamp: Date.now()
        });
      }
    } else {
      // Log the failure
      Logger.warn(
        LogCategory.COMBAT,
        `Combat action failed: ${result.message}`,
        LogContext.COMBAT_ACTION
      );
    }
    
    return newState;
  }

  /**
   * Handle retreat from battle
   */
  private handleRetreatFromBattle(state: GameState): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        'Game system manager not set',
        LogContext.COMBAT
      );
      return state;
    }

    Logger.info(
      LogCategory.COMBAT,
      'Retreating from battle',
      LogContext.COMBAT
    );
    
    return this.manager.combat.retreatFromCombat(state);
  }
} 