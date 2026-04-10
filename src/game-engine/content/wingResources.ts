/**
 * Wing Resource Definitions
 *
 * Each wing has 3 resources forming a production chain:
 *   primary → secondary → tertiary
 *
 * Workers assigned to each resource produce it at a base rate.
 * Each resource (except reactor primary) consumes the resource
 * before it in the chain to produce.
 *
 * Secondary resources are spent on CAPACITY upgrades for all 3 slots.
 * Tertiary resources are spent on EFFICIENCY upgrades for all 3 slots.
 */

export type WingId = 'reactor' | 'processor' | 'crewQuarters' | 'manufacturing';
export type ResourceSlot = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

export interface SlotResourceDef {
  id: string;           // unique string id (e.g. 'energy', 'fuelRods')
  name: string;         // display name
  description: string;
  baseCapacity: number;
  baseRate: number;     // produced per worker per second (before efficiency)
  consumeRate: number;  // input consumed per worker per second
  capacityPerLevel: number;  // capacity added per cap upgrade level
  efficiencyBonus: number;   // output multiplier per eff upgrade level (0.5 = +50%)
}

/** Thresholds to progressively unlock resource tiers within a wing */
export interface WingUnlockThresholds {
  secondary: number;          // primary resource amount to unlock secondary clicking
  tertiary: number;           // secondary resource amount to unlock tertiary clicking
  quaternary: number;         // tertiary resource amount to unlock quaternary clicking
  /** Per-slot automation: tertiary resource amount needed to enable automation */
  automatePrimary: number;    // tertiary resource to automate primary slot
  automateSecondary: number;  // tertiary resource to automate secondary slot
  automateTertiary: number;   // tertiary resource to automate tertiary slot
  automateQuaternary: number; // quaternary resource to automate quaternary slot
}

export interface WingDef {
  id: WingId;
  name: string;
  pageTitle: string;
  description: string;
  color: string;              // tailwind chart color (e.g. 'chart-1')
  clickText: string;          // e.g. "Generate Energy"
  clickAmount: number;        // units added per click (primary resource)
  /** Per-slot click amounts for manual generation */
  clickAmounts: Record<ResourceSlot, number>;
  /** Energy consumed per worker per second on the primary resource.
   *  0 for reactor (energy IS the primary). */
  energyCostPerPrimaryWorker: number;
  resources: Record<ResourceSlot, SlotResourceDef>;
  /** Thresholds for progressive unlock. 0 = immediately available. */
  unlockThresholds: WingUnlockThresholds;
}

/** Cost of a capacity upgrade (paid in secondary resource) */
export function capacityUpgradeCost(level: number): number {
  return Math.ceil(5 * Math.pow(1.4, level));
}

/** Cost of an efficiency upgrade (paid in tertiary resource) */
export function efficiencyUpgradeCost(level: number): number {
  return Math.ceil(3 * Math.pow(1.5, level));
}

/** Cost of a +1 max-workers upgrade for a slot (paid in quaternary resource) */
export function maxWorkersUpgradeCost(level: number): number {
  return Math.ceil(5 * Math.pow(1.6, level));
}

/** Starting per-slot worker cap */
export const INITIAL_MAX_WORKERS_PER_SLOT = 5;

/** Energy cost to hire one new worker (global pool) */
export function workerHireEnergyCost(currentWorkers: number): number {
  return Math.ceil(20 * Math.pow(1.4, currentWorkers));
}

/** Relic cost to buy the next +5 max workers (global pool) */
export function workerMaxUpgradeRelicCost(level: number): number {
  return 5 * (level + 1);
}

/** Base global max workers (before any relic upgrades) */
export const WORKER_BASE = 5;

/** Additional max workers granted per relic upgrade level */
export const WORKER_PER_UPGRADE = 5;

/** Max workers raised per boss gate level (hard ceiling) */
export const WORKER_BOSS_GATE_SIZE = 5;

/** Starting boss gate level (all wings share this) */
export const INITIAL_BOSS_GATE_LEVEL = 1;

/* ========================================================================== */
/* Wing Definitions                                                           */
/* ========================================================================== */

