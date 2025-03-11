import { Enemy, EnemyAction } from '../../types';

/**
 * Enemies for the Asteroid Field region
 *
 * Organized by subregions:
 * 1. Mining Frontier - Former resource extraction zones
 * 2. Resource Processing Hub - Areas for processing extracted materials
 * 3. Core Extraction Zone - Critical mining areas with valuable resources
 */

// =====================
// Mining Frontier Subregion Enemies
// =====================

export const MINING_FRONTIER_ENEMIES: Enemy[] = [
    {
        id: 'asteroid-mining-drone',
        name: 'Mining Drone',
        description: 'A small automated mining unit with basic defensive capabilities. Originally designed for resource extraction, these units have been left on autonomous mode for too long and now treat all ships as intruders.',
        health: 30,
        maxHealth: 30,
        shield: 0,
        maxShield: 0,
        image: '/images/enemies/mining-drone.png',
        attackDelay: 3000,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Mining Frontier',
        introTitle: "Territorial Machine",
        introDescription: "Your ship's scanner highlights a small, boxy object maneuvering purposefully between asteroid fragments. A Mining Drone - one of thousands once deployed to extract resources from this field - approaches with mechanical precision. Its worn exterior bears the faded logo of a long-defunct corporation, and its sensors sweep your vessel with unblinking evaluation. After centuries of autonomous operation without oversight, its territorial protocols have overridden its original programming. The drone's extraction laser pivots to target your ship, now categorizing you as an unwelcome competitor for 'its' resources.",
        actions: [
            {
                name: 'Drilling Laser',
                description: 'Fires a concentrated beam originally meant for cutting through rock.',
                damage: 5,
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Proximity Alert',
                description: 'Emits a high-frequency pulse that damages nearby systems while alerting other drones.',
                damage: 3,
                target: 'health',
                probability: 0.3
            }
        ]
    },
    {
        id: 'asteroid-scavenger-ship',
        name: 'Scavenger Ship',
        description: 'A cobbled-together vessel operated by desperate miners or pirates. These ships survive by salvaging abandoned equipment and attacking vulnerable targets.',
        health: 45,
        maxHealth: 45,
        shield: 5,
        maxShield: 5,
        image: '/images/enemies/scavenger-ship.png',
        attackDelay: 3500,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Mining Frontier',
        actions: [
            {
                name: 'Scrap Volley',
                description: 'Launches a barrage of metallic fragments, causing widespread but moderate damage.',
                damage: 8,
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Tether Hook',
                description: 'Attempts to attach a magnetic grapple to drain resources from your ship.',
                damage: 6,
                target: 'shield',
                probability: 0.4
            }
        ]
    },
    {
        id: 'asteroid-security-skiff',
        name: 'Corporate Security Skiff',
        description: 'A light patrol vessel enforcing mining claims for major corporations. Fast and well-armed, but lightly armored.',
        health: 40,
        maxHealth: 40,
        shield: 10,
        maxShield: 10,
        image: '/images/enemies/security-skiff.png',
        attackDelay: 3000,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Mining Frontier',
        actions: [
            {
                name: 'Warning Shot',
                description: 'A precise burst of laser fire meant to demonstrate superior targeting systems.',
                damage: 10,
                target: 'health',
                probability: 0.5
            },
            {
                name: 'Security Scan',
                description: 'Penetrating scan that identifies weak points in your ship\'s defenses for future attacks.',
                damage: 4,
                target: 'shield',
                probability: 0.5
            }
        ]
    }
];

// =====================
// Dense Cluster Subregion Enemies
// =====================

export const DENSE_CLUSTER_ENEMIES: Enemy[] = [
    // For all enemies in DENSE_CLUSTER_ENEMIES, add:
    // subRegion: 'Dense Cluster',
];

// =====================
// Settlement Ruins Subregion Enemies
// =====================

export const SETTLEMENT_RUINS_ENEMIES: Enemy[] = [
    // For all enemies in SETTLEMENT_RUINS_ENEMIES, add:
    // subRegion: 'Settlement Ruins',
];

/**
 * Enemies for the Resource Processing Hub subregion of the Asteroid Field
 */
