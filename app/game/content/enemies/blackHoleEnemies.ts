import { Enemy } from '../../types';

/**
 * Enemies for the Black Hole region
 * 
 * Organized by subregions:
 * 1. Accretion Disk - Warped research vessels and radiation entities
 * 2. Ergosphere - Space-time distorted constructs
 * 3. Event Horizon - Reality-bending entities and the boss
 */

// =====================
// Accretion Disk Subregion Enemies
// =====================

export const WARPED_RESEARCH_VESSEL: Enemy = {
    id: 'blackhole-warped-research-vessel',
    name: 'Warped Research Vessel',
    description: 'Once a scientific vessel, now twisted by extreme gravitational forces. Its hull has stretched in impossible ways, and its systems operate on altered physical principles.',
    maxHealth: 75,
    health: 75,
    shield: 40,
    maxShield: 40,
    image: '/images/enemies/warped_research_vessel.png',
    attackDelay: 3000,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Accretion Disk',
    introTitle: "Gravity's Victim",
    introDescription: "Your sensors struggle to render a coherent image of the object approaching from the swirling matter of the accretion disk. What was once a proud research vessel has been transformed by the black hole's immense gravity into something that defies conventional physics. The Warped Research Vessel's hull stretches and contracts in impossible ways, caught in a perpetual state between existence and annihilation. Its crew, if any remain, must exist in a state beyond human comprehension. The vessel's communications broadcast only distorted fragments: '...time dilation... experiment success... we can see... everything... simultaneously.' The ship's weapon systems, now operating according to altered physical laws, orient toward you with unnatural precision.",
    actions: [
        {
            name: 'Gravity Pulse',
            damage: 15,
            description: 'Fires a concentrated burst of distorted space-time that damages ship systems.',
            target: 'health',
            probability: 0.5
        },
        {
            name: 'Tractor Beam',
            damage: 10,
            description: 'Locks onto your ship with a warped gravitational field, draining shield energy.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Distorted Scan',
            damage: 5,
            description: 'Attempts to analyze your ship, causing minor system fluctuations across all departments.',
            target: 'health',
            probability: 0.2
        }
    ]
};

