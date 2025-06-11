import { EnemyDefinition, EnemyType } from '@/app/game/types/combat';

/**
 * Enemy definitions for the Void region
 * 
 * The Void is an empty part of space - enemies reflect themes of decay and abandonment,
 * featuring deteriorated technology and decaying systems rather than advanced concepts.
 * 
 * Note: Void region doesn't have explicit subregions in this design.
 */

export const VOID_ENEMIES: EnemyDefinition[] = [
    // Basic enemies
    {
        id: 'void-service-bot',
        name: 'Malfunctioning Service Bot',
        description: 'A simple maintenance robot left adrift when its station was abandoned. Years of radiation exposure have corrupted its basic programming, causing it to attack any vessel it encounters.',
        type: EnemyType.DRONE,
        maxHealth: 25,
        health: 25,
        shield: 10,
        maxShield: 10,
        image: '/images/enemies/void/service-bot.png',
        attackDelay: 2500,
        lastAttackTime: 0,
        isBoss: false,
        spawnLocations: [{ regionId: 'void', weight: 3 }],
        introTitle: "Lost Caretaker",
        introDescription: "Your proximity sensors detect a small object drifting in the endless void. As you approach, the object reorients itself – a Malfunctioning Service Bot, its once-white hull now pitted and discolored from centuries of cosmic radiation. Status lights that once indicated routine maintenance protocols now flicker with erratic patterns. The bot jerks to attention, its corrupted identification system categorizing your ship as 'unauthorized structure – maintenance required.' Its manipulator arms extend, welding tools sparking to life as it prepares to 'service' your vessel in the only way its damaged programming now understands.",
        actions: [
            {
                name: 'Welding Tool',
                damage: 5,
                description: 'Fires up its deteriorating welding implement, originally designed for hull repairs.',
                target: 'health',
                probability: 0.7
            },
            {
                name: 'Diagnostic Scan',
                damage: 3,
                description: 'Attempts to run a corrupted diagnostic routine that interferes with nearby systems.',
                target: 'shield',
                probability: 0.3
            }
        ],
        loot: [
          { type: 'scrap', amount: 5 },
          { type: 'energy', amount: 2, probability: 0.5 },
          { type: 'combatComponents', amount: 1, probability: 0.5 }
        ]
    },
    {
        id: 'void-excavator',
        name: 'Derelict Excavator',
        description: 'A hulking piece of industrial equipment abandoned when its asteroid mining operation shut down. Its power cells should have died decades ago, but something keeps it partially functioning.',
        type: EnemyType.DRONE,
        maxHealth: 40,
        health: 40,
        shield: 5,
        maxShield: 5,
        image: '/images/enemies/void/excavator.png',
        attackDelay: 4000,
        lastAttackTime: 0,
        isBoss: false,
        spawnLocations: [{ regionId: 'void', weight: 1 }],
        actions: [
            {
                name: 'Rusted Drill',
                damage: 8,
                description: 'Extends a corroded drilling apparatus that still manages to function despite its deteriorated state.',
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Cracked Spotlight',
                damage: 4,
                description: 'Floods the area with harsh light from its cracked industrial floodlights, temporarily blinding sensors.',
                target: 'shield',
                probability: 0.4
            }
        ],
        loot: [
          { type: 'scrap', amount: 8 }
        ]
    },
    {
        id: 'void-radiation-cluster',
        name: 'Radiation Cluster',
        description: 'A pocket of concentrated radiation, possibly the result of a reactor breach from a long-destroyed vessel. It drifts through space, interacting unpredictably with ship systems.',
        type: EnemyType.ANOMALY,
        maxHealth: 20,
        health: 20,
        shield: 20,
        maxShield: 20,
        image: '/images/enemies/void/radiation.png',
        attackDelay: 3500,
        lastAttackTime: 0,
        isBoss: false,
        spawnLocations: [{ regionId: 'void', weight: 1 }],
        actions: [
            {
                name: 'Radiation Spike',
                damage: 6,
                description: 'A sudden surge in radioactive particles penetrates the ship hull, damaging internal components.',
                target: 'health',
                probability: 0.5
            },
            {
                name: 'Electromagnetic Pulse',
                damage: 7,
                description: 'Radiation interacts with the ship\'s shield generators, causing power fluctuations.',
                target: 'shield',
                probability: 0.5
            }
        ],
        loot: [
          { type: 'energy', amount: 10 }
        ]
    },
    {
        id: 'void-sentry-turret',
        name: 'Abandoned Sentry Turret',
        description: 'A defensive turret from a forgotten outpost, still adhering to protocols long since obsolete. Its targeting systems are damaged, causing it to fire at anything that moves.',
        type: EnemyType.STATION,
        maxHealth: 30,
        health: 30,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/void/sentry-turret.png',
        attackDelay: 3200,
        lastAttackTime: 0,
        isBoss: false,
        spawnLocations: [{ regionId: 'void', weight: 2 }],
        actions: [
            {
                name: 'Sporadic Fire',
                damage: 4,
                description: 'Fires erratically from its partially-jammed weapon system, hitting with quantity rather than accuracy.',
                target: 'shield',
                probability: 0.8
            },
            {
                name: 'Power Surge',
                damage: 10,
                description: 'A dangerous power surge allows the turret to fire at full capacity for a brief moment.',
                target: 'health',
                probability: 0.2
            }
        ],
        loot: [
          { type: 'scrap', amount: 10 },
          { type: 'energy', amount: 5, probability: 0.7 }
        ]
    },
    
    // Boss enemy
    {
        id: 'void-forgotten-monitor-boss',
        name: 'The Forgotten Monitor',
        description: 'A massive derelict station that once served as an observation post at the edge of charted space. Long abandoned, its systems have decayed into a semi-functional state of paranoid defense protocols and corrupted data.',
        type: EnemyType.STATION,
        maxHealth: 100,
        health: 100,
        shield: 50,
        maxShield: 50,
        image: '/images/enemies/void/forgotten-monitor.png',
        attackDelay: 4500,
        lastAttackTime: 0,
        isBoss: true,
        spawnLocations: [],
        introTitle: "Ancient Guardian of the Void",
        introDescription: "Your sensor array struggles to process the massive structure emerging from the darkness ahead. The Forgotten Monitor – once humanity's farthest outpost – now drifts in eternal vigil over nothing. Its kilometer-long frame is scarred by centuries of micrometeorite impacts, and vast sections lie dark and lifeless. Yet as your ship approaches, ancient systems stir to life. Warning beacons flare with sickly light as a distorted voice broadcasts on all frequencies: 'UNRECOGNIZED VESSEL DETECTED. IDENTIFICATION PROTOCOLS CORRUPTED. ASSUMING HOSTILE INTENT. DEFENSE SYSTEMS ENGAGED.' The titanic station's remaining operational sections illuminate one by one, weapons systems charging with ominous purpose. This is no mere derelict – it's a fortress awakening from slumber, its paranoid AI convinced that whatever cataclysm befell humanity has returned in your form.",
        actions: [
            {
                name: 'Aged Defense Array',
                damage: 12,
                description: 'Activates a series of deteriorating defense turrets that still pack significant firepower despite their condition.',
                target: 'shield',
                probability: 0.4
            },
            {
                name: 'Corrupted Database',
                damage: 15,
                description: 'Broadcasts garbled data packets that overwhelm and confuse ship systems, causing unexpected shutdowns.',
                target: 'health',
                probability: 0.3
            },
            {
                name: 'Emergency Protocol',
                damage: 8,
                description: 'Executes a fragmented emergency routine, deploying countermeasures designed for threats that no longer exist.',
                target: 'health',
                probability: 0.2
            },
            {
                name: 'Power Redistribution',
                damage: 20,
                description: 'Diverts power from failing life support systems to weapons, creating a dangerous but unsustainable surge in attack capability.',
                target: 'shield',
                probability: 0.1
            }
        ],
        loot: [
          { type: 'scrap', amount: 50 },
          { type: 'energy', amount: 30 },
          { type: 'insight', amount: 20 }
        ]
    },
    {
        id: 'void-defense-turret',
        name: 'Automated Defense Turret',
        description: 'A defensive weapon that broke free from its mounting during a station catastrophe. Now drifting freely, its targeting systems activate whenever it detects movement.',
        type: EnemyType.STATION,
        maxHealth: 30,
        health: 30,
        shield: 15,
        maxShield: 15,
        image: '/images/enemies/void/defense-turret.png',
        attackDelay: 3000,
        lastAttackTime: 0,
        isBoss: false,
        spawnLocations: [{ regionId: 'void', weight: 2 }],
        introTitle: "Silent Sentinel",
        introDescription: "What appears to be mere space debris suddenly pivots toward your ship. An Automated Defense Turret, torn from its original mounting by some ancient catastrophe, has detected your approach. Solar panels unfold like metallic petals as dormant systems reactivate. Though no station remains to protect, the turret's core programming persists – eliminate all unauthorized vessels. Its targeting array, still functioning after centuries adrift, bathes your ship in a crimson scanning beam as its weapon systems power up, ready to perform its eternal duty.",
        actions: [
            {
                name: 'Sporadic Fire',
                damage: 4,
                description: 'Fires erratically from its partially-jammed weapon system, hitting with quantity rather than accuracy.',
                target: 'shield',
                probability: 0.8
            },
            {
                name: 'Power Surge',
                damage: 10,
                description: 'A dangerous power surge allows the turret to fire at full capacity for a brief moment.',
                target: 'health',
                probability: 0.2
            }
        ],
        loot: [
          { type: 'scrap', amount: 12 },
          { type: 'energy', amount: 8 }
        ]
    },
    {
        id: 'void-mining-drone',
        name: 'Derelict Mining Drone',
        description: 'Once part of a resource extraction operation, this drone continues to follow its programming to collect valuable materials - now identifying spacecraft as viable targets.',
        type: EnemyType.DRONE,
        maxHealth: 35,
        health: 35,
        shield: 5,
        maxShield: 5,
        image: '/images/enemies/void/mining-drone.png',
        attackDelay: 3200,
        lastAttackTime: 0,
        isBoss: false,
        spawnLocations: [{ regionId: 'void', weight: 1 }],
        introTitle: "Relentless Harvester",
        introDescription: "A shadow passes across your viewports as sensors alert you to a large object on an intercept course. The angular silhouette of a Derelict Mining Drone looms against the starfield, its collection arms extended like predatory appendages. Originally designed to extract ore from asteroids, its resource detection algorithms have degraded, now classifying your ship's metal hull as a promising deposit. The drone's drills begin to spin with increasing velocity, and its grabber arms unfold to their full extension. A metallic groaning echoes through space as ancient hydraulics prepare to claim new 'resources' for masters long since vanished.",
        actions: [
            {
                name: 'Rusted Drill',
                damage: 8,
                description: 'Extends a corroded drilling apparatus that still manages to function despite its deteriorated state.',
                target: 'health',
                probability: 0.6
            },
            {
                name: 'Cracked Spotlight',
                damage: 4,
                description: 'Floods the area with harsh light from its cracked industrial floodlights, temporarily blinding sensors.',
                target: 'shield',
                probability: 0.4
            }
        ],
        loot: [
          { type: 'scrap', amount: 7 }
        ]
    }
]; 
