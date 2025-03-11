import { StoryEncounter, EncounterChoice } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Encounter definitions for the Habitable Zone region
 * 
 * Organized by subzones:
 * 1. Orbital Graveyard - Massive derelict space stations in decaying orbits
 * 2. Fallen Worlds - Once-terraformed planets sliding back into uninhabitability
 * 3. The Last Metropolis - Final large human settlement, now a crumbling dystopia
 * 
 * Encounters emphasize decay, fighting over scraps, technological regression, and the
 * dark aftermath of civilization's collapse.
 */

export const HABITABLE_ZONE_ENCOUNTERS: StoryEncounter[] = [
    // =====================
    // Orbital Graveyard Encounters
    // =====================
    
    {
        id: uuidv4(),
        title: "The Aristocrat's Folly",
        region: 'habitable',
        type: 'story',
        description: "Your sensors detect a private orbital estate drifting among larger station ruins. Once a luxury retreat for the ultra-wealthy, its artificial gravity and life support still function sporadically. Amazingly, its automated defense systems remain active.",
        choices: [
            {
                id: uuidv4(),
                text: "Carefully breach the security systems to salvage high-value items",
                outcome: {
                    text: "You bypass several layers of ancient security protocols. Inside, you find luxuries unimaginable in the current age - synthetic foods preserved in stasis fields, art pieces from lost worlds, and personal technology crafted with materials no longer available. Most valuable are the aristocrat's private data cores, containing engineering knowledge that predates the collapse.",
                    resources: [
                        { type: 'scrap', amount: 40 },
                        { type: 'insight', amount: 20 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Study the estate's still-functioning life support systems",
                outcome: {
                    text: "The estate utilizes remarkably efficient atmospheric recyclers that have continued to function for centuries despite minimal maintenance. You gather valuable data on sustainable life support engineering, and even manage to extract a small but advanced air purification module.",
                    resources: [
                        { type: 'insight', amount: 30 },
                        { type: 'energy', amount: 5 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Harvest the rare materials used in the estate's construction",
                outcome: {
                    text: "The estate's walls contain exotic alloys no longer manufactured, and its structural supports use composite materials of exceptional durability. Your crew carefully extracts and catalogs these treasures, which will be invaluable for repairs and upgrades.",
                    resources: [
                        { type: 'scrap', amount: 50 }
                    ]
                }
            }
        ]
    },
    {
        id: uuidv4(),
        title: "Orbital Transit Hub",
        region: 'habitable',
        type: 'story',
        description: "Your ship approaches what was once a bustling transit station connecting orbital habitats to planetary surfaces. The massive structure slowly rotates, its docking arms extending like skeletal fingers into space. Portions of the station still have power, and you detect movements inside.",
        choices: [
            {
                id: uuidv4(),
                text: "Explore the station's command center",
                outcome: {
                    text: "The command center is remarkably intact, sealed off during the station's final hours by emergency protocols. You find navigation charts detailing safe passages through the debris field and archived transport schedules that reveal the locations of several forgotten outposts.",
                    resources: [
                        { type: 'insight', amount: 35 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Investigate the movements detected in the passenger terminals",
                outcome: {
                    text: "The terminals are inhabited by a small community of scavengers who've established a precarious existence here. After initial wariness, they trade information about nearby hazards for medical supplies and fresh food. They also offer you some of their salvaged materials as a goodwill gesture.",
                    resources: [
                        { type: 'scrap', amount: 25 },
                        { type: 'insight', amount: 15 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Salvage the station's power distribution network",
                outcome: {
                    text: "The station's power core uses advanced superconducting technology that has remained operational for centuries. Your engineers are able to carefully extract several key components and study the ingenious redundancy systems that kept it functioning despite catastrophic exterior damage.",
                    resources: [
                        { type: 'scrap', amount: 20 },
                        { type: 'energy', amount: 30 }
                    ]
                }
            }
        ]
    },
    {
        id: uuidv4(),
        title: "Research Archive",
        region: 'habitable',
        type: 'story',
        description: "Drifting at the edge of a debris field, you discover a cylindrical structure with distinctive radiation shielding. It appears to be an orbital research laboratory, its external markings indicating specialization in biological sciences. An automated distress signal still pulses weakly after all these centuries.",
        choices: [
            {
                id: uuidv4(),
                text: "Access the laboratory's data archives",
                outcome: {
                    text: "The archives contain extensive research on genetic adaptation techniques developed to help humans survive on marginally habitable worlds. Most files are corrupted, but you recover crucial information on efficient crop modifications and simplified terraforming methodologies that don't require advanced technology to implement.",
                    resources: [
                        { type: 'insight', amount: 40 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Investigate the specimen containment area",
                outcome: {
                    text: "Most containment units failed centuries ago, but a few emergency preservation chambers remain operational. Inside, you find carefully stored seed specimens of food crops engineered to grow in minimal light and poor soil conditions. These could be invaluable to struggling colonies.",
                    resources: [
                        { type: 'scrap', amount: 15 },
                        { type: 'insight', amount: 25 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Recover the laboratory's specialized equipment",
                outcome: {
                    text: "The laboratory contains advanced analytical instruments that have been preserved in sealed environments. Your crew carefully extracts compact genetic sequencers, molecular assemblers, and diagnostic tools that, while centuries old, represent technology superior to current equivalents.",
                    resources: [
                        { type: 'scrap', amount: 35 },
                        { type: 'energy', amount: 10 }
                    ]
                }
            }
        ]
    },

    // =====================
    // Fallen Worlds Encounters
    // =====================
    
    {
        id: uuidv4(),
        title: "Garden of Ruin",
        region: 'habitable',
        type: 'story',
        description: "Your ship orbits a planet once famous for its vast botanical preserves and biodomes. From space, you can see that some structures remain intact, their massive transparent domes now clouded and cracked. Many have collapsed entirely, spilling their contents across the landscape in strangely beautiful patterns of feral growth.",
        choices: [
            {
                id: uuidv4(),
                text: "Explore an intact biodome specialized in medicinal plants",
                outcome: {
                    text: "The biodome's environmental systems failed gradually, creating a unique transition ecosystem. Many of the medicinal plants adapted rather than died, evolving new properties. Your botanist identifies several species with enhanced pharmaceutical potential and collects samples along with the dome's research records on cultivation techniques.",
                    resources: [
                        { type: 'insight', amount: 30 },
                        { type: 'energy', amount: 10 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Salvage technology from the dome maintenance systems",
                outcome: {
                    text: "The domes were engineering marvels, with self-repairing materials and advanced environmental regulation. You recover sophisticated atmospheric processors, water filtration components, and parts of the automated cultivation system. Some equipment still functions after centuries, testament to the quality of its construction.",
                    resources: [
                        { type: 'scrap', amount: 45 },
                        { type: 'energy', amount: 5 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Contact the descendants of the botanical staff still living among the ruins",
                outcome: {
                    text: "A community of specialists has maintained a tenuous existence here for generations, preserving what knowledge they could of the botanical treasures. They share insights on sustainable agriculture techniques developed during centuries of adaptation. In exchange for repair components, they offer rare seeds from plants thought extinct elsewhere.",
                    resources: [
                        { type: 'insight', amount: 35 },
                        { type: 'energy', amount: -5 }
                    ]
                }
            }
        ]
    },
    {
        id: uuidv4(),
        title: "The Rationed Light",
        region: 'habitable',
        type: 'story',
        description: "Sensors detect unusually organized energy signatures from a planet whose terraforming was incomplete when civilization collapsed. Landing near the signal source, you discover a settlement centered around a massive solar energy collection array. The inhabitants maintain the ancient technology with religious devotion, rationing power like a sacred resource.",
        choices: [
            {
                id: uuidv4(),
                text: "Offer engineering expertise to improve their energy collection",
                outcome: {
                    text: "The settlement leaders cautiously accept your help. Your engineers identify numerous inefficiencies in their maintenance rituals, which have become more ceremonial than practical over generations. By implementing simple improvements and teaching basic principles, you increase their energy yield by 40%. In gratitude, they share their power storage technology, which uses innovative locally-sourced materials.",
                    resources: [
                        { type: 'energy', amount: 35 },
                        { type: 'insight', amount: 15 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Study their adapted agriculture that functions with minimal energy",
                outcome: {
                    text: "The settlement has developed remarkable low-energy cultivation methods, using plant varieties that photosynthesize efficiently under minimal light conditions. Their irrigation systems use gravity and capillary action rather than pumps, and they've bred livestock that thrive on low-nutrition feed. You document these sustainable approaches, recognizing their value beyond this world.",
                    resources: [
                        { type: 'insight', amount: 40 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Salvage materials from the abandoned sections of the collection array",
                outcome: {
                    text: "The settlement only maintains a portion of the original array, leaving vast sections to deteriorate. These abandoned panels and conduits contain valuable materials impossible to manufacture locally. As your crew begins extraction, you're confronted by a heavily-armed figure claiming to be the guardian of these 'sacred relics'. They demand you leave immediately or face consequences.",
                    combat: {
                        enemySubRegion: 'Fallen Worlds',
                        isBoss: false
                    }
                }
            }
        ]
    },
    {
        id: uuidv4(),
        title: "Adaptation Enclave",
        region: 'habitable',
        type: 'story',
        description: "Your expedition discovers a valley settlement on a world whose atmosphere has been slowly degrading since terraforming ceased. The inhabitants have biologically adapted over generations, developing larger lung capacity and enhanced oxygen absorption. Their society revolves around carefully preserving medical knowledge despite technological regression.",
        choices: [
            {
                id: uuidv4(),
                text: "Exchange medical information with their healer caste",
                outcome: {
                    text: "The healers welcome your medical knowledge and share their own specialized techniques. They've developed effective treatments using local flora, surgical procedures that require minimal technology, and genetic selection practices to enhance adaptive traits. Their anatomical knowledge is particularly advanced, focused on respiratory and cardiovascular modifications that help survival in their thinning atmosphere.",
                    resources: [
                        { type: 'insight', amount: 45 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Study their atmospheric processing technologies",
                outcome: {
                    text: "The enclave maintains ancient atmospheric processors that have been modified over centuries to operate with decreasing resources. They've created ingenious mechanical systems powered by wind and geothermal energy, supplementing the failing terraforming infrastructure. Their approach to atmospheric recycling within habitats uses principles applicable to ship life support systems.",
                    resources: [
                        { type: 'insight', amount: 25 },
                        { type: 'energy', amount: 20 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Trade modern manufactured goods for their adaptation records",
                outcome: {
                    text: "The enclave leaders are eager to acquire precision tools, standardized medical supplies, and digital storage media. In exchange, they provide comprehensive records of their physiological adaptations over generations, including detailed genetic analyses performed during their technological prime and preserved through their decline. This evolutionary data is a scientific treasure.",
                    resources: [
                        { type: 'insight', amount: 40 },
                        { type: 'energy', amount: -10 }
                    ]
                }
            }
        ]
    },

    // =====================
    // The Last Metropolis Encounters
    // =====================
    
    {
        id: uuidv4(),
        title: "Technological Bazaar",
        region: 'habitable',
        type: 'story',
        description: "The Last Metropolis dominates its planet's single habitable region—a sprawling urban expanse protected by ancient atmospheric shields. At its heart lies a vast marketplace where technology from across the fallen civilization changes hands. Knowledge is currency here, and artifice that still functions commands astronomical prices.",
        choices: [
            {
                id: uuidv4(),
                text: "Trade ship components for rare technological artifacts",
                outcome: {
                    text: "The bazaar merchants eagerly examine your relatively modern ship components. In exchange, you acquire several pre-collapse devices: a quantum encryption module, a miniaturized matter analyzer, and data crystals containing lost manufacturing techniques. These relics, though ancient, represent technology more advanced than current production capabilities.",
                    resources: [
                        { type: 'scrap', amount: -15 },
                        { type: 'insight', amount: 50 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Infiltrate the black market information brokers' network",
                outcome: {
                    text: "Through careful negotiation and strategic information sharing, you gain access to the brokers' inner circle. They trade in technical schematics, scientific data, and historical records considered too dangerous or valuable for public knowledge. You acquire coordinates to forgotten manufacturing facilities and research outposts that escaped the general collapse.",
                    resources: [
                        { type: 'insight', amount: 40 },
                        { type: 'energy', amount: 10 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Hire local technicians to perform specialized ship maintenance",
                outcome: {
                    text: "The Metropolis still maintains technical specialties long lost elsewhere. You hire artisans who service your propulsion system using techniques preserved from the civilization's height. They replace deteriorating components with custom-manufactured alternatives superior to standard replacements, and optimize systems that have been operating at reduced efficiency for years.",
                    resources: [
                        { type: 'scrap', amount: -30 },
                        { type: 'energy', amount: 40 }
                    ]
                }
            }
        ]
    },
    {
        id: uuidv4(),
        title: "Authority Complex",
        region: 'habitable',
        type: 'story',
        description: "The Metropolis's governing district rises above the urban sprawl, a cluster of imposing structures where the ruling technocrats maintain their power. Advanced defense systems and immaculate facades contrast sharply with the surrounding decay. Here, ancient technologies are hoarded rather than traded, and knowledge is closely guarded.",
        choices: [
            {
                id: uuidv4(),
                text: "Attempt to gain audience with a governing council member",
                outcome: {
                    text: "Through persistence and diplomatic skill, you secure a meeting with a junior council representative. They're surprisingly interested in information about the outside worlds, which the ruling class largely ignores. In exchange for your observations and data, they provide access to restricted archives containing valuable technological information the authorities have suppressed.",
                    resources: [
                        { type: 'insight', amount: 35 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Infiltrate the authority's power distribution center",
                outcome: {
                    text: "Your team successfully accesses the facility by posing as maintenance personnel. Inside, you discover that the Metropolis's remarkable power stability comes from a miniaturized fusion reactor of pre-collapse design. As you gather data, alarms suddenly blare - your intrusion has been detected. Security forces are mobilizing. You must decide quickly whether to fight your way out with the valuable data or abandon the mission.",
                    resources: [
                        { type: 'insight', amount: 15 }
                    ],
                    combat: {
                        enemySubRegion: 'The Last Metropolis',
                        isBoss: false
                    }
                }
            },
            {
                id: uuidv4(),
                text: "Negotiate a technology exchange with lower-ranking officials",
                outcome: {
                    text: "You identify officials dissatisfied with the ruling council's isolationist policies. They agree to a discreet exchange, providing restricted technical documentation and specialized components in return for your ship's sensor data about other regions. This mutually beneficial arrangement yields valuable assets without alerting the higher authorities.",
                    resources: [
                        { type: 'scrap', amount: 25 },
                        { type: 'insight', amount: 25 }
                    ]
                }
            }
        ]
    },
    {
        id: uuidv4(),
        title: "Undercity Archives",
        region: 'habitable',
        type: 'story',
        description: "Beneath the Metropolis's gleaming surface lies the Undercity, where the majority live in controlled squalor. Rumors lead you to a hidden knowledge collective—scholars and technicians who secretly preserve information the authorities consider dangerous. Their clandestine archive exists in a sprawling network of repurposed maintenance tunnels and forgotten infrastructure chambers.",
        choices: [
            {
                id: uuidv4(),
                text: "Exchange your ship's data for access to their forbidden archives",
                outcome: {
                    text: "The archivists eagerly accept your navigational data and observations from beyond their system. In return, they grant you access to technical repositories containing long-suppressed knowledge: efficient terraforming methods requiring minimal infrastructure, sustainable fusion principles, and biological adaptation techniques considered too radical by the governing authorities.",
                    resources: [
                        { type: 'insight', amount: 45 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Help repair their deteriorating data storage systems",
                outcome: {
                    text: "The archive's preservation technology is failing, with irreplaceable knowledge at risk. Your engineers assist in transferring data to more stable media and implementing redundant storage protocols. In gratitude, the archivists share their most valuable technical information, including schematics for efficient life support systems and sustainable resource extraction methods.",
                    resources: [
                        { type: 'scrap', amount: -10 },
                        { type: 'energy', amount: -5 },
                        { type: 'insight', amount: 40 }
                    ]
                }
            },
            {
                id: uuidv4(),
                text: "Recruit knowledgeable archivists to join your expedition",
                outcome: {
                    text: "Two senior archivists, dissatisfied with their limited impact in the restrictive Metropolis environment, agree to join your crew. They bring with them portable data stores containing valuable technical knowledge and rare historical context. Their expertise in adapting ancient technology to current limitations proves immediately valuable to your engineering team.",
                    resources: [
                        { type: 'energy', amount: -10 },
                        { type: 'insight', amount: 50 }
                    ]
                }
            }
        ]
    }
]; 