export const WING_DEFS: Record<WingId, WingDef> = {
  reactor: {
    id: 'reactor',
    name: 'Reactor',
    pageTitle: 'Reactor Core',
    description: "The ship's primary energy generation system. All other wings depend on energy to operate.",
    color: 'chart-1',
    clickText: 'Generate Energy',
    clickAmount: 1,
    clickAmounts: { primary: 1, secondary: 0.5, tertiary: 0.2, quaternary: 0.1 },
    energyCostPerPrimaryWorker: 0,
    unlockThresholds: {
      secondary: 100, tertiary: 15, quaternary: 6,
      automatePrimary: 5, automateSecondary: 7, automateTertiary: 8, automateQuaternary: 4,
    },
    resources: {
      primary: {
        id: 'energy',
        name: 'Energy',
        description: 'Core power supply for the entire ship.',
        baseCapacity: 100,
        baseRate: 2.0,
        consumeRate: 0,        // free
        capacityPerLevel: 50,
        efficiencyBonus: 0.5,
      },
      secondary: {
        id: 'fuelRods',
        name: 'Fuel Rods',
        description: 'Condensed energy cells. Spent to expand storage capacities.',
        baseCapacity: 15,
        baseRate: 0.3,
        consumeRate: 1.5,      // energy/s per worker
        capacityPerLevel: 8,
        efficiencyBonus: 0.5,
      },
      tertiary: {
        id: 'thermalCores',
        name: 'Thermal Cores',
        description: 'Refined reactor by-products. Spent to improve worker efficiency.',
        baseCapacity: 8,
        baseRate: 0.1,
        consumeRate: 0.5,      // fuel rods/s per worker
        capacityPerLevel: 4,
        efficiencyBonus: 0.5,
      },
      quaternary: {
        id: 'plasmaConduits',
        name: 'Plasma Conduits',
        description: 'High-pressure routing channels. Spent to raise the worker cap on each slot.',
        baseCapacity: 6,
        baseRate: 0.06,
        consumeRate: 0.3,      // thermal cores/s per worker
        capacityPerLevel: 3,
        efficiencyBonus: 0.5,
      },
    },
  },

  processor: {
    id: 'processor',
    name: 'Processor',
    pageTitle: 'Quantum Processor',
    description: "Ship's computational core. Generates Insight to unlock advanced capabilities.",
    color: 'chart-2',
    clickText: 'Process Data',
    clickAmount: 0.5,
    clickAmounts: { primary: 0.5, secondary: 0.3, tertiary: 0.1, quaternary: 0.05 },
    energyCostPerPrimaryWorker: 1.0,
    unlockThresholds: {
      secondary: 50, tertiary: 10, quaternary: 4,
      automatePrimary: 3, automateSecondary: 4, automateTertiary: 5, automateQuaternary: 3,
    },
    resources: {
      primary: {
        id: 'insight',
        name: 'Insight',
        description: 'Computational output from quantum processing.',
        baseCapacity: 50,
        baseRate: 1.0,
        consumeRate: 0,        // energy cost handled by energyCostPerPrimaryWorker
        capacityPerLevel: 25,
        efficiencyBonus: 0.5,
      },
      secondary: {
        id: 'dataBanks',
        name: 'Data Banks',
        description: 'Structured data archives. Spent to expand storage capacities.',
        baseCapacity: 10,
        baseRate: 0.2,
        consumeRate: 1.0,      // insight/s per worker
        capacityPerLevel: 5,
        efficiencyBonus: 0.5,
      },
      tertiary: {
        id: 'algorithms',
        name: 'Algorithms',
        description: 'Optimized processing routines. Spent to improve worker efficiency.',
        baseCapacity: 5,
        baseRate: 0.08,
        consumeRate: 0.3,      // data banks/s per worker
        capacityPerLevel: 3,
        efficiencyBonus: 0.5,
      },
      quaternary: {
        id: 'heuristics',
        name: 'Heuristics',
        description: 'Self-tuning decision models. Spent to raise the worker cap on each slot.',
        baseCapacity: 4,
        baseRate: 0.05,
        consumeRate: 0.2,      // algorithms/s per worker
        capacityPerLevel: 2,
        efficiencyBonus: 0.5,
      },
    },
  },

  crewQuarters: {
    id: 'crewQuarters',
    name: 'Crew Quarters',
    pageTitle: 'Crew Quarters',
    description: 'Cryogenic bay and living quarters. Awaken and organize crew members.',
    color: 'chart-3',
    clickText: 'Awaken Crew',
    clickAmount: 0.5,
    clickAmounts: { primary: 0.5, secondary: 0.2, tertiary: 0.1, quaternary: 0.05 },
    energyCostPerPrimaryWorker: 1.0,
    unlockThresholds: {
      secondary: 20, tertiary: 8, quaternary: 4,
      automatePrimary: 3, automateSecondary: 4, automateTertiary: 5, automateQuaternary: 3,
    },
    resources: {
      primary: {
        id: 'crew',
        name: 'Crew',
        description: 'Awakened crew members supporting ship operations.',
        baseCapacity: 20,
        baseRate: 0.5,
        consumeRate: 0,
        capacityPerLevel: 10,
        efficiencyBonus: 0.5,
      },
      secondary: {
        id: 'barracks',
        name: 'Barracks',
        description: 'Organized crew quarters. Spent to expand storage capacities.',
        baseCapacity: 8,
        baseRate: 0.1,
        consumeRate: 0.5,      // crew/s per worker
        capacityPerLevel: 4,
        efficiencyBonus: 0.5,
      },
      tertiary: {
        id: 'commandTokens',
        name: 'Command Tokens',
        description: 'Authority protocols. Spent to improve worker efficiency.',
        baseCapacity: 5,
        baseRate: 0.04,
        consumeRate: 0.2,      // barracks/s per worker
        capacityPerLevel: 2,
        efficiencyBonus: 0.5,
      },
      quaternary: {
        id: 'officers',
        name: 'Officers',
        description: 'Specialist crew leaders. Spent to raise the worker cap on each slot.',
        baseCapacity: 4,
        baseRate: 0.03,
        consumeRate: 0.15,     // command tokens/s per worker
        capacityPerLevel: 2,
        efficiencyBonus: 0.5,
      },
    },
  },

  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    pageTitle: 'Manufacturing Bay',
    description: 'Salvage and fabrication systems. Process raw materials into ship components.',
    color: 'chart-4',
    clickText: 'Collect Scrap',
    clickAmount: 1,
    clickAmounts: { primary: 1, secondary: 0.3, tertiary: 0.1, quaternary: 0.05 },
    energyCostPerPrimaryWorker: 1.0,
    unlockThresholds: {
      secondary: 100, tertiary: 10, quaternary: 4,
      automatePrimary: 3, automateSecondary: 4, automateTertiary: 5, automateQuaternary: 3,
    },
    resources: {
      primary: {
        id: 'scrap',
        name: 'Scrap',
        description: 'Raw salvage materials collected from the void.',
        baseCapacity: 100,
        baseRate: 1.5,
        consumeRate: 0,
        capacityPerLevel: 50,
        efficiencyBonus: 0.5,
      },
      secondary: {
        id: 'alloys',
        name: 'Alloys',
        description: 'Refined metal composites. Spent to expand storage capacities.',
        baseCapacity: 10,
        baseRate: 0.15,
        consumeRate: 1.5,      // scrap/s per worker
        capacityPerLevel: 5,
        efficiencyBonus: 0.5,
      },
      tertiary: {
        id: 'schematics',
        name: 'Schematics',
        description: 'Engineering blueprints. Spent to improve worker efficiency.',
        baseCapacity: 5,
        baseRate: 0.04,
        consumeRate: 0.3,      // alloys/s per worker
        capacityPerLevel: 3,
        efficiencyBonus: 0.5,
      },
      quaternary: {
        id: 'prototypes',
        name: 'Prototypes',
        description: 'Functional test builds. Spent to raise the worker cap on each slot.',
        baseCapacity: 4,
        baseRate: 0.03,
        consumeRate: 0.15,     // schematics/s per worker
        capacityPerLevel: 2,
        efficiencyBonus: 0.5,
      },
    },
  },
};

/** Fixed progression: completing a region unlocks the next wing + makes a new region navigable */
export const REGION_WING_UNLOCKS: { region: string; wing: WingId; unlocksRegion: string }[] = [
  { region: 'void', wing: 'processor', unlocksRegion: 'nebula' },
  { region: 'nebula', wing: 'manufacturing', unlocksRegion: 'asteroid' },
  { region: 'asteroid', wing: 'crewQuarters', unlocksRegion: 'deepspace' },
];

/** All wing IDs in display order */
export const WING_ORDER: WingId[] = ['reactor', 'processor', 'crewQuarters', 'manufacturing'];

/** All resource slot types in chain order */
export const SLOT_ORDER: ResourceSlot[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

/** Map a concrete resource id (e.g. 'energy') to its wing and slot */
export function findResourceDef(resourceId: string): { wing: WingDef; slot: ResourceSlot; def: SlotResourceDef } | null {
  for (const wing of Object.values(WING_DEFS)) {
    for (const slot of SLOT_ORDER) {
      if (wing.resources[slot].id === resourceId) {
        return { wing, slot, def: wing.resources[slot] };
      }
    }
  }
  return null;
}
