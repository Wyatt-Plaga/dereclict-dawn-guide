/**
 * Encounter Type Probabilities
 * 
 * Defines the chance of triggering different encounter types (combat, narrative, empty)
 * potentially on a per-region or per-subregion basis.
 */

// Define a type for the probability structure
interface EncounterProbabilities {
    combat: number;    // Probability of combat encounter (0 to 1)
    narrative: number; // Probability of narrative encounter (0 to 1)
    empty: number;     // Probability of empty encounter (0 to 1)
    // Note: These should ideally sum to 1 for a given location
}

// Define probabilities for each region
// We can specify defaults and override for specific subregions if needed
export const ENCOUNTER_TYPE_PROBABILITIES: Record<string, { 
    default: EncounterProbabilities; 
    [subRegionId: string]: EncounterProbabilities; // Optional overrides for subregions
}> = {
    'void': {
        // Roughly equal chances for testing
        default: { combat: 0.33, narrative: 0.34, empty: 0.33 }
    },
    'blackhole': {
        // Roughly equal chances for testing
        default: { combat: 0.33, narrative: 0.34, empty: 0.33 }
    },
    'asteroid': { 
        // Roughly equal chances for testing
        default: { combat: 0.33, narrative: 0.34, empty: 0.33 }
    },
    'habitable': { 
        // Roughly equal chances for testing
        default: { combat: 0.33, narrative: 0.34, empty: 0.33 }
    },
    'supernova': {
        // Roughly equal chances for testing
        default: { combat: 0.33, narrative: 0.34, empty: 0.33 }
    },
    // Add 'anomaly' region probabilities if/when created
    // 'anomaly': {
    //     default: { combat: 0.33, narrative: 0.34, empty: 0.33 }
    // }
}; 

// Removed ENCOUNTER_ENEMY_PROBABILITIES and EnemySpawnInfo interface 
