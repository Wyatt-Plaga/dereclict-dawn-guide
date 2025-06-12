import { RegionDefinition, RegionType } from '../types/combat';

/**
 * Region Definitions
 * 
 * These are all the regions the player can explore
 */
export const REGION_DEFINITIONS: Record<string, RegionDefinition> = {
  'void': {
    id: 'void',
    name: 'Void of Space',
    description: 'The empty vacuum of space surrounds the Dawn. Long-range sensors detect potential areas of interest, but encounters are rare in this desolate region.',
    type: RegionType.VOID,
    difficulty: 1,
    enemyProbabilities: [
      { enemyId: 'scavenger', weight: 3 },
      { enemyId: 'patrol-drone', weight: 2 }
    ],
    resourceModifiers: {
      'energy': 1.0,
      'insight': 1.0,
      'crew': 1.0,
      'scrap': 1.0
    },
    encounterChance: 0.4 // 40% chance of encounter when jumping
  },
  
  'nebula': {
    id: 'nebula',
    name: 'Azure Nebula',
    description: 'A dense cloud of ionized gases that interferes with sensors and shields. The colorful mists hide many secrets and dangers, but also rich energy sources.',
    type: RegionType.NEBULA,
    difficulty: 2,
    enemyProbabilities: [
      { enemyId: 'nebula-lurker', weight: 3 },
      { enemyId: 'ion-storm', weight: 2 },
      { enemyId: 'scavenger', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.5, // More energy available
      'insight': 1.2,
      'crew': 0.8, // Harder to find survivors
      'scrap': 0.9
    },
    encounterChance: 0.6 // 60% chance of encounter when jumping
  },
  
  'asteroid-field': {
    id: 'asteroid-field',
    name: 'Shattered Belt',
    description: 'A dense field of rocky debris from a destroyed planet. Navigation is challenging, but the asteroids are rich in minerals and abandoned mining equipment.',
    type: RegionType.ASTEROID_FIELD,
    difficulty: 2,
    enemyProbabilities: [
      { enemyId: 'mining-rig', weight: 3 },
      { enemyId: 'asteroid-hive', weight: 2 },
      { enemyId: 'scavenger', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 0.8, // Less energy available
      'insight': 0.9,
      'crew': 0.7, // Fewer survivors
      'scrap': 1.8 // Much more scrap available
    },
    encounterChance: 0.7 // 70% chance of encounter when jumping
  },
  
  'radiation-zone': {
    id: 'radiation-zone',
    name: 'Gamma Sector',
    description: 'An area of space bathed in deadly radiation from an unstable pulsar. Ship systems experience interference, but the exotic particles can be harvested for research.',
    type: RegionType.RADIATION_ZONE,
    difficulty: 3,
    enemyProbabilities: [
      { enemyId: 'mutated-vessel', weight: 3 },
      { enemyId: 'ion-storm', weight: 2 }
    ],
    resourceModifiers: {
      'energy': 1.2,
      'insight': 1.5, // Great for research
      'crew': 0.5, // Very dangerous for crew
      'scrap': 1.0
    },
    encounterChance: 0.5 // 50% chance of encounter when jumping
  },
  
  'supernova': {
    id: 'supernova',
    name: 'Stellar Graveyard',
    description: 'The remains of a massive star that went supernova centuries ago. The area is filled with exotic matter and dangerous anomalies, but also valuable resources.',
    type: RegionType.SUPERNOVA,
    difficulty: 4,
    enemyProbabilities: [
      { enemyId: 'solar-remnant', weight: 3 },
      { enemyId: 'guardian-construct', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.8, // Abundant energy
      'insight': 1.6, // Valuable research
      'crew': 0.3, // Extremely dangerous
      'scrap': 1.4 // Good salvage
    },
    encounterChance: 0.8 // 80% chance of encounter when jumping
  }
}; 
