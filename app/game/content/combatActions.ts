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
  
  // Black Hole Region Actions
  'spacetime-distortion': {
    id: 'spacetime-distortion',
    name: 'Spacetime Distortion',
    description: 'Weaponizes gravitational distortions to warp and damage the target',
    damage: 15,
    statusEffect: {
      type: 'DISABLE',
      duration: 2,
      magnitude: 0.3
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  'gravity-lance': {
    id: 'gravity-lance',
    name: 'Gravity Lance',
    description: 'Concentrated gravitational beam that crushes ship sections',
    damage: 25,
    cooldown: 2,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.3 }
  },
  'temporal-shift': {
    id: 'temporal-shift',
    name: 'Temporal Shift',
    description: 'Attack from multiple timelines simultaneously, bypassing normal defenses',
    damage: 20,
    statusEffect: {
      type: 'STUN',
      duration: 1,
      magnitude: 0.7
    },
    cooldown: 4,
    useCondition: { type: 'RANDOM', probability: 0.4 }
  },
  'entropy-burst': {
    id: 'entropy-burst',
    name: 'Entropy Burst',
    description: 'Accelerates decay in ship systems, causing cascading failures',
    damage: 12,
    statusEffect: {
      type: 'WEAKEN',
      duration: 3,
      magnitude: 0.3
    },
    cooldown: 3,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.6 }
  },
  
  // Asteroid Field Region Actions
  'drill-strike': {
    id: 'drill-strike',
    name: 'Drill Strike',
    description: 'Deploys a massive drill bit that can puncture even the strongest hull',
    damage: 30,
    cooldown: 3,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.2 }
  },
  'mining-charge': {
    id: 'mining-charge',
    name: 'Mining Charge',
    description: 'Industrial explosive normally used for breaking asteroids',
    damage: 25,
    statusEffect: {
      type: 'DISABLE',
      duration: 1,
      magnitude: 0.4
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  'drone-swarm': {
    id: 'drone-swarm',
    name: 'Drone Swarm',
    description: 'Releases a cloud of small mining drones that attach to and damage the hull',
    damage: 15,
    statusEffect: {
      type: 'WEAKEN',
      duration: 2,
      magnitude: 0.3
    },
    cooldown: 2,
    useCondition: { type: 'RANDOM', probability: 0.7 }
  },
  'mineral-barrage': {
    id: 'mineral-barrage',
    name: 'Mineral Barrage',
    description: 'Launches a stream of superheated asteroid fragments',
    damage: 20,
    shieldDamage: 10,
    cooldown: 2,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  
  // Habitable Zone Region Actions
  'ion-cannon': {
    id: 'ion-cannon',
    name: 'Ion Cannon',
    description: 'Precision weapon designed to disable ship systems without causing catastrophic damage',
    damage: 15,
    statusEffect: {
      type: 'DISABLE',
      duration: 2,
      magnitude: 0.6
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.6 }
  },
  'defense-matrix': {
    id: 'defense-matrix',
    name: 'Defense Matrix',
    description: 'Creates a reflective energy field that turns attacks back on the attacker',
    damage: 10,
    statusEffect: {
      type: 'EXPOSE',
      duration: 2,
      magnitude: 0.4
    },
    cooldown: 4,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.5 }
  },
  'targeting-lock': {
    id: 'targeting-lock',
    name: 'Targeting Lock',
    description: 'Advanced tracking system ensures all subsequent attacks hit vulnerable areas',
    damage: 5,
    statusEffect: {
      type: 'EXPOSE',
      duration: 3,
      magnitude: 0.5
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.4 }
  },
  'spore-cloud': {
    id: 'spore-cloud',
    name: 'Spore Cloud',
    description: 'Releases a dense cloud of biological spores that interfere with ship systems',
    damage: 8,
    statusEffect: {
      type: 'WEAKEN',
      duration: 3,
      magnitude: 0.3
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.6 }
  },
  'regenerative-pulse': {
    id: 'regenerative-pulse',
    name: 'Regenerative Pulse',
    description: 'Organic healing wave that repairs the bio-construct\'s damaged tissues',
    damage: 0,
    cooldown: 4,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.5 }
  },
  'bio-lance': {
    id: 'bio-lance',
    name: 'Bio-Lance',
    description: 'Concentrated stream of corrosive biological material that eats through hull plating',
    damage: 25,
    cooldown: 2,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.3 }
  },
  
  // Supernova Region Actions
  'stellar-flare': {
    id: 'stellar-flare',
    name: 'Stellar Flare',
    description: 'Unleashes a massive burst of solar energy, overwhelming sensors and shields',
    damage: 35,
    shieldDamage: 20,
    cooldown: 4,
    useCondition: { type: 'RANDOM', probability: 0.4 }
  },
  'plasma-ejection': {
    id: 'plasma-ejection',
    name: 'Plasma Ejection',
    description: 'Hurls superheated stellar plasma that clings to the hull and continues burning',
    damage: 15,
    statusEffect: {
      type: 'WEAKEN',
      duration: 3,
      magnitude: 0.4
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  'radiation-pulse': {
    id: 'radiation-pulse',
    name: 'Radiation Pulse',
    description: 'Emits deadly radiation that penetrates shields and damages internal systems',
    damage: 20,
    statusEffect: {
      type: 'DISABLE',
      duration: 2,
      magnitude: 0.3
    },
    cooldown: 3,
    useCondition: { type: 'SHIELD_THRESHOLD', threshold: 0.7 }
  },
  'ancient-weapon': {
    id: 'ancient-weapon',
    name: 'Ancient Weapon',
    description: 'Fires a beam of unknown energy that seems to distort the very fabric of reality',
    damage: 40,
    cooldown: 4,
    useCondition: { type: 'RANDOM', probability: 0.3 }
  },
  'quantum-shield': {
    id: 'quantum-shield',
    name: 'Quantum Shield',
    description: 'Deploys an impenetrable barrier that exists in multiple quantum states simultaneously',
    damage: 0,
    cooldown: 5,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.4 }
  },
  'multi-target-array': {
    id: 'multi-target-array',
    name: 'Multi-Target Array',
    description: 'Launches a barrage of smaller projectiles that strike multiple ship systems simultaneously',
    damage: 25,
    statusEffect: {
      type: 'DISABLE',
      duration: 1,
      magnitude: 0.3
    },
    cooldown: 3,
    useCondition: { type: 'RANDOM', probability: 0.5 }
  },
  'stasis-field': {
    id: 'stasis-field',
    name: 'Stasis Field',
    description: 'Temporarily freezes the target in a bubble of slowed time',
    damage: 10,
    statusEffect: {
      type: 'STUN',
      duration: 2,
      magnitude: 0.8
    },
    cooldown: 5,
    useCondition: { type: 'HEALTH_THRESHOLD', threshold: 0.3 }
  }
}; 