import { Enemy } from '../../types';

/**
 * Enemy definitions for the Habitable Zone region
 * 
 * Organized by subzones:
 * 1. Orbital Graveyard - Massive derelict space stations in decaying orbits
 * 2. Fallen Worlds - Once-terraformed planets sliding back into uninhabitability
 * 3. The Last Metropolis - Final large human settlement, now a crumbling dystopia
 * 
 * Enemies emphasize decay, fighting over scraps, technological regression, and the
 * dark aftermath of civilization's collapse.
 */

export const HABITABLE_ZONE_ENEMIES: Enemy[] = [
    // =====================
    // Orbital Graveyard Enemies
    // =====================
    
    {
        id: 'habitable-station-scavenger',
        name: 'Station Scavenger',
        description: 'Former maintenance worker turned violent salvager. Uses repurposed tools as weapons and wears patchwork armor made from scavenged station components.',
        maxHealth: 35,
        health: 35,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/habitable/station-scavenger.png',
        attackDelay: 3000,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'Orbital Graveyard',
        introTitle: "Ambush in the Corridors",
        introDescription: "As you explore the derelict station, movement catches your eye - a figure lurking in the shadows. A Station Scavenger emerges, wielding makeshift weapons crafted from the station's own components. Their eyes glint with desperation through a patchwork helmet as they move to defend what they consider their territory.",
        actions: [
            {
                name: 'Salvaged Cutter',
                damage: 7,
                description: 'Attacks with a maintenance torch modified into a makeshift plasma cutter.',
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Magnetic Grapple',
                damage: 5,
                description: 'Fires a magnetic retrieval tool that pulls away metal components.',
                target: 'shield',
                probability: 0.4
            }
        ]
    },
    {
        id: 'habitable-security-drone',
        name: 'Rogue Security Drone',
        description: 'Station security drone operating on corrupted protocols. Its identification systems have degraded, causing it to target all unauthorized movement with increasing aggression.',
        maxHealth: 30,
        health: 30,
        shield: 25,
        maxShield: 25,
        image: '/images/enemies/habitable/security-drone.png',
        attackDelay: 2800,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'Orbital Graveyard',
        introTitle: "Security Protocol Violation",
        introDescription: "A warning chime echoes through your comms as a dormant security system activates ahead. A sleek, angular Rogue Security Drone emerges from a recessed docking port, its identification beacon broadcasting corrupted authentication requests. As its sensors sweep over your vessel, red targeting lights activate and a synthetic voice announces: 'Intruder detected. Security violation. Neutralization protocols initiated.'",
        actions: [
            {
                name: 'Defense Laser',
                damage: 6,
                description: 'Fires a precision laser burst originally designed to disable unauthorized equipment.',
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Electronic Suppression',
                damage: 8,
                description: 'Emits a directional pulse designed to disrupt shield systems.',
                target: 'shield',
                probability: 0.3
            }
        ]
    },
    {
        id: 'habitable-void-parasite',
        name: 'Void-Adapted Parasite',
        description: 'Organism that evolved to survive in derelict stations by consuming energy and organic material. Forms a natural shield from crystallized metal particles.',
        maxHealth: 25,
        health: 25,
        shield: 30,
        maxShield: 30,
        image: '/images/enemies/habitable/void-parasite.png',
        attackDelay: 2500,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'Orbital Graveyard',
        introTitle: "Luminescent Hunger",
        introDescription: "The darkened corridor ahead seems to shimmer with unnatural light. As your spotlights sweep the area, you see the metallic surfaces crawling with a Void-Adapted Parasite - a translucent organism that pulses with stolen energy. Its form is a network of filaments that have crystallized trace metals into a protective carapace. Sensing your ship's power signature, it detaches from the walls and floats toward you, tendrils reaching outward with hungry purpose.",
        actions: [
            {
                name: 'Energy Drain',
                damage: 4,
                description: 'Latches onto systems and drains power, causing internal damage.',
                target: 'health',
                probability: 0.5
            },
            {
                name: 'Crystal Projection',
                damage: 6,
                description: 'Fires crystallized particles that rapidly deplete shield strength.',
                target: 'shield',
                probability: 0.5
            }
        ]
    },

    // =====================
    // Fallen Worlds Enemies
    // =====================
    
    {
        id: 'habitable-adapted-hunter',
        name: 'Adapted Hunter',
        description: 'Human hunter from a regressed colony, adapted to the failing ecosystem through crude genetic modification and tribal scarification. Territorial and deeply suspicious of outsiders with technology.',
        maxHealth: 45,
        health: 45,
        shield: 5,
        maxShield: 5,
        image: '/images/enemies/habitable/adapted-hunter.png',
        attackDelay: 3500,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'Fallen Worlds',
        introTitle: "Territorial Challenge",
        introDescription: "Descending through the toxic mists, your sensors detect movement in the tangled wilderness below. An Adapted Hunter - a descendant of the original terraformers - watches your approach. Centuries of adaptation have changed them; their skin has a greenish tint and protective scarification patterns cover vital areas. As you near their territory, they raise a crude spear in challenge, their expression a mixture of fear and determination to protect what little they have claimed.",
        actions: [
            {
                name: 'Toxic Spear',
                damage: 10,
                description: 'Hurls a spear tipped with venom harvested from mutated wildlife.',
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Disruptor Charm',
                damage: 4,
                description: 'Activates a crude electromagnetic disruptor made from salvaged components.',
                target: 'shield',
                probability: 0.3
            }
        ]
    },
    {
        id: 'habitable-atmospheric-predator',
        name: 'Atmospheric Predator',
        description: 'Flying creature evolved to hunt in the degrading atmospheres of failed terraforming projects. Its respiratory system generates natural EMP discharges.',
        maxHealth: 40,
        health: 40,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/habitable/atmo-predator.png',
        attackDelay: 3200,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'Fallen Worlds',
        introTitle: "Stalker in the Skies",
        introDescription: "Your ship's proximity alarms blare as sensors detect a rapidly approaching biological signature. An Atmospheric Predator circles your vessel, its evolved form perfectly adapted to the thin, toxic atmosphere. Bioluminescent patterns pulse across its wingspan as it prepares to discharge its natural electromagnetic pulse - a hunting mechanism evolved to disable the electronic systems of its prey.",
        actions: [
            {
                name: 'Energy Drain',
                damage: 4,
                description: 'Latches onto systems and drains power, causing internal damage.',
                target: 'health',
                probability: 0.5
            },
            {
                name: 'Crystal Projection',
                damage: 6,
                description: 'Fires crystallized particles that rapidly deplete shield strength.',
                target: 'shield',
                probability: 0.5
            }
        ]
    },
    {
        id: 'habitable-feral-harvester',
        name: 'Feral Harvester',
        description: 'Agricultural machine that has evolved predatory behaviors after centuries without maintenance. Its harvesting protocols now target any movement, including humans.',
        maxHealth: 50,
        health: 50,
        shield: 10,
        maxShield: 10,
        image: '/images/enemies/habitable/feral-harvester.png',
        attackDelay: 4000,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'Fallen Worlds',
        introTitle: "Mechanical Predator",
        introDescription: "Your ship's sensors register an anomalous signature moving through the overgrown fields ahead. A Feral Harvester - once part of this world's agricultural infrastructure - emerges from the dense vegetation. Centuries of operation without maintenance have corrupted its programming; rusted blades that once harvested crops now hunt any moving target. Its optical sensors, now a deep crimson, lock onto your vessel as it calibrates its antiquated targeting systems. The machine's motors rev to a predatory whine as it accelerates toward you.",
        actions: [
            {
                name: 'Reaping Blade',
                damage: 12,
                description: 'Swings massive cutting blades originally designed for crop collection.',
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Soil Analyzer',
                damage: 6,
                description: 'Deploys corrosive sampling probes meant to test soil composition.',
                target: 'shield',
                probability: 0.4
            }
        ]
    },

    // =====================
    // The Last Metropolis Enemies
    // =====================
    
    {
        id: 'habitable-corporate-enforcer',
        name: 'Corporate Enforcer',
        description: 'Security personnel employed by the city\'s ruling elite. Equipped with partially-functional ancient technology and conditioned with absolute loyalty through dependency on rationed resources.',
        maxHealth: 40,
        health: 40,
        shield: 25,
        maxShield: 25,
        image: '/images/enemies/habitable/corporate-enforcer.png',
        attackDelay: 3000,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'The Last Metropolis',
        introTitle: "Authority Intervention",
        introDescription: "An authorized transmission cuts through your communications: 'This is Metropolis Security. You are in violation of corporate airspace. All resources and technologies are property of the Governing Council.' A sleek patrol craft approaches, piloted by a Corporate Enforcer clad in the distinctive black and gold uniform of the city's elite guardians. Their equipment is a mix of advanced ancient technology and jury-rigged modern solutions – a reflection of the Metropolis's dedication to maintaining appearances of the old world, despite its crumbling foundations.",
        actions: [
            {
                name: 'Compliance Rod',
                damage: 8,
                description: 'Strikes with an electrified baton used for crowd control and punishment.',
                target: 'health',
                probability: 0.4
            },
            {
                name: 'Suppression Field',
                damage: 9,
                description: 'Activates a wearable field generator that disrupts nearby electronic systems.',
                target: 'shield',
                probability: 0.6
            }
        ]
    },
    {
        id: 'habitable-resource-raider',
        name: 'Resource Raider',
        description: 'Desperate citizen driven to violence by the city\'s artificial scarcity. Operates in gangs that ambush travelers for their technology and supplies.',
        maxHealth: 30,
        health: 30,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/habitable/resource-raider.png',
        attackDelay: 2700,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'The Last Metropolis',
        introTitle: "Desperate Ambush",
        introDescription: "Your proximity scanner flags multiple small craft emerging from the shadows of a derelict building. Resource Raiders – citizens excluded from the Metropolis's rationing system – have spotted your ship as an opportunity. Their makeshift vessels are cobbled together from stolen parts and salvage, much like their patchwork clothing and weapons. A desperate voice crackles over an open frequency: 'Hand over your supplies and you can pass. Hold anything back, and we strip your ship to the frame.' Behind the threat, you can hear the unmistakable sound of hungry children in the background.",
        actions: [
            {
                name: 'Scrap Launcher',
                damage: 7,
                description: 'Fires compressed bundles of metal scrap from a homemade launcher.',
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Power Leech',
                damage: 5,
                description: 'Uses a modified tool designed to siphon energy from functional technology.',
                target: 'shield',
                probability: 0.3
            }
        ]
    },
    {
        id: 'habitable-knowledge-broker',
        name: 'Knowledge Broker',
        description: 'Black market dealer in restricted information who turns violent when threatened. Uses a combination of ancient technology and improvised weapons to protect their valuable data caches.',
        maxHealth: 35,
        health: 35,
        shield: 20,
        maxShield: 20,
        image: '/images/enemies/habitable/knowledge-broker.png',
        attackDelay: 3300,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'The Last Metropolis',
        introTitle: "Information Dealer's Defense",
        introDescription: "Deep in the Metropolis's lower levels, a sleek vessel detaches from an unmarked docking port. The Knowledge Broker aboard had clearly been expecting someone else; their surprise quickly turns to suspicion as they scan your ship. 'I don't recognize your signature. My client list is invitation-only.' Their vessel bristles with unusual modifications - data transfer arrays repurposed as weapons, shielding reinforced with prototype technology. 'Either pay for the privilege or leave my territory. Knowledge has a price, and so does trespassing.'",
        actions: [
            {
                name: 'Memory Spike',
                damage: 6,
                description: 'Attacks with a data transfer device repurposed as a weapon that corrupts systems.',
                target: 'shield',
                probability: 0.6
            },
            {
                name: 'Restricted Stimulant',
                damage: 9,
                description: 'Uses combat drugs reserved for the elite to temporarily enhance fighting ability.',
                target: 'health',
                probability: 0.4
            }
        ]
    },
    
    // =====================
    // Boss Enemy
    // =====================
    
    {
        id: 'habitable-festering-collective',
        name: 'The Festering Collective',
        description: 'A massive hive ship infected with an aggressive biodigital plague. Once a colony vessel, now a fusion of corrupt AI and diseased organic matter that actively seeks to infect other vessels.',
        maxHealth: 100,
        health: 100,
        shield: 80,
        maxShield: 80,
        image: '/images/enemies/habitable/festering-collective.png',
        attackDelay: 4000,
        lastAttackTime: 0,
        region: 'habitable',
        isBoss: true,
        introTitle: "Harbinger of Corruption",
        introDescription: "Your sensors detect a massive biomechanical structure drifting toward your position. The Festering Collective - infamous among what remains of humanity as a plague ship that corrupts both organic life and digital systems. On your viewscreen, you can see its hull pulsing with sickly light, a grotesque fusion of technology and diseased flesh. Tendrils of corrupted matter extend from its form, seeking to ensnare your vessel. This is no ordinary encounter - survival will require everything at your disposal.",
        actions: [
            {
                name: 'Plague Strike',
                damage: 15,
                description: 'Launches infected debris that burrows through hull material.',
                target: 'health',
                probability: 0.4
            },
            {
                name: 'Corrupted Broadcast',
                damage: 12,
                description: 'Emits a signal that exploits shield frequencies, creating catastrophic feedback.',
                target: 'shield',
                probability: 0.4
            },
            {
                name: 'Assimilation Attempt',
                damage: 20,
                description: 'Tries to physically connect to your ship, causing massive damage to all systems.',
                target: 'health',
                probability: 0.2
            }
        ]
    },
    {
        id: 'habitable-enforcer-mech',
        name: 'Enforcement Mech',
        description: 'Heavy security robot from the Last Metropolis, deployed to prevent unauthorized ships from approaching the city. Armed with military-grade weapons and countermeasures.',
        maxHealth: 60,
        health: 60,
        shield: 40,
        maxShield: 40,
        image: '/images/enemies/habitable/enforcer-mech.png',
        attackDelay: 3800,
        lastAttackTime: 0,
        region: 'habitable',
        subRegion: 'The Last Metropolis',
        introTitle: "Metropolis Border Patrol",
        introDescription: "Approaching the Last Metropolis, your communications system receives an automated warning: 'Unauthorized vessel detected. Vacate restricted airspace immediately.' Before you can respond, a heavily armored Enforcement Mech deploys from a concealed silo, powering up its weapons systems. Its utilitarian design emphasizes function over form - a relic of the old world, maintained to protect what remains of civilization.",
        actions: [
            {
                name: 'Heavy Cannon',
                damage: 12,
                description: 'Fires a high-caliber round from shoulder-mounted artillery.',
                target: 'health',
                probability: 0.4
            },
            {
                name: 'Shield Disruptor',
                damage: 10,
                description: 'Emits a specialized frequency designed to destabilize shield matrices.',
                target: 'shield',
                probability: 0.6
            }
        ]
    }
]; 