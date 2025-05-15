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
import { EventBus } from 'core/EventBus';
import { getCategoryEntity } from 'core/ecs/selectors';
import { Upgradable, UpgradeKey, ResourceStorage, Generator } from '../components/interfaces';
import { ResourceSystem } from './ResourceSystem';

// Map legacy upgrade keys (from UI/events) to namespaced UpgradeKey
const legacyToUpgradeKey: Record<string, UpgradeKey> = {
  reactorExpansions: 'reactor:expansions',
  energyConverters: 'reactor:converters',
  mainframeExpansions: 'processor:expansions',
  processingThreads: 'processor:threads',
  additionalQuarters: 'crew:quartersExpansion',
  workerCrews: 'crew:workerCrews',
  cargoHoldExpansions: 'manufacturing:expansions',
  manufacturingBays: 'manufacturing:bays',
};

/**
 * UpgradeSystem
 * 
 * Handles purchasing upgrades and calculating stats based on upgrades.
 * Think of this as the R&D department that improves your capabilities.
 */
export class UpgradeSystem {
  private currentState?: GameState;
  private world?: import('core/ecs/World').World;
  constructor(private bus?: EventBus, private resourceSystem?: ResourceSystem) {
    if (this.bus) {
      // Phase-5 namespaced action
      this.bus.on('action:purchase_upgrade', this.handleActionPurchaseUpgrade.bind(this));
    }
  }

  /**
   * Attempt to purchase an upgrade
   * 
   * @param state - Current game state
   * @param category - Category the upgrade belongs to
   * @param upgradeKey - Namespaced key of the upgrade to purchase
   * @returns Whether the purchase was successful
   */
  purchaseUpgrade(state: GameState, category: GameCategory, upgradeKey: UpgradeKey): boolean {
    Logger.debug(
      LogCategory.UPGRADES,
      `Attempting to purchase ${upgradeKey} in ${category}`,
      LogContext.UPGRADE_PURCHASE
    );

    const entity = getCategoryEntity(state.world, category);
    if (!entity) return false;
    const upg = entity.get<Upgradable>(upgradeKey);
    if (!upg) return false;
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    const costs = this.getCostsFor(upgradeKey, upg, storage);
    if (!this.hasResources(state, costs)) return false;
    this.consumeResources(state, costs);
    upg.level += 1;
    // Update stats after purchase
    this.updateAllStats(state);
    if (this.bus) {
      const payload = { category, upgradeType: upgradeKey as string, state };
      (this.bus as any).publish?.('upgrade:purchased', payload);
      this.bus.emit('upgradePurchased', { state, category, upgradeType: upgradeKey as string });
      this.bus.emit('stateUpdated', state);
    }
    return true;
  }

