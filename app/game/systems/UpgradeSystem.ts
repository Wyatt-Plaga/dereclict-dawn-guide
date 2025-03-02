import { GameState } from '../types';
import { GameCategory } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

/**
 * UpgradeSystem
 * 
 * Handles purchasing upgrades and calculating stats based on upgrades.
 * Think of this as the R&D department that improves your capabilities.
 */
export class UpgradeSystem {
  /**
   * Attempt to purchase an upgrade
   * 
   * @param state - Current game state
   * @param category - Category the upgrade belongs to
   * @param upgradeType - Type of upgrade to purchase
   * @returns Whether the purchase was successful
   */
  purchaseUpgrade(state: GameState, category: GameCategory, upgradeType: string): boolean {
    Logger.debug(
      LogCategory.UPGRADES, 
      `Attempting to purchase ${upgradeType} in ${category}`,
      LogContext.UPGRADE_PURCHASE
    );
    
    switch (category) {
      case 'reactor':
        return this.purchaseReactorUpgrade(state, upgradeType);
      case 'processor':
        return this.purchaseProcessorUpgrade(state, upgradeType);
      case 'crewQuarters':
        return this.purchaseCrewQuartersUpgrade(state, upgradeType);
      case 'manufacturing':
        return this.purchaseManufacturingUpgrade(state, upgradeType);
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown category: ${category}`,
          LogContext.UPGRADE_PURCHASE
        );
        return false;
    }
  }
  
  /**
   * Attempt to purchase a reactor upgrade
   */
  private purchaseReactorUpgrade(state: GameState, upgradeType: string): boolean {
    const reactor = state.categories.reactor;
    
    switch (upgradeType) {
      case 'reactorExpansions':
        // Cost: 80% of current capacity
        const expansionCost = reactor.stats.energyCapacity * 0.8;
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Reactor expansion cost: ${expansionCost} energy (available: ${reactor.resources.energy})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        if (reactor.resources.energy >= expansionCost) {
          // Deduct cost
          reactor.resources.energy -= expansionCost;
          
          // Increment upgrade
          reactor.upgrades.reactorExpansions += 1;
          
          // Update stats
          this.updateReactorStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased reactor expansion (level ${reactor.upgrades.reactorExpansions})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient energy for reactor expansion`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        return false;
        
      case 'energyConverters':
        // Cost: (converters + 1) * 20
        const converterCost = (reactor.upgrades.energyConverters + 1) * 20;
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Energy converter cost: ${converterCost} energy (available: ${reactor.resources.energy})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        if (reactor.resources.energy >= converterCost) {
          // Deduct cost
          reactor.resources.energy -= converterCost;
          
          // Increment upgrade
          reactor.upgrades.energyConverters += 1;
          
          // Update stats
          this.updateReactorStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased energy converter (level ${reactor.upgrades.energyConverters})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient energy for energy converter`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        return false;
        
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown reactor upgrade: ${upgradeType}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        return false;
    }
  }
  
  /**
   * Attempt to purchase a processor upgrade
   */
  private purchaseProcessorUpgrade(state: GameState, upgradeType: string): boolean {
    const processor = state.categories.processor;
    
    switch (upgradeType) {
      case 'mainframeExpansions':
        // Cost: 70% of current capacity
        const expansionCost = processor.stats.insightCapacity * 0.7;
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Mainframe expansion cost: ${expansionCost} insight (available: ${processor.resources.insight})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        if (processor.resources.insight >= expansionCost) {
          // Deduct cost
          processor.resources.insight -= expansionCost;
          
          // Increment upgrade
          processor.upgrades.mainframeExpansions += 1;
          
          // Update stats
          this.updateProcessorStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased mainframe expansion (level ${processor.upgrades.mainframeExpansions})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient insight for mainframe expansion`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        return false;
        
      case 'processingThreads':
        // Cost: (threads + 1) * 15
        const threadCost = (processor.upgrades.processingThreads + 1) * 15;
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Processing thread cost: ${threadCost} insight (available: ${processor.resources.insight})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        if (processor.resources.insight >= threadCost) {
          // Deduct cost
          processor.resources.insight -= threadCost;
          
          // Increment upgrade
          processor.upgrades.processingThreads += 1;
          
          // Update stats
          this.updateProcessorStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased processing thread (level ${processor.upgrades.processingThreads})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient insight for processing thread`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        return false;
        
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown processor upgrade: ${upgradeType}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        return false;
    }
  }
  
  /**
   * Attempt to purchase a crew quarters upgrade
   */
  private purchaseCrewQuartersUpgrade(state: GameState, upgradeType: string): boolean {
    const crewQuarters = state.categories.crewQuarters;
    
    switch (upgradeType) {
      case 'additionalQuarters':
        // Cost: 60% of current capacity
        const quartersCost = Math.floor(crewQuarters.stats.crewCapacity * 0.6);
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Additional quarters cost: ${quartersCost} crew (available: ${crewQuarters.resources.crew})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        if (crewQuarters.resources.crew >= quartersCost) {
          // Deduct cost
          crewQuarters.resources.crew -= quartersCost;
          
          // Increment upgrade
          crewQuarters.upgrades.additionalQuarters += 1;
          
          // Update stats
          this.updateCrewQuartersStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased additional quarters (level ${crewQuarters.upgrades.additionalQuarters})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient crew for additional quarters`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        return false;
        
      case 'workerCrews':
        // Cost: (workers + 1) * 2.5
        const workerCost = Math.floor((crewQuarters.upgrades.workerCrews + 1) * 2.5);
        
        // Check if maxed out (max 5 worker crews)
        if (crewQuarters.upgrades.workerCrews >= 5) {
          Logger.debug(
            LogCategory.UPGRADES,
            `Worker crews already at maximum level (5)`,
            [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
          );
          return false;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Worker crew cost: ${workerCost} crew (available: ${crewQuarters.resources.crew})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        if (crewQuarters.resources.crew >= workerCost) {
          // Deduct cost
          crewQuarters.resources.crew -= workerCost;
          
          // Increment upgrade
          crewQuarters.upgrades.workerCrews += 1;
          
          // Update stats
          this.updateCrewQuartersStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased worker crew (level ${crewQuarters.upgrades.workerCrews})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient crew for worker crew`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        return false;
        
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown crew quarters upgrade: ${upgradeType}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        return false;
    }
  }
  
  /**
   * Attempt to purchase a manufacturing upgrade
   */
  private purchaseManufacturingUpgrade(state: GameState, upgradeType: string): boolean {
    const manufacturing = state.categories.manufacturing;
    
    switch (upgradeType) {
      case 'cargoHoldExpansions':
        // Cost: 50% of current capacity
        const expansionCost = Math.floor(manufacturing.stats.scrapCapacity * 0.5);
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Cargo hold expansion cost: ${expansionCost} scrap (available: ${manufacturing.resources.scrap})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        if (manufacturing.resources.scrap >= expansionCost) {
          // Deduct cost
          manufacturing.resources.scrap -= expansionCost;
          
          // Increment upgrade
          manufacturing.upgrades.cargoHoldExpansions += 1;
          
          // Update stats
          this.updateManufacturingStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased cargo hold expansion (level ${manufacturing.upgrades.cargoHoldExpansions})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient scrap for cargo hold expansion`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        return false;
        
      case 'manufacturingBays':
        // Cost: (bays + 1) * 25
        const bayCost = (manufacturing.upgrades.manufacturingBays + 1) * 25;
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Manufacturing bay cost: ${bayCost} scrap (available: ${manufacturing.resources.scrap})`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        if (manufacturing.resources.scrap >= bayCost) {
          // Deduct cost
          manufacturing.resources.scrap -= bayCost;
          
          // Increment upgrade
          manufacturing.upgrades.manufacturingBays += 1;
          
          // Update stats
          this.updateManufacturingStats(state);
          
          Logger.info(
            LogCategory.UPGRADES,
            `Purchased manufacturing bay (level ${manufacturing.upgrades.manufacturingBays})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
          );
          
          return true;
        }
        
        Logger.debug(
          LogCategory.UPGRADES,
          `Insufficient scrap for manufacturing bay`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        return false;
        
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown manufacturing upgrade: ${upgradeType}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        return false;
    }
  }
  
  /**
   * Update all stats based on current upgrade levels
   * 
   * @param state - Current game state
   */
  updateAllStats(state: GameState): void {
    Logger.debug(LogCategory.UPGRADES, "Updating all stats based on upgrade levels", LogContext.STARTUP);
    this.updateReactorStats(state);
    this.updateProcessorStats(state);
    this.updateCrewQuartersStats(state);
    this.updateManufacturingStats(state);
  }
  
  /**
   * Update reactor stats based on upgrades
   */
  private updateReactorStats(state: GameState): void {
    const reactor = state.categories.reactor;
    
    // Calculate energy capacity based on expansions
    // Base capacity = 100, each expansion adds 50% more
    reactor.stats.energyCapacity = 100 * Math.pow(1.5, reactor.upgrades.reactorExpansions);
    
    // Calculate energy production based on converters
    // Each converter adds 1 energy per second
    reactor.stats.energyPerSecond = reactor.upgrades.energyConverters;
  }
  
  /**
   * Update processor stats based on upgrades
   */
  private updateProcessorStats(state: GameState): void {
    const processor = state.categories.processor;
    
    // Calculate insight capacity based on mainframe expansions
    // Base capacity = 50, each expansion adds 50% more
    processor.stats.insightCapacity = 50 * Math.pow(1.5, processor.upgrades.mainframeExpansions);
    
    // Calculate insight production based on processing threads
    // Each thread adds 0.2 insight per second
    processor.stats.insightPerSecond = processor.upgrades.processingThreads * 0.2;
  }
  
  /**
   * Update crew quarters stats based on upgrades
   */
  private updateCrewQuartersStats(state: GameState): void {
    const crewQuarters = state.categories.crewQuarters;
    
    // Calculate crew capacity based on additional quarters
    // Base capacity = 5, each quarters upgrade adds 3 capacity
    crewQuarters.stats.crewCapacity = 5 + (crewQuarters.upgrades.additionalQuarters * 3);
    
    // Calculate crew production based on worker crews
    // Each worker crew adds 0.1 crew per second
    crewQuarters.stats.crewPerSecond = crewQuarters.upgrades.workerCrews * 0.1;
  }
  
  /**
   * Update manufacturing stats based on upgrades
   */
  private updateManufacturingStats(state: GameState): void {
    const manufacturing = state.categories.manufacturing;
    
    // Calculate scrap capacity based on cargo hold expansions
    // Base capacity = 100, each expansion adds 50% more
    manufacturing.stats.scrapCapacity = 100 * Math.pow(1.5, manufacturing.upgrades.cargoHoldExpansions);
    
    // Calculate scrap production based on manufacturing bays
    // Each bay adds 0.5 scrap per second
    manufacturing.stats.scrapPerSecond = manufacturing.upgrades.manufacturingBays * 0.5;
  }
} 