export const RADIATION_PHANTOM: Enemy = {
    id: 'blackhole-radiation-phantom',
    name: 'Radiation Phantom',
    description: 'A mysterious entity composed of ionized particles and exotic radiation. It flickers in and out of conventional detection, appearing as a vaguely humanoid shape.',
    maxHealth: 60,
    health: 60,
    shield: 25,
    maxShield: 25,
    image: '/images/enemies/radiation_phantom.png',
    attackDelay: 2500,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Accretion Disk',
    actions: [
        {
            name: 'Radiation Surge',
            damage: 20,
            description: 'Releases a burst of exotic radiation that penetrates ship hulls, affecting crew directly.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Phase Shift',
            damage: 0,
            description: 'Temporarily shifts out of conventional space-time, becoming untargetable for a short duration.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Particle Storm',
            damage: 12,
            description: 'Creates a localized storm of high-energy particles that damage multiple ship systems.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const GRAVITY_PROBE: Enemy = {
    id: 'blackhole-gravity-probe',
    name: 'Gravity Probe',
    description: 'An automated research device designed to measure gravitational anomalies. Its programming has been corrupted by proximity to the black hole, now perceiving all other objects as threats.',
    maxHealth: 50,
    health: 50,
    shield: 60,
    maxShield: 60,
    image: '/images/enemies/gravity_probe.png',
    attackDelay: 2000,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Accretion Disk',
    actions: [
        {
            name: 'Focused Graviton Beam',
            damage: 25,
            description: 'Emits a concentrated beam of gravitons that creates localized gravitational shearing.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Field Analysis',
            damage: 15,
            description: 'Analyzes your ship\'s gravitational field, causing fluctuations in power distribution.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Defensive Calibration',
            damage: 0,
            description: 'Recalibrates its defensive systems, regenerating a portion of its shields.',
            target: 'shield',
            probability: 0.4
        }
    ]
};

// =====================
// Ergosphere Subregion Enemies
// =====================

export const TWISTED_FRAME_STRUCTURE: Enemy = {
    id: 'blackhole-twisted-frame',
    name: 'Twisted Frame Structure',
    description: 'The remnants of a space station caught in the ergosphere\'s frame dragging effect. Its structure is perpetually rotating and folding through higher dimensions.',
    maxHealth: 100,
    health: 100,
    shield: 70,
    maxShield: 70,
    image: '/images/enemies/twisted_frame.png',
    attackDelay: 3500,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Ergosphere',
    actions: [
        {
            name: 'Structural Collapse',
            damage: 30,
            description: 'A section of the structure collapses, sending high-velocity debris in all directions.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Dimensional Fold',
            damage: 20,
            description: 'The structure folds through higher dimensions, appearing to strike from impossible angles.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Frame Drag',
            damage: 25,
            description: 'The rotational force pulls your ship closer, stressing structural integrity.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const TIME_DILATED_OBSERVER: Enemy = {
    id: 'blackhole-time-dilated-observer',
    name: 'Time-Dilated Observer',
    description: 'A research drone experiencing extreme time dilation. It perceives events at a different rate than normal space-time, allowing it to react to attacks before they occur.',
    maxHealth: 80,
    health: 80,
    shield: 90,
    maxShield: 90,
    image: '/images/enemies/time_dilated_observer.png',
    attackDelay: 4000,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Ergosphere',
    actions: [
        {
            name: 'Precognitive Evasion',
            damage: 0,
            description: 'Predicts attacks before they happen, temporarily boosting defensive capabilities.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Temporal Feedback',
            damage: 25,
            description: 'Creates a loop of temporal energy that damages ship systems from multiple timeframes simultaneously.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Chrono-Disruption Pulse',
            damage: 35,
            description: 'Emits a pulse that disrupts the temporal flow around your ship\'s systems, causing them to age rapidly.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const PHASE_SHIFTED_CONSTRUCT: Enemy = {
    id: 'blackhole-phase-shifted-construct',
    name: 'Phase-Shifted Construct',
    description: 'An artificial structure existing partially in our dimension and partially in others, appearing as a constantly shifting geometric impossibility.',
    maxHealth: 120,
    health: 120,
    shield: 50,
    maxShield: 50,
    image: '/images/enemies/phase_shifted_construct.png',
    attackDelay: 3000,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Ergosphere',
    actions: [
        {
            name: 'Reality Fracture',
            damage: 40,
            description: 'Creates a temporary tear between dimensions, causing severe but unpredictable damage.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Phase Cycling',
            damage: 0,
            description: 'Cycles through dimensional phases, becoming temporarily invulnerable to conventional attacks.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Dimensional Anchors',
            damage: 30,
            description: 'Launches anchors that connect to your ship across dimensional boundaries, causing system disruptions.',
            target: 'health',
            probability: 0.4
        }
    ]
};

// =====================
// Event Horizon Subregion Enemies
// =====================

export const SINGULARITY_GUARDIAN: Enemy = {
    id: 'blackhole-singularity-guardian',
    name: 'Singularity Guardian',
    description: 'An entity composed of ultra-dense matter that orbits just beyond the event horizon. It appears to purposefully protect the black hole from intruders.',
    maxHealth: 150,
    health: 150,
    shield: 100,
    maxShield: 100,
    image: '/images/enemies/singularity_guardian.png',
    attackDelay: 4000,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Event Horizon',
    actions: [
        {
            name: 'Gravitational Lensing',
            damage: 45,
            description: 'Bends space around your ship, focusing gravitational forces to crush hull sections.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Event Horizon Simulation',
            damage: 35,
            description: 'Creates a localized point of no return, trapping energy and matter from your ship.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Density Manipulation',
            damage: 0,
            description: 'Increases its own density, dramatically enhancing defensive capabilities temporarily.',
            target: 'shield',
            probability: 0.3
        }
    ]
};

export const REALITY_FRACTURE: Enemy = {
    id: 'blackhole-reality-fracture',
    name: 'Reality Fracture',
    description: 'Not truly an entity but a tear in the fabric of space-time that behaves with apparent intelligence. It appears as a jagged line of absolute darkness that splits and reconnects unpredictably.',
    maxHealth: 130,
    health: 130,
    shield: 120,
    maxShield: 120,
    image: '/images/enemies/reality_fracture.png',
    attackDelay: 3500,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Event Horizon',
    actions: [
        {
            name: 'Causal Violation',
            damage: 50,
            description: 'Creates an effect that precedes its cause, making it impossible to defend against conventionally.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Spatial Reconfiguration',
            damage: 40,
            description: 'Rearranges the physical space occupied by your ship, causing systems to overlap and malfunction.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Probability Collapse',
            damage: 30,
            description: 'Collapses quantum probability waves in an unfavorable configuration, causing unlikely failures in ship systems.',
            target: 'health',
            probability: 0.3
        }
    ]
};

// =====================
// Boss Enemy
// =====================

export const SINGULARITY_ECHO: Enemy = {
    id: 'blackhole-singularity-echo-boss',
    name: 'The Singularity\'s Echo',
    description: 'A perfect reflection of your own ship, twisted by the black hole\'s influence. It anticipates your actions and counters with impossible precision, as if it knows what you\'ll do before you do.',
    maxHealth: 250,
    health: 250,
    shield: 200,
    maxShield: 200,
    image: '/images/enemies/singularity_echo.png',
    attackDelay: 3000,
    lastAttackTime: 0,
    region: 'blackhole',
    subRegion: 'Event Horizon',
    isBoss: true,
    introTitle: "The Mirror Beyond Time",
    introDescription: "As your ship approaches the event horizon, reality itself seems to fold. The stars behind you stretch and distort, and then—impossibly—your own ship appears before you. The Singularity's Echo, a perfect yet twisted reflection of your vessel, hovers with unnatural stillness against the backdrop of the black hole. This is not mere mimicry; the black hole has created something from another timeline, another possibility of your existence. The Echo's systems pulse with dark energy, and as you watch, it makes adjustments to its defenses that mirror the very thoughts forming in your mind. A cold certainty grips you: this entity exists partially outside normal time, seeing your actions before you make them. This is not just combat—it's a battle against yourself from a reality where you've already lost.",
    actions: [
        {
            name: 'Mirror Strike',
            damage: 60,
            description: 'Launches an attack that perfectly counters your current defensive posture, finding vulnerabilities with unnatural precision.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Temporal Foresight',
            damage: 50,
            description: 'Perceives your intentions across timelines, allowing it to strike systems before you even decide to defend them.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Reality Inversion',
            damage: 40,
            description: 'Inverts the nature of space around your ship, turning strengths into vulnerabilities and shields into conduits.',
            target: 'shield',
            probability: 0.2
        },
        {
            name: 'Probability Manipulation',
            damage: 70,
            description: 'Alters probability fields to ensure critical system failures occur at the worst possible moment.',
            target: 'health',
            probability: 0.2
        }
    ]
};

// Combined export of all Black Hole enemies
export const BLACKHOLE_ENEMIES: Enemy[] = [
    WARPED_RESEARCH_VESSEL,
    RADIATION_PHANTOM,
    GRAVITY_PROBE,
    TWISTED_FRAME_STRUCTURE,
    TIME_DILATED_OBSERVER,
    PHASE_SHIFTED_CONSTRUCT,
    SINGULARITY_GUARDIAN,
    REALITY_FRACTURE,
    SINGULARITY_ECHO
]; 