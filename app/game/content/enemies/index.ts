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
 * Combined array of all enemy definitions from all regions.
 */
export const ALL_ENEMIES: EnemyDefinition[] = [
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
 */
export const ALL_ENEMIES_MAP: Record<string, EnemyDefinition> = 
    ALL_ENEMIES.reduce((acc, enemy) => {
        if (acc[enemy.id]) {
            // Log a warning if duplicate enemy IDs are found
            console.warn(`Duplicate enemy ID found: ${enemy.id}. Overwriting previous definition.`);
        }
        acc[enemy.id] = enemy;
        return acc;
    }, {} as Record<string, EnemyDefinition>);

// Commented out re-exports
/*
export {
    // ... specific exports if needed ...
};
*/ 