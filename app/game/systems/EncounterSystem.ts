import { v4 as uuidv4 } from 'uuid';
import { GameState, BaseEncounter, EmptyEncounter, ResourceReward, RegionType } from '../types';
import { 
  getRandomEmptyEncounterMessage, 
  getRandomEmptyEncounterTitle,
  getRandomEmptyEncounterDescription, 
  generateEmptyEncounterRewards, 
  REGION_ENCOUNTER_CHANCES 
} from '../content/encounters';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { GameSystemManager } from './index';

/**
 * System responsible for generating and managing encounters
 */
export class EncounterSystem {
    private manager: GameSystemManager | null = null;

    constructor() {
        Logger.info(LogCategory.LIFECYCLE, 'EncounterSystem initialized', LogContext.STARTUP);
    }
    
    /**
     * Set the game system manager reference
     */
    setManager(manager: GameSystemManager) {
        this.manager = manager;
    }
    
    /**
     * Generate an encounter based on the current region
     */
    generateEncounter(state: GameState): BaseEncounter {
        const region = state.navigation.currentRegion;
        console.log(`Generating encounter for region: ${region}`);
        
        // For now, we only generate empty encounters
        // In the future, we'll add combat and story encounters
        return this.generateEmptyEncounter(region);
    }
    
    /**
     * Generate an empty encounter
     */
    private generateEmptyEncounter(region: RegionType): EmptyEncounter {
        const message = getRandomEmptyEncounterMessage(region);
        const resources = generateEmptyEncounterRewards(region);
        
        return {
            id: uuidv4(),
            type: 'empty',
            title: getRandomEmptyEncounterTitle(region),
            description: getRandomEmptyEncounterDescription(region),
            region,
            message,
            resources
        };
    }
    
    /**
     * Apply rewards from an encounter to the game state
     */
    applyRewards(state: GameState, rewards: ResourceReward[]): GameState {
        console.log('Applying rewards:', rewards);
        
        // Create a copy of the state to modify
        const newState = { ...state };
        
        // Apply each reward
        rewards.forEach(reward => {
            const { type, amount } = reward;
            
            // Handle different resource types
            switch (type) {
                case 'energy':
                    newState.categories.reactor.resources.energy = Math.min(
                        newState.categories.reactor.resources.energy + amount,
                        newState.categories.reactor.stats.energyCapacity
                    );
                    console.log(`Added ${amount} energy`);
                    break;
                    
                case 'insight':
                    newState.categories.processor.resources.insight = Math.min(
                        newState.categories.processor.resources.insight + amount,
                        newState.categories.processor.stats.insightCapacity
                    );
                    console.log(`Added ${amount} insight`);
                    break;
                    
                case 'crew':
                    if (amount >= 1) {
                        newState.categories.crewQuarters.resources.crew = Math.min(
                            newState.categories.crewQuarters.resources.crew + Math.floor(amount),
                            newState.categories.crewQuarters.stats.crewCapacity
                        );
                        console.log(`Added ${Math.floor(amount)} crew`);
                    }
                    break;
                    
                case 'scrap':
                    newState.categories.manufacturing.resources.scrap = Math.min(
                        newState.categories.manufacturing.resources.scrap + amount,
                        newState.categories.manufacturing.stats.scrapCapacity
                    );
                    console.log(`Added ${amount} scrap`);
                    break;
                    
                default:
                    console.warn(`Unknown reward type: ${type}`);
            }
        });
        
        return newState;
    }
    
    /**
     * Complete the current encounter
     */
    completeEncounter(state: GameState): GameState {
        console.log('Completing encounter');
        
        if (!state.encounters.active || !state.encounters.encounter) {
            console.warn('No active encounter to complete');
            return state;
        }
        
        // Create a copy of the state to modify
        let newState = { ...state };
        
        // Get the current encounter
        const encounter = state.encounters.encounter;
        
        // Apply rewards if it's an empty encounter
        if (encounter.type === 'empty') {
            const emptyEncounter = encounter as EmptyEncounter;
            if (emptyEncounter.resources && emptyEncounter.resources.length > 0) {
                newState = this.applyRewards(newState, emptyEncounter.resources);
            }
        }
        
        // Add to encounter history
        newState.encounters.history = Array.isArray(newState.encounters.history) 
          ? [
              ...newState.encounters.history,
              {
                  id: encounter.id,
                  type: encounter.type,
                  result: 'completed',
                  date: Date.now(),
                  region: encounter.region
              }
            ]
          : [
              {
                  id: encounter.id,
                  type: encounter.type,
                  result: 'completed',
                  date: Date.now(),
                  region: encounter.region
              }
            ];
        
        // Clear the active encounter
        newState.encounters.active = false;
        newState.encounters.encounter = undefined;
        
        return newState;
    }
} 