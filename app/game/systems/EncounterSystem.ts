import { v4 as uuidv4 } from 'uuid';
import { 
    GameState, 
    BaseEncounter, 
    EmptyEncounter, 
    StoryEncounter,
    ResourceReward, 
    RegionType, 
    RegionTypeEnum,
    EncounterChoice,
    Enemy
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
// Import Habitable Zone enemies for the example
import { HABITABLE_ZONE_ENEMIES } from '../content/enemies/habitableZoneEnemies';

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
        const regionEnum = this.convertRegionTypeToEnum(region);
        const message = getRandomEmptyEncounterMessage(regionEnum);
        const resources = generateEmptyEncounterRewards(regionEnum);
        
        return {
            id: uuidv4(),
            type: 'empty',
            title: getRandomEmptyEncounterTitle(regionEnum),
            description: getRandomEmptyEncounterDescription(regionEnum),
            region,
            message,
            resources
        };
    }
    
    /**
     * Generate a story encounter with choices
     */
    private generateStoryEncounter(region: RegionType): StoryEncounter {
        const regionEnum = this.convertRegionTypeToEnum(region);
        
        // Get the array of story encounters for this region
        const regionEncounters = STORY_ENCOUNTERS[region];
        
        // If there are no encounters defined for this region, use the generic encounter
        if (!regionEncounters || regionEncounters.length === 0) {
            return getGenericStoryEncounter(regionEnum);
        }
        
        // Select a random encounter from the available ones for this region
        const randomIndex = Math.floor(Math.random() * regionEncounters.length);
        
        // Deep clone the encounter to avoid mutating the original data
        return JSON.parse(JSON.stringify(regionEncounters[randomIndex]));
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
                            // If no specific enemy is specified, generate one based on region/subregion
                            const regionToUse = combatTrigger.enemyRegion || encounter.region;
                            const subRegionToUse = combatTrigger.enemySubRegion || state.navigation.currentSubRegion;
                            
                            enemyId = this.generateEnemyForRegion(regionToUse, subRegionToUse, combatTrigger.isBoss);
                        }
                        
                        if (enemyId) {
                            // Determine the subregion to use
                            const subRegionToUse = combatTrigger.enemySubRegion || state.navigation.currentSubRegion;
                            
                            // Emit an event to trigger combat
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
     * Generate an enemy for a specific region and optionally subregion
     */
    generateEnemyForRegion(region: string, subRegion?: string, isBoss?: boolean): string | undefined {
        try {
            // Import the appropriate enemies array based on the region
            let regionEnemies: Enemy[] = [];
            
            switch(region) {
                case 'habitable':
                    // Import Habitable Zone enemies
                    const { HABITABLE_ZONE_ENEMIES } = require('../content/enemies/habitableZoneEnemies');
                    regionEnemies = HABITABLE_ZONE_ENEMIES;
                    break;
                case 'void':
                    // Import Void enemies
                    const { VOID_ENEMIES } = require('../content/enemies/voidEnemies');
                    regionEnemies = VOID_ENEMIES;
                    // Void doesn't have subregions, so we'll treat the whole region as one subregion
                    if (subRegion && subRegion !== 'void') {
                        Logger.warn(
                            LogCategory.COMBAT,
                            `Void region doesn't have subregion "${subRegion}", using entire region`,
                            LogContext.COMBAT
                        );
                    }
                    // Override subRegion to be the same as region for consistency
                    subRegion = 'void';
                    break;
                case 'asteroid':
                    // Import Asteroid Field enemies
                    const { ASTEROID_ENEMIES } = require('../content/enemies/asteroidFieldEnemies');
                    regionEnemies = ASTEROID_ENEMIES;
                    break;
                case 'supernova':
                    // Import Supernova enemies
                    const { SUPERNOVA_ENEMIES } = require('../content/enemies/supernovaEnemies');
                    regionEnemies = SUPERNOVA_ENEMIES;
                    break;
                case 'blackhole':
                    // Import Black Hole enemies
                    const { BLACKHOLE_ENEMIES } = require('../content/enemies/blackHoleEnemies');
                    regionEnemies = BLACKHOLE_ENEMIES;
                    break;
                default:
                    // Fallback to region definitions for backward compatibility
                    Logger.info(
                        LogCategory.COMBAT,
                        `No specific enemy array found for region "${region}", falling back to region definitions`,
                        LogContext.COMBAT
                    );
                    return this.selectEnemyFromRegionDefinition(region, subRegion, isBoss);
            }
            
            // If we have enemies for this region, filter by subregion and boss status
            if (regionEnemies.length > 0) {
                // Log that we're filtering
                Logger.info(
                    LogCategory.COMBAT,
                    `Filtering ${regionEnemies.length} enemies by subregion: ${subRegion || 'any'}, boss: ${isBoss || false}`,
                    LogContext.COMBAT
                );
                
                // Filter the enemies by subregion and boss status
                let eligibleEnemies = regionEnemies.filter(enemy => {
                    // If subregion is specified, check if enemy has that subregion
                    // If enemy has no subregion, it can appear in any subregion of its region
                    const subRegionMatch = !subRegion || !enemy.subRegion || enemy.subRegion === subRegion;
                    
                    // If boss is requested, filter for boss enemies
                    const bossMatch = isBoss === undefined || (isBoss === !!enemy.isBoss);
                    
                    return subRegionMatch && bossMatch;
                });
                
                // If no eligible enemies found and subregion was specified, try without subregion filter
                if (eligibleEnemies.length === 0 && subRegion) {
                    Logger.warn(
                        LogCategory.COMBAT,
                        `No enemies found for subregion: ${subRegion}, falling back to any subregion in region: ${region}`,
                        LogContext.COMBAT
                    );
                    
                    eligibleEnemies = regionEnemies.filter(enemy => {
                        // Only filter by boss status
                        return isBoss === undefined || (isBoss === !!enemy.isBoss);
                    });
                }
                
                // If we have eligible enemies, select one randomly
                if (eligibleEnemies.length > 0) {
                    const randomIndex = Math.floor(Math.random() * eligibleEnemies.length);
                    return eligibleEnemies[randomIndex].id;
                } else {
                    Logger.error(
                        LogCategory.COMBAT,
                        `No eligible enemies found for region: ${region}, subregion: ${subRegion}, boss: ${isBoss}`,
                        LogContext.COMBAT
                    );
                    return undefined;
                }
            } else {
                // Fallback to region definitions if no enemies found
                Logger.warn(
                    LogCategory.COMBAT,
                    `No enemies found for region: ${region}, falling back to region definitions`,
                    LogContext.COMBAT
                );
                return this.selectEnemyFromRegionDefinition(region, subRegion, isBoss);
            }
        } catch (error) {
            Logger.error(
                LogCategory.COMBAT,
                `Error generating enemy for region ${region}: ${error}`,
                LogContext.COMBAT
            );
            return undefined;
        }
    }

    /**
     * Legacy method to select an enemy from region definitions
     */
    private selectEnemyFromRegionDefinition(region: string, subRegion?: string, isBoss?: boolean): string | undefined {
        // Get region definition from REGION_DEFINITIONS
        const regionDef = REGION_DEFINITIONS[region];
        if (!regionDef) {
            Logger.warn(
                LogCategory.COMBAT,
                `No region definition found for: ${region}`,
                LogContext.COMBAT
            );
            return undefined;
        }
        
        // Use the weighted probabilities from the region definition
        if (regionDef.enemyProbabilities && regionDef.enemyProbabilities.length > 0) {
            // If subregion is specified, log that we can't filter by it in legacy mode
            if (subRegion) {
                Logger.warn(
                    LogCategory.COMBAT,
                    `Cannot filter by subregion: ${subRegion} in legacy mode, using entire region: ${region}`,
                    LogContext.COMBAT
                );
            }
            
            // If boss is requested, log that we can't filter by it in legacy mode
            if (isBoss) {
                Logger.warn(
                    LogCategory.COMBAT,
                    `Cannot filter by boss status in legacy mode, using random enemy from region: ${region}`,
                    LogContext.COMBAT
                );
            }
            
            // Calculate total weight
            let totalWeight = 0;
            regionDef.enemyProbabilities.forEach(enemy => {
                totalWeight += enemy.weight;
            });
            
            // Select an enemy based on weights
            let randomValue = Math.random() * totalWeight;
            
            for (const enemy of regionDef.enemyProbabilities) {
                randomValue -= enemy.weight;
                if (randomValue <= 0) {
                    return enemy.enemyId;
                }
            }
            
            // Fallback to first enemy
            return regionDef.enemyProbabilities[0].enemyId;
        } else {
            Logger.warn(
                LogCategory.COMBAT,
                `No enemy probabilities defined for region: ${region}`,
                LogContext.COMBAT
            );
            return undefined;
        }
    }

    /**
     * Generate a random enemy for a region (legacy method, uses the new one)
     */
    generateRandomEnemyForRegion(region: string): string | undefined {
        return this.generateEnemyForRegion(region);
    }

    /**
     * Generate a combat encounter with enemy-specific flavor text
     */
    private generateCombatEncounter(region: string, state?: GameState): BaseEncounter {
        const regionType = region as RegionType;
        const subRegion = this.getCurrentSubregion(region, state);
        
        // First, select an enemy for this region/subregion
        const enemyId = this.generateEnemyForRegion(region, subRegion);
        
        // If we couldn't find an enemy, use generic text
        if (!enemyId) {
            Logger.warn(
                LogCategory.COMBAT,
                `No enemy found for region: ${region}, using generic combat encounter`,
                LogContext.COMBAT
            );
            
            // Define region-specific fallback combat encounter details
            const encounterDetails: Record<string, { title: string; description: string }> = {
                'void': {
                    title: "Forgotten Sentinel",
                    description: "A small remnant of the Dawn's former security system detects your presence. Though damaged by centuries of exposure to the void, its core programming remains active: eliminate any unauthorized entities."
                },
                'asteroid': {
                    title: "Scavenger Ambush",
                    description: "Your scanners detect unusual fluctuations in the asteroid field ahead. As you move closer, the truth becomes clear - a camouflaged ship reveals itself, weapons hot and ready to claim your vessel as salvage."
                },
                'supernova': {
                    title: "Radiation Feeder",
                    description: "A strange entity manifests in the highly charged particles of the supernova remnant. Its energy signature suggests it has evolved to consume the intense radiation - and now it's turned its attention to your ship's power systems."
                },
                'habitable':
                    {
                        title: "Territorial Defense",
                        description: "As you approach the habitable zone, a modified defense vessel intercepts your path. Their weapons are primed - resources in this region are scarce, and they're unwilling to share with newcomers."
                    },
                'blackhole': {
                    title: "Guardians of the Singularity",
                    description: "A strange vessel of unknown origin materializes near the event horizon. Its design defies conventional physics, suggesting either incredibly advanced technology or origins from beyond known space. They appear to be positioning to prevent the Dawn from approaching the black hole further."
                },
                'anomaly': {
                    title: "Dimensional Distortion",
                    description: "Sensors detect a tear in spacetime forming nearby. Before you can change course, an entity slides through - its form shifting between states of matter as it approaches your vessel with apparent hostile intent."
                }
            };
            
            // Get region-specific details or use defaults
            const details = encounterDetails[regionType] || {
                title: "Hostile Encounter",
                description: "Sensors have detected a hostile entity approaching. Weapon signatures detected. Combat seems inevitable."
            };
            
            // Create a basic encounter structure
            return {
                id: `combat-${region}-${Date.now()}`,
                title: details.title,
                description: details.description,
                region: regionType,
                type: "combat",
                enemyId: null
            };
        }
        
        // Try to get the enemy definition
        let enemy: Enemy | undefined;
        
        try {
            // Get the enemy based on region
            switch(region) {
                case 'habitable':
                    const { HABITABLE_ZONE_ENEMIES } = require('../content/enemies/habitableZoneEnemies');
                    enemy = HABITABLE_ZONE_ENEMIES.find((e: Enemy) => e.id === enemyId);
                    break;
                case 'void':
                    const { VOID_ENEMIES } = require('../content/enemies/voidEnemies');
                    enemy = VOID_ENEMIES.find((e: Enemy) => e.id === enemyId);
                    break;
                case 'asteroid':
                    const { ASTEROID_ENEMIES } = require('../content/enemies/asteroidFieldEnemies');
                    enemy = ASTEROID_ENEMIES.find((e: Enemy) => e.id === enemyId);
                    break;
                case 'supernova':
                    const { SUPERNOVA_ENEMIES } = require('../content/enemies/supernovaEnemies');
                    enemy = SUPERNOVA_ENEMIES.find((e: Enemy) => e.id === enemyId);
                    break;
                case 'blackhole':
                    const { BLACKHOLE_ENEMIES } = require('../content/enemies/blackHoleEnemies');
                    enemy = BLACKHOLE_ENEMIES.find((e: Enemy) => e.id === enemyId);
                    break;
                default:
                    enemy = undefined;
            }
        } catch (error) {
            Logger.error(
                LogCategory.COMBAT,
                `Error getting enemy definition for ${enemyId}: ${error}`,
                LogContext.COMBAT
            );
        }
        
        // If we found the enemy, use its intro text (if available)
        if (enemy) {
            const title = enemy.introTitle || `${enemy.name} Encounter`;
            const description = enemy.introDescription || 
                `Sensors detect ${enemy.name} approaching. ${enemy.description}`;
            
            // Create a combat encounter with the enemy's details
            return {
                id: `combat-${region}-${Date.now()}`,
                title: title,
                description: description,
                region: regionType,
                type: "combat",
                enemyId: enemyId // Store the enemyId for later reference
            };
        } else {
            // Fallback to generic encounter
            Logger.warn(
                LogCategory.COMBAT,
                `Found enemyId ${enemyId} but couldn't get enemy details, using generic encounter`,
                LogContext.COMBAT
            );
            
            return {
                id: `combat-${region}-${Date.now()}`,
                title: "Hostile Encounter",
                description: "Sensors have detected a hostile entity approaching. Weapon signatures detected. Combat seems inevitable.",
                region: regionType,
                type: "combat",
                enemyId: enemyId
            };
        }
    }

    /**
     * Helper method to get the current subregion from the game state
     */
    private getCurrentSubregion(region: string, state?: GameState): string | undefined {
        // For void, use 'void' as the subregion
        if (region === 'void') {
            return 'void';
        }
        
        // If state is provided, try to get the current subregion from it
        if (state && state.navigation && state.navigation.currentSubRegion) {
            return state.navigation.currentSubRegion;
        }
        
        // If no state is provided or no subregion is set, return undefined
        // which will select from any subregion
        return undefined;
    }

    /**
     * Helper method to convert RegionType to RegionTypeEnum
     */
    private convertRegionTypeToEnum(regionType: RegionType): RegionTypeEnum {
        switch (regionType) {
            case 'void':
                return RegionTypeEnum.VOID;
            case 'asteroid':
                return RegionTypeEnum.ASTEROID_FIELD;
            case 'supernova':
                return RegionTypeEnum.SUPERNOVA;
            case 'blackhole':
                return RegionTypeEnum.BLACK_HOLE;
            case 'habitable':
                return RegionTypeEnum.HABITABLE_ZONE;
            case 'anomaly':
                return RegionTypeEnum.ANOMALY;
            default:
                return RegionTypeEnum.VOID; // Default fallback
        }
    }
} 