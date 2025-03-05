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
    description: 'A small, nimble ship crewed by opportunistic scavengers. They\'re lightly armed but determined to salvage anything of value from the endless void.',
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
    regions: [RegionType.VOID, RegionType.ASTEROID_FIELD, RegionType.BLACK_HOLE],
    difficultyTier: 1
  },
  'patrol-drone': {
    id: 'patrol-drone',
    name: 'Patrol Drone',
    description: 'An automated security drone that silently drifts through the void. Its sensors constantly scan for unauthorized vessels, following protocols established centuries ago.',
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
  
  // Black Hole Enemies
  'gravity-warper': {
    id: 'gravity-warper',
    name: 'Gravity Warper',
    description: 'A vessel of unknown origin that manipulates the warped spacetime near the black hole. It seems to phase in and out of reality, using the gravitational distortions to its advantage.',
    type: EnemyType.VESSEL,
    health: 70,
    maxHealth: 70,
    shield: 40,
    maxShield: 40,
    image: '/enemies/gravity-warper.png',
    actions: ['spacetime-distortion', 'gravity-lance', 'shield-disruptor'],
    loot: [
      { type: 'scrap', amount: 20 },
      { type: 'insight', amount: 10 }
    ],
    regions: [RegionType.BLACK_HOLE],
    difficultyTier: 2
  },
  'time-fragment': {
    id: 'time-fragment',
    name: 'Time Fragment',
    description: 'A bizarre temporal anomaly near the black hole. It exists in multiple moments simultaneously, appearing to predict attacks before they occur and strike from impossible angles.',
    type: EnemyType.ANOMALY,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 0,
    image: '/enemies/time-fragment.png',
    actions: ['temporal-shift', 'entropy-burst'],
    loot: [
      { type: 'energy', amount: 30 },
      { type: 'insight', amount: 15 }
    ],
    regions: [RegionType.BLACK_HOLE],
    difficultyTier: 2
  },
  
  // Asteroid Field Enemies
  'mining-rig': {
    id: 'mining-rig',
    name: 'Mining Rig',
    description: 'A heavily armored mining vessel that roams the asteroid belt. Its industrial-grade drilling equipment has been repurposed into devastating weapons that can shatter hulls like brittle rock.',
    type: EnemyType.VESSEL,
    health: 90,
    maxHealth: 90,
    shield: 30,
    maxShield: 30,
    image: '/enemies/mining-rig.png',
    actions: ['drill-strike', 'laser-fire', 'mining-charge'],
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
    description: 'A hollowed-out asteroid hosting a colony of autonomous mining drones. The swarm erupts from crevices to strip passing ships for parts and resources to expand their collective.',
    type: EnemyType.SWARM,
    health: 120,
    maxHealth: 120,
    shield: 20,
    maxShield: 20,
    image: '/enemies/asteroid-hive.png',
    actions: ['drone-swarm', 'mineral-barrage', 'targeting-scrambler'],
    loot: [
      { type: 'scrap', amount: 25 },
      { type: 'energy', amount: 15 },
      { type: 'insight', amount: 10 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },
  
  // Habitable Zone Enemies
  'planetary-defense': {
    id: 'planetary-defense',
    name: 'Planetary Defense System',
    description: 'An automated defense satellite designed to protect habitable worlds from unauthorized visitors. Its weapons systems are calibrated for precision rather than destruction.',
    type: EnemyType.STATION,
    health: 110,
    maxHealth: 110,
    shield: 45,
    maxShield: 45,
    image: '/enemies/planetary-defense.png',
    actions: ['ion-cannon', 'defense-matrix', 'targeting-lock'],
    loot: [
      { type: 'energy', amount: 20 },
      { type: 'scrap', amount: 20 },
      { type: 'insight', amount: 15 }
    ],
    regions: [RegionType.HABITABLE_ZONE],
    difficultyTier: 3
  },
  'bio-construct': {
    id: 'bio-construct',
    name: 'Bio-Construct',
    description: 'A living vessel grown rather than built, originating from one of the habitable worlds. Its organic hull regenerates damage and responds intelligently to threats with biological weapons.',
    type: EnemyType.VESSEL,
    health: 130,
    maxHealth: 130,
    shield: 40,
    maxShield: 40,
    image: '/enemies/bio-construct.png',
    actions: ['spore-cloud', 'regenerative-pulse', 'bio-lance'],
    loot: [
      { type: 'energy', amount: 15 },
      { type: 'crew', amount: 2 },
      { type: 'insight', amount: 20 }
    ],
    regions: [RegionType.HABITABLE_ZONE],
    difficultyTier: 3
  },
  
  // Supernova Enemies
  'solar-remnant': {
    id: 'solar-remnant',
    name: 'Solar Remnant',
    description: 'A sentient fragment of a star\'s core, expelled during a supernova. It pulses with blinding energy and attacks anything that approaches the stellar graveyard with unpredictable solar flares.',
    type: EnemyType.ANOMALY,
    health: 150,
    maxHealth: 150,
    shield: 50,
    maxShield: 50,
    image: '/enemies/solar-remnant.png',
    actions: ['stellar-flare', 'plasma-ejection', 'radiation-pulse'],
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
    description: 'An ancient automated defense system that protects the remains of a star system destroyed in the supernova. Its technology is built to withstand stellar cataclysms and protect something of immense value.',
    type: EnemyType.STATION,
    health: 180,
    maxHealth: 180,
    shield: 70,
    maxShield: 70,
    image: '/enemies/guardian-construct.png',
    actions: ['ancient-weapon', 'quantum-shield', 'multi-target-array', 'stasis-field'],
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