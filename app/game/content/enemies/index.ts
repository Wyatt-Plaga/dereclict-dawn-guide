import { EnemyDefinition } from '@/app/game/types/combat';

// Import the main exported array from each region file
import { 
    MINING_FRONTIER_ENEMIES, 
    DENSE_CLUSTER_ENEMIES, 
    SETTLEMENT_RUINS_ENEMIES,
    PROCESSING_HUB_ENEMIES,
    EXTRACTION_ZONE_ENEMIES
} from './asteroidFieldEnemies'; // Asteroid field has subregions
import { BLACKHOLE_ENEMIES } from './blackHoleEnemies'; // Assuming single export
import { HABITABLE_ZONE_ENEMIES } from './habitableZoneEnemies'; // Assuming single export
import { SUPERNOVA_ENEMIES } from './supernovaEnemies'; // Assuming single export
import { VOID_ENEMIES } from './voidEnemies'; // Assuming single export
// Note: anomalyEnemies.ts is currently missing

/**
 * Combined list (array) of ALL enemy definitions.
 * Needed for filtering enemies based on spawn locations.
 */
export const ALL_ENEMIES_LIST: EnemyDefinition[] = [
    // Asteroid Field (has subregion arrays)
    ...MINING_FRONTIER_ENEMIES,
    ...DENSE_CLUSTER_ENEMIES,
    ...SETTLEMENT_RUINS_ENEMIES,
    ...PROCESSING_HUB_ENEMIES,
    ...EXTRACTION_ZONE_ENEMIES,
    // Other regions (assuming single array export)
    ...BLACKHOLE_ENEMIES,
    ...HABITABLE_ZONE_ENEMIES,
    ...SUPERNOVA_ENEMIES,
    ...VOID_ENEMIES,
    // Spread ANOMALY_ENEMIES here if added later
];

/**
 * Map of all enemies, keyed by their ID for efficient lookup.
 * Useful for CombatSystem to get definition by ID.
 */
export const ALL_ENEMIES_MAP: Record<string, EnemyDefinition> = 
    ALL_ENEMIES_LIST.reduce((acc, enemy) => {
        if (acc[enemy.id]) {
            // Log a warning if duplicate enemy IDs are found
            console.warn(`Duplicate enemy ID found: ${enemy.id}. Overwriting previous definition.`);
        }
        acc[enemy.id] = enemy;
        return acc;
    }, {} as Record<string, EnemyDefinition>);

// Optional: Log counts for verification
console.log(`Loaded ${ALL_ENEMIES_LIST.length} total enemies into list.`);
console.log(`Mapped ${Object.keys(ALL_ENEMIES_MAP).length} total enemies into map.`);

// Re-export EnemyDefinition using 'export type' for isolatedModules compatibility
export type { EnemyDefinition };

// Commented out re-exports
/*
export {
    // ... specific exports if needed ...
};
*/ 