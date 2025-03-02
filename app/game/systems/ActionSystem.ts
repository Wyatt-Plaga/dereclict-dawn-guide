import { GameState } from '../types';
import { GameAction, GameCategory } from '../types/actions';
import { GameSystemManager } from './index';
import { UpgradeSystem } from './UpgradeSystem';

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
  }

  /**
   * Process an action and update the game state
   * 
   * @param state - Current game state
   * @param action - Action to process
   */
  processAction(state: GameState, action: GameAction): void {
    console.log('Processing action:', action.type);
    
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
        console.warn('Unknown action type:', action.type);
    }
  }
  
  /**
   * Handle resource click actions
   */
  private handleResourceClick(state: GameState, category: GameCategory): void {
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
    
    // Add 1 energy (up to capacity)
    if (reactor.resources.energy < reactor.stats.energyCapacity) {
      reactor.resources.energy = Math.min(
        reactor.resources.energy + 1,
        reactor.stats.energyCapacity
      );
    }
  }
  
  /**
   * Handle processor insight click
   */
  private handleProcessorClick(state: GameState): void {
    const processor = state.categories.processor;
    
    // Add 0.5 insight (up to capacity)
    if (processor.resources.insight < processor.stats.insightCapacity) {
      processor.resources.insight = Math.min(
        processor.resources.insight + processor.stats.insightPerClick,
        processor.stats.insightCapacity
      );
    }
  }
  
  /**
   * Handle crew awakening click
   */
  private handleCrewClick(state: GameState): void {
    const crewQuarters = state.categories.crewQuarters;
    
    // Increment awakening progress
    crewQuarters.stats.awakeningProgress += 1;
    
    // If reached 10 clicks, add 1 crew member (up to capacity)
    if (crewQuarters.stats.awakeningProgress >= 10) {
      if (crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
        crewQuarters.resources.crew = Math.min(
          crewQuarters.resources.crew + 1,
          crewQuarters.stats.crewCapacity
        );
      }
      
      // Reset progress
      crewQuarters.stats.awakeningProgress = 0;
    }
  }
  
  /**
   * Handle manufacturing scrap click
   */
  private handleManufacturingClick(state: GameState): void {
    const manufacturing = state.categories.manufacturing;
    
    // Add 1 scrap (up to capacity)
    if (manufacturing.resources.scrap < manufacturing.stats.scrapCapacity) {
      manufacturing.resources.scrap = Math.min(
        manufacturing.resources.scrap + 1,
        manufacturing.stats.scrapCapacity
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
    console.log(`Upgrade purchase: ${category} - ${upgradeType}`);
    
    // Use the UpgradeSystem from the manager if available
    let upgradeSystem: UpgradeSystem;
    
    if (this.manager) {
      upgradeSystem = this.manager.upgrade;
    } else {
      // Fallback to a new instance if manager is not set
      console.warn('GameSystemManager not set in ActionSystem, creating temporary UpgradeSystem');
      upgradeSystem = new UpgradeSystem();
    }
    
    // Attempt to purchase the upgrade
    const success = upgradeSystem.purchaseUpgrade(state, category, upgradeType);
    
    if (success) {
      console.log(`Successfully purchased ${upgradeType} for ${category}`);
    } else {
      console.log(`Failed to purchase ${upgradeType} for ${category}`);
    }
  }
} 