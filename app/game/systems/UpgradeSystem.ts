import { GameState } from '../types';
import { GameCategory } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { 
  CrewQuartersConstants,
  ReactorConstants,
  ProcessorConstants,
  ManufacturingConstants
} from '../config/gameConstants';
import { ResourceCost } from '../types/combat';
import { ResourceSystem } from './ResourceSystem';

/**
 * UpgradeSystem
 * 
 * Handles purchasing upgrades and calculating stats based on upgrades.
 * Think of this as the R&D department that improves your capabilities.
 */
export class UpgradeSystem {
  // Instantiate ResourceSystem once for the class instance
  private resourceSystem: ResourceSystem;

  constructor() {
    this.resourceSystem = new ResourceSystem();
  }

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
        // Calculate cost (now returns ResourceCost[])
        const expansionCosts = this.calculateReactorExpansionCost(reactor.upgrades.reactorExpansions, reactor.stats.energyCapacity);
        
        // Log the multi-resource cost
        const costString = expansionCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Reactor expansion costs: ${costString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, expansionCosts)) {
          // Consume resources
          this.resourceSystem.consumeResources(state, expansionCosts);
          
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
          `Insufficient resources for reactor expansion`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        return false;
        
      case 'energyConverters':
        // Calculate cost (now returns ResourceCost[])
        const converterCosts = this.calculateEnergyConverterCost(reactor.upgrades.energyConverters);
        
        // Log the multi-resource cost
        const converterCostString = converterCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Energy converter costs: ${converterCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
        );
        
        // Use ResourceSystem for checking/consuming
        if (this.resourceSystem.hasResources(state, converterCosts)) {
          this.resourceSystem.consumeResources(state, converterCosts);
          
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
        // Calculate cost (now returns ResourceCost[])
        const expansionCosts = this.calculateMainframeExpansionCost(processor.upgrades.mainframeExpansions, processor.stats.insightCapacity);
        
        // Log the multi-resource cost
        const expansionCostString = expansionCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Mainframe expansion costs: ${expansionCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, expansionCosts)) {
          // Consume resources
          this.resourceSystem.consumeResources(state, expansionCosts);
          
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
          `Insufficient resources for mainframe expansion`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        return false;
        
      case 'processingThreads':
        // Calculate cost (now returns ResourceCost[])
        const threadCosts = this.calculateProcessingThreadCost(processor.upgrades.processingThreads);
        
        // Log the multi-resource cost
        const threadCostString = threadCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Processing thread costs: ${threadCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, threadCosts)) {
          // Consume resources
          this.resourceSystem.consumeResources(state, threadCosts);
          
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
          `Insufficient resources for processing thread`,
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
        // Calculate cost (now returns ResourceCost[])
        const quartersCosts = this.calculateQuartersCost(crewQuarters.upgrades.additionalQuarters, crewQuarters.stats.crewCapacity);
        
        // Log the multi-resource cost
        const quartersCostString = quartersCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Additional quarters costs: ${quartersCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, quartersCosts)) {
           // Consume resources
           this.resourceSystem.consumeResources(state, quartersCosts);
          
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
          `Insufficient resources for additional quarters`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        return false;
        
      case 'workerCrews':
        // Calculate cost (now returns ResourceCost[])
        const workerCosts = this.calculateWorkerCrewCost(crewQuarters.upgrades.workerCrews);
        
        // Check if maxed out (max 5 worker crews)
        if (crewQuarters.upgrades.workerCrews >= this.getMaxWorkerCrews()) {
          Logger.debug(
            LogCategory.UPGRADES,
            `Worker crews already at maximum level (${this.getMaxWorkerCrews()})`,
            [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
          );
          return false;
        }
        
        // Log the multi-resource cost
        const workerCostString = workerCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Worker crew costs: ${workerCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, workerCosts)) {
          // Consume resources
          this.resourceSystem.consumeResources(state, workerCosts);
          
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
          `Insufficient resources for worker crew`,
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
        // Calculate cost (now returns ResourceCost[])
        const expansionCosts = this.calculateCargoHoldExpansionCost(manufacturing.upgrades.cargoHoldExpansions, manufacturing.stats.scrapCapacity);
        
        // Log the multi-resource cost
        const expansionCostString = expansionCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Cargo hold expansion costs: ${expansionCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, expansionCosts)) {
          // Consume resources
          this.resourceSystem.consumeResources(state, expansionCosts);
          
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
          `Insufficient resources for cargo hold expansion`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        return false;
        
      case 'manufacturingBays':
        // Calculate cost (now returns ResourceCost[])
        const bayCosts = this.calculateManufacturingBayCost(manufacturing.upgrades.manufacturingBays);
        
        // Log the multi-resource cost
        const bayCostString = bayCosts.map((c: ResourceCost) => `${c.amount} ${c.type}`).join(', ');
        Logger.debug(
          LogCategory.UPGRADES,
          `Manufacturing bay costs: ${bayCostString}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
        );
        
        // Check if all resources are available
        if (this.resourceSystem.hasResources(state, bayCosts)) {
          // Consume resources
          this.resourceSystem.consumeResources(state, bayCosts);
          
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
          `Insufficient resources for manufacturing bay`,
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
    reactor.stats.energyCapacity = ReactorConstants.BASE_ENERGY_CAPACITY * 
      Math.pow(ReactorConstants.ENERGY_CAPACITY_MULTIPLIER, reactor.upgrades.reactorExpansions);
    
    // Calculate energy production based on *active* converters
    reactor.stats.energyPerSecond = reactor.stats.activeEnergyConverters * ReactorConstants.ENERGY_PER_CONVERTER;
  }
  
  /**
   * Update processor stats based on upgrades
   */
  private updateProcessorStats(state: GameState): void {
    const processor = state.categories.processor;
    
    // Calculate insight capacity based on mainframe expansions
    processor.stats.insightCapacity = ProcessorConstants.BASE_INSIGHT_CAPACITY * 
      Math.pow(ProcessorConstants.INSIGHT_CAPACITY_MULTIPLIER, processor.upgrades.mainframeExpansions);
    
    // Calculate insight production based on *active* processing threads
    processor.stats.insightPerSecond = processor.stats.activeProcessingThreads * ProcessorConstants.INSIGHT_PER_THREAD;
  }
  
  /**
   * Update crew quarters stats based on upgrades
   */
  private updateCrewQuartersStats(state: GameState): void {
    const crewQuarters = state.categories.crewQuarters;
    
    // Calculate crew capacity based on additional quarters
    crewQuarters.stats.crewCapacity = CrewQuartersConstants.BASE_CREW_CAPACITY + 
      (crewQuarters.upgrades.additionalQuarters * CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE);
    
    // Calculate crew production based on *active* worker crews
    crewQuarters.stats.crewPerSecond = crewQuarters.stats.activeWorkerCrews * CrewQuartersConstants.WORKER_CREW_PRODUCTION_RATE;
  }
  
  /**
   * Update manufacturing stats based on upgrades
   */
  private updateManufacturingStats(state: GameState): void {
    const manufacturing = state.categories.manufacturing;
    
    // Calculate scrap capacity based on cargo hold expansions
    manufacturing.stats.scrapCapacity = ManufacturingConstants.BASE_SCRAP_CAPACITY * 
      Math.pow(ManufacturingConstants.SCRAP_CAPACITY_MULTIPLIER, manufacturing.upgrades.cargoHoldExpansions);
    
    // Calculate scrap production based on *active* manufacturing bays
    manufacturing.stats.scrapPerSecond = manufacturing.stats.activeManufacturingBays * ManufacturingConstants.SCRAP_PER_BAY;
  }

  /*** Utility methods for cost calculations ***/

  /**
   * Calculate the cost of upgrading crew quarters
   * 
   * @param currentLevel Current crew quarters level
   * @param crewCapacity Current crew capacity
   * @returns The cost in crew
   */
  calculateQuartersCost(currentLevel: number, crewCapacity: number): ResourceCost[] {
    const baseCrewCost = Math.floor(crewCapacity * CrewQuartersConstants.QUARTERS_COST_MULTIPLIER);
    const costs: ResourceCost[] = [
      { type: 'crew', amount: baseCrewCost }
    ];

    // Example: Add combat component cost
    if (currentLevel >= 2) { // Cost applies when buying level 3+
      const componentCost = Math.floor(Math.pow(1.3, currentLevel));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  /**
   * Calculate the cost of upgrading worker crews
   * 
   * @param currentWorkerCrews Current worker crew level
   * @returns The cost in crew
   */
  calculateWorkerCrewCost(currentWorkerCrews: number): ResourceCost[] {
    const baseCrewCost = Math.floor((currentWorkerCrews + 1) * CrewQuartersConstants.WORKER_CREW_COST_BASE);
    const costs: ResourceCost[] = [
      { type: 'crew', amount: baseCrewCost }
    ];

     // Example: Add combat component cost
     if (currentWorkerCrews >= 1) { // Cost applies when buying level 2+
      const componentCost = Math.floor(Math.pow(1.8, currentWorkerCrews));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  /**
   * Get the maximum number of worker crews that can be purchased
   * 
   * @returns The maximum worker crew level
   */
  getMaxWorkerCrews(): number {
    return CrewQuartersConstants.MAX_WORKER_CREWS;
  }

  /**
   * Calculate the cost of upgrading the reactor
   * 
   * @param currentLevel Current upgrade level
   * @param energyCapacity Current energy capacity (used for scaling base cost)
   * @returns Array of resource costs
   */
  calculateReactorExpansionCost(currentLevel: number, energyCapacity: number): ResourceCost[] {
    const baseEnergyCost = energyCapacity * ReactorConstants.EXPANSION_COST_MULTIPLIER;
    const costs: ResourceCost[] = [
      { type: 'energy', amount: Math.floor(baseEnergyCost) }
    ];

    // Example: Add combat component cost starting at level 5
    if (currentLevel >= 4) { // Cost applies when buying level 5+
      const componentCost = Math.floor(Math.pow(1.5, currentLevel - 3)); // Exponential cost
      costs.push({ type: 'combatComponents', amount: componentCost });
    }

    return costs;
  }

  /**
   * Calculate the cost of upgrading energy converters
   * 
   * @param currentConverters Current energy converter level
   * @returns The cost in energy
   */
  calculateEnergyConverterCost(currentConverters: number): ResourceCost[] {
    const baseEnergyCost = (currentConverters + 1) * ReactorConstants.CONVERTER_COST_BASE;
    const costs: ResourceCost[] = [
      { type: 'energy', amount: baseEnergyCost }
    ];

    return costs;
  }

  /**
   * Calculate the cost of upgrading the processor mainframe
   * 
   * @param insightCapacity Current insight capacity
   * @returns The cost in insight
   */
  calculateMainframeExpansionCost(currentLevel: number, insightCapacity: number): ResourceCost[] {
    const baseInsightCost = insightCapacity * ProcessorConstants.EXPANSION_COST_MULTIPLIER;
    const costs: ResourceCost[] = [
      { type: 'insight', amount: Math.floor(baseInsightCost) }
    ];

    // Example: Add combat component cost
    if (currentLevel >= 4) { // Cost applies when buying level 5+
      const componentCost = Math.floor(Math.pow(1.4, currentLevel - 2));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  /**
   * Calculate the cost of upgrading processing threads
   * 
   * @param currentThreads Current processing thread level
   * @returns The cost in insight
   */
  calculateProcessingThreadCost(currentThreads: number): ResourceCost[] {
    const baseInsightCost = (currentThreads + 1) * ProcessorConstants.THREAD_COST_BASE;
    const costs: ResourceCost[] = [
      { type: 'insight', amount: baseInsightCost }
    ];

    // Example: Add combat component cost
    if (currentThreads >= 2) { // Cost applies when buying level 3+
      const componentCost = Math.floor(Math.pow(1.7, currentThreads));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  /**
   * Calculate the cost of upgrading cargo holds
   * 
   * @param scrapCapacity Current scrap capacity
   * @returns The cost in scrap
   */
  calculateCargoHoldExpansionCost(currentLevel: number, scrapCapacity: number): ResourceCost[] {
    const baseScrapCost = Math.floor(scrapCapacity * ManufacturingConstants.EXPANSION_COST_MULTIPLIER);
    const costs: ResourceCost[] = [
      { type: 'scrap', amount: baseScrapCost }
    ];

    // Example: Add combat component cost
    if (currentLevel >= 5) { // Cost applies when buying level 6+
      const componentCost = Math.floor(Math.pow(1.2, currentLevel - 1));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  /**
   * Calculate the cost of upgrading manufacturing bays
   * 
   * @param currentBays Current manufacturing bay level
   * @returns The cost in scrap
   */
  calculateManufacturingBayCost(currentBays: number): ResourceCost[] {
    const baseScrapCost = (currentBays + 1) * ManufacturingConstants.BAY_COST_BASE;
    const costs: ResourceCost[] = [
      { type: 'scrap', amount: baseScrapCost }
    ];

     // Example: Add combat component cost
     if (currentBays >= 3) { // Cost applies when buying level 4+
      const componentCost = Math.floor(Math.pow(1.9, currentBays - 1));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  /**
   * Check if the player can afford a set of resource costs.
   * 
   * @param state - Current game state
   * @param costs - Array of resource costs to check
   * @returns True if the player has enough resources, false otherwise
   */
  canAffordUpgrade(state: GameState, costs: ResourceCost[]): boolean {
    return this.resourceSystem.hasResources(state, costs);
  }
} 