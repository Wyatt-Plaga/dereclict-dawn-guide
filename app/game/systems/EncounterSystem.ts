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
  REGION_ENCOUNTER_CHANCES 
} from '../content/encounters';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { GameSystemManager } from './index';
import { REGION_DEFINITIONS } from '../content/regions';

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
        // Generate a story encounter based on the region
        let title = '';
        let description = '';
        let choices: EncounterChoice[] = [];
        
        switch(region) {
            case 'void':
                title = 'Mysterious Signal';
                description = 'Your sensors detect a faint distress signal coming from a nearby debris field. The signal appears to be automated, repeating on an old frequency not commonly used anymore.';
                choices = [
                    {
                        id: uuidv4(),
                        text: 'Investigate the signal',
                        outcome: {
                            resources: [{ type: 'scrap', amount: 15, message: 'You salvaged valuable components from the wreckage.' }],
                            text: 'You navigate through the debris field and discover the remnants of an old scout ship. While the crew is long gone, you manage to salvage some valuable components before departing.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Ignore it and continue on your course',
                        outcome: {
                            text: 'You decide the risk isn\'t worth it and continue on your original course. The signal gradually fades as you move away from the debris field.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Scan the area thoroughly before approaching',
                        outcome: {
                            resources: [{ type: 'insight', amount: 10, message: 'The detailed analysis yielded valuable data.' }],
                            text: 'Your thorough scan reveals that the signal is emanating from an old emergency beacon. While there doesn\'t appear to be anything of physical value, the data you extract from the beacon provides useful insights about this region of space.',
                            continuesToNextEncounter: true
                        }
                    }
                ];
                break;
                
            case 'nebula':
                title = 'Luminous Anomaly';
                description = 'As you traverse the nebula, you encounter a pulsating area of unusual luminosity. Your sensors indicate high energy readings, but also potential radiation hazards.';
                choices = [
                    {
                        id: uuidv4(),
                        text: 'Collect energy samples',
                        outcome: {
                            resources: [{ type: 'energy', amount: 25, message: 'The energy collection was successful despite the risks.' }],
                            text: 'You carefully navigate to the edge of the luminous area and extend your collection arrays. Despite some minor radiation exposure to your outer hull, you successfully harvest a significant amount of energy.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Study from a safe distance',
                        outcome: {
                            resources: [{ type: 'insight', amount: 15, message: 'The phenomenon yielded valuable scientific data.' }],
                            text: 'You maintain a safe distance while conducting detailed scans of the phenomenon. The data collected will be valuable for understanding nebula dynamics and potentially identifying similar energy-rich regions in the future.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Plot a course around the anomaly',
                        outcome: {
                            text: 'You decide that the potential risks outweigh any benefits and carefully navigate around the luminous area. While you gain no immediate resources, your cautious approach ensures the safety of your crew and vessel.',
                            continuesToNextEncounter: true
                        }
                    }
                ];
                break;
                
            case 'asteroid':
                title = 'Mining Operation Remnants';
                description = 'You come across what appears to be an abandoned mining operation on a medium-sized asteroid. Equipment has been left behind, though it\'s unclear how long ago the site was abandoned.';
                choices = [
                    {
                        id: uuidv4(),
                        text: 'Salvage the mining equipment',
                        outcome: {
                            resources: [{ type: 'scrap', amount: 30, message: 'The abandoned equipment provided significant salvage materials.' }],
                            text: 'You dock with the asteroid and send a team to dismantle and retrieve the abandoned mining equipment. It\'s old but still valuable as scrap material that can be repurposed for your ship\'s needs.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Look for any remaining mineral deposits',
                        outcome: {
                            resources: [
                                { type: 'energy', amount: 10, message: 'You found some energy crystals in the deeper tunnels.' },
                                { type: 'scrap', amount: 5, message: 'You also collected some loose metal fragments.' }
                            ],
                            text: 'You explore the mining tunnels and discover that while most valuable deposits were extracted, the miners missed some smaller veins deeper in the asteroid. You spend some time extracting what remains before continuing your journey.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Search for clues about what happened to the miners',
                        outcome: {
                            resources: [{ type: 'insight', amount: 20, message: 'The logs contained valuable information about this sector.' }],
                            text: 'You find the operations center and manage to recover some of the site logs. It appears the operation was abandoned due to corporate bankruptcy rather than any danger. The navigation and survey data you recover provides valuable insights about this asteroid field.',
                            continuesToNextEncounter: true
                        }
                    }
                ];
                break;
                
            case 'deepspace':
                title = 'Derelict Research Vessel';
                description = 'Your long-range sensors detect a drifting vessel in the void of deep space. Initial scans indicate it\'s a research vessel that lost power several years ago. There are no life signs aboard.';
                choices = [
                    {
                        id: uuidv4(),
                        text: 'Board the vessel to search for valuable technology',
                        outcome: {
                            resources: [
                                { type: 'scrap', amount: 20, message: 'You salvaged useful components from the ship systems.' },
                                { type: 'insight', amount: 15, message: 'The research data was partially recoverable.' }
                            ],
                            text: 'Your boarding party explores the derelict vessel, finding it in surprisingly good condition despite years of abandonment. You manage to salvage some advanced components and partial research data before returning to your ship and continuing your journey.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Attempt to remotely access their computer systems',
                        outcome: {
                            resources: [{ type: 'insight', amount: 30, message: 'You successfully extracted the complete research database.' }],
                            text: 'Rather than risking a boarding operation, you establish a remote connection to the vessel\'s systems. After bypassing several security measures, you manage to download their complete research database, which contains valuable scientific insights.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Tow the vessel to the nearest station for a salvage bounty',
                        outcome: {
                            resources: [{ type: 'energy', amount: -10, message: 'The towing operation consumed some energy reserves.' }],
                            text: 'You decide to attach tow cables and bring the vessel to the nearest station for a proper salvage operation. Unfortunately, the nearest station is farther than expected, and the towing operation consumes some of your energy reserves without immediate compensation.',
                            continuesToNextEncounter: true
                        }
                    }
                ];
                break;
                
            case 'blackhole':
                title = 'Gravitational Lens Observatory';
                description = 'You discover the remains of a scientific outpost positioned to use the black hole as a gravitational lens for deep space observation. The facility appears to have been hastily evacuated.';
                choices = [
                    {
                        id: uuidv4(),
                        text: 'Recover the observational data',
                        outcome: {
                            resources: [{ type: 'insight', amount: 40, message: 'The astronomical data is extremely valuable.' }],
                            text: 'You manage to extract the storage drives containing years of observational data. This information provides exceptional insights into distant cosmic phenomena that would be impossible to observe without the black hole\'s gravitational lensing effect.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Salvage the advanced scientific equipment',
                        outcome: {
                            resources: [
                                { type: 'scrap', amount: 25, message: 'The specialized equipment contained valuable materials.' },
                                { type: 'energy', amount: 15, message: 'You salvaged some power cells that were still charged.' }
                            ],
                            text: 'You carefully dismantle and retrieve the specialized observation equipment. The advanced materials and components will be valuable for upgrades to your own systems, and you even find some auxiliary power cells that still hold a charge.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Use the observatory\'s position for your own observations',
                        outcome: {
                            resources: [{ type: 'insight', amount: 20, message: 'Your brief observations yielded interesting data.' }],
                            text: 'Rather than salvaging, you temporarily power up the observatory\'s systems and conduct your own observations through the gravitational lens. The brief session provides some valuable insights before you move on.',
                            continuesToNextEncounter: true
                        }
                    }
                ];
                break;
                
            default:
                // Fallback story for any other regions
                title = 'Strange Encounter';
                description = 'As you navigate through this region, you encounter something unusual that catches your attention.';
                choices = [
                    {
                        id: uuidv4(),
                        text: 'Investigate closely',
                        outcome: {
                            resources: [{ type: 'insight', amount: 10, message: 'Your curiosity was rewarded with new knowledge.' }],
                            text: 'Your curiosity leads you to investigate more closely, yielding some interesting insights before you continue on your journey.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Observe from a distance',
                        outcome: {
                            text: 'You decide to observe from a safe distance, gathering what information you can before resuming your course.',
                            continuesToNextEncounter: true
                        }
                    },
                    {
                        id: uuidv4(),
                        text: 'Ignore and continue on your path',
                        outcome: {
                            text: 'You decide that whatever it is doesn\'t warrant further attention and continue on your planned route without delay.',
                            continuesToNextEncounter: true
                        }
                    }
                ];
        }
        
        return {
            id: uuidv4(),
            type: 'story',
            title,
            description,
            region,
            choices
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
            
            if (enemyId && this.manager && this.manager.combat) {
                // Start the combat encounter using the CombatSystem
                this.manager.combat.startCombatEncounter(newState, enemyId, regionId);
                
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
                
                // Return the updated state with combat active
                return newState;
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