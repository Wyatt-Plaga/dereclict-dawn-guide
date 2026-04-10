import { ResourceType } from '../types/resources';

/**
 * Ammo type identifiers
 */
export type AmmoTypeId = 'powerCells' | 'munitions' | 'dataCores' | 'repairKits';

/**
 * Ammo type definition
 */
export interface AmmoTypeDef {
  id: AmmoTypeId;
  name: string;
  description: string;
  color: string;           // tailwind color class stem (e.g. "cyan" for text-cyan-400, bg-cyan-500)
  sourceResource: ResourceType;
  craftCost: number;       // raw resources per 1 ammo
  craftYield: number;      // ammo produced per craft action
  baseMax: number;         // max capacity at tier 0
  maxPerTier: number;      // additional max per tier upgrade
  tierUpgradeCost: { resource: ResourceType; base: number; perTier: number }[];
}

/**
 * Ammo capacity tiers
 */
export const AMMO_TIER_NAMES = ['Mk1', 'Mk2', 'Mk3', 'Mk4'] as const;

/**
 * How many ammo a player ability consumes based on its tier
 */
export const AMMO_COST_BY_ABILITY_TIER: Record<number, number> = {
  0: 1,  // Starter abilities
  1: 2,  // Region T1 abilities
  2: 3,  // Region T2 abilities
  3: 5,  // Capstone abilities
};

/**
 * All ammo type definitions
 */
export const AMMO_TYPES: Record<AmmoTypeId, AmmoTypeDef> = {
  powerCells: {
    id: 'powerCells',
    name: 'Power Cells',
    description: 'Compressed energy cells for phasers, shields, and energy weapons.',
    color: 'cyan',
    sourceResource: 'energy',
    craftCost: 10,
    craftYield: 1,
    baseMax: 10,
    maxPerTier: 15,
    tierUpgradeCost: [
      { resource: 'energy', base: 50, perTier: 50 },
    ],
  },
  munitions: {
    id: 'munitions',
    name: 'Munitions',
    description: 'Kinetic projectiles and warheads for railguns, flak cannons, and ballistic weapons.',
    color: 'amber',
    sourceResource: 'scrap',
    craftCost: 15,
    craftYield: 1,
    baseMax: 10,
    maxPerTier: 15,
    tierUpgradeCost: [
      { resource: 'scrap', base: 75, perTier: 75 },
    ],
  },
  dataCores: {
    id: 'dataCores',
    name: 'Data Cores',
    description: 'Encoded signal packages for torpedoes, scanning arrays, and electronic warfare.',
    color: 'violet',
    sourceResource: 'insight',
    craftCost: 5,
    craftYield: 1,
    baseMax: 10,
    maxPerTier: 15,
    tierUpgradeCost: [
      { resource: 'insight', base: 25, perTier: 25 },
    ],
  },
  repairKits: {
    id: 'repairKits',
    name: 'Repair Kits',
    description: 'Emergency hull patches and medical supplies for field repairs.',
    color: 'emerald',
    sourceResource: 'crew',
    craftCost: 2,
    craftYield: 1,
    baseMax: 10,
    maxPerTier: 15,
    tierUpgradeCost: [
      { resource: 'crew', base: 5, perTier: 5 },
    ],
  },
};

/**
 * Map resource types to ammo types
 */
export const RESOURCE_TO_AMMO: Record<string, AmmoTypeId> = {
  energy: 'powerCells',
  scrap: 'munitions',
  insight: 'dataCores',
  crew: 'repairKits',
};

/**
 * Get max capacity for an ammo type at a given tier
 */
export function getAmmoMax(ammoId: AmmoTypeId, tier: number): number {
  const def = AMMO_TYPES[ammoId];
  return def.baseMax + def.maxPerTier * tier;
}

/**
 * Get the cost to upgrade an ammo type to the next tier
 */
export function getAmmoUpgradeCost(ammoId: AmmoTypeId, currentTier: number): { resource: ResourceType; amount: number }[] {
  const def = AMMO_TYPES[ammoId];
  return def.tierUpgradeCost.map(c => ({
    resource: c.resource,
    amount: c.base + c.perTier * currentTier,
  }));
}

/**
 * Relic cost to upgrade ammo capacity to the next tier
 */
const AMMO_UPGRADE_RELIC_COSTS = [5, 15, 30];

export function getAmmoUpgradeRelicCost(currentTier: number): number {
  return AMMO_UPGRADE_RELIC_COSTS[currentTier] ?? 0;
}
