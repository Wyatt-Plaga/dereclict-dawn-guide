import { GameState } from '../types';

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
    const crewProduced = crewQuarters.stats.crewPerSecond * delta;
    
    if (crewProduced > 0) {
      crewQuarters.resources.crew = Math.min(
        crewQuarters.resources.crew + crewProduced,
        crewQuarters.stats.crewCapacity
      );
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
} 