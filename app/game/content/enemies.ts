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
    actions: ['laser-fire', 'cannon-volley', 'salvage-claw'],
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
    actions: ['laser-fire', 'shield-disruptor', 'tractor-beam'],
    loot: [
      { type: 'energy', amount: 10 },
      { type: 'scrap', amount: 10 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 1
  },
  'derelict-hunter': {
    id: 'derelict-hunter',
    name: 'Derelict Hunter',
    description: 'An automated vessel that searches for abandoned ships. Its owners are long dead.',
    type: EnemyType.VESSEL,
    health: 75,
    maxHealth: 75,
    shield: 35,
    maxShield: 35,
    image: '/enemies/derelict-hunter.png',
    actions: ['cannon-volley', 'tractor-beam', 'salvage-claw'],
    loot: [
      { type: 'scrap', amount: 20 },
      { type: 'energy', amount: 8 },
      { type: 'crew', amount: 1, probability: 0.3 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 2
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
    actions: ['cannon-volley', 'targeting-scrambler', 'shield-disruptor', 'stealth-strike'],
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
    actions: ['system-shock', 'targeting-scrambler', 'plasma-cloud'],
    loot: [
      { type: 'energy', amount: 30 },
      { type: 'insight', amount: 15 }
    ],
    regions: [RegionType.NEBULA, RegionType.RADIATION_ZONE],
    difficultyTier: 2
  },
  'mist-stalker': {
    id: 'mist-stalker',
    name: 'Mist Stalker',
    description: 'A predatory vessel that has evolved specialized sensors to hunt in nebula environments. It can track ships through the densest gases and ambush with sudden precision.',
    type: EnemyType.FIGHTER,
    health: 65,
    maxHealth: 65,
    shield: 50,
    maxShield: 50,
    image: '/enemies/mist-stalker.png',
    actions: ['stealth-strike', 'plasma-cloud', 'cannon-volley'],
    loot: [
      { type: 'energy', amount: 15 },
      { type: 'insight', amount: 20 },
      { type: 'scrap', amount: 10 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 3
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
    actions: ['railgun-blast', 'laser-fire', 'mining-laser', 'cannon-volley'],
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
    actions: ['laser-fire', 'cannon-volley', 'targeting-scrambler', 'micro-missile-swarm'],
    loot: [
      { type: 'scrap', amount: 25 },
      { type: 'energy', amount: 15 },
      { type: 'insight', amount: 10 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },
  'rock-crusher': {
    id: 'rock-crusher',
    name: 'Rock Crusher',
    description: 'A massive industrial vessel designed to break down asteroids. Its hulking frame houses powerful grinding mechanisms that can tear through metal as easily as rock.',
    type: EnemyType.VESSEL,
    health: 140,
    maxHealth: 140,
    shield: 15,
    maxShield: 15,
    image: '/enemies/rock-crusher.png',
    actions: ['mining-laser', 'salvage-claw', 'micro-missile-swarm'],
    loot: [
      { type: 'scrap', amount: 40 },
      { type: 'energy', amount: 10 },
      { type: 'crew', amount: 2, probability: 0.2 }
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
    actions: ['railgun-blast', 'system-shock', 'overcharge-weapon', 'bio-corruption'],
    loot: [
      { type: 'energy', amount: 20 },
      { type: 'scrap', amount: 20 },
      { type: 'insight', amount: 15 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 3
  },
  'radiation-eater': {
    id: 'radiation-eater',
    name: 'Radiation Eater',
    description: 'An evolved entity that absorbs radiation to fuel its systems. It actively seeks out energy sources and can project deadly bursts of radioactive particles.',
    type: EnemyType.ANOMALY,
    health: 90,
    maxHealth: 90,
    shield: 60,
    maxShield: 60,
    image: '/enemies/radiation-eater.png',
    actions: ['radiation-burst', 'system-shock', 'bio-corruption'],
    loot: [
      { type: 'energy', amount: 35 },
      { type: 'insight', amount: 15 },
      { type: 'crew', amount: 1, probability: 0.1 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 4
  },
  'void-abomination': {
    id: 'void-abomination',
    name: 'Void Abomination',
    description: 'A horrific amalgamation of ship and organic matter, twisted by years of deep space radiation. It seems driven by a primal hunger to assimilate more vessels into its mass.',
    type: EnemyType.ALIEN,
    health: 130,
    maxHealth: 130,
    shield: 40,
    maxShield: 40,
    image: '/enemies/void-abomination.png',
    actions: ['bio-corruption', 'radiation-burst', 'salvage-claw', 'system-shock'],
    loot: [
      { type: 'energy', amount: 25 },
      { type: 'insight', amount: 20 },
      { type: 'scrap', amount: 30 },
      { type: 'crew', amount: 2, probability: 0.3 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 4
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
    actions: ['overcharge-weapon', 'system-shock', 'targeting-scrambler', 'stellar-flare'],
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
    actions: ['railgun-blast', 'torpedo-salvo', 'overcharge-weapon', 'shield-disruptor', 'gravity-well'],
    loot: [
      { type: 'scrap', amount: 35 },
      { type: 'insight', amount: 25 },
      { type: 'energy', amount: 20 },
      { type: 'crew', amount: 1 }
    ],
    regions: [RegionType.SUPERNOVA, RegionType.VOID],
    difficultyTier: 5
  },
  'event-horizon': {
    id: 'event-horizon',
    name: 'Event Horizon',
    description: 'A swirling vortex of spacetime distortion that appears to have developed self-awareness. It manipulates gravity and time in ways that defy conventional physics.',
    type: EnemyType.ANOMALY,
    health: 160,
    maxHealth: 160,
    shield: 90,
    maxShield: 90,
    image: '/enemies/event-horizon.png',
    actions: ['gravity-well', 'temporal-rift', 'stellar-flare'],
    loot: [
      { type: 'energy', amount: 50 },
      { type: 'insight', amount: 30 },
      { type: 'scrap', amount: 15 },
      { type: 'crew', amount: 2, probability: 0.4 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 5
  },
  'cosmic-leviathan': {
    id: 'cosmic-leviathan',
    name: 'Cosmic Leviathan',
    description: 'An enormous entity that appears to swim through the fabric of space itself. Ancient beyond comprehension, it regards vessels as minor irritants to be crushed.',
    type: EnemyType.ALIEN,
    health: 200,
    maxHealth: 200,
    shield: 60,
    maxShield: 60,
    image: '/enemies/cosmic-leviathan.png',
    actions: ['gravity-well', 'stellar-flare', 'temporal-rift', 'plasma-cloud'],
    loot: [
      { type: 'energy', amount: 45 },
      { type: 'insight', amount: 35 },
      { type: 'scrap', amount: 30 },
      { type: 'crew', amount: 3, probability: 0.5 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 5
  }
}; 