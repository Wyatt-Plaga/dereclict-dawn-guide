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
  },
  
  // New Void Region Attacks
  'tractor-beam': {
    id: 'tractor-beam',
    name: 'Tractor Beam',
    description: 'Graviton projector that slows target\'s movement and response time',
    damage: 5,
    statusEffect: {
      type: 'STUN',
      duration: 1,
      magnitude: 0.3
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.4 }
  },
  'salvage-claw': {
    id: 'salvage-claw',
    name: 'Salvage Claw',
    description: 'Mechanical arm designed to tear off sections of hull plating',
    damage: 18,
    cooldown: 2,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.2 } // Used when shields are nearly depleted
  },
  
  // New Nebula Region Attacks
  'plasma-cloud': {
    id: 'plasma-cloud',
    name: 'Plasma Cloud',
    description: 'Release of ionized gas that corrodes shield systems',
    shieldDamage: 20,
    statusEffect: {
      type: 'WEAKEN',
      duration: 2,
      magnitude: 0.15
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  'stealth-strike': {
    id: 'stealth-strike',
    name: 'Stealth Strike',
    description: 'Sudden attack from hidden position, difficult to anticipate',
    damage: 22,
    cooldown: 3,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.7 } // Used when player is still healthy
  },
  
  // New Asteroid Field Attacks
  'micro-missile-swarm': {
    id: 'micro-missile-swarm',
    name: 'Micro-Missile Swarm',
    description: 'Launch of dozens of tiny guided missiles that overwhelm defenses',
    damage: 5,
    shieldDamage: 15,
    cooldown: 2,
    useCondition: { type: 'RANDOM', probability: 0.6 }
  },
  'mining-laser': {
    id: 'mining-laser',
    name: 'Mining Laser',
    description: 'Industrial cutting beam repurposed for combat',
    damage: 30,
    cooldown: 3,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.3 } // Used when shields are low
  },
  
  // New Radiation Zone Attacks
  'radiation-burst': {
    id: 'radiation-burst',
    name: 'Radiation Burst',
    description: 'Concentrated blast of exotic particles that disrupts organic systems',
    damage: 15,
    statusEffect: {
      type: 'DISABLE',
      duration: 2,
      magnitude: 0.4
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  'bio-corruption': {
    id: 'bio-corruption',
    name: 'Bio-Corruption',
    description: 'Mutagenic field that affects crew performance',
    damage: 10,
    statusEffect: {
      type: 'WEAKEN',
      duration: 3,
      magnitude: 0.25
    },
    cooldown: 4,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.6 }
  },
  
  // New Supernova Attacks
  'gravity-well': {
    id: 'gravity-well',
    name: 'Gravity Well',
    description: 'Creates a localized gravity distortion that stresses hull integrity',
    damage: 25,
    statusEffect: {
      type: 'DISABLE',
      duration: 2,
      magnitude: 0.3
    },
    cooldown: 4,
    useCondition: { type: 'RANDOM', probability: 0.4 }
  },
  'stellar-flare': {
    id: 'stellar-flare',
    name: 'Stellar Flare',
    description: 'Intense burst of stellar energy that overwhelms systems',
    damage: 35,
    shieldDamage: 20,
    cooldown: 5,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.4 }
  },
  'temporal-rift': {
    id: 'temporal-rift',
    name: 'Temporal Rift',
    description: 'Opens a brief tear in spacetime that causes chronometric disruption',
    damage: 15,
    statusEffect: {
      type: 'STUN',
      duration: 2,
      magnitude: 0.7
    },
    cooldown: 6,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.3 }
  }
}; 