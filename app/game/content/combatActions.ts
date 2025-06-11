import { CombatActionCategory, CombatActionDefinition, EnemyActionDefinition } from '../types/combat';

/**
 * Player Combat Actions
 * 
 * These are actions the player can use during combat
 */
export const PLAYER_ACTIONS: Record<string, CombatActionDefinition> = {
  // Shield Actions
  'raise-shields': {
    id: 'raise-shields',
    name: 'Raise Shields',
    description: 'Bolster your defenses against incoming attacks',
    category: CombatActionCategory.SHIELD,
    cost: { type: 'energy', amount: 10 },
    shieldRepair: 15,
    cooldown: 1
  },

  // Weapon Actions
  'plasma-cannon': {
    id: 'plasma-cannon',
    name: 'Plasma Cannon',
    description: 'Direct energy attack on enemy systems',
    category: CombatActionCategory.WEAPON,
    cost: { type: 'scrap', amount: 15 },
    damage: 20,
    cooldown: 1
  },
  'missile-barrage': {
    id: 'missile-barrage',
    name: 'Missile Barrage',
    description: 'Launch explosive projectiles at enemy hull',
    category: CombatActionCategory.WEAPON,
    cost: { type: 'scrap', amount: 25 },
    damage: 35,
    cooldown: 2
  },

  // Repair Actions  
  'hull-repair': {
    id: 'hull-repair',
    name: 'Hull Repair',
    description: 'Patch damaged sections of the ship\'s hull',
    category: CombatActionCategory.REPAIR,
    cost: { type: 'crew', amount: 2 },
    hullRepair: 15,
    cooldown: 2
  },
  'shield-recharge': {
    id: 'shield-recharge',
    name: 'Shield Recharge',
    description: 'Divert power to the ship\'s shield generators',
    category: CombatActionCategory.REPAIR,
    cost: { type: 'crew', amount: 3 },
    shieldRepair: 20,
    cooldown: 2
  },
  'system-bypass': {
    id: 'system-bypass',
    name: 'System Bypass',
    description: 'Reroute damaged systems through backup circuits',
    category: CombatActionCategory.REPAIR,
    cost: { type: 'crew', amount: 4 },
    hullRepair: 10,
    shieldRepair: 10,
    cooldown: 3
  },

  // Sabotage Actions
  'sabotage': {
    id: 'sabotage',
    name: 'Sabotage',
    description: 'Disrupt enemy systems with targeted data packets',
    category: CombatActionCategory.SABOTAGE,
    cost: { type: 'insight', amount: 8 },
    damage: 10,
    statusEffect: {
      type: 'WEAKEN',
      duration: 2,
      magnitude: 0.2 // 20% more damage taken
    },
    cooldown: 3
  },
  'scan': {
    id: 'scan',
    name: 'Scan',
    description: 'Analyze enemy capabilities and structural weaknesses',
    category: CombatActionCategory.SABOTAGE,
    cost: { type: 'insight', amount: 5 },
    statusEffect: {
      type: 'EXPOSE',
      duration: 2,
      magnitude: 0.15 // 15% chance to bypass shields
    },
    cooldown: 1
  },
  'find-weakness': {
    id: 'find-weakness',
    name: 'Find Weakness',
    description: 'Identify critical flaws in enemy defensive systems',
    category: CombatActionCategory.SABOTAGE,
    cost: { type: 'insight', amount: 12 },
    statusEffect: {
      type: 'STUN',
      duration: 1,
      magnitude: 1 // Skip one enemy turn
    },
    cooldown: 4
  },
  'sensor-overload': {
    id: 'sensor-overload',
    name: 'Sensor Overload',
    description: 'Flood enemy sensors with false readings',
    category: CombatActionCategory.SABOTAGE,
    cost: { type: 'insight', amount: 10 },
    statusEffect: {
      type: 'DISABLE',
      duration: 2,
      magnitude: 0.5 // 50% reduced effectiveness of attacks
    },
    cooldown: 3
  }
};

// REMOVE ENEMY_ACTIONS map
/*
export const ENEMY_ACTIONS: Record<string, EnemyActionDefinition> = {
  // ... all enemy action definitions ...
};
*/ 
