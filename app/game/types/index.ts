/**
 * Core game state type definitions
 */

/**
 * Region Types
 */
export type RegionType = 'void' | 'nebula' | 'asteroid' | 'deepspace' | 'blackhole';

/**
 * Log Categories
 */
export enum LogCategory {
    SHIP_SYSTEMS = "Ship Systems",
    CREW_RECORDS = "Crew Records",
    MISSION_DATA = "Mission Data",
    PERSONAL_LOGS = "Personal Logs",
    UNKNOWN = "Unknown"
}

/**
 * Log Entry interface
 */
export interface LogEntry {
    id: string;
    title: string;
    content: string;
    timestamp: number; // When it was discovered
    category: LogCategory;
    isRead: boolean;
}

/**
 * Log Unlock Conditions
 */
export type LogUnlockCondition = 
    | ResourceThresholdCondition
    | UpgradePurchasedCondition
    | MultiCondition;

export interface ResourceThresholdCondition {
    type: 'RESOURCE_THRESHOLD';
    category: keyof GameState['categories'];
    resourceType: string;
    threshold: number;
}

export interface UpgradePurchasedCondition {
    type: 'UPGRADE_PURCHASED';
    category: keyof GameState['categories'];
    upgradeId: string;
}

export interface MultiCondition {
    type: 'MULTI_CONDITION';
    operator: 'AND' | 'OR';
    conditions: LogUnlockCondition[];
}

/**
 * Log Definition interface
 */
export interface LogDefinition {
    title: string;
    content: string;
    category: LogCategory;
    unlockConditions: LogUnlockCondition[];
}

/**
 * Reactor Category - Energy generation and storage
 */
export interface ReactorCategory {
    resources: {
        energy: number;
    };
    upgrades: {
        reactorExpansions: number;  // Increases energy capacity
        energyConverters: number;   // Automatic energy generation
    };
    stats: {
        energyCapacity: number;
        energyPerSecond: number;    // Auto-generation rate
    };
}

/**
 * Processor Category - Insight generation and computation
 */
export interface ProcessorCategory {
    resources: {
        insight: number;
    };
    upgrades: {
        mainframeExpansions: number;  // Increases insight capacity
        processingThreads: number;    // Automatic insight generation
    };
    stats: {
        insightCapacity: number;
        insightPerSecond: number;     // Auto-generation rate
        insightPerClick: number;      // Currently fixed at 0.5
    };
}

/**
 * Crew Quarters Category - Crew management
 */
export interface CrewQuartersCategory {
    resources: {
        crew: number;
    };
    upgrades: {
        additionalQuarters: number;  // Increases crew capacity
        workerCrews: number;         // Automatic crew awakening
    };
    stats: {
        crewCapacity: number;
        crewPerSecond: number;       // Auto-awakening rate
        awakeningProgress: number;   // Tracks 0-10 clicks for manual awakening
    };
}

/**
 * Manufacturing Category - Resource gathering and production
 */
export interface ManufacturingCategory {
    resources: {
        scrap: number;
    };
    upgrades: {
        cargoHoldExpansions: number;  // Increases scrap capacity
        manufacturingBays: number;    // Automatic scrap collection
    };
    stats: {
        scrapCapacity: number;
        scrapPerSecond: number;       // Auto-collection rate
    };
}

/**
 * Encounter Types
 */
export interface BaseEncounter {
    id: string;
    type: 'combat' | 'story' | 'empty';
    title: string;
    description: string;
    region: RegionType;
}

export interface EmptyEncounter extends BaseEncounter {
    type: 'empty';
    resources?: ResourceReward[];
    message: string;
}

export interface StoryEncounter extends BaseEncounter {
    type: 'story';
    choices: EncounterChoice[];
    message?: string;
}

export interface EncounterChoice {
    id: string;
    text: string;
    outcome: {
        resources?: ResourceReward[];
        text: string;
        continuesToNextEncounter?: boolean;
    };
}

export interface ResourceReward {
    type: string;
    amount: number;
    message?: string;
}

export interface EncounterHistory {
    type: 'combat' | 'story' | 'empty';
    id: string;
    result: string;
    date: number;
    region: RegionType;
}

/**
 * Combat Related Types
 */

/**
 * Enemy Action interface
 */
export interface EnemyAction {
  name: string;
  description: string;
  damage: number;
  target: 'health' | 'shield';
  probability: number;
}

/**
 * Enemy interface
 */
export interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  image: string;
  attackDelay: number; // Time in ms between enemy attacks
  lastAttackTime: number; // Last time the enemy attacked
  actions: EnemyAction[];
  region: RegionType;
}

/**
 * Battle Log Entry interface
 */
export interface BattleLogEntry {
  id: string;
  text: string;
  type: 'SYSTEM' | 'PLAYER' | 'ENEMY' | 'ANALYSIS';
  timestamp: number;
}

/**
 * Combat State interface
 */
export interface CombatState {
  active: boolean;
  currentEnemy: string | null;
  currentRegion: string | null;
  turn: number;
  encounterCompleted: boolean;
  outcome?: 'victory' | 'defeat' | 'retreat';
  playerStats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    statusEffects: any[];
  };
  enemyStats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    statusEffects: any[];
  };
  battleLog: BattleLogEntry[];
  availableActions: string[];
  cooldowns: Record<string, number>;
  lastActionResult?: any;
  lastEnemyActionId: string | null;
  rewards?: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
  };
  enemyIntentions: any | null;
}

/**
 * Combat Encounter interface
 */
export interface CombatEncounter extends BaseEncounter {
  type: 'combat';
  enemy: Enemy;
  rewards?: ResourceReward[];
  escapePenalty?: ResourceReward[];
}

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
            shield: 50,
            maxShield: 50,
            statusEffects: []
        },
        enemyStats: {
            health: 100,
            maxHealth: 100,
            shield: 50,
            maxShield: 50,
            statusEffects: []
        },
        battleLog: [],
        availableActions: [],
        cooldowns: {},
        lastActionResult: null,
        lastEnemyActionId: null,
        rewards: {
            energy: 0,
            insight: 0,
            crew: 0,
            scrap: 0
        },
        enemyIntentions: null
    }
}; 