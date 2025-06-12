import { GameState } from '../types';
import { GameCategory } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { 
  CrewQuartersConstants,
  ReactorConstants,
  ProcessorConstants,
  ManufacturingConstants
} from '../config/gameConstants';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";
import { UPGRADE_CATALOG } from '../config/upgradeCatalog';
import { incrementAtPath } from '../utils/objectPath';

/**
 * UpgradeSystem
 * 
 * Handles purchasing upgrades and calculating stats based on upgrades.
 * Think of this as the R&D department that improves your capabilities.
 */
export class UpgradeSystem {
  private eventBus?: EventBus<EventMap>;

  constructor(eventBus?: EventBus<EventMap>) {
    this.eventBus = eventBus;

    // Listen for purchase requests if bus provided
    if (this.eventBus) {
      this.eventBus.on('PURCHASE_UPGRADE', (data: any) => {
        const { state, category, upgradeType } = data as {
          state: GameState;
          category: GameCategory;
          upgradeType: string;
        };
        this.purchaseUpgrade(state, category, upgradeType);
      });
    }
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
    Logger.debug(LogCategory.UPGRADES, `Attempting to purchase ${upgradeType} in ${category}`, LogContext.UPGRADE_PURCHASE);

    const catalogEntry = UPGRADE_CATALOG[category]?.[upgradeType];

    // For now only reactor is catalog-driven
    if (catalogEntry) {
      const cost = catalogEntry.cost(state);
      const { obj, key } = this.getResourceAccessor(state, catalogEntry.resource);
      if (obj[key] < cost) {
        Logger.debug(LogCategory.UPGRADES, 'Insufficient resources for upgrade', LogContext.UPGRADE_PURCHASE);
        return false;
      }
      obj[key] -= cost;

      incrementAtPath(state, catalogEntry.incrementPath, 1);
      catalogEntry.apply(state);
      return true;
    }

    Logger.warn(LogCategory.UPGRADES, `Unknown upgrade ${upgradeType} in category ${category}`, LogContext.UPGRADE_PURCHASE);
    return false;
  }
  
  /**
   * @deprecated Legacy reactor purchase logic; superseded by catalog-driven flow.
   */
  private purchaseReactorUpgrade(_state: GameState, _upgradeType: string): boolean {
    return false;
  }
  
  /**
   * @deprecated Legacy processor purchase logic; superseded by catalog-driven flow.
   */
  private purchaseProcessorUpgrade(_state: GameState, _upgradeType: string): boolean {
    return false;
  }
  
  /**
   * @deprecated Legacy crew-quarters purchase logic; superseded by catalog-driven flow.
   */
  private purchaseCrewQuartersUpgrade(_state: GameState, _upgradeType: string): boolean {
    return false;
  }
  
  /**
   * @deprecated Legacy manufacturing purchase logic; superseded by catalog-driven flow.
   */
  private purchaseManufacturingUpgrade(_state: GameState, _upgradeType: string): boolean {
    return false;
  }
  
  /**
   * Recalculate stats for all upgrades using catalog apply functions
   */
  updateAllStats(state: GameState): void {
    Object.values(UPGRADE_CATALOG).forEach(cat => {
      Object.values(cat).forEach(def => def.apply(state));
    });
  }
  
  /**
   * Update reactor stats based on upgrades
   */
  private updateReactorStats(state: GameState): void {
    const reactor = state.categories.reactor;
    
    // Calculate energy capacity based on expansions
    // Base capacity = 100, each expansion adds 50% more
    reactor.stats.energyCapacity = ReactorConstants.BASE_ENERGY_CAPACITY * 
      Math.pow(ReactorConstants.ENERGY_CAPACITY_MULTIPLIER, reactor.upgrades.reactorExpansions);
    
    // Calculate energy production based on converters
    // Each converter adds 1 energy per second
    reactor.stats.energyPerSecond = reactor.upgrades.energyConverters * ReactorConstants.ENERGY_PER_CONVERTER;
  }
  
  /**
   * Update processor stats based on upgrades
   */
  private updateProcessorStats(state: GameState): void {
    const processor = state.categories.processor;
    
    // Calculate insight capacity based on mainframe expansions
    // Base capacity = 50, each expansion adds 50% more
    processor.stats.insightCapacity = ProcessorConstants.BASE_INSIGHT_CAPACITY * 
      Math.pow(ProcessorConstants.INSIGHT_CAPACITY_MULTIPLIER, processor.upgrades.mainframeExpansions);
    
    // Calculate insight production based on processing threads
    // Each thread adds 0.2 insight per second
    processor.stats.insightPerSecond = processor.upgrades.processingThreads * ProcessorConstants.INSIGHT_PER_THREAD;
  }
  
