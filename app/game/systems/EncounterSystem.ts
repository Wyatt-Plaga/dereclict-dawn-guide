import { v4 as uuidv4 } from 'uuid';
import { 
    GameState, 
    BaseEncounter, 
    EmptyEncounter, 
    StoryEncounter,
    ResourceReward, 
} from '../types';
import { RegionType } from '../types/combat';
import { 
  getRandomEmptyEncounterMessage, 
  getRandomEmptyEncounterTitle,
  getRandomEmptyEncounterDescription, 
  generateEmptyEncounterRewards,
  STORY_ENCOUNTERS,
  getGenericStoryEncounter
} from '../content/encounters';
import { 
    ENCOUNTER_TYPE_PROBABILITIES,
} from '../content/encounterConfig';
import { ALL_ENEMIES_LIST, EnemyDefinition } from '../content/enemies/index';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EventBus } from 'core/EventBus';

/**
 * System responsible for generating and managing encounters
 */
export class EncounterSystem {
    private eventBus: EventBus;
    private currentState?: GameState;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        Logger.info(LogCategory.LIFECYCLE, 'EncounterSystem initialized', LogContext.STARTUP);

        // Listen for story choice / encounter completion actions
        this.eventBus.on('storyChoice', ({ state, choiceId }) => {
          this.completeEncounter(state, choiceId);
          this.eventBus.emit('stateUpdated', state);
        });

        // Phase-5 namespaced action handler
        this.eventBus.on('action:story_choice', ({ choiceId }) => {
          if (!this.currentState) return;
          this.completeEncounter(this.currentState, choiceId);
          this.eventBus.emit('stateUpdated', this.currentState);
        });

