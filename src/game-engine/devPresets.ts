/**
 * Dev Mode Quick Start Presets
 *
 * Each preset provides a partial GameState that gets deep-merged
 * into initialGameState via engine.loadPreset(). Stats are
 * recalculated by updateAllStats after load.
 */

import { GameState, EncounterHistory, RegionType } from './types';

/** Helper to generate fake encounter history for a completed region */
function regionHistory(region: RegionType, count: number): EncounterHistory[] {
    const entries: EncounterHistory[] = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
        entries.push({
            type: 'combat',
            id: `${region}-history-${i}`,
            result: 'victory',
            date: now - (count - i) * 60_000,
            region,
        });
    }
    return entries;
}

export interface DevPreset {
    name: string;
    description: string;
    /**
     * Partial state fragment, deep-merged into initialGameState by loadPreset.
     * Typed as `any` because the inner wing categories supply only partial
     * fields and rely on mergeWing() to fill defaults for new slots/upgrades.
     */
    state: any;
}

const postVoid: DevPreset = {
    name: 'Post-Void',
    description: 'Void complete, all wings unlocked, ready for branching regions',
    state: {
        categories: {
            reactor: {
                resources: { primary: 150, secondary: 5, tertiary: 2 },
                workers: { primary: 3, secondary: 1, tertiary: 0 },
                upgrades: {
                    primaryCap: 2, secondaryCap: 1, tertiaryCap: 0,
                    primaryEff: 1, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
                specialUpgrades: { shielding: 1, shieldBoosts: 0, bridgeUnlocked: 1 },
            },
            processor: {
                resources: { primary: 30, secondary: 2, tertiary: 0 },
                workers: { primary: 2, secondary: 0, tertiary: 0 },
                upgrades: {
                    primaryCap: 1, secondaryCap: 0, tertiaryCap: 0,
                    primaryEff: 0, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            crewQuarters: {
                resources: { primary: 5, secondary: 0, tertiary: 0 },
                workers: { primary: 1, secondary: 0, tertiary: 0 },
                upgrades: {
                    primaryCap: 0, secondaryCap: 0, tertiaryCap: 0,
                    primaryEff: 0, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            manufacturing: {
                resources: { primary: 80, secondary: 2, tertiary: 0 },
                workers: { primary: 1, secondary: 0, tertiary: 0 },
                upgrades: {
                    primaryCap: 1, secondaryCap: 0, tertiaryCap: 0,
                    primaryEff: 0, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
        },
        workerGateLevel: 2,
        workers: { total: 8, max: 10, maxLevel: 1 },
        bridge: {
            currentRegion: 'nebula',
            currentTier: 1,
            completedRegions: ['void'],
        },
        encounters: { active: false, history: regionHistory('void', 6) },
        relics: 5,
        ammo: {
            powerCells: { current: 8, tier: 0 },
            munitions: { current: 3, tier: 0 },
            dataCores: { current: 5, tier: 0 },
            repairKits: { current: 4, tier: 0 },
        },
        inventory: ['basic-phaser', 'basic-shielding', 'hull-patch', 'scan-mk1'],
        loadout: {
            shield: 'basic-shielding',
            weapons: ['basic-phaser'],
            utilities: ['hull-patch', 'scan-mk1'],
            stance: null,
        },
    },
};

const midGame: DevPreset = {
    name: 'Mid-Game',
    description: 'Void + Nebula complete, solid upgrades, ready for Asteroid/Radiation',
    state: {
        categories: {
            reactor: {
                resources: { primary: 400, secondary: 10, tertiary: 5 },
                workers: { primary: 3, secondary: 2, tertiary: 1 },
                upgrades: {
                    primaryCap: 4, secondaryCap: 2, tertiaryCap: 1,
                    primaryEff: 2, secondaryEff: 1, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
                specialUpgrades: { shielding: 1, shieldBoosts: 1, bridgeUnlocked: 1 },
            },
            processor: {
                resources: { primary: 100, secondary: 5, tertiary: 2 },
                workers: { primary: 2, secondary: 1, tertiary: 1 },
                upgrades: {
                    primaryCap: 3, secondaryCap: 1, tertiaryCap: 0,
                    primaryEff: 1, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            crewQuarters: {
                resources: { primary: 10, secondary: 3, tertiary: 1 },
                workers: { primary: 2, secondary: 1, tertiary: 0 },
                upgrades: {
                    primaryCap: 2, secondaryCap: 1, tertiaryCap: 0,
                    primaryEff: 1, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            manufacturing: {
                resources: { primary: 200, secondary: 5, tertiary: 2 },
                workers: { primary: 2, secondary: 1, tertiary: 0 },
                upgrades: {
                    primaryCap: 3, secondaryCap: 1, tertiaryCap: 0,
                    primaryEff: 1, secondaryEff: 0, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
        },
        workerGateLevel: 4,
        workers: { total: 16, max: 20, maxLevel: 3 },
        bridge: {
            currentRegion: 'asteroid',
            currentTier: 1,
            completedRegions: ['void', 'nebula'],
        },
        encounters: {
            active: false,
            history: [...regionHistory('void', 6), ...regionHistory('nebula', 6)],
        },
        relics: 25,
        ammo: {
            powerCells: { current: 20, tier: 1 },
            munitions: { current: 15, tier: 1 },
            dataCores: { current: 18, tier: 1 },
            repairKits: { current: 12, tier: 1 },
        },
        inventory: [
            'basic-phaser', 'basic-shielding', 'hull-patch', 'scan-mk1',
            'regenerative-shield', 'raise-shields-mk2',
            'flak-cannon', 'scramble-sensors-mk1',
        ],
        loadout: {
            shield: 'regenerative-shield',
            weapons: ['basic-phaser', 'flak-cannon'],
            utilities: ['hull-patch', 'scan-mk1', 'scramble-sensors-mk1'],
            stance: null,
        },
    },
};

const preEndgame: DevPreset = {
    name: 'Pre-Endgame',
    description: 'All regions except blackhole complete, high upgrades, ready for final',
    state: {
        categories: {
            reactor: {
                resources: { primary: 1500, secondary: 30, tertiary: 15 },
                workers: { primary: 4, secondary: 2, tertiary: 1 },
                upgrades: {
                    primaryCap: 8, secondaryCap: 4, tertiaryCap: 3,
                    primaryEff: 4, secondaryEff: 2, tertiaryEff: 1,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
                specialUpgrades: { shielding: 1, shieldBoosts: 3, bridgeUnlocked: 1 },
            },
            processor: {
                resources: { primary: 500, secondary: 15, tertiary: 8 },
                workers: { primary: 3, secondary: 2, tertiary: 1 },
                upgrades: {
                    primaryCap: 6, secondaryCap: 3, tertiaryCap: 2,
                    primaryEff: 3, secondaryEff: 2, tertiaryEff: 1,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            crewQuarters: {
                resources: { primary: 20, secondary: 10, tertiary: 4 },
                workers: { primary: 3, secondary: 1, tertiary: 1 },
                upgrades: {
                    primaryCap: 5, secondaryCap: 2, tertiaryCap: 1,
                    primaryEff: 3, secondaryEff: 1, tertiaryEff: 0,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            manufacturing: {
                resources: { primary: 800, secondary: 15, tertiary: 6 },
                workers: { primary: 3, secondary: 1, tertiary: 1 },
                upgrades: {
                    primaryCap: 6, secondaryCap: 3, tertiaryCap: 2,
                    primaryEff: 3, secondaryEff: 1, tertiaryEff: 1,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
        },
        workerGateLevel: 7,
        workers: { total: 23, max: 35, maxLevel: 6 },
        bridge: {
            currentRegion: 'blackhole',
            currentTier: 1,
            completedRegions: ['void', 'nebula', 'asteroid', 'deepspace'],
        },
        encounters: {
            active: false,
            history: [
                ...regionHistory('void', 6),
                ...regionHistory('nebula', 6),
                ...regionHistory('asteroid', 8),
                ...regionHistory('deepspace', 6),
            ],
        },
        relics: 80,
        ammo: {
            powerCells: { current: 35, tier: 2 },
            munitions: { current: 30, tier: 2 },
            dataCores: { current: 30, tier: 2 },
            repairKits: { current: 25, tier: 2 },
        },
        inventory: [
            'basic-phaser', 'basic-shielding', 'hull-patch', 'scan-mk1',
            'regenerative-shield', 'raise-shields-mk2', 'reactive-shield', 'raise-shields-mk3',
            'rail-gun', 'gauss-cannon', 'flak-cannon', 'flak-mk2',
            'hull-plating-mk1', 'hull-plating-mk2', 'brace-for-impact',
            'low-yield-torpedo', 'emp-torpedo',
            'scramble-sensors-mk1', 'hack', 'evasive-manoeuvres',
        ],
        loadout: {
            shield: 'reactive-shield',
            weapons: ['gauss-cannon', 'flak-mk2'],
            utilities: ['hull-patch', 'hack'],
            stance: 'evasive-manoeuvres',
        },
    },
};

const maxPreset: DevPreset = {
    name: 'Max',
    description: 'Everything maxed — all regions, upgrades, and resources',
    state: {
        categories: {
            reactor: {
                resources: { primary: 5000, secondary: 80, tertiary: 40 },
                workers: { primary: 5, secondary: 3, tertiary: 2 },
                upgrades: {
                    primaryCap: 12, secondaryCap: 8, tertiaryCap: 6,
                    primaryEff: 6, secondaryEff: 4, tertiaryEff: 3,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
                specialUpgrades: { shielding: 1, shieldBoosts: 5, bridgeUnlocked: 1 },
            },
            processor: {
                resources: { primary: 2000, secondary: 40, tertiary: 20 },
                workers: { primary: 4, secondary: 2, tertiary: 1 },
                upgrades: {
                    primaryCap: 10, secondaryCap: 6, tertiaryCap: 5,
                    primaryEff: 5, secondaryEff: 3, tertiaryEff: 2,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            crewQuarters: {
                resources: { primary: 50, secondary: 25, tertiary: 12 },
                workers: { primary: 3, secondary: 2, tertiary: 1 },
                upgrades: {
                    primaryCap: 8, secondaryCap: 5, tertiaryCap: 4,
                    primaryEff: 5, secondaryEff: 3, tertiaryEff: 2,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
            manufacturing: {
                resources: { primary: 3000, secondary: 50, tertiary: 25 },
                workers: { primary: 4, secondary: 2, tertiary: 1 },
                upgrades: {
                    primaryCap: 10, secondaryCap: 6, tertiaryCap: 5,
                    primaryEff: 5, secondaryEff: 3, tertiaryEff: 2,
                },
                stats: { primaryCapacity: 0, primaryRate: 0, secondaryCapacity: 0, secondaryRate: 0, tertiaryCapacity: 0, tertiaryRate: 0 },
                unlocked: true,
                secondaryUnlocked: true, tertiaryUnlocked: true, automated: { primary: true, secondary: true, tertiary: true },
            },
        },
        workerGateLevel: 11,
        workers: { total: 30, max: 55, maxLevel: 10 },
        bridge: {
            currentRegion: 'blackhole',
            currentTier: 1,
            completedRegions: ['void', 'nebula', 'asteroid', 'deepspace', 'blackhole'],
        },
        encounters: {
            active: false,
            history: [
                ...regionHistory('void', 6),
                ...regionHistory('nebula', 6),
                ...regionHistory('asteroid', 8),
                ...regionHistory('deepspace', 6),
                ...regionHistory('blackhole', 6),
            ],
        },
        relics: 200,
        ammo: {
            powerCells: { current: 55, tier: 3 },
            munitions: { current: 55, tier: 3 },
            dataCores: { current: 55, tier: 3 },
            repairKits: { current: 55, tier: 3 },
        },
        inventory: [
            'basic-phaser', 'basic-shielding', 'hull-patch', 'scan-mk1',
            'regenerative-shield', 'raise-shields-mk2', 'reactive-shield', 'raise-shields-mk3', 'mantle-of-stars',
            'rail-gun', 'gauss-cannon', 'flak-cannon', 'flak-mk2',
            'hull-plating-mk1', 'hull-plating-mk2', 'brace-for-impact',
            'low-yield-torpedo', 'emp-torpedo', 'tactical-nuke',
            'scramble-sensors-mk1', 'hack', 'evasive-manoeuvres',
            'leeching-phaser', 'spark-of-creation', 'battle-stations',
        ],
        loadout: {
            shield: 'mantle-of-stars',
            weapons: ['spark-of-creation', 'gauss-cannon'],
            utilities: ['hull-patch', 'hack'],
            stance: 'battle-stations',
        },
    },
};

/** All available dev presets */
export const DEV_PRESETS: DevPreset[] = [
    postVoid,
    midGame,
    preEndgame,
    maxPreset,
];
