import { v4 as uuidv4 } from 'uuid';
import { 
    GameState, 
    BaseEncounter, 
    EmptyEncounter, 
    StoryEncounter,
    ResourceReward, 
    EncounterChoice,
} from '../types';
import { RegionType } from '../types/combat';
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
            // Combat encounter
            return this.generateCombatEncounter(region, state);
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
        const regionEncounters = STORY_ENCOUNTERS[region];
        
        if (!regionEncounters || regionEncounters.length === 0) {
            return getGenericStoryEncounter(region);
        }
        
        const randomIndex = Math.floor(Math.random() * regionEncounters.length);
        
        // Deep clone and ensure the region type is preserved correctly
        const clonedEncounter = JSON.parse(JSON.stringify(regionEncounters[randomIndex])) as StoryEncounter;
        clonedEncounter.region = region; // Explicitly set the region back to the enum type
        return clonedEncounter;
    }
    
    /**
     * Apply rewards from an encounter to the game state
     */
    applyRewards(state: GameState, rewards: ResourceReward[]): GameState {
        Logger.info(LogCategory.RESOURCES, 'Applying encounter rewards', LogContext.NONE);
        
        // Apply each reward
        rewards.forEach(reward => {
            const { type, amount } = reward;
            
            // Emit an event for resource changes instead of directly modifying the state
            this.eventBus.emit('resourceChange', {
                state: state,
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
        
        return state;
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
        
        // Get the current encounter
        const encounter = state.encounters.encounter;
        
        // Handle different encounter types
        if (encounter.type === 'empty') {
            const emptyEncounter = encounter as EmptyEncounter;
            if (emptyEncounter.resources && emptyEncounter.resources.length > 0) {
                this.applyRewards(state, emptyEncounter.resources);
            }
        } else if (encounter.type === 'story') {
            const storyEncounter = encounter as StoryEncounter;
            
            // Check if a valid choice was provided
            if (choiceId) {
                // Find the selected choice
                const selectedChoice = storyEncounter.choices.find(choice => choice.id === choiceId);
                
                if (selectedChoice) {
                    // Apply resources if available
                    if (selectedChoice.outcome.resources && selectedChoice.outcome.resources.length > 0) {
                        this.applyRewards(state, selectedChoice.outcome.resources);
                    }
                    
                    // Check if the outcome triggers combat
                    if (selectedChoice.outcome.combat) {
                        const combatTrigger = selectedChoice.outcome.combat;
                        Logger.info(
                            LogCategory.COMBAT,
                            'Story choice triggered combat',
                            LogContext.COMBAT
                        );
                        
                        // Determine the enemy ID to use
                        let enemyId = combatTrigger.enemyId;
                        
                        if (!enemyId) {
                            // Determine the correct RegionType to pass
                            const regionToUse: RegionType = combatTrigger.enemyRegion 
                                ? this.stringToRegionType(combatTrigger.enemyRegion)
                                : encounter.region;
                            
                            const subRegionToUse = combatTrigger.enemySubRegion || state.navigation.currentSubRegion;
                            
                            // Ensure generateEnemyForRegion accepts RegionType
                            enemyId = this.generateEnemyForRegion(regionToUse, subRegionToUse, combatTrigger.isBoss);
                        }
                        
                        if (enemyId) {
                            const subRegionToUse = combatTrigger.enemySubRegion || state.navigation.currentSubRegion;
                            
                            // Ensure combatEncounterTriggered expects RegionType
                            this.eventBus.emit('combatEncounterTriggered', {
                                state: state,
                                enemyId: enemyId,
                                regionId: encounter.region,
                                subRegionId: subRegionToUse,
                                sourceEncounterId: encounter.id,
                                sourceChoiceId: choiceId
                            });
                            
                            // Mark the encounter as completed, but combat as active
                            state.encounters.active = false;
                            state.encounters.encounter = undefined;
                            state.combat.active = true;
                            
                            // Add to encounter history
                            this.addToEncounterHistory(state, encounter, 'combat-initiated');
                            
                            Logger.info(
                                LogCategory.COMBAT,
                                `Combat initiated with enemy: ${enemyId} in region: ${encounter.region}${subRegionToUse ? ', subregion: ' + subRegionToUse : ''}`,
                                LogContext.COMBAT
                            );
                            
                            return state;
                        } else {
                            Logger.error(
                                LogCategory.COMBAT,
                                `Failed to generate enemy for region: ${encounter.region}`,
                                LogContext.COMBAT
                            );
                        }
                    }
                } else {
                    Logger.warn(
                        LogCategory.ACTIONS,
                        `Invalid choice ID: ${choiceId}`,
                        LogContext.NONE
                    );
                }
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
            
            // Use the pre-selected enemy if available, otherwise generate one
            const enemyId = combatEncounter.enemyId || this.generateRandomEnemyForRegion(regionId);
            
            if (enemyId) {
                // Instead of directly calling CombatSystem, emit an event
                this.eventBus.emit('combatEncounterTriggered', {
                    state: state,
                    enemyId: enemyId,
                    regionId: regionId,
                    subRegionId: state.navigation.currentSubRegion || undefined
                });
                
                // Mark the encounter as completed, but combat as active
                state.encounters.active = false;
                state.encounters.encounter = undefined;
                state.combat.active = true;
                
                // Add to encounter history
                this.addToEncounterHistory(state, encounter, 'initiated');
                
                Logger.info(
                    LogCategory.COMBAT,
                    `Combat initiated with enemy: ${enemyId} in region: ${regionId}`,
                    LogContext.COMBAT
                );
                
                return state;
            } else {
                Logger.error(
                    LogCategory.COMBAT,
                    `Failed to generate enemy for region: ${regionId}`,
                    LogContext.COMBAT
                );
            }
        }
        
        // Add to encounter history
        this.addToEncounterHistory(state, encounter, choiceId || 'completed');
        
        // Clear the active encounter
        state.encounters.active = false;
        state.encounters.encounter = undefined;
        
        return state;
    }

    /**
     * Helper method to add an encounter to history
     */
    private addToEncounterHistory(state: GameState, encounter: BaseEncounter, result: string): void {
        const historyEntry = {
            id: encounter.id,
            type: encounter.type,
            result: result,
            date: Date.now(),
            region: encounter.region
        };
        
        if (Array.isArray(state.encounters.history)) {
            state.encounters.history.push(historyEntry);
        } else {
            state.encounters.history = [historyEntry];
        }
    }

    /**
     * Helper function to convert string region to RegionType enum
     * Needed if combatTrigger.enemyRegion is a string
     */
    private stringToRegionType(regionString: string): RegionType {
        const regionKey = Object.keys(RegionType).find(key => RegionType[key as keyof typeof RegionType] === regionString);
        return RegionType[regionKey as keyof typeof RegionType] || RegionType.VOID; // Default to VOID if not found
    }

    /**
     * Generate an enemy for a specific region and optionally subregion
     */
    generateEnemyForRegion(region: RegionType, subRegion?: string, isBoss?: boolean): string | undefined {
        Logger.debug(LogCategory.ACTIONS, `Generating enemy for region: ${region}...`, LogContext.NONE);
        
        const regionDefinition = REGION_DEFINITIONS[region];
        if (!regionDefinition) {
            Logger.warn(LogCategory.ACTIONS, `No region definition found for region: ${region}`, LogContext.NONE);
            return undefined;
        }
        
        let possibleEnemies = regionDefinition.enemyProbabilities;
        
        // Filter by subregion if provided
        if (subRegion) {
            possibleEnemies = possibleEnemies.filter(enemyProb => {
                // Requires loading full enemy def to check subRegion, less efficient
                // Consider adding subRegion to enemyProbabilities if performance is an issue
                // For now, just check if the probability entry itself matches (assuming format allows)
                // This part might need adjustment based on how subregions are actually defined in content
                return (enemyProb as any).subRegion === subRegion || !(enemyProb as any).subRegion; // Allow enemies without specific subregion
            });
            Logger.debug(LogCategory.ACTIONS, `Filtered enemies by subRegion ${subRegion}: ${possibleEnemies.length} remaining`, LogContext.NONE);
        }
        
        // Filter by boss status
        if (isBoss !== undefined) {
            possibleEnemies = possibleEnemies.filter(enemyProb => {
                // Similar to subRegion, requires loading full def potentially
                return (enemyProb as any).isBoss === isBoss; // Needs enemyProb to contain isBoss flag
            });
             Logger.debug(LogCategory.ACTIONS, `Filtered enemies by isBoss=${isBoss}: ${possibleEnemies.length} remaining`, LogContext.NONE);
        }
        
        if (possibleEnemies.length === 0) {
            Logger.warn(LogCategory.ACTIONS, `No matching enemies found for region ${region}...`, LogContext.NONE);
            return undefined;
        }
        
        // Calculate total weight
        const totalWeight = possibleEnemies.reduce((sum, entry) => sum + entry.weight, 0);
        
        // Select random enemy based on weights
        let randomValue = Math.random() * totalWeight;
        for (const enemy of possibleEnemies) {
            randomValue -= enemy.weight;
            if (randomValue <= 0) {
                Logger.debug(LogCategory.ACTIONS, `Selected enemy: ${enemy.enemyId}`, LogContext.NONE);
                return enemy.enemyId;
            }
        }
        
        // Fallback: return the first enemy ID if selection failed (should not happen)
        Logger.warn(LogCategory.ACTIONS, `Enemy selection failed, returning first possible enemy: ${possibleEnemies[0].enemyId}`, LogContext.NONE);
        return possibleEnemies[0].enemyId;
    }

    /**
     * Generate a random enemy for a region (legacy method, uses the new one)
     */
    generateRandomEnemyForRegion(region: RegionType): string | undefined {
        return this.generateEnemyForRegion(region, undefined, false);
    }

    /**
     * Generate a combat encounter with enemy-specific flavor text
     */
    private generateCombatEncounter(region: RegionType, state?: GameState): BaseEncounter {
        const subRegion = this.getCurrentSubregion(region, state);
        const enemyId = this.generateEnemyForRegion(region, subRegion);

        if (!enemyId) {
            Logger.error(LogCategory.ACTIONS, `Failed to generate combat encounter for region ${region}: No enemy ID returned`, LogContext.NONE);
            // Fallback to an empty encounter if enemy generation fails
            return this.generateEmptyEncounter(region);
        }

        return {
            id: uuidv4(),
            type: 'combat',
            title: 'Hostile Encounter',
            description: `You've encountered a hostile entity in the ${region} region!`,
            region,
            enemyId: enemyId
        };
    }

    /**
     * Helper method to get the current subregion from the game state
     */
    private getCurrentSubregion(region: RegionType, state?: GameState): string | undefined {
        // Placeholder: Implement logic to determine the current subregion based on game state if needed
        // For now, assumes subregion is stored in state.navigation.currentSubRegion
        return state?.navigation?.currentSubRegion;
    }
} 