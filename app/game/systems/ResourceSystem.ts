import { GameState } from '../types';
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import { ProcessorConstants, CrewQuartersConstants, ManufacturingConstants } from '../config/gameConstants';
import { EventBus } from 'core/EventBus';
import { GameEventMap } from 'core/events';
import { Entity, Generator, ResourceStorage } from '../components/interfaces';

/**
 * ResourceSystem
 * 
 * Responsible for calculating and updating resources for all game categories.
 * Think of this as the production department of your game.
 */
export class ResourceSystem {
  private bus?: EventBus<GameEventMap>;

  constructor(eventBus?: EventBus<GameEventMap>) {
    this.bus = eventBus;
    if (this.bus) {
      this.bus.on('resourceClick', this.handleResourceClick.bind(this));
      this.bus.on('adjustAutomation', this.handleAdjustAutomation.bind(this));
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
    // If we have an ECS world attached, prefer that path.
    if (state.world && state.world.length) {
      this.updateWorld(state, state.world, delta, automationHasPower);
      return;
    }

    // 1. Energy Generation (Reactor) - Not affected by automation power cost
    const reactor = state.categories.reactor;
    if (reactor) {
      const energyPerSecond = reactor.stats.energyPerSecond;
      if (energyPerSecond > 0) {
        const capacityLeft = reactor.stats.energyCapacity - reactor.resources.energy;
        const generated = Math.min(capacityLeft, energyPerSecond * delta);
        if (generated > 0) {
          if (this.bus) {
            this.bus.emit('resourceChange', { state, resourceType: 'energy', amount: generated, source: 'auto-gen' });
          } else {
            reactor.resources.energy += generated;
          }
        }
      }
    }
    
    // 2. Insight Generation (Processor)
    const processor = state.categories.processor;
    if (processor && automationHasPower) { // Check power
      const insightPerSecond = processor.stats.insightPerSecond;
      if (insightPerSecond > 0) {
        const capacityLeft = processor.stats.insightCapacity - processor.resources.insight;
        const generated = Math.min(capacityLeft, insightPerSecond * delta);
        if (generated > 0) {
          if (this.bus) {
            this.bus.emit('resourceChange', { state, resourceType: 'insight', amount: generated, source: 'auto-gen' });
          } else {
            processor.resources.insight += generated;
          }
        }
      }
    } // If !automationHasPower, insight doesn't increase
    
    // 3. Crew Awakening (Crew Quarters)
    const crewQuarters = state.categories.crewQuarters;
    if (crewQuarters && automationHasPower) { // Check power
      const crewPerSecond = crewQuarters.stats.crewPerSecond;
      if (crewPerSecond > 0 && crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
        crewQuarters.stats.awakeningProgress += crewPerSecond * delta;
        if (crewQuarters.stats.awakeningProgress >= CrewQuartersConstants.AWAKENING_THRESHOLD) {
          const newCrew = Math.floor(crewQuarters.stats.awakeningProgress / CrewQuartersConstants.AWAKENING_THRESHOLD);
          const capacityLeft = crewQuarters.stats.crewCapacity - crewQuarters.resources.crew;
          const generated = Math.min(capacityLeft, newCrew);
          if (generated > 0) {
            if (this.bus) {
              this.bus.emit('resourceChange', { state, resourceType: 'crew', amount: generated, source: 'auto-gen' });
            } else {
              crewQuarters.resources.crew += generated;
            }
          }
          crewQuarters.stats.awakeningProgress %= CrewQuartersConstants.AWAKENING_THRESHOLD;
        }
      }
    } // If !automationHasPower, awakening progress doesn't increase
    
    // 4. Scrap Collection (Manufacturing)
    const manufacturing = state.categories.manufacturing;
    if (manufacturing && automationHasPower) { // Check power
      const scrapPerSecond = manufacturing.stats.scrapPerSecond;
      if (scrapPerSecond > 0) {
        const capacityLeft = manufacturing.stats.scrapCapacity - manufacturing.resources.scrap;
        const generated = Math.min(capacityLeft, scrapPerSecond * delta);
        if (generated > 0) {
          if (this.bus) {
            this.bus.emit('resourceChange', { state, resourceType: 'scrap', amount: generated, source: 'auto-gen' });
          } else {
            manufacturing.resources.scrap += generated;
          }
        }
      }
    } // If !automationHasPower, scrap doesn't increase
  }

  /**
   * New ECS-based update path. Iterates over entities with Generator components.
   */
  private updateWorld(state: GameState, world: Entity[], delta: number, automationHasPower: boolean) {
    for (const entity of world) {
      const generators = entity.components.filter(
        (c): c is Generator => (c as Generator).ratePerSecond !== undefined
      );

      for (const gen of generators) {
        if (!gen.active) continue;
        if ((gen.outputType !== 'energy') && !automationHasPower) continue; // skip non-powered gens when power off

        const amount = gen.ratePerSecond * delta;
        if (amount <= 0) continue;

        // Find storage component on same entity
        const storage = entity.components.find(
          (c): c is ResourceStorage => (c as ResourceStorage).resourceType === gen.outputType
        );

        if (!storage) continue;

        const capacityLeft = storage.capacity - storage.amount;
        const generated = Math.min(capacityLeft, amount);
        if (generated <= 0) continue;

        if (this.bus) {
          this.bus.emit('resourceChange', {
            state,
            resourceType: gen.outputType,
            amount: generated,
            source: 'ecs-gen',
          });
        } else {
          storage.amount += generated;
        }
      }
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
      
      // Skip if no cost
      if (amount <= 0) continue;
      
      // Check resource type and amount
      switch (type) {
        case 'energy':
          if (state.categories.reactor.resources.energy < amount) {
            return false;
          }
          break;
        case 'insight':
          if (state.categories.processor.resources.insight < amount) {
            return false;
          }
          break;
        case 'crew':
          if (state.categories.crewQuarters.resources.crew < amount) {
            return false;
          }
          break;
        case 'scrap':
          if (state.categories.manufacturing.resources.scrap < amount) {
            return false;
          }
          break;
        case 'combatComponents':
          if (state.combatComponents < amount) {
            return false;
          }
          break;
        case 'bossMatrix':
          if (state.bossMatrix < amount) {
            return false;
          }
          break;
        default:
          Logger.warn(
            LogCategory.RESOURCES,
            `Unknown resource type: ${type}`,
            LogContext.COMBAT
          );
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
    // First check if we have enough resources
    if (!this.hasResources(state, costs)) {
      return false;
    }
    
    // Then consume the resources
    for (const cost of costs) {
      const { type, amount } = cost;
      
      // Skip if no cost
      if (amount <= 0) continue;
      
      // Consume resource
      switch (type) {
        case 'energy':
          state.categories.reactor.resources.energy -= amount;
          Logger.debug(
            LogCategory.RESOURCES,
            `Consumed ${amount} energy`,
            LogContext.COMBAT
          );
          break;
        case 'insight':
          state.categories.processor.resources.insight -= amount;
          Logger.debug(
            LogCategory.RESOURCES,
            `Consumed ${amount} insight`,
            LogContext.COMBAT
          );
          break;
        case 'crew':
          state.categories.crewQuarters.resources.crew -= amount;
          Logger.debug(
            LogCategory.RESOURCES,
            `Consumed ${amount} crew`,
            LogContext.COMBAT
          );
          break;
        case 'scrap':
          state.categories.manufacturing.resources.scrap -= amount;
          Logger.debug(
            LogCategory.RESOURCES,
            `Consumed ${amount} scrap`,
            LogContext.COMBAT
          );
          break;
        case 'combatComponents':
          state.combatComponents -= amount;
          Logger.debug(
            LogCategory.RESOURCES,
            `Consumed ${amount} combatComponents`,
            LogContext.COMBAT
          );
          break;
        case 'bossMatrix':
          state.bossMatrix -= amount;
          Logger.debug(
            LogCategory.RESOURCES,
            `Consumed ${amount} bossMatrix`,
            LogContext.COMBAT
          );
          break;
        default:
          Logger.warn(
            LogCategory.RESOURCES,
            `Unknown resource type: ${type}`,
            LogContext.COMBAT
          );
          return false;
      }
    }
    
    return true;
  }

  // -------------------------------------------------------------------------
  // Resource click logic (moved from ActionSystem)
  // -------------------------------------------------------------------------

  private handleResourceClick(data: { state: GameState; category: string }) {
    const { state, category } = data;

    const energyCost = 1; // using AutomationConstants.ENERGY_COST_PER_CLICK later
    let canAffordEnergy = true;
    let requiresEnergy = false;

    if (category === 'processor' || category === 'crewQuarters' || category === 'manufacturing') {
      requiresEnergy = true;
      const currentEnergy = state.categories.reactor?.resources?.energy ?? 0;
      if (currentEnergy < energyCost) {
        canAffordEnergy = false;
      }
    }

    if (requiresEnergy && !canAffordEnergy) return;

    if (requiresEnergy) {
      this.bus?.emit('resourceChange', { state, resourceType: 'energy', amount: -energyCost, source: 'click' });
    }

    switch (category) {
      case 'reactor': {
        const reactor = state.categories.reactor;
        if (reactor.resources.energy < reactor.stats.energyCapacity) {
          this.bus?.emit('resourceChange', { state, resourceType: 'energy', amount: 1, source: 'click' });
        }
        break;
      }
      case 'processor': {
        const processor = state.categories.processor;
        if (processor.resources.insight < processor.stats.insightCapacity) {
          this.bus?.emit('resourceChange', { state, resourceType: 'insight', amount: processor.stats.insightPerClick, source: 'click' });
        }
        break;
      }
      case 'manufacturing': {
        const man = state.categories.manufacturing;
        if (man.resources.scrap < man.stats.scrapCapacity) {
          this.bus?.emit('resourceChange', { state, resourceType: 'scrap', amount: 1, source: 'click' });
        }
        break;
      }
      case 'crewQuarters': {
        const crew = state.categories.crewQuarters;
        if (crew.resources.crew < crew.stats.crewCapacity) {
          crew.stats.awakeningProgress += 1;
          if (crew.stats.awakeningProgress >= 10) {
            crew.stats.awakeningProgress = 0;
            this.bus?.emit('resourceChange', { state, resourceType: 'crew', amount: 1, source: 'click' });
          }
        }
        break;
      }
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

    const statsMap: Record<string, { activeKey: string; totalKey: string }> = {
      reactor: { activeKey: 'activeEnergyConverters', totalKey: 'energyConverters' },
      processor: { activeKey: 'activeProcessingThreads', totalKey: 'processingThreads' },
      manufacturing: { activeKey: 'activeManufacturingBays', totalKey: 'manufacturingBays' },
      crewQuarters: { activeKey: 'activeWorkerCrews', totalKey: 'workerCrews' },
    };

    if (!statsMap[category]) return;

    const { activeKey, totalKey } = statsMap[category];
    // Using any to index dynamic keys
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats: any = (state.categories as any)[category]?.stats;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upgrades: any = (state.categories as any)[category]?.upgrades;

    if (!stats || !upgrades) return;

    const currentActive = stats[activeKey] ?? 0;
    const purchasedTotal = upgrades[totalKey] ?? 0;

    if (direction === 'increase' && currentActive < purchasedTotal) {
      stats[activeKey] = currentActive + 1;
    } else if (direction === 'decrease' && currentActive > 0) {
      stats[activeKey] = currentActive - 1;
    }

    // Emit state updated so UI refreshes promptly
    this.bus?.emit('stateUpdated', data.state);
  }
} 