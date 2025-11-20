/**
 * Core game state type definitions
 */

import { RegionType } from './regions';
import { LogEntry, LogCategory } from './logs';
import { BaseEncounter, EncounterHistory } from './encounters';
import { CombatState } from './combat';
import { ReactorCategory, ProcessorCategory, CrewQuartersCategory, ManufacturingCategory } from './resources';

// Re-export all types for convenience
export * from './regions';
export * from './logs';
export * from './resources';
export * from './encounters';
export * from './combat';
export * from './events';
export * from './actions';

/**
 * Main game state that holds all game data
 */
export interface GameState {
    /**
     * All game categories
     */
    categories: {
        reactor: ReactorCategory;
        processor: ProcessorCategory;
        crewQuarters: CrewQuartersCategory;
        manufacturing: ManufacturingCategory;
    };
    
    /**
     * Timestamp of the last update
     */
    lastUpdate: number;
    
    /**
     * Game state version for save compatibility
     */
    version: number;

    /**
     * Game logs for story progression
     */
    logs: {
        discovered: Record<string, LogEntry>;
        unread: string[]; // IDs of unread logs
    };

    /**
     * Navigation state
     */
    navigation: {
        currentRegion: RegionType;
        completedRegions: RegionType[];
    };

    /**
     * Encounter state
     */
    encounters: {
        active: boolean;
        encounter?: BaseEncounter;
        history: EncounterHistory[];
    };

    /**
     * Combat state
     */
    combat: CombatState;

    /**
     * Universal resources not tied to a single wing
     */
    relics: number; // General currency obtained from combat, no capacity limit
}

/**
 * Initial state for a new game
 */
export const initialGameState: GameState = {
    categories: {
        reactor: {
            resources: {
                energy: 0,
            },
            upgrades: {
                reactorExpansions: 0,
                energyConverters: 0,
                converterEfficiency: 0,
                shielding: 0,
                shieldBoosts: 0,
                navigationUnlocked: 0,
            },
            stats: {
                energyCapacity: 100,
                energyPerSecond: 0,  // Will increase with energyConverters
            }
        },
        processor: {
            resources: {
                insight: 0,
            },
            upgrades: {
                mainframeExpansions: 0,
                processingThreads: 0,
                threadEfficiency: 0,
                unlocked: 0,
            },
            stats: {
                insightCapacity: 50,
                insightPerSecond: 0,  // Will increase with processingThreads
                insightPerClick: 0.5,
            }
        },
        crewQuarters: {
            resources: {
                crew: 0,
            },
            upgrades: {
                additionalQuarters: 0,
                workerCrews: 0,
                crewEfficiency: 0,
                unlocked: 0,
            },
            stats: {
                crewCapacity: 5,
                crewPerSecond: 0,  // Will increase with workerCrews
                awakeningProgress: 0,
            }
        },
        manufacturing: {
            resources: {
                scrap: 0,
            },
            upgrades: {
                cargoHoldExpansions: 0,
                manufacturingBays: 0,
                bayEfficiency: 0,
                unlocked: 0,
            },
            stats: {
                scrapCapacity: 100,
                scrapPerSecond: 0,  // Will increase with manufacturingBays
            }
        }
    },
    lastUpdate: Date.now(),
    version: 1,
    logs: {
        discovered: {},
        unread: []
    },
    navigation: {
        currentRegion: 'void',
        completedRegions: []
    },
    encounters: {
        active: false,
        history: []
    },
    combat: {
        active: false,
        currentEnemy: null,
        currentRegion: null,
        turn: 0,
        encounterCompleted: false,
        playerStats: {
            health: 100,
            maxHealth: 100,
            shield: 0,
            maxShield: 0,
            statusEffects: []
        },
        enemyStats: {
            health: 100,
            maxHealth: 100,
            shield: 0,
            maxShield: 0,
            statusEffects: []
        },
        battleLog: [],
        availableActions: [],
        cooldowns: {},
        lastActionResult: undefined,
        lastEnemyActionId: null,
        rewards: {
            energy: 0,
            insight: 0,
            crew: 0,
            scrap: 0
        },
        enemyIntentions: null
    },
    relics: 0,
}; 
