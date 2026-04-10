/**
 * Resource type definitions for the wing-based worker system.
 *
 * Each wing has three resource slots: primary, secondary, tertiary.
 * Workers are assigned from a shared pool to produce each resource.
 */

import type { ResourceSlot } from '../content/wingResources';

/* ========================================================================== */
/* Per-wing state                                                             */
/* ========================================================================== */

/** Resource amounts for a single wing (primary / secondary / tertiary / quaternary) */
export interface WingResources {
  primary: number;
  secondary: number;
  tertiary: number;
  quaternary: number;
}

/** Workers assigned to each slot within a wing */
export interface WingWorkers {
  primary: number;
  secondary: number;
  tertiary: number;
  quaternary: number;
}

/** Upgrade levels within a wing (capacity, efficiency, max workers per slot) */
export interface WingUpgrades {
  // Capacity levels — purchased with the secondary resource
  primaryCap: number;
  secondaryCap: number;
  tertiaryCap: number;
  quaternaryCap: number;
  // Efficiency levels — purchased with the tertiary resource
  primaryEff: number;
  secondaryEff: number;
  tertiaryEff: number;
  quaternaryEff: number;
  // Max-worker levels — purchased with the quaternary resource
  primaryMaxWorkers: number;
  secondaryMaxWorkers: number;
  tertiaryMaxWorkers: number;
  quaternaryMaxWorkers: number;
}

/** Computed stats for a wing (derived from upgrades + workers) */
export interface WingStats {
  primaryCapacity: number;
  primaryRate: number;       // net production rate (positive = producing)
  secondaryCapacity: number;
  secondaryRate: number;
  tertiaryCapacity: number;
  tertiaryRate: number;
  quaternaryCapacity: number;
  quaternaryRate: number;
}

/** Global shared worker pool */
export interface WorkerPool {
  /** Total hired workers (across all wings) */
  total: number;
  /** Number of relic-purchased max-worker upgrades */
  maxLevel: number;
  /** Computed maximum workers (base + upgrades, capped by boss gate) */
  max: number;
}

/** Per-slot automation flags */
export interface SlotAutomation {
  primary: boolean;
  secondary: boolean;
  tertiary: boolean;
  quaternary: boolean;
}

/** Standard wing category shape */
export interface WingCategory {
  resources: WingResources;
  workers: WingWorkers;
  upgrades: WingUpgrades;
  stats: WingStats;
  unlocked: boolean;
  /** Progression: whether secondary resource tier is visible */
  secondaryUnlocked: boolean;
  /** Progression: whether tertiary resource tier is visible */
  tertiaryUnlocked: boolean;
  /** Progression: whether quaternary resource tier is visible */
  quaternaryUnlocked: boolean;
  /** Per-slot: whether automation is enabled (replaces clicking with workers) */
  automated: SlotAutomation;
}

/* ========================================================================== */
/* Wing types (each wing IS a WingCategory, reactor has extras)               */
/* ========================================================================== */

export interface ReactorCategory extends WingCategory {
  specialUpgrades: {
    shielding: number;
    shieldBoosts: number;
    bridgeUnlocked: number;
  };
}

export type ProcessorCategory = WingCategory;
export type CrewQuartersCategory = WingCategory;
export type ManufacturingCategory = WingCategory;

/* ========================================================================== */
/* Resource types for combat/encounters (unchanged from original)             */
/* ========================================================================== */

export type ResourceType = 'energy' | 'insight' | 'crew' | 'scrap' | 'relics';

export interface ResourceCost {
  type: ResourceType;
  amount: number;
}

export interface ResourceReward {
  type: string;       // 'energy' | 'insight' | 'crew' | 'scrap' | 'relics' | 'ammo'
  amount: number;
  ammoType?: string;  // e.g. 'powerCells' — only when type === 'ammo'
  message?: string;   // optional flavour text for encounter rewards
}

export interface BuffReward {
  type: BuffType;
  magnitude: number;
  durationMs: number;
  name: string;
  description: string;
}

/* ========================================================================== */
/* Buffs (unchanged)                                                          */
/* ========================================================================== */

export type BuffType =
  | 'energyRate'
  | 'insightRate'
  | 'scrapRate'
  | 'crewRate'
  | 'combatDamage'
  | 'shieldStrength';

export interface ActiveBuff {
  id: string;
  name: string;
  description: string;
  type: BuffType;
  magnitude: number;
  remainingMs: number;
  totalMs: number;
}

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

/** Get the capacity key for a slot */
export function capKey(slot: ResourceSlot): keyof WingUpgrades {
  return `${slot}Cap` as keyof WingUpgrades;
}

/** Get the efficiency key for a slot */
export function effKey(slot: ResourceSlot): keyof WingUpgrades {
  return `${slot}Eff` as keyof WingUpgrades;
}

/** Get the max-workers level key for a slot */
export function maxWorkersKey(slot: ResourceSlot): keyof WingUpgrades {
  return `${slot}MaxWorkers` as keyof WingUpgrades;
}
