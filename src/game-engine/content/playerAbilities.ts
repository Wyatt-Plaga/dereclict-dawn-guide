import { CombatActionCategory, StatusEffect } from '../types/combat';
import { ResourceCost } from '../types/resources';
import { AmmoTypeId } from './ammoTypes';

/**
 * Equipment slot types
 */
export type AbilitySlot = 'shield' | 'weapon' | 'utility' | 'stance';

/**
 * Ammo cost for an ability
 */
export interface AmmoCost {
  type: AmmoTypeId;
  amount: number;
}

/**
 * Player ability definition — replaces hardcoded PLAYER_ACTIONS
 */
export interface PlayerAbilityDef {
  id: string;
  name: string;
  description: string;
  slot: AbilitySlot;
  category: CombatActionCategory;
  passive?: boolean;
  apCost: number;                // action points to use this ability (default 1)
  cooldown: number;              // turns until usable again after firing
  cost?: ResourceCost;           // legacy resource cost (kept for reference)
  ammoCost?: AmmoCost;           // ammo consumed per use in combat
  // Effects
  damage?: number;               // hull damage to enemy
  shieldDamage?: number;         // shield damage to enemy (for split-damage weapons)
  shieldRepair?: number;         // restore player shields
  hullRepair?: number;           // restore player hull
  statusEffect?: StatusEffect;
  // Upgrade tree
  prereq?: string;               // ability ID required to unlock this
  unlockCost?: { material: string; amount: number };
  tier: number;                  // 0 = starter, 1-3 = unlockable
}

// ============================================================
// STARTER ABILITIES (tier 0 — everyone starts with these)
// ============================================================

const STARTER_ABILITIES: PlayerAbilityDef[] = [
  {
    id: 'basic-phaser',
    name: 'Basic Phaser',
    description: 'Low-power energy weapon. Effective against shields, weak against armor.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 1,
    cooldown: 0,
    cost: { type: 'energy', amount: 10 },
    damage: 5,
    shieldDamage: 10,
    tier: 0,
  },
  {
    id: 'basic-shielding',
    name: 'Raise Shields',
    description: 'Restore a small amount of shield energy.',
    slot: 'shield',
    category: CombatActionCategory.SHIELD,
    apCost: 1,
    cooldown: 1,
    cost: { type: 'energy', amount: 10 },
    shieldRepair: 15,
    tier: 0,
  },
  {
    id: 'hull-patch',
    name: 'Hull Patch',
    description: 'Emergency hull repair using crew and scrap.',
    slot: 'utility',
    category: CombatActionCategory.REPAIR,
    apCost: 1,
    cooldown: 2,
    cost: { type: 'crew', amount: 2 },
    hullRepair: 15,
    tier: 0,
  },
  {
    id: 'scan-mk1',
    name: 'Scan',
    description: 'Reveal enemy ability details for several turns.',
    slot: 'utility',
    category: CombatActionCategory.SABOTAGE,
    apCost: 1,
    cooldown: 3,
    cost: { type: 'insight', amount: 5 },
    statusEffect: { type: 'EXPOSE', duration: 4, magnitude: 1 },
    tier: 0,
  },
];

// ============================================================
// NEBULA BRANCH — Shields & Sustain (Plasma Cores)
// ============================================================

const NEBULA_ABILITIES: PlayerAbilityDef[] = [
  // Shield line
  {
    id: 'regenerative-shield',
    name: 'Regenerative Shielding',
    description: 'Shields that slowly restore themselves. Passive: +2 shield at the start of each player turn.',
    slot: 'shield',
    category: CombatActionCategory.SHIELD,
    passive: true,
    apCost: 0,
    cooldown: 0,
    prereq: 'basic-shielding',
    unlockCost: { material: 'plasmaCores', amount: 5 },
    tier: 1,
  },
  {
    id: 'raise-shields-mk2',
    name: 'Raise Shields Mk2',
    description: 'Improved shield restoration.',
    slot: 'shield',
    category: CombatActionCategory.SHIELD,
    apCost: 1,
    cooldown: 1,
    cost: { type: 'energy', amount: 15 },
    shieldRepair: 30,
    prereq: 'basic-shielding',
    unlockCost: { material: 'plasmaCores', amount: 8 },
    tier: 1,
  },
  {
    id: 'reactive-shield',
    name: 'Reactive Shielding',
    description: 'Advanced shields that absorb more damage. Passive: +4 shield at the start of each player turn.',
    slot: 'shield',
    category: CombatActionCategory.SHIELD,
    passive: true,
    apCost: 0,
    cooldown: 0,
    prereq: 'regenerative-shield',
    unlockCost: { material: 'plasmaCores', amount: 20 },
    tier: 2,
  },
  {
    id: 'raise-shields-mk3',
    name: 'Raise Shields Mk3',
    description: 'Maximum shield restoration.',
    slot: 'shield',
    category: CombatActionCategory.SHIELD,
    apCost: 2,
    cooldown: 2,
    cost: { type: 'energy', amount: 20 },
    shieldRepair: 50,
    prereq: 'raise-shields-mk2',
    unlockCost: { material: 'plasmaCores', amount: 25 },
    tier: 3,
  },
  {
    id: 'mantle-of-stars',
    name: 'Mantle of the Stars',
    description: 'Legendary shielding. Passive: +8 shield at the start of each player turn, shields absorb 20% hull damage.',
    slot: 'shield',
    category: CombatActionCategory.SHIELD,
    passive: true,
    apCost: 0,
    cooldown: 0,
    prereq: 'reactive-shield',
    unlockCost: { material: 'plasmaCores', amount: 50 },
    tier: 3,
  },
];

