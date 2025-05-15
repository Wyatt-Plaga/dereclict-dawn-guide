import { GameState } from '../types';
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import { EventBus } from 'core/EventBus';
import { GameEventMap } from 'core/events';
import { Entity, Generator, ResourceStorage, Upgradable, UpgradeKey } from '../components/interfaces';
import { createWorldFromGameState } from '../ecs/factory';
import { CrewQuartersConstants } from '../config/gameConstants';
import { getCategoryEntity, getComponent } from 'core/ecs/selectors';
import { World } from 'core/ecs/World';
import { UpgradeSystem } from './UpgradeSystem';

/**
 * ResourceSystem
 * 
 * Responsible for calculating and updating resources for all game categories.
 * Think of this as the production department of your game.
 */
export class ResourceSystem {
  private bus?: EventBus<GameEventMap>;
  private currentState?: GameState;
  private world?: World;

  constructor(eventBus?: EventBus<GameEventMap>) {
    this.bus = eventBus;
    if (this.bus) {
      this.bus.on('resourceClick', this.handleResourceClick.bind(this));
      this.bus.on('adjustAutomation', this.handleAdjustAutomation.bind(this));
      this.bus.on('upgradePurchased', this.handleUpgradePurchased.bind(this));
      this.bus.on('action:resource_click', this.handleActionResourceClick.bind(this));
    }
  }

  /**
   * Update resources based on production rates
   * 
   * @param state - Current game state
   * @param delta - Time since last update in seconds
   * @param automationHasPower - Flag indicating if automation units have power
   */
  update(state: GameState, delta: number, automationHasPower: boolean = true): void {
    // Cache current state & world reference for action handlers
    this.currentState = state;
    this.world = state.world;
    // Ensure a world snapshot exists (lazy convert legacy state on first run)
    if (!state.world || state.world.entities.size === 0) {
      // If world is missing or empty, create it from legacy state
      state.world = createWorldFromGameState(state);
      this.world = state.world;
    }
    this.updateWorld(state, state.world, delta, automationHasPower);
  }

  /**
   * New ECS-based update path. Iterates over entities with Generator components.
   */
  private updateWorld(state: GameState, world: World, delta: number, automationHasPower: boolean) {
    // Query all entities with a Generator component
    for (const entity of world.query(e => e.has('Generator'))) {
      const gen = entity.get<Generator>('Generator');
      const storage = entity.get<ResourceStorage>('ResourceStorage');
      if (!gen || !storage) continue;
      // If we ever add outputType/active to Generator, add those checks here
      // For now, assume all generators are active and powered
      const amount = gen.ratePerSecond * delta;
      if (amount <= 0) continue;
      const capacityLeft = storage.capacity - storage.current;
      const generated = Math.min(capacityLeft, amount);
      if (generated <= 0) continue;
      storage.current += generated;
      // Optionally, emit events here if needed
    }
  }

  /**
   * Check if the player has enough resources for a cost
   * 
   * @param state - Current game state
   * @param costs - Array of resource costs to check
   * @returns True if the player has enough resources, false otherwise
   */
  hasResources(state: GameState, costs: { type: string, amount: number }[]): boolean {
    for (const cost of costs) {
      const { type, amount } = cost;
      if (amount <= 0) continue;
      let entity = getCategoryEntity(state.world, this.categoryForResource(type));
      let storage = entity && getComponent<ResourceStorage>(entity, 'ResourceStorage');
      switch (type) {
        case 'energy':
        case 'insight':
        case 'crew':
        case 'scrap':
          if (!storage || storage.current < amount) return false;
          break;
        case 'combatComponents':
          if (state.combatComponents < amount) return false;
          break;
        case 'bossMatrix':
          if (state.bossMatrix < amount) return false;
          break;
        default:
          Logger.warn(LogCategory.RESOURCES, `Unknown resource type: ${type}`, LogContext.COMBAT);
          return false;
      }
    }
    return true;
  }
  
  /**
   * Consume resources for a cost
   * 
   * @param state - Current game state
   * @param costs - Array of resource costs to consume
   * @returns True if resources were consumed, false if not enough resources
   */
  consumeResources(state: GameState, costs: { type: string, amount: number }[]): boolean {
    if (!this.hasResources(state, costs)) return false;
    for (const cost of costs) {
      const { type, amount } = cost;
      if (amount <= 0) continue;
      let entity = getCategoryEntity(state.world, this.categoryForResource(type));
      let storage = entity && getComponent<ResourceStorage>(entity, 'ResourceStorage');
      switch (type) {
        case 'energy':
        case 'insight':
        case 'crew':
        case 'scrap':
          if (storage) storage.current -= amount;
          break;
        case 'combatComponents':
          state.combatComponents -= amount;
          break;
        case 'bossMatrix':
          state.bossMatrix -= amount;
          break;
        default:
          Logger.warn(LogCategory.RESOURCES, `Unknown resource type: ${type}`, LogContext.COMBAT);
      }
    }
    return true;
  }

  private categoryForResource(type: string): string {
    switch (type) {
      case 'energy': return 'reactor';
      case 'insight': return 'processor';
      case 'crew': return 'crewQuarters';
      case 'scrap': return 'manufacturing';
      default: return '';
    }
  }

  // -------------------------------------------------------------------------
  // Resource click logic (moved from ActionSystem)
  // -------------------------------------------------------------------------

