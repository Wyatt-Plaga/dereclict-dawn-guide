/**
 * Core game state type definitions
 */

import { RegionType } from './regions';
import { LogEntry, LogCategory } from './logs';
import { BaseEncounter, EncounterHistory } from './encounters';
import { CombatState } from './combat';
import {
  ReactorCategory, ProcessorCategory, CrewQuartersCategory,
  ManufacturingCategory, ActiveBuff, WorkerPool
} from './resources';

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
    categories: {
        reactor: ReactorCategory;
        processor: ProcessorCategory;
        crewQuarters: CrewQuartersCategory;
        manufacturing: ManufacturingCategory;
    };

    /** Boss-gated worker cap — each level raises the global max workers ceiling */
    workerGateLevel: number;

    /** Shared worker pool used by all wings */
    workers: WorkerPool;

    lastUpdate: number;
    version: number;

    logs: {
        discovered: Record<string, LogEntry>;
        unread: string[];
    };

    bridge: {
        currentRegion: RegionType;
        currentTier: number;
        completedRegions: string[];
    };

    encounters: {
        active: boolean;
        encounter?: BaseEncounter;
        history: EncounterHistory[];
        /** A retreat pins this enemy to its region — re-entering that region forces the rematch */
        pendingRematch?: { enemyId: string; regionKey: string };
    };

    combat: CombatState;

    /** Universal resources not tied to a single wing */
    relics: number;

    /** Equipment system */
    inventory: string[];
    loadout: {
        shield: string | null;
        weapons: string[];
        utilities: string[];
        stance: string | null;
    };

    /** Ammo system */
    ammo: {
        powerCells:  { current: number; tier: number };
        munitions:   { current: number; tier: number };
        dataCores:   { current: number; tier: number };
        repairKits:  { current: number; tier: number };
    };

    /** Active timed buffs from story encounters */
    buffs: ActiveBuff[];
}

/* ========================================================================== */
/* Helpers to create default wing state                                       */
/* ========================================================================== */

import { WING_DEFS, WingId, WORKER_BASE, WORKER_PER_UPGRADE, WORKER_BOSS_GATE_SIZE, INITIAL_BOSS_GATE_LEVEL } from '../content/wingResources';

function defaultWingCategory(wingId: WingId, unlocked: boolean) {
    const def = WING_DEFS[wingId];
    return {
        resources: { primary: 0, secondary: 0, tertiary: 0 },
        workers: { primary: 0, secondary: 0, tertiary: 0 },
        upgrades: {
            primaryCap: 0, secondaryCap: 0, tertiaryCap: 0,
            primaryEff: 0, secondaryEff: 0, tertiaryEff: 0,
        },
        stats: {
            primaryCapacity: def.resources.primary.baseCapacity,
            primaryRate: 0,
            secondaryCapacity: def.resources.secondary.baseCapacity,
            secondaryRate: 0,
            tertiaryCapacity: def.resources.tertiary.baseCapacity,
            tertiaryRate: 0,
        },
        unlocked,
        secondaryUnlocked: false,
        tertiaryUnlocked: false,
        automated: { primary: false, secondary: false, tertiary: false },
    };
}

/**
 * Initial state for a new game
 */
export const initialGameState: GameState = {
    categories: {
        reactor: {
            ...defaultWingCategory('reactor', true),
            specialUpgrades: {
                shielding: 0,
                shieldBoosts: 0,
                bridgeUnlocked: 0,
            },
        },
        processor: defaultWingCategory('processor', false),
        crewQuarters: defaultWingCategory('crewQuarters', false),
        manufacturing: defaultWingCategory('manufacturing', false),
    },
    workerGateLevel: INITIAL_BOSS_GATE_LEVEL,
    workers: {
        total: 0,
        maxLevel: 0,
        max: Math.min(WORKER_BASE, INITIAL_BOSS_GATE_LEVEL * WORKER_BOSS_GATE_SIZE),
    },
    lastUpdate: Date.now(),
    version: 4,
    logs: {
        discovered: {},
        unread: []
    },
    bridge: {
        currentRegion: 'void',
        currentTier: 1,
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
        turn: 1,
        turnPhase: 'PLAYER',
        playerAP: 1,
        maxPlayerAP: 1,
        playerStunTurns: 0,
        cooldowns: {},
        enemyCooldowns: {},
        lastActionResult: undefined,
        lastEnemyActionId: null,
        rewards: {
            energy: 0,
            insight: 0,
            crew: 0,
            scrap: 0
        },
        radiationStacks: 0,
        enemyCloaked: false,
        enemyCloakTurns: 0
    },
    relics: 0,
    inventory: ['basic-phaser'],
    loadout: {
        shield: null,
        weapons: ['basic-phaser'],
        utilities: [],
        stance: null,
    },
    ammo: {
        powerCells:  { current: 5, tier: 0 },
        munitions:   { current: 0, tier: 0 },
        dataCores:   { current: 3, tier: 0 },
        repairKits:  { current: 2, tier: 0 },
    },
    buffs: [],
};
