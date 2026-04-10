import { RegionDefinition, RegionType } from '../types/regions';

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
      { enemyId: 'patrol-drone', weight: 2 },
      { enemyId: 'void-lurker', weight: 1 },
      { enemyId: 'guttersnipe-king', weight: 0.5 }
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
    name: 'Stellar Nursery',
    description: 'The outermost reaches of a vast stellar nursery. Newborn creatures drift through luminous gas clouds, feeding on shield energy. Their bioluminescent glow is beautiful — and a warning.',
    type: RegionType.NEBULA,
    difficulty: 2,
    enemyProbabilities: [
      { enemyId: 'infant-nebula-feeder', weight: 3 },
      { enemyId: 'plasma-wisp', weight: 2 },
      { enemyId: 'nebula-jellyfish', weight: 2 },
      { enemyId: 'mother-nebula-feeder', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.5,
      'insight': 1.2,
      'crew': 0.8,
      'scrap': 0.9
    },
    encounterChance: 0.6
  },
  'nebula-t2': {
    id: 'nebula-t2',
    name: 'Ionized Mists',
    description: 'Deeper into the nebula where the gases glow white-hot with ionization. The creatures here have evolved — faster, smarter, and far more dangerous. Ghost ships drift through the mist, drained of all energy.',
    type: RegionType.NEBULA,
    difficulty: 3,
    enemyProbabilities: [
      { enemyId: 'juvenile-nebula-feeder', weight: 3 },
      { enemyId: 'ion-wraith', weight: 2 },
      { enemyId: 'luminous-parasite-swarm', weight: 2 },
      { enemyId: 'mother-of-the-mists', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.6,
      'insight': 1.3,
      'crew': 0.6,
      'scrap': 0.8
    },
    encounterChance: 0.65
  },
  'nebula-t3': {
    id: 'nebula-t3',
    name: 'Pillars of Creation',
    description: 'The heart of the stellar nursery — towering columns of gas where new stars are born. The oldest and most powerful creatures dwell here, along with proto-stars that burn with the light of creation itself. Something ancient is building a star inside its body.',
    type: RegionType.NEBULA,
    difficulty: 4,
    enemyProbabilities: [
      { enemyId: 'adult-nebula-feeder', weight: 3 },
      { enemyId: 'stellar-embryo', weight: 2 },
      { enemyId: 'prismatic-cnidarian', weight: 2 },
      { enemyId: 'mother-of-stars', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.8,
      'insight': 1.5,
      'crew': 0.4,
      'scrap': 0.7
    },
    encounterChance: 0.7
  },
  
  'asteroid': {
    id: 'asteroid',
    name: 'Outer Drift',
    description: 'The outermost ring of the shattered belt. Derelict mining rigs drift among the rubble, still grinding away at rocks that no longer need processing. Their IFF transponders died long ago — everything is a target.',
    type: RegionType.ASTEROID_FIELD,
    difficulty: 2,
    enemyProbabilities: [
      { enemyId: 'strip-miner', weight: 3 },
      { enemyId: 'slag-hauler', weight: 2 },
      { enemyId: 'rubble-runner', weight: 2 },
      { enemyId: 'pit-foreman', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 0.8,
      'insight': 0.9,
      'crew': 0.7,
      'scrap': 1.8
    },
    encounterChance: 0.7
  },
  'asteroid-t2': {
    id: 'asteroid-t2',
    name: 'Shattered Corridor',
    description: 'Deeper into the belt, the debris field thickens into a labyrinth of shattered rock. Military escorts still patrol dead shipping lanes, and the tunneling machines have grown far beyond their original design specs.',
    type: RegionType.ASTEROID_FIELD,
    difficulty: 3,
    enemyProbabilities: [
      { enemyId: 'bore-worm', weight: 3 },
      { enemyId: 'foundry-sentinel', weight: 2 },
      { enemyId: 'freight-escort', weight: 2 },
      { enemyId: 'convoy-warden', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 0.7,
      'insight': 1.0,
      'crew': 0.5,
      'scrap': 2.0
    },
    encounterChance: 0.75
  },
  'asteroid-t3': {
    id: 'asteroid-t3',
    name: 'The Core',
    description: 'The exposed heart of a dead planet. Magma still glows in the cracks between continent-sized fragments. Something immense moves in the deepest fissures — something that was here long before the miners arrived.',
    type: RegionType.ASTEROID_FIELD,
    difficulty: 4,
    enemyProbabilities: [
      { enemyId: 'mantle-crawler', weight: 3 },
      { enemyId: 'core-bastion', weight: 2 },
      { enemyId: 'iron-revenant', weight: 2 },
      { enemyId: 'lithivore', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 0.6,
      'insight': 1.2,
      'crew': 0.3,
      'scrap': 2.5
    },
    encounterChance: 0.8
  },
  
  'deepspace': {
    id: 'deepspace',
    name: 'Exclusion Zone',
    description: 'The outermost perimeter of a radiation catastrophe. Containment wardens still patrol. Creatures that metabolize radioactive material lurk in the ruins. Your Geiger counter has started clicking.',
    type: RegionType.RADIATION_ZONE,
    difficulty: 2,
    enemyProbabilities: [
      { enemyId: 'flicker-drone', weight: 3 },
      { enemyId: 'isotope-crawler', weight: 2 },
      { enemyId: 'signal-moth', weight: 2 },
      { enemyId: 'warden-null-seven', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.0,
      'insight': 1.5,
      'crew': 0.6,
      'scrap': 1.0
    },
    encounterChance: 0.6
  },
  'deepspace-t2': {
    id: 'deepspace-t2',
    name: 'Dead Signal',
    description: 'Past the containment perimeter, where no warden patrols. The radiation here has a pattern — a signal. Ghost ships broadcast phantom frequencies. Something is trying to communicate through the static.',
    type: RegionType.RADIATION_ZONE,
    difficulty: 3,
    enemyProbabilities: [
      { enemyId: 'cascade-drone', weight: 3 },
      { enemyId: 'phantom-repeater', weight: 2 },
      { enemyId: 'rad-hulk', weight: 2 },
      { enemyId: 'dr-echo', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.1,
      'insight': 1.6,
      'crew': 0.4,
      'scrap': 1.1
    },
    encounterChance: 0.65
  },
  'deepspace-t3': {
    id: 'deepspace-t3',
    name: 'Ground Zero',
    description: 'The epicenter. The source. Radiation here is not decay — it is alive, coherent, speaking. Angels of light drift through the ruins. The Quiet Frequency hums in everything. Even your thoughts are starting to click.',
    type: RegionType.RADIATION_ZONE,
    difficulty: 4,
    enemyProbabilities: [
      { enemyId: 'decay-angel', weight: 3 },
      { enemyId: 'null-worm', weight: 2 },
      { enemyId: 'geiger-wraith', weight: 2 },
      { enemyId: 'the-quiet-frequency', weight: 1 }
    ],
    resourceModifiers: {
      'energy': 1.2,
      'insight': 1.8,
      'crew': 0.3,
      'scrap': 1.2
    },
    encounterChance: 0.7
  },
  
  'blackhole': {
    id: 'blackhole',
    name: 'The Threshold',
    description: 'The edge of everything. Reality frays here — gravity bends light into impossible patterns, echoes of dead ships repeat on loop, and entities of pure concept drift through the void. Something waits at the center. Something that has been watching since before the universe began.',
    type: RegionType.SUPERNOVA,
    difficulty: 5,
    enemyProbabilities: [
      { enemyId: 'null-drifter', weight: 3 },
      { enemyId: 'echo-remnant', weight: 2 },
      { enemyId: 'gravity-phantom', weight: 2 },
      { enemyId: 'convergence-choir', weight: 2 },
      { enemyId: 'watchers-lens', weight: 1 },
      { enemyId: 'the-architect', weight: 0.3 }
    ],
    resourceModifiers: {
      'energy': 1.5,
      'insight': 2.0,
      'crew': 0.2,
      'scrap': 1.2
    },
    encounterChance: 0.85
  }
}; 