  private handleResourceClick(data: { state: GameState; category: string }) {
    const { state, category } = data;
    const energyCost = 1;
    let canAffordEnergy = true;
    let requiresEnergy = false;
    if (category === 'processor' || category === 'crewQuarters' || category === 'manufacturing') {
      requiresEnergy = true;
      const reactor = getCategoryEntity(state.world, 'reactor');
      const storage = reactor && getComponent<ResourceStorage>(reactor, 'ResourceStorage');
      const currentEnergy = storage?.current ?? 0;
      if (currentEnergy < energyCost) canAffordEnergy = false;
    }
    if (requiresEnergy && !canAffordEnergy) return;
    if (requiresEnergy) {
      this.bus?.emit('resourceChange', { state, resourceType: 'energy', amount: -energyCost, source: 'click' });
    }
    const entity = getCategoryEntity(state.world, category);
    const storage = entity && getComponent<ResourceStorage>(entity, 'ResourceStorage');
    switch (category) {
      case 'reactor':
        if (storage && storage.current < storage.capacity) {
          this.bus?.emit('resourceChange', { state, resourceType: 'energy', amount: 1, source: 'click' });
        }
        break;
      case 'processor':
        // For now, assume insightPerClick is 1
        if (storage && storage.current < storage.capacity) {
          this.bus?.emit('resourceChange', { state, resourceType: 'insight', amount: 1, source: 'click' });
        }
        break;
      case 'manufacturing':
        if (storage && storage.current < storage.capacity) {
          this.bus?.emit('resourceChange', { state, resourceType: 'scrap', amount: 1, source: 'click' });
        }
        break;
      case 'crewQuarters':
        // For now, increment crew if under capacity
        if (storage && storage.current < storage.capacity) {
          // Simulate awakening progress
          // (You may want to add a CrewAwakening component for full ECS)
          storage.current += 1;
          this.bus?.emit('resourceChange', { state, resourceType: 'crew', amount: 1, source: 'click' });
        }
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Automation adjustment logic (migrated from ActionSystem)
  // -------------------------------------------------------------------------

  private handleAdjustAutomation(data: {
    state: GameState;
    category: string;
    automationType: string;
    direction: 'increase' | 'decrease';
  }) {
    const { state, category, automationType, direction } = data;
    const entity = getCategoryEntity(state.world, category);
    if (!entity) return;
    // For now, assume Generator is the automation component
    const gen = getComponent<Generator>(entity, 'Generator');
    if (!gen) return;
    // Simulate automation adjustment (add/remove active flag)
    if (direction === 'increase') gen.active = true;
    else if (direction === 'decrease') gen.active = false;
    this.bus?.emit('stateUpdated', data.state);
  }

  /**
   * Handles the 'upgrade:purchased' event to deduct resources.
   */
  private handleUpgradePurchased(data: { state: GameState; category: string; upgradeType: string /*legacy key*/ }) {
    const { state, category, upgradeType } = data;
    const upgradeKey = legacyToUpgradeKey[upgradeType];

    if (!upgradeKey) {
      Logger.warn(LogCategory.RESOURCES, `UpgradeSystem published unmapped legacy upgradeType: ${upgradeType}`);
      return;
    }

    const entity = getCategoryEntity(state.world, category);
    if (!entity) {
      Logger.warn(LogCategory.RESOURCES, `Could not find entity for category ${category} during upgrade cost deduction.`);
      return;
    }

    const upg = entity.get<Upgradable>(upgradeKey);
    if (!upg) {
      Logger.warn(LogCategory.RESOURCES, `Could not find Upgradable component ${upgradeKey} on entity ${entity.id}`);
      return;
    }

    // HACK: Temporarily use UpgradeSystem's getCostsFor. This will be refactored.
    // We need a way to get costs without instantiating UpgradeSystem or creating circular dependencies.
    // For now, we assume the level on `upg` is the *new* level (already incremented).
    // The cost should be for the level *just purchased* (i.e. newLevel -1)
    const costCalculationLevel = upg.level -1;
    if (costCalculationLevel < 0) {
      Logger.warn(LogCategory.RESOURCES, `Cannot calculate cost for level ${costCalculationLevel} for ${upgradeKey}`);
      return;
    }
    const tempUpgForCostCalc: Upgradable = { ...upg, level: costCalculationLevel };
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    // Instantiate a temporary UpgradeSystem (without EventBus) to access cost calculation logic
    const tempUpgradeSystem = new UpgradeSystem(undefined, this as any);
    const costs = tempUpgradeSystem.getCostsFor(upgradeKey, tempUpgForCostCalc, storage);

    if (!costs || costs.length === 0) {
      Logger.warn(
        LogCategory.RESOURCES,
        `No costs found for ${upgradeKey} at level ${upg.level - 1}. Cannot deduct resources.`
      );
      return;
    }

    Logger.debug(
      LogCategory.RESOURCES,
      `Deducting costs for ${upgradeKey} (level ${upg.level}): ${JSON.stringify(costs)}`
    );
    this.consumeResources(state, costs);
    // Note: ResourceSystem doesn't emit stateUpdated; UpgradeSystem does after stat recalculation.
  }

  // -------------------------------------------------------------------------
  // Phase-5 action handler – lightweight direct mutation
  // -------------------------------------------------------------------------
  private handleActionResourceClick(data: { entityId: string; amount?: number }) {
    const { entityId, amount = 1 } = data;
    if (!this.world) return;
    const entity = this.world.entities.get(entityId);
    if (!entity) return;
    const storage = entity.get<ResourceStorage>('ResourceStorage');
    if (!storage) return;
    const delta = Math.min(amount, storage.capacity - storage.current);
    if (delta <= 0) return;
    storage.current += delta;

    // Optionally fire a typed change event for other subscribers
    this.bus?.publish?.('resource:changed' as any, {
      category: entityId,
      delta,
      state: this.currentState,
    });
  }
}

// Map legacy upgrade keys (from UI/events) to namespaced UpgradeKey
// TODO: Move this to a shared config in Commit B
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