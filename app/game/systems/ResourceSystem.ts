import { GameState } from '../types';
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import { ProcessorConstants, CrewQuartersConstants, ManufacturingConstants } from '../config/gameConstants';

/**
 * ResourceSystem
 * 
 * Responsible for calculating and updating resources for all game categories.
 * Think of this as the production department of your game.
 */
export class ResourceSystem {
  /**
   * Update resources based on production rates
   * 
   * @param state - Current game state
   * @param delta - Time since last update in seconds
   * @param automationHasPower - Flag indicating if automation units have power
   */
  update(state: GameState, delta: number, automationHasPower: boolean = true): void {
    // 1. Energy Generation (Reactor) - Not affected by automation power cost
    const reactor = state.categories.reactor;
    if (reactor) {
      const energyPerSecond = reactor.stats.energyPerSecond;
      if (energyPerSecond > 0) {
        reactor.resources.energy = Math.min(
          reactor.stats.energyCapacity,
          reactor.resources.energy + energyPerSecond * delta
        );
      }
    }
    
    // 2. Insight Generation (Processor)
    const processor = state.categories.processor;
    if (processor && automationHasPower) { // Check power
      const insightPerSecond = processor.stats.insightPerSecond;
      if (insightPerSecond > 0) {
        processor.resources.insight = Math.min(
          processor.stats.insightCapacity,
          processor.resources.insight + insightPerSecond * delta
        );
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
          crewQuarters.resources.crew = Math.min(
            crewQuarters.stats.crewCapacity,
            crewQuarters.resources.crew + newCrew
          );
          crewQuarters.stats.awakeningProgress %= CrewQuartersConstants.AWAKENING_THRESHOLD;
        }
      }
    } // If !automationHasPower, awakening progress doesn't increase
    
    // 4. Scrap Collection (Manufacturing)
    const manufacturing = state.categories.manufacturing;
    if (manufacturing && automationHasPower) { // Check power
      const scrapPerSecond = manufacturing.stats.scrapPerSecond;
      if (scrapPerSecond > 0) {
        manufacturing.resources.scrap = Math.min(
          manufacturing.stats.scrapCapacity,
          manufacturing.resources.scrap + scrapPerSecond * delta
        );
      }
    } // If !automationHasPower, scrap doesn't increase
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
} 