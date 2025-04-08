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
    enemyProbabilities: [
      { enemyId: 'void-service-bot', weight: 3 },
      { enemyId: 'void-defense-turret', weight: 2 }
    ],
    encounterChance: 0.4 // 40% chance of encounter when jumping
  },
  
  'black-hole': {
    id: 'black-hole',
    name: 'Event Horizon',
    description: 'An immense gravitational anomaly that warps space and time around it. The darkness at its center devours everything, but the accretion disk glows with intense radiation and exotic particles.',
    type: RegionType.BLACK_HOLE,
    enemyProbabilities: [
      { enemyId: 'blackhole-warped-research-vessel', weight: 3 },
      { enemyId: 'blackhole-radiation-phantom', weight: 2 },
      { enemyId: 'blackhole-gravity-probe', weight: 1 }
    ],
    encounterChance: 0.6 // 60% chance of encounter when jumping
  },
  
  'asteroid-field': {
    id: 'asteroid-field',
    name: 'Shattered Belt',
    description: 'A dense field of rocky debris from a destroyed planet. Navigation is challenging, but the asteroids are rich in minerals and abandoned mining equipment.',
    type: RegionType.ASTEROID_FIELD,
    enemyProbabilities: [
      { enemyId: 'asteroid-mining-drone', weight: 3 },
      { enemyId: 'asteroid-scavenger-ship', weight: 2 },
      { enemyId: 'asteroid-security-skiff', weight: 1 }
    ],
    encounterChance: 0.7 // 70% chance of encounter when jumping
  },
  
  'habitable-zone': {
    id: 'habitable-zone',
    name: 'Goldilocks Orbit',
    description: 'A region of space at the perfect distance from a stable star, where conditions might support life. Lush planets and moons orbit in this zone, with potential for colonization and resource harvesting.',
    type: RegionType.HABITABLE_ZONE,
    enemyProbabilities: [
      { enemyId: 'habitable-security-drone', weight: 3 },
      { enemyId: 'habitable-atmospheric-predator', weight: 2 }
    ],
    encounterChance: 0.5 // 50% chance of encounter when jumping
  },
  
  'supernova': {
    id: 'supernova',
    name: 'Stellar Graveyard',
    description: 'The remains of a massive star that went supernova centuries ago. The area is filled with exotic matter and dangerous anomalies, but also valuable resources.',
    type: RegionType.SUPERNOVA,
    enemyProbabilities: [
      { enemyId: 'supernova-radiation-wraith', weight: 3 },
      { enemyId: 'supernova-derelict-guardian', weight: 1 }
    ],
    encounterChance: 0.8 // 80% chance of encounter when jumping
  }
}; 