  /**
   * Get resource costs for a namespaced upgrade key
   */
  public getCostsFor(
    upgradeKey: UpgradeKey,
    upg: Upgradable,
    storage?: ResourceStorage
  ): ResourceCost[] {
    switch (upgradeKey) {
      case 'reactor:expansions':
        return this.calculateReactorExpansionCost(upg.level, storage?.capacity ?? 0);
      case 'reactor:converters':
        return this.calculateEnergyConverterCost(upg.level);
      case 'processor:expansions':
        return this.calculateMainframeExpansionCost(upg.level, storage?.capacity ?? 0);
      case 'processor:threads':
        return this.calculateProcessingThreadCost(upg.level);
      case 'crew:quartersExpansion':
        return this.calculateQuartersCost(upg.level, storage?.capacity ?? 0);
      case 'crew:workerCrews':
        return this.calculateWorkerCrewCost(upg.level);
      case 'manufacturing:expansions':
        return this.calculateCargoHoldExpansionCost(upg.level, storage?.capacity ?? 0);
      case 'manufacturing:bays':
        return this.calculateManufacturingBayCost(upg.level);
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown upgrade key: ${upgradeKey}`,
          LogContext.UPGRADE_PURCHASE
        );
        return [];
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
    const entity = getCategoryEntity(state.world, 'reactor');
    if (!entity) return;
    
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    const expansions = entity.get<Upgradable>('reactor:expansions');
    if (storage && expansions) {
      storage.capacity = ReactorConstants.BASE_ENERGY_CAPACITY * 
        Math.pow(ReactorConstants.ENERGY_CAPACITY_MULTIPLIER, expansions.level);
    }

    const generator = entity.get<Generator>('Generator');
    const converters = entity.get<Upgradable>('reactor:converters');
    if (generator && converters) {
      generator.ratePerSecond = converters.level * ReactorConstants.ENERGY_PER_CONVERTER;
    }
  }
  
  /**
   * Update processor stats based on upgrades
   */
  private updateProcessorStats(state: GameState): void {
    const entity = getCategoryEntity(state.world, 'processor');
    if (!entity) return;
    
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    const expansions = entity.get<Upgradable>('processor:expansions');
    if (storage && expansions) {
      storage.capacity = ProcessorConstants.BASE_INSIGHT_CAPACITY * 
        Math.pow(ProcessorConstants.INSIGHT_CAPACITY_MULTIPLIER, expansions.level);
    }

    const generator = entity.get<Generator>('Generator');
    const threads = entity.get<Upgradable>('processor:threads');
    if (generator && threads) {
      generator.ratePerSecond = threads.level * ProcessorConstants.INSIGHT_PER_THREAD;
    }
  }
  
  /**
   * Update crew quarters stats based on upgrades
   */
  private updateCrewQuartersStats(state: GameState): void {
    const entity = getCategoryEntity(state.world, 'crewQuarters');
    if (!entity) return;
    
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    const quartersExpansion = entity.get<Upgradable>('crew:quartersExpansion');
    if (storage && quartersExpansion) {
      storage.capacity = CrewQuartersConstants.BASE_CREW_CAPACITY + 
        (quartersExpansion.level * CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE);
    }

    const generator = entity.get<Generator>('Generator');
    const workerCrews = entity.get<Upgradable>('crew:workerCrews');
    if (generator && workerCrews) {
      generator.ratePerSecond = workerCrews.level * CrewQuartersConstants.WORKER_CREW_PRODUCTION_RATE;
    }
  }
  
  /**
   * Update manufacturing stats based on upgrades
   */
  private updateManufacturingStats(state: GameState): void {
    const entity = getCategoryEntity(state.world, 'manufacturing');
    if (!entity) return;
    
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    const expansions = entity.get<Upgradable>('manufacturing:expansions');
    if (storage && expansions) {
      storage.capacity = ManufacturingConstants.BASE_SCRAP_CAPACITY * 
        Math.pow(ManufacturingConstants.SCRAP_CAPACITY_MULTIPLIER, expansions.level);
    }

    const generator = entity.get<Generator>('Generator');
    const bays = entity.get<Upgradable>('manufacturing:bays');
    if (generator && bays) {
      generator.ratePerSecond = bays.level * ManufacturingConstants.SCRAP_PER_BAY;
    }
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
    return this.hasResources(state, costs);
  }

  /**
   * ----------------------------------------------------------------------
   * Resource helpers (formerly provided by ResourceSystem)
   * ----------------------------------------------------------------------
   */

  private hasResources(state: GameState, costs: ResourceCost[]): boolean {
    if (!this.resourceSystem) {
      Logger.warn(LogCategory.UPGRADES, 'ResourceSystem not available in UpgradeSystem for hasResources check');
      return false;
    }
    return this.resourceSystem.hasResources(state, costs);
  }

  private consumeResources(state: GameState, costs: ResourceCost[]): boolean {
    if (!this.resourceSystem) {
      Logger.warn(LogCategory.UPGRADES, 'ResourceSystem not available in UpgradeSystem for consumeResources');
      return false; // Or throw error, depending on desired handling
    }
    // hasResources check is done within ResourceSystem.consumeResources, no need to repeat here.
    return this.resourceSystem.consumeResources(state, costs);
  }

  /** Cache latest state & world so action handlers can mutate */
  setState(state: GameState) {
    this.currentState = state;
    this.world = state.world;
  }

  // -------------------------------------------------------------------------
  // Phase-5 action handler – mutate via ECS entityId/upgradable key
  // -------------------------------------------------------------------------
  private handleActionPurchaseUpgrade(data: { entityId: string; upgradeId: string }) {
    if (!this.currentState || !this.world) return;
    const { entityId, upgradeId } = data;
    const entity = this.world.entities.get(entityId);
    if (!entity) return;

    // Determine category from tag – assume first tag is category
    const tagComp = entity.get<{ tags: Set<string> }>('Tag');
    const category = tagComp ? Array.from(tagComp.tags.values())[0] : undefined;
    if (!category) return;

    const key = upgradeId as UpgradeKey; // Assume already namespaced
    this.purchaseUpgrade(this.currentState, category as any, key);
  }
} 