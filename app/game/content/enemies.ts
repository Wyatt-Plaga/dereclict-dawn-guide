import { EnemyDefinition, EnemyType, RegionType } from '../types/combat';

/**
 * Enemy Definitions
 * 
 * These are all possible enemies the player can encounter
 */
export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  // Void Region Enemies
  'scavenger': {
    id: 'scavenger',
    name: 'Scavenger Vessel',
    description: 'A small, nimble ship crewed by opportunistic scavengers. They\'re lightly armed but determined to salvage anything of value.',
    type: EnemyType.VESSEL,
    health: 60,
    maxHealth: 60,
    shield: 20,
    maxShield: 20,
    image: '/enemies/scavenger.png',
    actions: ['laser-fire', 'cannon-volley'],
    loot: [
      { type: 'scrap', amount: 15 },
      { type: 'insight', amount: 5, probability: 0.5 }
    ],
    regions: [RegionType.VOID, RegionType.ASTEROID_FIELD],
    difficultyTier: 1
  },
  'patrol-drone': {
    id: 'patrol-drone',
    name: 'Patrol Drone',
    description: 'An automated security drone that patrols the edges of known space. It\'s equipped with basic weaponry and follows old security protocols.',
    type: EnemyType.VESSEL,
    health: 45,
    maxHealth: 45,
    shield: 30,
    maxShield: 30,
    image: '/enemies/patrol-drone.png',
    actions: ['laser-fire', 'shield-disruptor'],
    loot: [
      { type: 'energy', amount: 10 },
      { type: 'scrap', amount: 10 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 1
  },
  
  // Nebula Enemies
  'nebula-lurker': {
    id: 'nebula-lurker',
    name: 'Nebula Lurker',
    description: 'A mysterious vessel that uses the dense nebula gases for cover. It relies on ambush tactics and hit-and-run attacks.',
    type: EnemyType.VESSEL,
    health: 70,
    maxHealth: 70,
    shield: 40,
    maxShield: 40,
    image: '/enemies/nebula-lurker.png',
    actions: ['cannon-volley', 'targeting-scrambler', 'shield-disruptor'],
    loot: [
      { type: 'scrap', amount: 20 },
      { type: 'insight', amount: 10 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 2
  },
  'ion-storm': {
    id: 'ion-storm',
    name: 'Ion Storm',
    description: 'A highly charged energetic anomaly that moves with apparent intelligence. It generates powerful electrical discharges that can disrupt ship systems.',
    type: EnemyType.ANOMALY,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 0,
    image: '/enemies/ion-storm.png',
    actions: ['system-shock', 'targeting-scrambler'],
    loot: [
      { type: 'energy', amount: 30 },
      { type: 'insight', amount: 15 }
    ],
    regions: [RegionType.NEBULA, RegionType.RADIATION_ZONE],
    difficultyTier: 2
  },
  
  // Asteroid Field Enemies
  'mining-rig': {
    id: 'mining-rig',
    name: 'Mining Rig',
    description: 'A heavily armed mining vessel. It\'s equipped with powerful industrial equipment repurposed for combat, including drilling lasers and mining charges.',
    type: EnemyType.VESSEL,
    health: 90,
    maxHealth: 90,
    shield: 30,
    maxShield: 30,
    image: '/enemies/mining-rig.png',
    actions: ['railgun-blast', 'laser-fire', 'cannon-volley'],
    loot: [
      { type: 'scrap', amount: 35 },
      { type: 'crew', amount: 1, probability: 0.3 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 2
  },
  'asteroid-hive': {
    id: 'asteroid-hive',
    name: 'Asteroid Hive',
    description: 'A hollowed-out asteroid hosting a colony of hostile drones. They swarm out to attack passing ships, stripping them for resources.',
    type: EnemyType.SWARM,
    health: 120,
    maxHealth: 120,
    shield: 20,
    maxShield: 20,
    image: '/enemies/asteroid-hive.png',
    actions: ['laser-fire', 'cannon-volley', 'targeting-scrambler'],
    loot: [
      { type: 'scrap', amount: 25 },
      { type: 'energy', amount: 15 },
      { type: 'insight', amount: 10 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },
  
  // Radiation Zone Enemies
  'mutated-vessel': {
    id: 'mutated-vessel',
    name: 'Mutated Vessel',
    description: 'A ship warped by prolonged exposure to exotic radiation. Its hull has fused with its crew, creating a bizarre bio-mechanical entity driven by instinct.',
    type: EnemyType.VESSEL,
    health: 110,
    maxHealth: 110,
    shield: 45,
    maxShield: 45,
    image: '/enemies/mutated-vessel.png',
    actions: ['railgun-blast', 'system-shock', 'overcharge-weapon'],
    loot: [
      { type: 'energy', amount: 20 },
      { type: 'scrap', amount: 20 },
      { type: 'insight', amount: 15 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 3
  },
  
  // Supernova Enemies
  'solar-remnant': {
    id: 'solar-remnant',
    name: 'Solar Remnant',
    description: 'A sentient fragment of a star\'s core, expelled during a supernova. It pulses with immense energy and attacks anything that approaches the stellar graveyard.',
    type: EnemyType.ANOMALY,
    health: 150,
    maxHealth: 150,
    shield: 50,
    maxShield: 50,
    image: '/enemies/solar-remnant.png',
    actions: ['overcharge-weapon', 'system-shock', 'targeting-scrambler'],
    loot: [
      { type: 'energy', amount: 40 },
      { type: 'insight', amount: 20 },
      { type: 'crew', amount: 2, probability: 0.2 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 4
  },
  'guardian-construct': {
    id: 'guardian-construct',
    name: 'Guardian Construct',
    description: 'An ancient automated defense system that protects the remains of a long-dead civilization. Its technology is far beyond current understanding.',
    type: EnemyType.STATION,
    health: 180,
    maxHealth: 180,
    shield: 70,
    maxShield: 70,
    image: '/enemies/guardian-construct.png',
    actions: ['railgun-blast', 'torpedo-salvo', 'overcharge-weapon', 'shield-disruptor'],
    loot: [
      { type: 'scrap', amount: 35 },
      { type: 'insight', amount: 25 },
      { type: 'energy', amount: 20 },
      { type: 'crew', amount: 1 }
    ],
    regions: [RegionType.SUPERNOVA, RegionType.VOID],
    difficultyTier: 5
  }
}; 