import { Enemy } from '../../types';


/**
 * Enemies for the Supernova region
 * 
 * Organized by subregions:
 * 1. Outer Shell - The expanded outer layers of the exploded star
 * 2. Midfield Ruins - Shattered planets and fragmented civilization remains
 * 3. Core Remnant - The ultra-dense central region with the neutron star
 */

// =====================
// Outer Shell Subregion Enemies
// =====================

export const RADIATION_WRAITH: Enemy = {
    id: 'supernova-radiation-wraith',
    name: 'Radiation Wraith',
    description: 'An energetic anomaly formed from the supernova\'s intense radiation, now drifting through the debris seeking energy to consume. It appears as a shimmering, translucent specter of light and ionized particles.',
    maxHealth: 80,
    health: 80,
    shield: 30,
    maxShield: 30,
    image: '/images/enemies/radiation_wraith.png',
    attackDelay: 2500,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Outer Shell',
    introTitle: "Luminous Hunter",
    introDescription: "Your ship's radiation sensors spike to dangerous levels as a ghostly luminescence materializes among the stellar debris. The Radiation Wraith – a sentient energy pattern born from the supernova's fury – coalesces before you. Its form shifts constantly, a spectral dance of light and ionized particles that defies conventional physics. What might have once been random cosmic energy has evolved into something with purpose, drawn to your ship's power signature like a predator sensing prey. The wraith's core pulses with increasing intensity as it prepares to feed, its ethereal tendrils reaching toward your vessel with hungry intent.",
    actions: [
        {
            name: 'Energy Drain',
            damage: 25,
            description: 'Latches onto your ship\'s systems and siphons energy directly, bypassing some shielding.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Radiation Pulse',
            damage: 20,
            description: 'Releases a burst of concentrated radiation that interferes with shield harmonics.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Spectral Shift',
            damage: 15,
            description: 'Rapidly changes its energy signature to find vulnerabilities in your defenses.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const SCAVENGER_DRONE: Enemy = {
    id: 'supernova-scavenger-drone',
    name: 'Scavenger Drone',
    description: 'An automated salvage unit still following ancient programming, harvesting materials from the ruins and attacking anything it perceives as competition for limited resources.',
    maxHealth: 70,
    health: 70,
    shield: 40,
    maxShield: 40,
    image: '/images/enemies/scavenger_drone.png',
    attackDelay: 3000,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Outer Shell',
    actions: [
        {
            name: 'Salvage Claw',
            damage: 30,
            description: 'Mechanical appendage designed to tear apart hulls for material extraction.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Resource Beam',
            damage: 25,
            description: 'Analysis beam that identifies and targets weak points in ship structures.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Nanite Swarm',
            damage: 20,
            description: 'Releases a cloud of microscopic machines that attach to and disassemble outer hull layers.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const DERELICT_GUARDIAN: Enemy = {
    id: 'supernova-derelict-guardian',
    name: 'Derelict Guardian',
    description: 'A damaged defense platform that survived the cataclysm, now malfunctioning and attacking any ships it detects. Its programming corrupted, it believes it still protects a civilization long gone.',
    maxHealth: 90,
    health: 90,
    shield: 50,
    maxShield: 50,
    image: '/images/enemies/derelict_guardian.png',
    attackDelay: 3500,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Outer Shell',
    actions: [
        {
            name: 'Defense Cannon',
            damage: 35,
            description: 'Fires concentrated energy blasts from ancient but still powerful weapons systems.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Targeting Matrix',
            damage: 30,
            description: 'Advanced targeting systems lock onto shield emitters for precision strikes.',
            target: 'shield',
            probability: 0.4
        },
        {
            name: 'Proximity Mines',
            damage: 25,
            description: 'Deploys self-guided explosive devices that home in on your ship.',
            target: 'health',
            probability: 0.3
        }
    ]
};

// =====================
// Midfield Ruins Subregion Enemies
// =====================

export const FUSED_CONSTRUCT: Enemy = {
    id: 'supernova-fused-construct',
    name: 'Fused Construct',
    description: 'A mass of technology and organic matter merged during the supernova, now animated by residual energy. Parts of buildings, machines, and possibly even life forms move with disturbing coordination.',
    maxHealth: 110,
    health: 110,
    shield: 60,
    maxShield: 60,
    image: '/images/enemies/fused_construct.png',
    attackDelay: 3000,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Midfield Ruins',
    actions: [
        {
            name: 'Amalgam Strike',
            damage: 40,
            description: 'Extends portions of its fused mass to slam against your hull with tremendous force.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Disruption Field',
            damage: 35,
            description: 'Emits chaotic energy patterns that interfere with shield coherence.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Absorption Tendril',
            damage: 30,
            description: 'Attempts to integrate parts of your ship into its own mass.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const STELLAR_SHARD: Enemy = {
    id: 'supernova-stellar-shard',
    name: 'Stellar Shard',
    description: 'A fragment of the star\'s photosphere that retained coherence, pulsing with dangerous energy discharges. It glows with the light of a small sun, temperature fluctuating wildly.',
    maxHealth: 100,
    health: 100,
    shield: 70,
    maxShield: 70,
    image: '/images/enemies/stellar_shard.png',
    attackDelay: 3500,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Midfield Ruins',
    actions: [
        {
            name: 'Plasma Discharge',
            damage: 45,
            description: 'Releases a stream of superheated stellar material that melts through protective systems.',
            target: 'shield',
            probability: 0.4
        },
        {
            name: 'Solar Flare',
            damage: 40,
            description: 'Erupts with a miniature version of a stellar flare, bombarding your ship with charged particles.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Radiation Surge',
            damage: 35,
            description: 'Briefly increases its radiation output to dangerous levels, penetrating multiple ship systems.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const AUTOMATED_DEFENDER: Enemy = {
    id: 'supernova-automated-defender',
    name: 'Automated Defender',
    description: 'A military vessel\'s AI core that survived the blast, now piloting what remains of its hull to defend territory that no longer exists. Its form is asymmetrical and partially destroyed, yet still deadly.',
    maxHealth: 130,
    health: 130,
    shield: 80,
    maxShield: 80,
    image: '/images/enemies/automated_defender.png',
    attackDelay: 4000,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Midfield Ruins',
    actions: [
        {
            name: 'Railgun Barrage',
            damage: 50,
            description: 'Fires high-velocity projectiles from its remaining weapons systems.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'ECM Pulse',
            damage: 45,
            description: 'Emits an electromagnetic countermeasure designed to disrupt shield frequencies.',
            target: 'shield',
            probability: 0.4
        },
        {
            name: 'Target Lock',
            damage: 40,
            description: 'Advanced targeting computers identify and exploit weaknesses in your ship\'s structure.',
            target: 'health',
            probability: 0.3
        }
    ]
};

// =====================
// Core Remnant Subregion Enemies
// =====================

export const QUANTUM_ABERRATION: Enemy = {
    id: 'supernova-quantum-aberration',
    name: 'Quantum Aberration',
    description: 'Entity formed from matter compressed to quantum uncertainty, phasing in and out of normal space. Its boundaries are unclear, seeming to exist in multiple states simultaneously.',
    maxHealth: 150,
    health: 150,
    shield: 90,
    maxShield: 90,
    image: '/images/enemies/quantum_aberration.png',
    attackDelay: 3500,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Core Remnant',
    actions: [
        {
            name: 'Phase Strike',
            damage: 55,
            description: 'Briefly materializes directly inside your ship\'s systems, causing damage from within.',
            target: 'health',
            probability: 0.4
        },
        {
            name: 'Uncertainty Wave',
            damage: 50,
            description: 'Propagates a field of quantum uncertainty that disrupts the coherence of shield harmonics.',
            target: 'shield',
            probability: 0.3
        },
        {
            name: 'Probability Collapse',
            damage: 45,
            description: 'Collapses multiple potential outcomes into the one most damaging to your ship.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const TEMPORAL_ECHO: Enemy = {
    id: 'supernova-temporal-echo',
    name: 'Temporal Echo',
    description: 'Manifestation of the star system\'s final moments, replaying in an endless loop and lashing out at intruders. It appears as a shimmering distortion containing fragments of destroyed worlds.',
    maxHealth: 140,
    health: 140,
    shield: 100,
    maxShield: 100,
    image: '/images/enemies/temporal_echo.png',
    attackDelay: 4000,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Core Remnant',
    actions: [
        {
            name: 'Catastrophe Replay',
            damage: 60,
            description: 'Manifests a fragment of the supernova\'s destructive power, focused on your ship.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Temporal Disruption',
            damage: 55,
            description: 'Creates a localized time distortion that stresses shield coherence.',
            target: 'shield',
            probability: 0.4
        },
        {
            name: 'Echo Fragmentation',
            damage: 50,
            description: 'Splits into multiple instances of destruction from different moments, attacking simultaneously.',
            target: 'health',
            probability: 0.3
        }
    ]
};

export const GRAVITY_MANIPULATOR: Enemy = {
    id: 'supernova-gravity-manipulator',
    name: 'Gravity Manipulator',
    description: 'Advanced military weapon torn free from its controls, harnessing the neutron star\'s gravity for devastating attacks. Its structure warps the space around it, making it difficult to perceive clearly.',
    maxHealth: 160,
    health: 160,
    shield: 110,
    maxShield: 110,
    image: '/images/enemies/gravity_manipulator.png',
    attackDelay: 4500,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Core Remnant',
    actions: [
        {
            name: 'Gravitational Lens',
            damage: 65,
            description: 'Focuses and amplifies gravitational forces to crush sections of your hull.',
            target: 'health',
            probability: 0.3
        },
        {
            name: 'Mass Inversion',
            damage: 60,
            description: 'Temporarily inverts the gravitational properties of your shield emitters, causing them to collapse.',
            target: 'shield',
            probability: 0.4
        },
        {
            name: 'Singularity Seed',
            damage: 55,
            description: 'Creates a miniature gravity well that tears at your ship\'s structural integrity.',
            target: 'health',
            probability: 0.3
        }
    ]
};

// =====================
// Boss Enemy
// =====================

export const STELLAR_PHOENIX: Enemy = {
    id: 'supernova-stellar-phoenix-boss',
    name: 'Stellar Phoenix',
    description: 'A sentient manifestation of the supernova itself, composed of stellar matter and the collective consciousness of billions who perished in the cataclysm. It exists in a constant cycle of death and rebirth.',
    maxHealth: 300,
    health: 300,
    shield: 250,
    maxShield: 250,
    image: '/images/enemies/stellar_phoenix.png',
    attackDelay: 3000,
    lastAttackTime: 0,
    region: 'supernova',
    subRegion: 'Core Remnant',
    isBoss: true,
    introTitle: "The Star Reborn",
    introDescription: "The neutron star at the supernova's core pulses with unnatural rhythm as space itself begins to warp and fold. From this cosmic crucible emerges a being of pure stellar energy – the Stellar Phoenix, a living embodiment of the star's death and rebirth. Its form is magnificent and terrible: a vast, bird-like shape composed of plasma, gravitational forces, and something more – echoes of consciousness from the billions of lives extinguished when the star exploded. The Phoenix's 'wings' span kilometers, trailing stellar matter that burns with the intensity of a newborn sun. As it regards your vessel, you feel not just observed but judged by an intelligence born from cosmic catastrophe. The collective memories of civilizations that died in the supernova now focus their attention on you, and find you wanting. The Phoenix's core brightens to blinding intensity as it prepares to cleanse what it perceives as an impurity in its domain.",
    actions: [
        {
            name: 'Rebirth Flare',
            damage: 70,
            description: 'Immolates itself momentarily before reforming, releasing a devastating wave of stellar energy.',
            target: 'health',
            probability: 0.25
        },
        {
            name: 'Memory Fragment',
            damage: 65,
            description: 'Hurls compressed matter containing the final memories of the dead, causing both physical and psychological damage.',
            target: 'health',
            probability: 0.25
        },
        {
            name: 'Gravity Siphon',
            damage: 60,
            description: 'Draws power from the nearby neutron star, intensifying its gravitational pull to crush opposing ships.',
            target: 'shield',
            probability: 0.25
        },
        {
            name: 'Phoenix Nova',
            damage: 100,
            description: 'Creates a miniature recreation of the supernova that birthed it, a devastating area attack.',
            target: 'health',
            probability: 0.15
        },
        {
            name: 'Stellar Resurrection',
            damage: 120,
            description: 'When near death, the Phoenix detonates in a blinding explosion before reconstituting itself from the stellar matter around it, fully restoring its health.',
            target: 'health',
            probability: 0.1
        }
    ]
};

// Combined export of all Supernova enemies
export const SUPERNOVA_ENEMIES: Enemy[] = [
    RADIATION_WRAITH,
    SCAVENGER_DRONE,
    DERELICT_GUARDIAN,
    FUSED_CONSTRUCT,
    STELLAR_SHARD,
    AUTOMATED_DEFENDER,
    QUANTUM_ABERRATION,
    TEMPORAL_ECHO,
    GRAVITY_MANIPULATOR,
    STELLAR_PHOENIX
]; 