// ============================================================
// ASTEROID BRANCH — Burst & Armor (Alloy Composites)
// ============================================================

const ASTEROID_ABILITIES: PlayerAbilityDef[] = [
  // Kinetic line
  {
    id: 'rail-gun',
    name: 'Rail Gun',
    description: 'Magnetically accelerated slug. High hull damage, ignores armor.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 2,
    cooldown: 2,
    cost: { type: 'scrap', amount: 20 },
    damage: 35,
    shieldDamage: 5,
    prereq: 'basic-phaser',
    unlockCost: { material: 'alloyComposites', amount: 8 },
    tier: 1,
  },
  {
    id: 'gauss-cannon',
    name: 'Gauss Cannon',
    description: 'Heavy kinetic weapon. Devastating against armored targets.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 3,
    cooldown: 3,
    cost: { type: 'scrap', amount: 30 },
    damage: 55,
    shieldDamage: 10,
    prereq: 'rail-gun',
    unlockCost: { material: 'alloyComposites', amount: 25 },
    tier: 2,
  },
  // Flak line
  {
    id: 'flak-cannon',
    name: 'Flak Cannon',
    description: 'Rapid burst of shrapnel. High shield damage, low hull damage.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 1,
    cooldown: 1,
    cost: { type: 'scrap', amount: 10 },
    damage: 3,
    shieldDamage: 20,
    prereq: 'basic-phaser',
    unlockCost: { material: 'alloyComposites', amount: 5 },
    tier: 1,
  },
  {
    id: 'flak-mk2',
    name: 'Flak Cannon Mk2',
    description: 'Improved shrapnel spread. Strips shields fast.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 2,
    cooldown: 1,
    cost: { type: 'scrap', amount: 15 },
    damage: 5,
    shieldDamage: 30,
    prereq: 'flak-cannon',
    unlockCost: { material: 'alloyComposites', amount: 20 },
    tier: 2,
  },
  // Hull plating
  {
    id: 'hull-plating-mk1',
    name: 'Hull Plating Mk1',
    description: 'Reinforced hull. Passive: +25 max hull.',
    slot: 'utility',
    category: CombatActionCategory.REPAIR,
    passive: true,
    apCost: 0,
    cooldown: 0,
    unlockCost: { material: 'alloyComposites', amount: 5 },
    tier: 1,
  },
  {
    id: 'hull-plating-mk2',
    name: 'Hull Plating Mk2',
    description: 'Heavy hull reinforcement. Passive: +50 max hull.',
    slot: 'utility',
    category: CombatActionCategory.REPAIR,
    passive: true,
    apCost: 0,
    cooldown: 0,
    prereq: 'hull-plating-mk1',
    unlockCost: { material: 'alloyComposites', amount: 20 },
    tier: 2,
  },
  // Stance
  {
    id: 'brace-for-impact',
    name: 'Brace for Impact',
    description: 'Stance: reduce all incoming damage by 30% but cannot attack.',
    slot: 'stance',
    category: CombatActionCategory.SHIELD,
    apCost: 2,
    cooldown: 3,
    prereq: 'hull-plating-mk1',
    unlockCost: { material: 'alloyComposites', amount: 15 },
    tier: 2,
  },
];

// ============================================================
// RADIATION BRANCH — DoTs & Control (Exotic Data)
// ============================================================

