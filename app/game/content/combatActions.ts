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

/**
 * Enemy Combat Actions
 * 
 * These are actions enemies can use during combat
 */
export const ENEMY_ACTIONS: Record<string, EnemyActionDefinition> = {
  // Basic Attacks
  'laser-fire': {
    id: 'laser-fire',
    name: 'Laser Fire',
    description: 'Basic energy weapon attack',
    damage: 10,
    cooldown: 0,
    useCondition: { type: 'ALWAYS' }
  },
  'cannon-volley': {
    id: 'cannon-volley',
    name: 'Cannon Volley',
    description: 'Multiple projectile attack',
    damage: 15,
    cooldown: 1,
    useCondition: { type: 'RANDOM', probability: 0.6 }
  },
  
  // Shield Attacks
  'shield-disruptor': {
    id: 'shield-disruptor',
    name: 'Shield Disruptor',
    description: 'Weapon specifically designed to damage shields',
    shieldDamage: 25,
    cooldown: 2,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.8 }
  },
  
  // Heavy Attacks
  'railgun-blast': {
    id: 'railgun-blast',
    name: 'Railgun Blast',
    description: 'Heavy kinetic weapon that can pierce shields',
    damage: 25,
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.4 }
  },
  'torpedo-salvo': {
    id: 'torpedo-salvo',
    name: 'Torpedo Salvo',
    description: 'Explosive ordnance that deals high damage',
    damage: 30,
    cooldown: 3,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.5 }
  },
  
  // Desperate Attacks
  'overcharge-weapon': {
    id: 'overcharge-weapon',
    name: 'Overcharge Weapon',
    description: 'Dangerously overload weapons for maximum damage',
    damage: 40,
    cooldown: 4,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.3 }
  },
  
  // Status Effect Attacks
  'targeting-scrambler': {
    id: 'targeting-scrambler',
    name: 'Targeting Scrambler',
    description: 'Electronic warfare that reduces weapon effectiveness',
    damage: 5,
    statusEffect: {
      type: 'WEAKEN',
      duration: 2,
      magnitude: 0.2
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.3 }
  },
  'system-shock': {
    id: 'system-shock',
    name: 'System Shock',
    description: 'Electrical attack that temporarily disables systems',
    damage: 8,
    statusEffect: {
      type: 'STUN',
      duration: 1,
      magnitude: 0.5
    },
    cooldown: 4,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.4 }
  }
}; 