  /**
   * Update crew quarters stats based on upgrades
   */
  private updateCrewQuartersStats(state: GameState): void {
    const crewQuarters = state.categories.crewQuarters;
    
    // Calculate crew capacity based on additional quarters
    // Base capacity = 5, each quarters upgrade adds 3 capacity
    crewQuarters.stats.crewCapacity = CrewQuartersConstants.BASE_CREW_CAPACITY + 
      (crewQuarters.upgrades.additionalQuarters * CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE);
    
    // Calculate crew production based on worker crews
    // Each worker crew adds 1.0 awakening progress per second
    crewQuarters.stats.crewPerSecond = crewQuarters.upgrades.workerCrews * CrewQuartersConstants.WORKER_CREW_PRODUCTION_RATE;
  }
  
  /**
   * Update manufacturing stats based on upgrades
   */
  private updateManufacturingStats(state: GameState): void {
    const manufacturing = state.categories.manufacturing;
    
    // Calculate scrap capacity based on cargo hold expansions
    // Base capacity = 100, each expansion adds 50% more
    manufacturing.stats.scrapCapacity = ManufacturingConstants.BASE_SCRAP_CAPACITY * 
      Math.pow(ManufacturingConstants.SCRAP_CAPACITY_MULTIPLIER, manufacturing.upgrades.cargoHoldExpansions);
    
    // Calculate scrap production based on manufacturing bays
    // Each bay adds 0.5 scrap per second
    manufacturing.stats.scrapPerSecond = manufacturing.upgrades.manufacturingBays * ManufacturingConstants.SCRAP_PER_BAY;
  }

  /*** Utility methods for cost calculations ***/

  /**
   * Calculate the cost of upgrading crew quarters
   * 
   * @param crewCapacity Current crew capacity
   * @returns The cost in crew
   */
  calculateQuartersCost(crewCapacity: number): number {
    return Math.floor(crewCapacity * CrewQuartersConstants.QUARTERS_COST_MULTIPLIER);
  }

  /**
   * Calculate the cost of upgrading worker crews
   * 
   * @param currentWorkerCrews Current worker crew level
   * @returns The cost in crew
   */
  calculateWorkerCrewCost(currentWorkerCrews: number): number {
    return Math.floor((currentWorkerCrews + 1) * CrewQuartersConstants.WORKER_CREW_COST_BASE);
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
   * @param energyCapacity Current energy capacity
   * @returns The cost in energy
   */
  calculateReactorExpansionCost(energyCapacity: number): number {
    return energyCapacity * ReactorConstants.EXPANSION_COST_MULTIPLIER;
  }

  /**
   * Calculate the cost of upgrading energy converters
   * 
   * @param currentConverters Current energy converter level
   * @returns The cost in energy
   */
  calculateEnergyConverterCost(currentConverters: number): number {
    return (currentConverters + 1) * ReactorConstants.CONVERTER_COST_BASE;
  }

  /**
   * Calculate the cost of upgrading the processor mainframe
   * 
   * @param insightCapacity Current insight capacity
   * @returns The cost in insight
   */
  calculateMainframeExpansionCost(insightCapacity: number): number {
    return insightCapacity * ProcessorConstants.EXPANSION_COST_MULTIPLIER;
  }

  /**
   * Calculate the cost of upgrading processing threads
   * 
   * @param currentThreads Current processing thread level
   * @returns The cost in insight
   */
  calculateProcessingThreadCost(currentThreads: number): number {
    return (currentThreads + 1) * ProcessorConstants.THREAD_COST_BASE;
  }

  /**
   * Calculate the cost of upgrading cargo holds
   * 
   * @param scrapCapacity Current scrap capacity
   * @returns The cost in scrap
   */
  calculateCargoHoldExpansionCost(scrapCapacity: number): number {
    return Math.floor(scrapCapacity * ManufacturingConstants.EXPANSION_COST_MULTIPLIER);
  }

  /**
   * Calculate the cost of upgrading manufacturing bays
   * 
   * @param currentBays Current manufacturing bay level
   * @returns The cost in scrap
   */
  calculateManufacturingBayCost(currentBays: number): number {
    return (currentBays + 1) * ManufacturingConstants.BAY_COST_BASE;
  }

  private getResourceAccessor(state: GameState, type: string): { obj: any; key: string } {
    switch (type) {
      case 'energy':
        return { obj: state.categories.reactor.resources, key: 'energy' };
      case 'insight':
        return { obj: state.categories.processor.resources, key: 'insight' };
      case 'crew':
        return { obj: state.categories.crewQuarters.resources, key: 'crew' };
      case 'scrap':
        return { obj: state.categories.manufacturing.resources, key: 'scrap' };
      default:
        throw new Error(`Unknown resource type ${type}`);
    }
  }
} 