const RADIATION_ABILITIES: PlayerAbilityDef[] = [
  // Torpedo line
  {
    id: 'low-yield-torpedo',
    name: 'Low Yield Torpedo',
    description: 'Explosive projectile. Balanced hull and shield damage.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 1,
    cooldown: 1,
    cost: { type: 'insight', amount: 10 },
    damage: 20,
    shieldDamage: 15,
    prereq: 'basic-phaser',
    unlockCost: { material: 'exoticData', amount: 5 },
    tier: 1,
  },
  {
    id: 'emp-torpedo',
    name: 'EMP Torpedo',
    description: 'Electromagnetic pulse. Strips shields and stuns briefly.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 2,
    cooldown: 3,
    cost: { type: 'insight', amount: 20 },
    damage: 10,
    shieldDamage: 40,
    statusEffect: { type: 'STUN', duration: 1, magnitude: 1 },
    prereq: 'low-yield-torpedo',
    unlockCost: { material: 'exoticData', amount: 20 },
    tier: 2,
  },
  {
    id: 'tactical-nuke',
    name: 'Tactical Nuke',
    description: 'Devastating warhead. Massive damage to all targets.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 3,
    cooldown: 5,
    cost: { type: 'insight', amount: 40 },
    damage: 80,
    shieldDamage: 60,
    prereq: 'emp-torpedo',
    unlockCost: { material: 'exoticData', amount: 40 },
    tier: 3,
  },
  // Cyber line
  {
    id: 'scramble-sensors-mk1',
    name: 'Scramble Sensors',
    description: 'Confuse enemy targeting. Reduces enemy damage by 20% for several turns.',
    slot: 'utility',
    category: CombatActionCategory.SABOTAGE,
    apCost: 1,
    cooldown: 3,
    cost: { type: 'insight', amount: 8 },
    statusEffect: { type: 'WEAKEN', duration: 3, magnitude: 0.2 },
    prereq: 'scan-mk1',
    unlockCost: { material: 'exoticData', amount: 5 },
    tier: 1,
  },
  {
    id: 'hack',
    name: 'Hack',
    description: 'Disable one enemy ability for several turns.',
    slot: 'utility',
    category: CombatActionCategory.SABOTAGE,
    apCost: 2,
    cooldown: 4,
    cost: { type: 'insight', amount: 15 },
    statusEffect: { type: 'DISABLE', duration: 3, magnitude: 1 },
    prereq: 'scramble-sensors-mk1',
    unlockCost: { material: 'exoticData', amount: 15 },
    tier: 2,
  },
  // Stance
  {
    id: 'evasive-manoeuvres',
    name: 'Evasive Manoeuvres',
    description: 'Stance: 40% chance to dodge incoming attacks.',
    slot: 'stance',
    category: CombatActionCategory.SHIELD,
    apCost: 2,
    cooldown: 3,
    prereq: 'scramble-sensors-mk1',
    unlockCost: { material: 'exoticData', amount: 12 },
    tier: 2,
  },
];

// ============================================================
// DEEP SPACE CAPSTONES (Stellar Fragments, multi-branch prereqs)
// ============================================================

const CAPSTONE_ABILITIES: PlayerAbilityDef[] = [
  {
    id: 'leeching-phaser',
    name: 'Leeching Phaser',
    description: 'Drains enemy shields and converts to your own.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 2,
    cooldown: 2,
    cost: { type: 'energy', amount: 15 },
    damage: 8,
    shieldDamage: 15,
    shieldRepair: 10,
    prereq: 'basic-phaser',
    unlockCost: { material: 'stellarFragments', amount: 20 },
    tier: 3,
  },
  {
    id: 'spark-of-creation',
    name: 'Spark of Creation',
    description: 'Channel the Heart of the First Light. Massive energy burst.',
    slot: 'weapon',
    category: CombatActionCategory.WEAPON,
    apCost: 3,
    cooldown: 4,
    cost: { type: 'energy', amount: 50 },
    damage: 60,
    shieldDamage: 60,
    prereq: 'gauss-cannon',
    unlockCost: { material: 'stellarFragments', amount: 40 },
    tier: 3,
  },
  {
    id: 'battle-stations',
    name: 'Battle Stations',
    description: 'Stance: all weapons deal +50% damage, but lose 5 shield each player turn.',
    slot: 'stance',
    category: CombatActionCategory.WEAPON,
    apCost: 2,
    cooldown: 3,
    prereq: 'brace-for-impact',
    unlockCost: { material: 'stellarFragments', amount: 30 },
    tier: 3,
  },
];

// ============================================================
// EXPORTS
// ============================================================

export const ALL_PLAYER_ABILITIES: Record<string, PlayerAbilityDef> = {};

// Resource type → ammo type mapping
const RESOURCE_TO_AMMO_MAP: Record<string, AmmoTypeId> = {
  energy: 'powerCells',
  scrap: 'munitions',
  insight: 'dataCores',
  crew: 'repairKits',
};

// Ammo cost per use based on ability tier
const AMMO_PER_TIER: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 5 };

for (const list of [STARTER_ABILITIES, NEBULA_ABILITIES, ASTEROID_ABILITIES, RADIATION_ABILITIES, CAPSTONE_ABILITIES]) {
  for (const ability of list) {
    // Auto-derive ammoCost from resource cost + tier if not already set
    if (!ability.ammoCost && !ability.passive && ability.cost) {
      const ammoType = RESOURCE_TO_AMMO_MAP[ability.cost.type];
      if (ammoType) {
        ability.ammoCost = {
          type: ammoType,
          amount: AMMO_PER_TIER[ability.tier] ?? 1,
        };
      }
    }
    ALL_PLAYER_ABILITIES[ability.id] = ability;
  }
}

export const STARTER_LOADOUT = {
  shield: 'basic-shielding',
  weapons: ['basic-phaser'],
  utilities: ['hull-patch', 'scan-mk1'],
  stance: null as string | null,
};

export const STARTER_INVENTORY = ['basic-phaser', 'basic-shielding', 'hull-patch', 'scan-mk1'];
