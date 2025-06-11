import { GameState } from '../types';
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"

/**
 * ResourceSystem
 * 
 * Responsible for calculating and updating resources for all game categories.
 * Think of this as the production department of your game.
 */
export class ResourceSystem {
  /**
   * Update all resources based on production rates and time passed
   * 
   * @param state - Current game state
   * @param delta - Time passed in seconds since last update
   */
  update(state: GameState, delta: number) {
    this.updateReactor(state, delta);
    this.updateProcessor(state, delta);
    this.updateCrewQuarters(state, delta);
    this.updateManufacturing(state, delta);
  }

  /**
   * Update reactor resources (energy)
   */
  private updateReactor(state: GameState, delta: number) {
    const reactor = state.categories.reactor;
    const energyProduced = reactor.stats.energyPerSecond * delta;
    
    // Only process if there's actual production
    if (energyProduced > 0) {
      // Add resources but don't exceed capacity
      reactor.resources.energy = Math.min(
        reactor.resources.energy + energyProduced,
        reactor.stats.energyCapacity
      );
    }
  }

  /**
   * Update processor resources (insight)
   */
  private updateProcessor(state: GameState, delta: number) {
    const processor = state.categories.processor;
    const insightProduced = processor.stats.insightPerSecond * delta;
    
    if (insightProduced > 0) {
      processor.resources.insight = Math.min(
        processor.resources.insight + insightProduced,
        processor.stats.insightCapacity
      );
    }
  }

  /**
   * Update crew quarters resources (crew)
   */
  private updateCrewQuarters(state: GameState, delta: number) {
    const crewQuarters = state.categories.crewQuarters;
    const awakeningProgressPerSecond = crewQuarters.stats.crewPerSecond;
    const progressAdded = awakeningProgressPerSecond * delta;
    
    // Log crew production
    if (awakeningProgressPerSecond > 0) {
      Logger.debug(
        LogCategory.RESOURCES,
        `Crew production: ${progressAdded.toFixed(5)} progress (rate: ${awakeningProgressPerSecond}/s, delta: ${delta.toFixed(5)}s)`,
        LogContext.CREW_LIFECYCLE
      );
    }
    
    if (progressAdded > 0 && crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
      // Log current values before update
      const oldProgress = crewQuarters.stats.awakeningProgress;
      const oldCrew = crewQuarters.resources.crew;
      
      // Add progress
      crewQuarters.stats.awakeningProgress += progressAdded;
      
      // Check if we've reached the threshold to add crew
      while (crewQuarters.stats.awakeningProgress >= 10 && crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
        // Add one crew member
        crewQuarters.resources.crew = Math.min(
          crewQuarters.resources.crew + 1,
          crewQuarters.stats.crewCapacity
        );
        
        // Subtract 10 from progress
        crewQuarters.stats.awakeningProgress -= 10;
        
        Logger.info(
          LogCategory.RESOURCES,
          `Crew member auto-awakened! Current crew: ${crewQuarters.resources.crew}`,
          LogContext.CREW_LIFECYCLE
        );
      }
      
      // Cap awakening progress at 10
      crewQuarters.stats.awakeningProgress = Math.min(crewQuarters.stats.awakeningProgress, 10);
      
      // Log the change
      if (oldProgress !== crewQuarters.stats.awakeningProgress || oldCrew !== crewQuarters.resources.crew) {
        Logger.debug(
          LogCategory.RESOURCES,
          `Awakening progress updated: ${oldProgress.toFixed(2)} -> ${crewQuarters.stats.awakeningProgress.toFixed(2)}`,
          LogContext.CREW_LIFECYCLE
        );
        
        if (oldCrew !== crewQuarters.resources.crew) {
          Logger.debug(
            LogCategory.RESOURCES,
            `Crew updated: ${oldCrew.toFixed(2)} -> ${crewQuarters.resources.crew.toFixed(2)}`,
            LogContext.CREW_LIFECYCLE
          );
        }
      }
    }
  }

  /**
   * Update manufacturing resources (scrap)
   */
  private updateManufacturing(state: GameState, delta: number) {
    const manufacturing = state.categories.manufacturing;
    const scrapProduced = manufacturing.stats.scrapPerSecond * delta;
    
    if (scrapProduced > 0) {
      manufacturing.resources.scrap = Math.min(
        manufacturing.resources.scrap + scrapProduced,
        manufacturing.stats.scrapCapacity
      );
    }
  }

  /**
   * Helper to access any resource amount generically.
   * Returns the object holding the value and the key so that the caller can
   * both read and mutate the value without a long switch-case.
   */
  private getResourceAccessor(state: GameState, type: string): { obj: any; key: string } | null {
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
        return null;
    }
  }

  /**
   * Check if the player has enough resources for a cost
   * 
   * @param state - Current game state
   * @param costs - Array of resource costs to check
   * @returns True if the player has enough resources, false otherwise
   */
  hasResources(state: GameState, costs: { type: string; amount: number }[]): boolean {
    for (const { type, amount } of costs) {
      if (amount <= 0) continue; // Nothing to check

      const accessor = this.getResourceAccessor(state, type);
      if (!accessor) {
        Logger.warn(
          LogCategory.RESOURCES,
          `Unknown resource type: ${type}`,
          LogContext.COMBAT
        );
        return false;
      }

      if (accessor.obj[accessor.key] < amount) {
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
  consumeResources(state: GameState, costs: { type: string; amount: number }[]): boolean {
    if (!this.hasResources(state, costs)) {
      return false; // Not enough resources
    }

    for (const { type, amount } of costs) {
      if (amount <= 0) continue;

      const accessor = this.getResourceAccessor(state, type);
      if (!accessor) {
        Logger.warn(
          LogCategory.RESOURCES,
          `Unknown resource type: ${type}`,
          LogContext.COMBAT
        );
        return false;
      }

      accessor.obj[accessor.key] -= amount;

      Logger.debug(
        LogCategory.RESOURCES,
        `Consumed ${amount} ${type}`,
        LogContext.COMBAT
      );
    }

    return true;
  }
} 