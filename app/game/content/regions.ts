import { RegionDefinition, RegionType } from '../types/combat';

/**
 * Region Definitions
 * 
 * Defines regions, subregions, and boss encounters.
 */
export const REGION_DEFINITIONS: Record<string, RegionDefinition> = {
  'void': {
    id: 'void',
    name: 'Void of Space',
    description: 'The empty vacuum of space surrounds the Dawn. Long-range sensors detect potential areas of interest, but encounters are rare in this desolate region.',
    type: RegionType.VOID,
    // No defined subregions for Void in this design
    bossEnemyId: 'void-forgotten-monitor-boss',
    bossDefeatThreshold: 5, // Example threshold
  },
  
  'black-hole': {
    id: 'black-hole',
    name: 'Event Horizon',
    description: 'An immense gravitational anomaly that warps space and time around it. The darkness at its center devours everything, but the accretion disk glows with intense radiation and exotic particles.',
    type: RegionType.BLACK_HOLE,
    subRegions: [
        { id: 'Accretion Disk', name: 'Accretion Disk', description: 'Warped research vessels and radiation entities patrol the swirling matter.' },
        { id: 'Ergosphere', name: 'Ergosphere', description: 'Space-time distorted constructs drift in the frame-dragging zone.' },
        { id: 'Event Horizon', name: 'Event Horizon', description: 'Reality-bending entities guard the point of no return.' }
    ],
    bossEnemyId: 'blackhole-singularity-echo-boss',
    bossDefeatThreshold: 8, // Example threshold
  },
  
  'asteroid-field': {
    id: 'asteroid-field',
    name: 'Shattered Belt',
    description: 'A dense field of rocky debris from a destroyed planet. Navigation is challenging, but the asteroids are rich in minerals and abandoned mining equipment.',
    type: RegionType.ASTEROID_FIELD,
    subRegions: [
        { id: 'Mining Frontier', name: 'Mining Frontier', description: 'Former resource extraction zones, patrolled by drones and scavengers.' },
        { id: 'Dense Cluster', name: 'Dense Cluster', description: 'Tightly packed asteroids requiring careful navigation.' }, // Added based on enemy file comment
        { id: 'Settlement Ruins', name: 'Settlement Ruins', description: 'Remains of failed asteroid settlements.' }, // Added based on enemy file comment
        { id: 'Resource Processing Hub', name: 'Resource Processing Hub', description: 'Areas for processing extracted materials, guarded by industrial units.' },
        { id: 'Core Extraction Zone', name: 'Core Extraction Zone', description: 'Critical mining areas with valuable resources and heavy security.' }
    ],
    bossEnemyId: 'asteroid-extractor-boss',
    bossDefeatThreshold: 12, // Example threshold
  },
  
  'habitable-zone': {
    id: 'habitable-zone',
    name: 'Goldilocks Orbit',
    description: 'A region of space at the perfect distance from a stable star, where conditions might support life. Lush planets and moons orbit in this zone, with potential for colonization and resource harvesting.',
    type: RegionType.HABITABLE_ZONE,
    subRegions: [
        { id: 'Orbital Graveyard', name: 'Orbital Graveyard', description: 'Massive derelict space stations in decaying orbits.' },
        { id: 'Fallen Worlds', name: 'Fallen Worlds', description: 'Once-terraformed planets sliding back into uninhabitability.' },
        { id: 'The Last Metropolis', name: 'The Last Metropolis', description: 'Final large human settlement, now a crumbling dystopia.' }
    ],
    bossEnemyId: 'habitable-enforcer-mech-boss',
    bossDefeatThreshold: 10, // Example threshold
  },
  
  'supernova': {
    id: 'supernova',
    name: 'Stellar Graveyard',
    description: 'The remains of a massive star that went supernova centuries ago. The area is filled with exotic matter and dangerous anomalies, but also valuable resources.',
    type: RegionType.SUPERNOVA,
    subRegions: [
        { id: 'Outer Shell', name: 'Outer Shell', description: 'The expanded outer layers of the exploded star, filled with energetic wraiths.' },
        { id: 'Midfield Ruins', name: 'Midfield Ruins', description: 'Shattered planets and fragmented civilization remains, haunted by constructs.' },
        { id: 'Core Remnant', name: 'Core Remnant', description: 'The ultra-dense central region with the neutron star and powerful anomalies.' }
    ],
    bossEnemyId: 'supernova-stellar-phoenix-boss',
    bossDefeatThreshold: 15, // Example threshold
  }
}; 