        // Handle jump initiation to generate encounters
        this.eventBus.on('initiateJump', ({ state }) => {
          const encounter = this.generateEncounter(state);
          state.encounters.active = true;
          state.encounters.encounter = encounter;
          // After generating, emit state update
          this.eventBus.emit('stateUpdated', state);
        });
    }
    
    /**
     * Generate an encounter based on the current region
     */
    generateEncounter(state: GameState): BaseEncounter {
        const region = state.navigation.currentRegion;
        console.log(`Generating encounter for region: ${region}`);
        
        const regionTypeProbs = ENCOUNTER_TYPE_PROBABILITIES[region] || 
            { default: { combat: 0.3, empty: 0.5, narrative: 0.2 } }; // Fallback
        const encounterChances = regionTypeProbs.default;
        
        const randomValue = Math.random();
        
        let encounter: BaseEncounter | null = null;

        if (randomValue < encounterChances.combat) {
            // Attempt Combat encounter
            encounter = this.generateCombatEncounter(region, state);
        } else if (randomValue < encounterChances.combat + encounterChances.empty) {
            // Attempt Empty encounter
            encounter = this.generateEmptyEncounter(region);
        } else {
            // Attempt Narrative/story encounter
            encounter = this.generateStoryEncounter(region, state);
            // If no unique story encounter is available, fall back to empty
            if (encounter === null) {
                Logger.debug(LogCategory.ACTIONS, "No unique story encounter available, falling back to empty.", LogContext.NONE);
                encounter = this.generateEmptyEncounter(region);
            }
        }
        
        // Final fallback if something unexpected happened (shouldn't occur with current logic)
        if (encounter === null) {
             Logger.error(LogCategory.ACTIONS, "Failed to generate any encounter type, defaulting to generic empty.", LogContext.NONE);
             encounter = this.generateEmptyEncounter(RegionType.VOID); // Or some generic fallback
        }
        
        return encounter;
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
            validLocations: [{ regionId: region }],
            message,
            resources
        };
    }
    
    /**
     * Generate a story encounter with choices, ensuring uniqueness
     */
    private generateStoryEncounter(region: RegionType, state: GameState): StoryEncounter | null {
        const allRegionEncounters = STORY_ENCOUNTERS[region];
        
        if (!allRegionEncounters || allRegionEncounters.length === 0) {
            // No story encounters defined for this region at all
            return getGenericStoryEncounter(region); // Or return null if generic shouldn't be unique?
        }

        // Get IDs of completed story encounters from history
        const completedStoryIds = new Set(
            state.encounters.history
                .filter(entry => entry.type === 'story')
                .map(entry => entry.id)
        );

        // Filter out already completed encounters
        const availableEncounters = allRegionEncounters.filter(
            encounter => !completedStoryIds.has(encounter.id)
        );
        
        if (availableEncounters.length === 0) {
            // No unique story encounters left for this region
            Logger.info(LogCategory.ACTIONS, `No unique story encounters remaining for region: ${region}.`, LogContext.NONE);
            return null; // Indicate no story encounter available
        }
        
        // Select a random encounter from the available unique ones
        const randomIndex = Math.floor(Math.random() * availableEncounters.length);
        const selectedEncounter = availableEncounters[randomIndex];

        // Deep clone before returning
        const clonedEncounter = JSON.parse(JSON.stringify(selectedEncounter)) as StoryEncounter;
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
                            // Get region from validLocations instead of encounter.region
                            const regionIdFromLocation = encounter.validLocations?.[0]?.regionId;
                            const regionToUse: RegionType = combatTrigger.enemyRegion 
                                ? this.stringToRegionType(combatTrigger.enemyRegion)
                                : regionIdFromLocation ? this.stringToRegionType(regionIdFromLocation) : RegionType.VOID; // Fallback needed
                            
                            const subRegionToUse = combatTrigger.enemySubRegion || state.navigation.currentSubRegion;
                            
                            // Ensure generateEnemyForRegion accepts RegionType
                            enemyId = this.generateEnemyForRegion(regionToUse, subRegionToUse, combatTrigger.isBoss);
                        }
                        
                        if (enemyId) {
                            const subRegionToUse = combatTrigger.enemySubRegion || state.navigation.currentSubRegion;
                            // Get region from validLocations for event emission
                            const regionIdForEvent = encounter.validLocations?.[0]?.regionId ?? RegionType.VOID;

                            // Ensure combatEncounterTriggered expects RegionType
                            this.eventBus.emit('combatEncounterTriggered', {
                                state: state,
                                enemyId: enemyId,
                                regionId: this.stringToRegionType(regionIdForEvent), // Convert string back to enum
                                subRegionId: subRegionToUse
                            });
                            
                            // Mark the encounter as completed, but combat as active
                            state.encounters.active = false;
                            state.encounters.encounter = undefined;
                            state.combat.active = true;
                            
                            // Add to encounter history
                            this.addToEncounterHistory(state, encounter, 'combat-initiated');
                            
                            Logger.info(
                                LogCategory.COMBAT,
                                // Get region from validLocations for logging
                                `Combat initiated with enemy: ${enemyId} in region: ${encounter.validLocations?.[0]?.regionId ?? 'unknown'}${subRegionToUse ? ', subregion: ' + subRegionToUse : ''}`,
                                LogContext.COMBAT
                            );
                            
                            return state;
                        } else {
                            Logger.error(
                                LogCategory.COMBAT,
                                // Get region from validLocations for logging
                                `Failed to generate enemy for region: ${encounter.validLocations?.[0]?.regionId ?? 'unknown'}`,
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
            
            // Extract region from validLocations instead
            const regionIdFromLocation = combatEncounter.validLocations?.[0]?.regionId ?? RegionType.VOID; // Default to VOID if no location
            const regionId = this.stringToRegionType(regionIdFromLocation);
            
            // Use the pre-selected enemy if available, otherwise generate one using the correct regionId
            const enemyId = combatEncounter.enemyId || this.generateRandomEnemyForRegion(regionId);
            
            if (enemyId) {
                // Instead of directly calling CombatSystem, emit an event
                this.eventBus.emit('combatEncounterTriggered', {
                    state: state,
                    enemyId: enemyId,
                    regionId: regionId, // Use corrected regionId
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
                    `Combat initiated with enemy: ${enemyId} in region: ${regionId}`, // Use corrected regionId
                    LogContext.COMBAT
                );
                
                return state;
            } else {
                Logger.error(
                    LogCategory.COMBAT,
                    `Failed to generate enemy for region: ${regionId}`, // Use corrected regionId
                    LogContext.COMBAT
                );
            }
        }
        
        // Add to encounter history
        this.addToEncounterHistory(state, encounter, choiceId || 'completed');
        
        // Clear the active encounter
        state.encounters.active = false;
        state.encounters.encounter = undefined;

        // Emit encounterCompleted event for cross-system listeners
        if (this.eventBus) {
            const payload = { encounterId: encounter.id, result: choiceId || 'completed', state };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.eventBus as any).publish?.('encounter:completed', payload);
            this.eventBus.emit('encounterCompleted', {
                state,
                encounterId: encounter.id,
                encounterType: encounter.type,
                result: choiceId || 'completed',
            });
        }

        // Update UI immediately
        this.eventBus.emit('stateUpdated', state);
        
        return state;
    }

    /**
     * Add encounter result to history
     */
    private addToEncounterHistory(state: GameState, encounter: BaseEncounter, result: string): void {
        // Use validLocations for history logging
        const regionIdForHistory = encounter.validLocations?.[0]?.regionId ?? RegionType.VOID;
        state.encounters.history.push({
            type: encounter.type,
            id: encounter.id,
            result: result,
            date: Date.now(),
            region: this.stringToRegionType(regionIdForHistory) // Ensure enum type
        });
        
        // Limit history size if needed
        // if (state.encounters.history.length > 100) { // Example limit
        //     state.encounters.history.shift();
        // }
    }

    /**
     * Helper function to convert string region to RegionType enum
     * Needed if combatTrigger.enemyRegion is a string
     */
    private stringToRegionType(regionId: string): RegionType {
        // Check if the string is a valid value in the RegionType enum
        if (Object.values(RegionType).includes(regionId as RegionType)) {
            return regionId as RegionType;
        }
        // Log a warning and return a default if the string is not a valid RegionType
        // Reverting to ACTIONS category due to persistent linter issues with other categories
        Logger.warn(LogCategory.ACTIONS, `Invalid regionId string encountered during type conversion: '${regionId}'. Defaulting to VOID.`, LogContext.NONE); 
        return RegionType.VOID; 
    }

    /**
     * Generate an enemy for a specific region and optionally subregion
     */
    generateEnemyForRegion(region: RegionType, subRegion?: string, isBoss?: boolean): string | undefined {
        Logger.debug(LogCategory.ACTIONS, `Generating enemy for region: ${region}${subRegion ? ', subRegion: ' + subRegion : ''}${isBoss !== undefined ? ', isBoss: ' + isBoss : ''}`, LogContext.NONE);

        // Define the type for the intermediate spawn info object
        type PotentialSpawnInfo = { enemyId: string; weight: number };

        // 1. Filter ALL_ENEMIES_LIST based on region, subRegion, and isBoss status
        const potentialSpawns = ALL_ENEMIES_LIST
            .map((enemy: EnemyDefinition) => { // Add type for enemy
                // Find a matching spawn location for the current region/subRegion
                const matchingSpawn = enemy.spawnLocations.find((loc: { regionId: string; subRegionId?: string; weight: number }) => // Add type for loc
                    loc.regionId === region &&
                    (subRegion ? loc.subRegionId === subRegion : true) // Match subRegion if provided
                );

                // If a match is found AND the boss status matches, return info needed for weighted selection
                // Default isBoss check to false if the parameter is undefined
                if (matchingSpawn && enemy.isBoss === (isBoss ?? false)) { 
                    return {
                        enemyId: enemy.id,
                        weight: matchingSpawn.weight
                    } as PotentialSpawnInfo; // Cast to defined type
                }
                return null; // No match for this enemy
            })
            .filter((spawn): spawn is PotentialSpawnInfo => spawn !== null); // Use type predicate for filtering

        Logger.debug(LogCategory.ACTIONS, `Found ${potentialSpawns.length} potential enemy spawns matching criteria.`, LogContext.NONE);

        // 2. Handle cases where no enemies match
        if (potentialSpawns.length === 0) {
            Logger.warn(LogCategory.ACTIONS, `No matching enemies found for region ${region}${subRegion ? '/' + subRegion : ''}, isBoss: ${isBoss ?? false}`, LogContext.NONE);
            return undefined;
        }

        // 3. Perform weighted random selection
        const totalWeight = potentialSpawns.reduce((sum, entry) => sum + entry.weight, 0);

        if (totalWeight <= 0) {
             Logger.warn(LogCategory.ACTIONS, `Total weight is zero for potential spawns in region ${region}. Cannot perform weighted selection.`, LogContext.NONE);
             return potentialSpawns[0].enemyId;
        }

        let randomValue = Math.random() * totalWeight;
        for (const spawn of potentialSpawns) { // Type is now inferred correctly
            if (spawn.weight > 0) { 
                randomValue -= spawn.weight;
                if (randomValue <= 0) {
                    Logger.debug(LogCategory.ACTIONS, `Selected enemy: ${spawn.enemyId} (weight: ${spawn.weight})`, LogContext.NONE);
                    return spawn.enemyId;
                }
            }
        }

        // 4. Fallback
        Logger.warn(LogCategory.ACTIONS, `Weighted enemy selection failed unexpectedly, returning first possible enemy: ${potentialSpawns[0].enemyId}`, LogContext.NONE);
        return potentialSpawns[0].enemyId;
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
            validLocations: [{ regionId: region }],
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

    /** Cache latest state for Phase-5 action handlers */
    setState(state: GameState) {
      this.currentState = state;
    }
} 