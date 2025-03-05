import { v4 as uuidv4 } from 'uuid';
import { 
    GameState, 
    BaseEncounter, 
    EmptyEncounter, 
    StoryEncounter,
    ResourceReward, 
    RegionType, 
    EncounterChoice 
} from '../types';
import { 
  getRandomEmptyEncounterMessage, 
  getRandomEmptyEncounterTitle,
  getRandomEmptyEncounterDescription, 
  generateEmptyEncounterRewards, 
  REGION_ENCOUNTER_CHANCES,
  STORY_ENCOUNTERS,
  getGenericStoryEncounter
} from '../content/encounters';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EventBus } from '../core/EventBus';
import { REGION_DEFINITIONS } from '../content/regions';

/**
 * System responsible for generating and managing encounters
 */
export class EncounterSystem {
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        Logger.info(LogCategory.LIFECYCLE, 'EncounterSystem initialized', LogContext.STARTUP);
    }
    
    /**
     * Generate an encounter based on the current region
     */
    generateEncounter(state: GameState): BaseEncounter {
        const region = state.navigation.currentRegion;
        console.log(`Generating encounter for region: ${region}`);
        
        // Get encounter chances for the current region
        const encounterChances = REGION_ENCOUNTER_CHANCES[region] || 
            { combat: 0.3, empty: 0.5, narrative: 0.2 }; // Fallback values if region not found
        
        // Generate a random value to determine encounter type
        const randomValue = Math.random();
        
        // Determine the type of encounter based on region probabilities
        if (randomValue < encounterChances.combat) {
            // Combat encounter - delegate to the combat system
            return this.generateCombatEncounter(region);
        } else if (randomValue < encounterChances.combat + encounterChances.empty) {
            // Empty encounter
            return this.generateEmptyEncounter(region);
        } else {
            // Narrative/story encounter
            return this.generateStoryEncounter(region);
        }
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
     * Generate a story encounter with choices
     */
    private generateStoryEncounter(region: RegionType): StoryEncounter {
        // Get the array of story encounters for this region
        const regionEncounters = STORY_ENCOUNTERS[region];
        
        // If there are no encounters defined for this region, use the generic encounter
        if (!regionEncounters || regionEncounters.length === 0) {
            return getGenericStoryEncounter(region);
        }
        
        // Select a random encounter from the available ones for this region
        const randomIndex = Math.floor(Math.random() * regionEncounters.length);
        
        // Deep clone the encounter to avoid mutating the original data
        // This ensures that we don't reuse the same ID if this encounter is selected again
        return JSON.parse(JSON.stringify(regionEncounters[randomIndex]));
    }
    
    /**
     * Apply rewards from an encounter to the game state
     */
    applyRewards(state: GameState, rewards: ResourceReward[]): GameState {
        Logger.info(LogCategory.RESOURCES, 'Applying encounter rewards', LogContext.NONE);
        
        // Create a copy of the state to modify
        const newState = { ...state };
        
        // Apply each reward
        rewards.forEach(reward => {
            const { type, amount } = reward;
            
            // Emit an event for resource changes instead of directly modifying the state
            this.eventBus.emit('resourceChange', {
                state: newState,
                resourceType: type,
                amount: amount,
                source: 'encounter'
            });
            
            // Log the resource changes
            switch (type) {
                case 'energy':
                    Logger.debug(LogCategory.RESOURCES, `Added ${amount} energy from encounter`, LogContext.NONE);
                    break;
                    
                case 'insight':
                    Logger.debug(LogCategory.RESOURCES, `Added ${amount} insight from encounter`, LogContext.NONE);
                    break;
                    
                case 'crew':
                    if (amount >= 1) {
                        Logger.debug(LogCategory.RESOURCES, `Added ${Math.floor(amount)} crew from encounter`, LogContext.NONE);
                    }
                    break;
                    
                case 'scrap':
                    Logger.debug(LogCategory.RESOURCES, `Added ${amount} scrap from encounter`, LogContext.NONE);
                    break;
                    
                default:
                    Logger.warn(LogCategory.RESOURCES, `Unknown resource type: ${type}`, LogContext.NONE);
            }
        });
        
        return newState;
    }
    
    /**
     * Complete the current encounter
     */
    completeEncounter(state: GameState, choiceId?: string): GameState {
        Logger.info(
            LogCategory.ACTIONS,
            'Completing encounter',
            LogContext.NONE
        );
        
        if (!state.encounters.active || !state.encounters.encounter) {
            Logger.warn(
                LogCategory.ACTIONS,
                'No active encounter to complete',
                LogContext.NONE
            );
            return state;
        }
        
        // Create a copy of the state to modify
        let newState = { ...state };
        
        // Get the current encounter
        const encounter = state.encounters.encounter;
        
        // Handle different encounter types
        if (encounter.type === 'empty') {
            const emptyEncounter = encounter as EmptyEncounter;
            if (emptyEncounter.resources && emptyEncounter.resources.length > 0) {
                newState = this.applyRewards(newState, emptyEncounter.resources);
            }
        } else if (encounter.type === 'story') {
            const storyEncounter = encounter as StoryEncounter;
            
            // Make sure a choice was made
            if (!choiceId) {
                console.warn('No choice was made for story encounter');
                return state;
            }
            
            // Find the selected choice
            const selectedChoice = storyEncounter.choices.find(choice => choice.id === choiceId);
            if (!selectedChoice) {
                console.warn(`Invalid choice ID: ${choiceId}`);
                return state;
            }
            
            // Apply rewards from the outcome if any
            if (selectedChoice.outcome.resources && selectedChoice.outcome.resources.length > 0) {
                newState = this.applyRewards(newState, selectedChoice.outcome.resources);
            }
        } else if (encounter.type === 'combat') {
            // Combat encounters will be handled by the CombatSystem
            
            // Log that we're starting combat
            Logger.info(
                LogCategory.COMBAT,
                'Combat encounter detected - initiating combat sequence',
                LogContext.COMBAT
            );
            
            // Get the combat encounter details
            const combatEncounter = encounter as BaseEncounter;
            
            // Extract region from the encounter
            const regionId = combatEncounter.region;
            
            // Generate a random enemy from the region
            const enemyId = this.generateRandomEnemyForRegion(regionId);
            
            if (enemyId) {
                // Instead of directly calling CombatSystem, emit an event
                this.eventBus.emit('combatEncounterTriggered', {
                    state: newState,
                    enemyId: enemyId,
                    regionId: regionId
                });
                
                // Mark the encounter as completed, but combat as active
                // This will clear the encounter and allow the combat to be handled by the battle page
                newState.encounters.active = false;
                newState.encounters.encounter = undefined;
                newState.combat.active = true;
                
                // Add to encounter history
                newState.encounters.history = Array.isArray(newState.encounters.history) 
                    ? [
                        ...newState.encounters.history,
                        {
                            id: encounter.id,
                            type: encounter.type,
                            result: 'initiated',
                            date: Date.now(),
                            region: encounter.region
                        }
                    ]
                    : [
                        {
                            id: encounter.id,
                            type: encounter.type,
                            result: 'initiated',
                            date: Date.now(),
                            region: encounter.region
                        }
                    ];
                
                Logger.info(
                    LogCategory.COMBAT,
                    `Combat initiated with enemy: ${enemyId} in region: ${regionId}`,
                    LogContext.COMBAT
                );
            } else {
                Logger.error(
                    LogCategory.COMBAT,
                    `Failed to generate enemy for region: ${regionId}`,
                    LogContext.COMBAT
                );
            }
        }
        
        // Add to encounter history
        newState.encounters.history = Array.isArray(newState.encounters.history) 
          ? [
              ...newState.encounters.history,
              {
                  id: encounter.id,
                  type: encounter.type,
                  result: choiceId || 'completed',
                  date: Date.now(),
                  region: encounter.region
              }
            ]
          : [
              {
                  id: encounter.id,
                  type: encounter.type,
                  result: choiceId || 'completed',
                  date: Date.now(),
                  region: encounter.region
              }
            ];
        
        // Clear the active encounter
        newState.encounters.active = false;
        newState.encounters.encounter = undefined;
        
        return newState;
    }

    // Add a new method for generating combat encounters
    private generateCombatEncounter(region: string): BaseEncounter {
        const regionType = region as RegionType;
        
        // Region-specific encounter titles and descriptions
        const encounterDetails = {
            'void': {
                title: "Unknown Vessel Approaching",
                description: "Long-range sensors have detected an unidentified vessel approaching on an intercept course. The vessel is not responding to hails and appears to be powering weapons systems. The emptiness of the void offers little cover for evasive maneuvers."
            },
            'nebula': {
                title: "Ambush in the Nebula",
                description: "The dense nebula clouds suddenly part to reveal a hostile vessel lying in wait. The electromagnetic interference from the nebula masked their presence until now. Their weapons are charged and targeting systems locked onto the Dawn."
            },
            'asteroid': {
                title: "Mining Claim Dispute",
                description: "A rugged mining vessel emerges from behind a large asteroid, broadcasting territorial warnings. They claim this asteroid field as their exclusive mining territory and demand immediate departure or payment. Weapons systems are online and tracking the Dawn."
            },
            'deepspace': {
                title: "Deep Space Hunter",
                description: "A sleek combat vessel appears on sensors, accelerating toward the Dawn at high velocity. Its design suggests advanced technology and dedicated combat capabilities. No communication attempts have been made - their intentions appear hostile."
            },
            'blackhole': {
                title: "Guardians of the Singularity",
                description: "A strange vessel of unknown origin materializes near the event horizon. Its design defies conventional physics, suggesting either incredibly advanced technology or origins from beyond known space. They appear to be positioning to prevent the Dawn from approaching the black hole further."
            }
        };
        
        // Get region-specific details or use defaults
        const details = encounterDetails[regionType] || {
            title: "Hostile Encounter",
            description: "Sensors have detected a hostile entity approaching. Weapon signatures detected. Combat seems inevitable."
        };
        
        // Create a basic encounter structure that will be handled by the combat system
        return {
            id: `combat-${region}-${Date.now()}`,
            title: details.title,
            description: details.description,
            region: regionType,
            type: "combat"
        };
    }

    /**
     * Generate a random enemy for the given region
     */
    private generateRandomEnemyForRegion(regionId: RegionType): string | null {
        // Find the region definition - REGION_DEFINITIONS is a Record<string, RegionDefinition>
        // not an array, so we can't use find directly
        const region = REGION_DEFINITIONS[regionId as string];
        
        if (!region || !region.enemyProbabilities || region.enemyProbabilities.length === 0) {
            Logger.warn(
                LogCategory.COMBAT,
                `No enemies defined for region ${regionId}`,
                LogContext.COMBAT
            );
            return null;
        }
        
        // Calculate total weight
        let totalWeight = 0;
        region.enemyProbabilities.forEach((enemy: { weight: number; enemyId: string }) => {
            totalWeight += enemy.weight;
        });
        
        // Select an enemy based on weights
        let randomValue = Math.random() * totalWeight;
        
        for (const enemy of region.enemyProbabilities) {
            randomValue -= enemy.weight;
            if (randomValue <= 0) {
                return enemy.enemyId;
            }
        }
        
        // Fallback to first enemy
        return region.enemyProbabilities[0].enemyId;
    }
} 