export const PROCESSING_HUB_ENEMIES: Enemy[] = [
    {
        id: 'asteroid-mining-barge',
        name: 'Heavy Mining Barge',
        description: 'A massive industrial vessel designed to harvest and process asteroids. Though slow, its industrial equipment has been weaponized to devastating effect.',
        health: 65,
        maxHealth: 65,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/mining-barge.png',
        attackDelay: 4000,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Resource Processing Hub',
        actions: [
            {
                name: 'Breaker Beam',
                description: 'Fires an industrial cutting beam designed to split asteroids in half.',
                damage: 12,
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Particle Collector',
                description: 'Activates a wide-area vacuum system that damages external components.',
                damage: 7,
                target: 'shield',
                probability: 0.3
            }
        ]
    },
    {
        id: 'asteroid-processing-sentinel',
        name: 'Processing Sentinel',
        description: 'An automated security unit designed to protect valuable processing facilities. Armed with repurposed industrial equipment.',
        health: 55,
        maxHealth: 55,
        shield: 20,
        maxShield: 20,
        image: '/images/enemies/processing-sentinel.png',
        attackDelay: 3500,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Resource Processing Hub',
        actions: [
            {
                name: 'Molten Spray',
                description: 'Ejects partially refined minerals at extreme temperatures.',
                damage: 15,
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Security Protocol',
                description: 'Activates defensive measures that reduce incoming damage while preparing a counterattack.',
                damage: 5,
                target: 'shield',
                probability: 0.4
            }
        ]
    },
    {
        id: 'asteroid-automated-harvester',
        name: 'Automated Harvester',
        description: 'A large collection platform that strips resources from asteroids. Its collection systems can easily tear through ship hulls.',
        health: 60,
        maxHealth: 60,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/automated-harvester.png',
        attackDelay: 3800,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Resource Processing Hub',
        actions: [
            {
                name: 'Collection Array',
                description: 'Deploys a wide net of energy beams that pull and tear at your ship\'s exterior.',
                damage: 10,
                target: 'health',
                probability: 0.5
            },
            {
                name: 'Pressure Compactor',
                description: 'Attempts to crush portions of your ship using gravitational compression technology.',
                damage: 18,
                target: 'health',
                probability: 0.5
            }
        ]
    }
];

/**
 * Enemies for the Core Extraction Zone subregion of the Asteroid Field
 */
export const EXTRACTION_ZONE_ENEMIES: Enemy[] = [
    {
        id: 'asteroid-mining-excavator',
        name: 'Mining Excavator',
        description: 'A massive drilling platform capable of boring through the densest asteroids. Its reinforced hull and powerful engines make it a formidable opponent.',
        health: 80,
        maxHealth: 80,
        shield: 20,
        maxShield: 20,
        image: '/images/enemies/mining-excavator.png',
        attackDelay: 4000,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Core Extraction Zone',
        actions: [
            {
                name: 'Core Drill',
                description: 'Activates its primary drilling apparatus, capable of penetrating even reinforced hull plating.',
                damage: 20,
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Seismic Charge',
                description: 'Deploys a device designed to shatter asteroids from within, creating a devastating shockwave.',
                damage: 15,
                target: 'shield',
                probability: 0.4
            }
        ]
    },
    {
        id: 'asteroid-security-battleframe',
        name: 'Security Battleframe',
        description: 'Elite corporate security unit equipped with military-grade weapons and armor. Deployed to protect the corporation\'s most valuable assets.',
        health: 75,
        maxHealth: 75,
        shield: 25,
        maxShield: 25,
        image: '/images/enemies/security-battleframe.png',
        attackDelay: 3500,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Core Extraction Zone',
        actions: [
            {
                name: 'Enforcement Protocol',
                description: 'Unleashes a barrage of targeted weapons fire from multiple hardpoints.',
                damage: 18,
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Boarding Party',
                description: 'Launches a team of security personnel that temporarily disrupt ship systems before being repelled.',
                damage: 12,
                target: 'shield',
                probability: 0.3
            }
        ]
    },
    {
        id: 'asteroid-extractor-boss',
        name: 'The Extractor',
        description: 'A modified mining superstructure with experimental technology designed to extract rare materials. Its systems have been enhanced with artifacts recovered from the asteroid belt.',
        health: 120,
        maxHealth: 120,
        shield: 40,
        maxShield: 40,
        image: '/images/enemies/the-extractor.png',
        attackDelay: 4500,
        lastAttackTime: 0,
        region: 'asteroid',
        subRegion: 'Core Extraction Zone',
        isBoss: true,
        introTitle: "Monolith of Greed",
        introDescription: "The asteroid field parts to reveal a colossal industrial structure that dwarfs the surrounding rocks – The Extractor, the pinnacle of pre-collapse mining technology gone rogue. Its frame is a nightmarish fusion of human engineering and alien artifacts recovered from deep within the belt. Massive processing arms extend for kilometers, and at its center, an experimental gravity manipulation core pulses with unnatural energy. Warning signals flood your communications as the behemoth locks onto your ship. 'UNAUTHORIZED ENTITY IN RESOURCE-RICH ZONE. INITIATING EXTRACTION PROTOCOLS.' The superstructure's vast silhouette blots out the stars as its systems reconfigure to process an unexpected new resource – your vessel.",
        actions: [
            {
                name: 'Gravitational Singularity',
                description: 'Creates a localized gravity well that crushes and distorts your ship\'s structure.',
                damage: 25,
                target: 'health',
                probability: 0.4
            },
            {
                name: 'Refinement Beam',
                description: 'Fires a sustained energy beam that separates and destroys molecular bonds.',
                damage: 20,
                target: 'health',
                probability: 0.3
            },
            {
                name: 'Artifact Resonance',
                description: 'Activates recovered alien technology, creating unpredictable energy fluctuations that damage multiple systems simultaneously.',
                damage: 30,
                target: 'shield',
                probability: 0.3
            }
        ]
    }
];

// Combined enemy array for the asteroid field region
export const ASTEROID_FIELD_ENEMIES: Enemy[] = [
    ...MINING_FRONTIER_ENEMIES,
    ...PROCESSING_HUB_ENEMIES,
    ...EXTRACTION_ZONE_ENEMIES
];