import { GameState, RegionType } from '../types';
import { GameAction, GameActions, GameCategory, MakeStoryChoiceAction, ToggleProductionAction, SelectRegionAction, CombatAction, RetreatFromBattleAction, AdjustAutomationAction } from '../types/actions';
import { GameSystemManager } from './index';
import { UpgradeSystem } from './UpgradeSystem';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EncounterSystem } from './EncounterSystem';
import { v4 as uuidv4 } from 'uuid';
import { ReactorConstants, ProcessorConstants, CrewQuartersConstants, ManufacturingConstants, AutomationConstants } from '../config/gameConstants';
import { ResourceSystem } from './ResourceSystem';

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
  processAction(state: GameState, action: GameActions): GameState {
    // Log action arrival
    console.log(`[ActionSystem] Received action: ${action.type}`, action.payload);

    Logger.trace(
      LogCategory.ACTIONS, 
      `Processing action: ${action.type}`,
      LogContext.NONE
    );
    
    // Process the action based on its type - directly mutate the state
    switch (action.type) {
      case 'CLICK_RESOURCE':
        this.handleResourceClick(state, action as GameAction);
        break;

      case 'PURCHASE_UPGRADE':
        this.handleUpgradePurchase(
          state, 
          action.payload.category, 
          action.payload.upgradeType
        );
        break;

      case 'MARK_LOG_READ':
        this.handleMarkLogRead(state, action.payload.logId);
        break;

      case 'MARK_ALL_LOGS_READ':
        this.handleMarkAllLogsRead(state);
        break;

      case 'SELECT_REGION': 
        this.handleSelectRegion(state, action as SelectRegionAction);
        break;
        
      case 'INITIATE_JUMP':
        this.handleInitiateJump(state);
        break;
        
      case 'COMPLETE_ENCOUNTER':
        this.handleCompleteEncounter(state, action);
        break;
        
      case 'MAKE_STORY_CHOICE':
        this.handleStoryChoice(state, action as MakeStoryChoiceAction);
        break;
        
      case 'COMBAT_ACTION':
        this.handleCombatAction(state, action as CombatAction);
        break;
        
      case 'RETREAT_FROM_BATTLE':
        this.handleRetreatFromBattle(state);
        break;

      case 'ADJUST_AUTOMATION':
        this.handleAdjustAutomation(state, action as AdjustAutomationAction);
        break;
        
      default:
        // This check helps ensure all action types are handled
        const _exhaustiveCheck: never = action;
        Logger.warn(LogCategory.ACTIONS, `Unhandled action type: ${(_exhaustiveCheck as GameAction).type}`, LogContext.NONE);
    }
    
    return state;
  }
  
  /**
   * Handle resource click actions
   */
  private handleResourceClick(state: GameState, action: GameAction): void {
    const category = action.payload?.category;
    
    if (!category) {
      Logger.warn(
        LogCategory.ACTIONS,
        'No category specified for resource click',
        LogContext.NONE
      );
      return;
    }
    
    Logger.debug(
      LogCategory.ACTIONS,
      `Processing resource click for ${category}`,
      LogContext.NONE
    );
    
    const energyCost = AutomationConstants.ENERGY_COST_PER_CLICK;
    let canAffordEnergy = true;
    let requiresEnergy = false;

    // Check if this click requires energy and if affordable
    if (category === 'processor' || category === 'crewQuarters' || category === 'manufacturing') {
      requiresEnergy = true;
      const currentEnergy = state.categories.reactor?.resources?.energy ?? 0;
      if (currentEnergy < energyCost) {
        canAffordEnergy = false;
        Logger.debug(LogCategory.ACTIONS, `Insufficient energy (${currentEnergy.toFixed(1)}) for ${category} click (cost: ${energyCost})`, LogContext.ACTION_PROCESSING);
      }
    }

    // If requires energy and cannot afford, stop processing
    if (requiresEnergy && !canAffordEnergy) {
      return;
    }

    // Consume energy if required
    if (requiresEnergy) {
      if (state.categories.reactor) { // Safety check
          state.categories.reactor.resources.energy = Math.max(0, (state.categories.reactor.resources.energy ?? 0) - energyCost);
          Logger.debug(LogCategory.ACTIONS, `Consumed ${energyCost} energy for ${category} click. Remaining: ${state.categories.reactor.resources.energy.toFixed(1)}`, LogContext.ACTION_PROCESSING);
      } else {
          Logger.warn(LogCategory.ACTIONS, `Cannot consume energy for ${category} click: Reactor category missing.`, LogContext.ACTION_PROCESSING);
          // Decide if the click should still proceed without energy cost?
          // For now, let it proceed but log warning.
      }
    }

    // Proceed with resource generation based on category
    switch (category) {
      case 'reactor':
        this.handleReactorClick(state);
        break;
      case 'processor':
        this.handleProcessorClick(state);
        break;
      case 'manufacturing':
        this.handleManufacturingClick(state);
        break;
      case 'crewQuarters':
        this.handleCrewQuartersClick(state);
        break;
      default:
        Logger.warn(
          LogCategory.ACTIONS,
          `Unknown resource category: ${category}`,
          LogContext.NONE
        );
    }
  }
  
  /**
   * Handle reactor energy click
   */
  private handleReactorClick(state: GameState): void {
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
  }
  
  /**
   * Handle processor insight click
   */
  private handleProcessorClick(state: GameState): void {
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
  }
  
  /**
   * Handle manufacturing scrap click
   */
  private handleManufacturingClick(state: GameState): void {
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
  }
  
  /**
   * Handle crew quarters click for awakening crew
   */
  private handleCrewQuartersClick(state: GameState): void {
    const crewQuarters = state.categories.crewQuarters;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Crew Quarters click - Before: ${crewQuarters.resources.crew}/${crewQuarters.stats.crewCapacity}`,
      LogContext.CREW_LIFECYCLE
    );
    
    // If we're already at capacity, don't do anything
    if (crewQuarters.resources.crew >= crewQuarters.stats.crewCapacity) {
      Logger.info(
        LogCategory.RESOURCES, 
        `Crew Quarters already at capacity (${crewQuarters.stats.crewCapacity})`,
        LogContext.CREW_LIFECYCLE
      );
      return;
    }
    
    // Increment awakening progress
    crewQuarters.stats.awakeningProgress += 1;
    
    // Check if we've reached the threshold to awaken a crew member
    if (crewQuarters.stats.awakeningProgress >= 10) { // Using the AWAKENING_THRESHOLD from constants
      // Reset progress and add crew
      crewQuarters.stats.awakeningProgress = 0;
      crewQuarters.resources.crew = Math.min(
        crewQuarters.resources.crew + 1, // Add 1 crew member
        crewQuarters.stats.crewCapacity
      );
      
      Logger.debug(
        LogCategory.RESOURCES, 
        `Crew member awakened! New crew count: ${crewQuarters.resources.crew}`,
        LogContext.CREW_LIFECYCLE
      );
    } else {
      Logger.debug(
        LogCategory.RESOURCES, 
        `Awakening progress: ${crewQuarters.stats.awakeningProgress}/10`,
        LogContext.CREW_LIFECYCLE
      );
    }
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
      // Log the fallback case
      if (!this.manager) {
        console.error("[ActionSystem] FATAL: Manager was null during upgrade purchase! Using temporary UpgradeSystem.");
      }
      Logger.warn(
        LogCategory.UPGRADES, 
        `Failed to purchase ${upgradeType} for ${category} - insufficient resources`,
        LogContext.UPGRADE_PURCHASE
      );
    }

    // Trigger stats update after changing active level
    // Log the manager status BEFORE the check
    console.log(`[ActionSystem] Checking manager before updateAllStats:`, this.manager ? 'Manager exists' : 'Manager is NULL');
    if (this.manager) {
        this.manager.upgrade.updateAllStats(state);
    } else {
        console.error("[ActionSystem] FATAL: Manager was null during automation adjustment! Cannot call updateAllStats.");
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
    
    // Update the game state directly
    state.encounters.active = true;
    state.encounters.encounter = encounter;
    
    return state;
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
   * Handle region selection
   */
  private handleSelectRegion(state: GameState, action: SelectRegionAction): void {
    // Ensure payload and region exist
    if (!action.payload || !action.payload.region) {
      Logger.warn(LogCategory.ACTIONS, `Invalid payload for SELECT_REGION action`, LogContext.NONE);
      return;
    }
    
    const selectedRegionId = action.payload.region; // Use action.payload.region

    // Validate region ID (this assumes RegionType includes all valid IDs)
    const validRegions = Object.values(RegionType) as string[];
    if (!validRegions.includes(selectedRegionId)) {
      Logger.warn(LogCategory.ACTIONS, `Invalid region selected: ${selectedRegionId}`, LogContext.NONE);
      return;
    }

    // Ensure navigation state exists
    if (!state.navigation) {
      state.navigation = {
        currentRegion: selectedRegionId as RegionType,
        completedRegions: [],
        regionProgress: {}
      };
    } else {
      // Update the current region
      state.navigation.currentRegion = selectedRegionId as RegionType;
    }
    
    // Reset subregion when changing main regions
    state.navigation.currentSubRegion = undefined;

    Logger.info(LogCategory.ACTIONS, `