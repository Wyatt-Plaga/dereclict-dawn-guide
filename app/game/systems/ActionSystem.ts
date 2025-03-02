import { GameState } from '../types';
import { GameAction, GameCategory } from '../types/actions';
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
   * Process an action and update the game state
   * 
   * @param state - Current game state
   * @param action - Action to process
   */
  processAction(state: GameState, action: GameAction): void {
    // Determine the appropriate context based on action type
    let context = LogContext.NONE;
    
    if (action.type === 'CLICK_RESOURCE') {
      const category = action.payload.category;
      if (category === 'reactor') {
        context = LogContext.REACTOR_LIFECYCLE;
      } else if (category === 'processor') {
        context = LogContext.PROCESSOR_LIFECYCLE;
      } else if (category === 'crewQuarters') {
        context = LogContext.CREW_LIFECYCLE;
      } else if (category === 'manufacturing') {
        context = LogContext.MANUFACTURING_LIFECYCLE;
      }
    } else if (action.type === 'PURCHASE_UPGRADE') {
      context = LogContext.UPGRADE_PURCHASE;
    }
    
    Logger.debug(LogCategory.ACTIONS, `Processing action: ${action.type}`, context);
    
    switch (action.type) {
      case 'CLICK_RESOURCE':
        this.handleResourceClick(state, action.payload.category);
        break;
        
      case 'PURCHASE_UPGRADE':
        this.handleUpgradePurchase(
          state, 
          action.payload.category, 
          action.payload.upgradeType
        );
        break;
        
      default:
        Logger.warn(LogCategory.ACTIONS, `Unknown action type: ${action.type}`, context);
    }
  }
  
  /**
   * Handle resource click actions
   */
  private handleResourceClick(state: GameState, category: GameCategory): void {
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
        this.handleReactorClick(state);
        break;
        
      case 'processor':
        this.handleProcessorClick(state);
        break;
        
      case 'crewQuarters':
        this.handleCrewClick(state);
        break;
        
      case 'manufacturing':
        this.handleManufacturingClick(state);
        break;
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
   * Handle crew awakening click
   */
  private handleCrewClick(state: GameState): void {
    const crewQuarters = state.categories.crewQuarters;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Crew click - Progress: ${crewQuarters.stats.awakeningProgress}/10, Crew: ${crewQuarters.resources.crew}/${crewQuarters.stats.crewCapacity}`,
      LogContext.CREW_LIFECYCLE
    );
    
    // Increment awakening progress
    crewQuarters.stats.awakeningProgress += 1;
    
    // If reached 10 clicks, add 1 crew member (up to capacity)
    if (crewQuarters.stats.awakeningProgress >= 10) {
      if (crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
        crewQuarters.resources.crew = Math.min(
          crewQuarters.resources.crew + 1,
          crewQuarters.stats.crewCapacity
        );
        
        Logger.info(
          LogCategory.RESOURCES, 
          `Crew member awakened! Current crew: ${crewQuarters.resources.crew}`,
          LogContext.CREW_LIFECYCLE
        );
      } else {
        Logger.info(
          LogCategory.RESOURCES, 
          `Cannot awaken more crew - at capacity (${crewQuarters.stats.crewCapacity})`,
          LogContext.CREW_LIFECYCLE
        );
      }
      
      // Reset progress
      crewQuarters.stats.awakeningProgress = 0;
      Logger.debug(
        LogCategory.RESOURCES, 
        "Awakening progress reset to 0",
        LogContext.CREW_LIFECYCLE
      );
    } else {
      Logger.debug(
        LogCategory.RESOURCES, 
        `Awakening progress increased to ${crewQuarters.stats.awakeningProgress}/10`,
        LogContext.CREW_LIFECYCLE
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
   * Handle upgrade purchases
   * Uses the UpgradeSystem to process the purchase
   */
  private handleUpgradePurchase(
    state: GameState, 
    category: GameCategory, 
    upgradeType: string
  ): void {
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
  }
} 