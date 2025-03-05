/**
 * Encounter content for the game
 * Contains region-specific encounter probabilities and flavor text
 */

import { RegionType, ResourceReward, StoryEncounter } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Chances of getting encounters in different regions
 */
export const REGION_ENCOUNTER_CHANCES: Record<RegionType, { combat: number, empty: number, narrative: number }> = {
    'void': { combat: 0.5, empty: 0.05, narrative: 0.45 },
    'nebula': { combat: 0.3, empty: 0.5, narrative: 0.2 },
    'asteroid': { combat: 0.5, empty: 0.3, narrative: 0.2 },
    'deepspace': { combat: 0.7, empty: 0.2, narrative: 0.1 },
    'blackhole': { combat: 0.9, empty: 0.05, narrative: 0.05 }
};

/**
 * Empty encounter titles by region
 */
export const EMPTY_ENCOUNTER_TITLES: Record<RegionType, string[]> = {
    'void': [
        "Silent Vacuum",
        "Empty Expanse",
        "Quiet Sector"
    ],
    'nebula': [
        "Colorful Mists",
        "Stellar Nursery",
        "Cosmic Clouds"
    ],
    'asteroid': [
        "Rocky Passage",
        "Mineral Wealth",
        "Silent Stones"
    ],
    'deepspace': [
        "Vast Emptiness",
        "Interstellar Medium",
        "Cosmic Void"
    ],
    'blackhole': [
        "Gravity Well",
        "Event Horizon",
        "Time Anomaly"
    ]
};

/**
 * Empty encounter descriptions by region
 */
export const EMPTY_ENCOUNTER_DESCRIPTIONS: Record<RegionType, string[]> = {
    'void': [
        "Your ship drifts through an unremarkable sector of space. Sensors indicate nothing of significance in the vicinity.",
        "The emptiness of space stretches out in all directions. This sector appears to be devoid of noteworthy phenomena.",
        "A quiet region where little happens. The background radiation is slightly higher than normal, but otherwise unremarkable."
    ],
    'nebula': [
        "The ship passes through a region of colorful gas clouds. Stellar formations cast beautiful patterns of light through the mist.",
        "This part of the nebula contains ionized gases that create a spectacular light show as your ship passes through them.",
        "Swirling clouds of cosmic dust and gas create an otherworldly landscape. Your sensors struggle to penetrate the dense matter."
    ],
    'asteroid': [
        "Your ship navigates through a field of small asteroids. Some appear to contain valuable minerals worth investigating.",
        "Several large asteroids float peacefully in this sector. Long-range scanners detect metal deposits in some of them.",
        "A collection of space rocks tumble slowly through the void. They appear to be the remnants of a larger celestial body."
    ],
    'deepspace': [
        "The ship travels through the vast darkness between stars. Distant galaxies are visible as mere pinpricks of light.",
        "This region of space is particularly empty, far from any stellar body. It's an eerie reminder of the universe's vastness.",
        "Long-range sensors detect nothing but the cosmic microwave background in this remote region between star systems."
    ],
    'blackhole': [
        "Your ship's sensors detect the immense gravitational distortions of a nearby black hole, though you maintain a safe distance.",
        "Time itself seems to flow differently as you pass near the black hole's influence. The view outside is distorted by gravitational lensing.",
        "The black hole's event horizon creates strange visual effects. Matter being drawn in forms a distant, beautiful accretion disk."
    ]
};

/**
 * Empty encounter messages by region - more detailed and atmospheric
 */
export const EMPTY_ENCOUNTER_MESSAGES: Record<RegionType, string[]> = {
    'void': [
        "The void is quiet. You find nothing of particular interest, but the empty space gives the crew a moment to reflect on their journey.",
        "Empty space stretches in all directions. The stars seem distant and cold, yet there's a strange comfort in the solitude.",
        "Your sensors detect no anomalies in this sector. The ship's systems hum quietly as you drift through the vacuum.",
        "The ship's chronometer ticks steadily as you pass through this unremarkable region. Sometimes, uneventful moments are a blessing.",
        "Complete silence fills the bridge as you gaze out at the stars. In this moment of peace, the mission's purpose feels renewed."
    ],
    'nebula': [
        "Colorful gases swirl around your ship as you navigate through the nebula. The spectacle provides a much-needed morale boost to the crew.",
        "The nebula's radiation interferes with your sensors, but no threats are detected. The cosmic light show outside the viewports is breathtaking.",
        "You pass through a particularly dense cloud of stellar dust. For a moment, it seems as if the ship is flying through a multi-colored dream.",
        "Electric blue and purple wisps of ionized gas caress the hull as you pass. Some crew members swear they can hear the nebula 'singing' through the ship's frame.",
        "The nebula's gases reflect and refract starlight, turning your surroundings into a cathedral of cosmic light and color."
    ],
    'asteroid': [
        "You navigate between floating rocks of various sizes. They tumble silently in the void, ancient witnesses to the solar system's formation.",
        "A small asteroid passes harmlessly by your ship. Surface scans reveal a composition rich in rare elements.",
        "Your scanners detect valuable minerals in nearby asteroids. With more time, this area could be worth mining.",
        "The asteroid field is sparse enough to navigate safely, yet dense enough to shield you from long-range scans. A good place to catch your breath.",
        "Crystalline formations glint on the surface of nearby asteroids, reflecting starlight like a field of cosmic diamonds."
    ],
    'deepspace': [
        "The vast emptiness of deep space surrounds your ship. Out here, between the stars, the universe feels impossibly large.",
        "You detect the faint signals of distant stars. In this profound isolation, the crew finds a moment of quiet contemplation.",
        "Your ship drifts through the cosmic void without incident. The silence of deep space is both terrifying and comforting.",
        "Out here, far from any star system, the darkness is nearly complete. Only the distant galaxies provide any light to navigate by.",
        "The ship's hull creaks slightly as it adjusts to the perfect vacuum of deep space. Some crew members claim to hear whispers in those sounds."
    ],
    'blackhole': [
        "The gravitational pull of the black hole tugs gently at your ship. Time seems to flow differently in its presence.",
        "Time seems to slow as you navigate near the event horizon. The laws of physics bend in ways that challenge comprehension.",
        "Strange quantum fluctuations appear on your sensors. The black hole's gravity well distorts light into impossible patterns.",
        "The accretion disk of the black hole glows with ethereal beauty. Matter spirals inward toward the event horizon, creating a cosmic light show.",
        "Your ship's AI reports unusual mathematical patterns in the space-time distortions surrounding you. There seems to be an order in the chaos."
    ]
};

/**
 * Helper function to get a random title for an empty encounter
 */
export function getRandomEmptyEncounterTitle(region: RegionType): string {
    const titles = EMPTY_ENCOUNTER_TITLES[region];
    return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Helper function to get a random description for an empty encounter
 */
export function getRandomEmptyEncounterDescription(region: RegionType): string {
    const descriptions = EMPTY_ENCOUNTER_DESCRIPTIONS[region];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * Helper function to get a random message for an empty encounter
 */
export function getRandomEmptyEncounterMessage(region: RegionType): string {
    const messages = EMPTY_ENCOUNTER_MESSAGES[region];
    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Helper function to generate a resource reward appropriate for the region
 */
export function generateEmptyEncounterRewards(region: RegionType): ResourceReward[] {
    const rewards: ResourceReward[] = [];
    
    // Define resource messages by type and region
    const resourceMessages: Record<RegionType, Partial<Record<string, string[]>>> = {
        void: {
            energy: [
                "Your sensors detected trace amounts of energy residue, allowing for a small collection.",
                "The Dawn's energy collectors captured stray particles from the void.",
                "A small energy fluctuation in the void provided a minor boost to ship systems."
            ],
        },
        nebula: {
            energy: [
                "The nebula's ionized gases infused the Dawn's collectors with energy.",
                "Energy discharge from the nebula's star formation yielded valuable power.",
                "The ship's energy arrays harvested photonic radiation from the surrounding nebula."
            ],
            insight: [
                "Analysis of the nebula's unique composition yielded valuable scientific data.",
                "The Dawn's sensors cataloged previously unknown stellar phenomena.",
                "Atmospheric scans of the nebula revealed patterns worthy of further study."
            ]
        },
        asteroid: {
            scrap: [
                "Mineral-rich fragments were collected from nearby asteroids.",
                "The Dawn's automated collectors harvested valuable ore deposits.",
                "A successful mining operation yielded substantial material resources."
            ],
            energy: [
                "Specialized collectors siphoned energy from highly charged asteroid fragments.",
                "Radioactive elements in the asteroid field provided harvestable energy.",
                "The ship's systems absorbed kinetic energy from microimpacts in the field."
            ]
        },
        deepspace: {
            insight: [
                "Long-range scans captured data from distant celestial bodies.",
                "The vast emptiness of deep space allowed for clear astronomical observations.",
                "Cosmic background radiation analysis yielded valuable scientific insights."
            ],
            crew: [
                "A derelict escape pod with a survivor was found drifting in the void.",
                "Long-range communication established contact with a stranded crewmember.",
                "A stasis pod with a hibernating crew member was recovered from debris."
            ]
        },
        blackhole: {
            insight: [
                "Observations of the black hole's event horizon provided unprecedented data.",
                "Gravitational analysis of the singularity granted revolutionary scientific understanding.",
                "The Dawn's sensors captured exotic particle emissions from the black hole."
            ],
            energy: [
                "The ship's collectors harvested hawking radiation from the black hole's periphery.",
                "Gravitational slingshot around the black hole's mass generated substantial power.",
                "Energy was extracted from the intense radiation surrounding the singularity."
            ],
            scrap: [
                "Dense material clusters trapped in the black hole's orbit were salvaged.",
                "Wreckage from unfortunate vessels was recovered from the gravity well.",
                "Exotic metals compressed by gravitational forces were collected for use."
            ]
        }
    };

    // Get a random message for a given resource type and region
    const getRandomMessage = (region: RegionType, type: string): string => {
        const messagesForRegion = resourceMessages[region] || {};
        const messagesForType = messagesForRegion[type] || [];
        
        if (messagesForType.length === 0) {
            return `The Dawn collected ${type} resources from the ${region} region.`;
        }
        
        return messagesForType[Math.floor(Math.random() * messagesForType.length)];
    };
    
    // Different regions provide different resources and amounts
    switch(region) {
        case 'void':
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 5) + 1,
                    message: getRandomMessage('void', 'energy')
                });
            }
            break;
        case 'nebula':
            if (Math.random() < 0.4) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage('nebula', 'energy')
                });
            }
            if (Math.random() < 0.2) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 3) + 1,
                    message: getRandomMessage('nebula', 'insight')
                });
            }
            break;
        case 'asteroid':
            if (Math.random() < 0.5) {
                rewards.push({ 
                    type: 'scrap', 
                    amount: Math.floor(Math.random() * 15) + 5,
                    message: getRandomMessage('asteroid', 'scrap')
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 8) + 3,
                    message: getRandomMessage('asteroid', 'energy')
                });
            }
            break;
        case 'deepspace':
            if (Math.random() < 0.6) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 5) + 3,
                    message: getRandomMessage('deepspace', 'insight')
                });
            }
            if (Math.random() < 0.4) {
                rewards.push({ 
                    type: 'crew', 
                    amount: Math.random() < 0.2 ? 1 : 0,
                    message: Math.random() < 0.2 ? getRandomMessage('deepspace', 'crew') : undefined
                });
            }
            break;
        case 'blackhole':
            if (Math.random() < 0.7) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage('blackhole', 'insight')
                });
            }
            if (Math.random() < 0.5) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 15) + 10,
                    message: getRandomMessage('blackhole', 'energy')
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'scrap', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage('blackhole', 'scrap')
                });
            }
            break;
    }
    
    return rewards;
}

/**
 * Story encounter data organized by region
 */
export const STORY_ENCOUNTERS: Record<RegionType, StoryEncounter[]> = {
    'void': [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Mysterious Signal',
            description: 'Your sensors detect a faint distress signal coming from a nearby debris field. The signal appears to be automated, repeating on an old frequency not commonly used anymore.',
            region: 'void',
            choices: [
                {
                    id: uuidv4(),
                    text: 'Investigate the signal',
                    outcome: {
                        resources: [{ type: 'scrap', amount: 15, message: 'You salvaged valuable components from the wreckage.' }],
                        text: 'You navigate through the debris field and discover the remnants of an old scout ship. While the crew is long gone, you manage to salvage some valuable components before departing.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Ignore it and continue on your course',
                    outcome: {
                        text: 'You decide the risk isn\'t worth it and continue on your original course. The signal gradually fades as you move away from the debris field.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Scan the area thoroughly before approaching',
                    outcome: {
                        resources: [{ type: 'insight', amount: 10, message: 'The detailed analysis yielded valuable data.' }],
                        text: 'Your thorough scan reveals that the signal is emanating from an old emergency beacon. While there doesn\'t appear to be anything of physical value, the data you extract from the beacon provides useful insights about this region of space.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ],
    'nebula': [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Luminous Anomaly',
            description: 'As you traverse the nebula, you encounter a pulsating area of unusual luminosity. Your sensors indicate high energy readings, but also potential radiation hazards.',
            region: 'nebula',
            choices: [
                {
                    id: uuidv4(),
                    text: 'Collect energy samples',
                    outcome: {
                        resources: [{ type: 'energy', amount: 25, message: 'The energy collection was successful despite the risks.' }],
                        text: 'You carefully navigate to the edge of the luminous area and extend your collection arrays. Despite some minor radiation exposure to your outer hull, you successfully harvest a significant amount of energy.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Study from a safe distance',
                    outcome: {
                        resources: [{ type: 'insight', amount: 15, message: 'The phenomenon yielded valuable scientific data.' }],
                        text: 'You maintain a safe distance while conducting detailed scans of the phenomenon. The data collected will be valuable for understanding nebula dynamics and potentially identifying similar energy-rich regions in the future.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Plot a course around the anomaly',
                    outcome: {
                        text: 'You decide that the potential risks outweigh any benefits and carefully navigate around the luminous area. While you gain no immediate resources, your cautious approach ensures the safety of your crew and vessel.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ],
    'asteroid': [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Mining Operation Remnants',
            description: 'You come across what appears to be an abandoned mining operation on a medium-sized asteroid. Equipment has been left behind, though it\'s unclear how long ago the site was abandoned.',
            region: 'asteroid',
            choices: [
                {
                    id: uuidv4(),
                    text: 'Salvage the mining equipment',
                    outcome: {
                        resources: [{ type: 'scrap', amount: 30, message: 'The abandoned equipment provided significant salvage materials.' }],
                        text: 'You dock with the asteroid and send a team to dismantle and retrieve the abandoned mining equipment. It\'s old but still valuable as scrap material that can be repurposed for your ship\'s needs.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Look for any remaining mineral deposits',
                    outcome: {
                        resources: [
                            { type: 'energy', amount: 10, message: 'You found some energy crystals in the deeper tunnels.' },
                            { type: 'scrap', amount: 5, message: 'You also collected some loose metal fragments.' }
                        ],
                        text: 'You explore the mining tunnels and discover that while most valuable deposits were extracted, the miners missed some smaller veins deeper in the asteroid. You spend some time extracting what remains before continuing your journey.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Search for clues about what happened to the miners',
                    outcome: {
                        resources: [{ type: 'insight', amount: 20, message: 'The logs contained valuable information about this sector.' }],
                        text: 'You find the operations center and manage to recover some of the site logs. It appears the operation was abandoned due to corporate bankruptcy rather than any danger. The navigation and survey data you recover provides valuable insights about this asteroid field.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ],
    'deepspace': [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Derelict Research Vessel',
            description: 'Your long-range sensors detect a drifting vessel in the void of deep space. Initial scans indicate it\'s a research vessel that lost power several years ago. There are no life signs aboard.',
            region: 'deepspace',
            choices: [
                {
                    id: uuidv4(),
                    text: 'Board the vessel to search for valuable technology',
                    outcome: {
                        resources: [
                            { type: 'scrap', amount: 20, message: 'You salvaged useful components from the ship systems.' },
                            { type: 'insight', amount: 15, message: 'The research data was partially recoverable.' }
                        ],
                        text: 'Your boarding party explores the derelict vessel, finding it in surprisingly good condition despite years of abandonment. You manage to salvage some advanced components and partial research data before returning to your ship and continuing your journey.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Attempt to remotely access their computer systems',
                    outcome: {
                        resources: [{ type: 'insight', amount: 30, message: 'You successfully extracted the complete research database.' }],
                        text: 'Rather than risking a boarding operation, you establish a remote connection to the vessel\'s systems. After bypassing several security measures, you manage to download their complete research database, which contains valuable scientific insights.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Tow the vessel to the nearest station for a salvage bounty',
                    outcome: {
                        resources: [{ type: 'energy', amount: -10, message: 'The towing operation consumed some energy reserves.' }],
                        text: 'You decide to attach tow cables and bring the vessel to the nearest station for a proper salvage operation. Unfortunately, the nearest station is farther than expected, and the towing operation consumes some of your energy reserves without immediate compensation.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ],
    'blackhole': [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Gravitational Lens Observatory',
            description: 'You discover the remains of a scientific outpost positioned to use the black hole as a gravitational lens for deep space observation. The facility appears to have been hastily evacuated.',
            region: 'blackhole',
            choices: [
                {
                    id: uuidv4(),
                    text: 'Recover the observational data',
                    outcome: {
                        resources: [{ type: 'insight', amount: 40, message: 'The astronomical data is extremely valuable.' }],
                        text: 'You manage to extract the storage drives containing years of observational data. This information provides exceptional insights into distant cosmic phenomena that would be impossible to observe without the black hole\'s gravitational lensing effect.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Salvage the advanced scientific equipment',
                    outcome: {
                        resources: [
                            { type: 'scrap', amount: 25, message: 'The specialized equipment contained valuable materials.' },
                            { type: 'energy', amount: 15, message: 'You salvaged some power cells that were still charged.' }
                        ],
                        text: 'You carefully dismantle and retrieve the specialized observation equipment. The advanced materials and components will be valuable for upgrades to your own systems, and you even find some auxiliary power cells that still hold a charge.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Use the observatory\'s position for your own observations',
                    outcome: {
                        resources: [{ type: 'insight', amount: 20, message: 'Your brief observations yielded interesting data.' }],
                        text: 'Rather than salvaging, you temporarily power up the observatory\'s systems and conduct your own observations through the gravitational lens. The brief session provides some valuable insights before you move on.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ]
};

// Helper function to get a generic fallback encounter for regions without specific content
export function getGenericStoryEncounter(region: RegionType): StoryEncounter {
    return {
        id: uuidv4(),
        type: 'story',
        title: 'Strange Encounter',
        description: 'As you navigate through this region, you encounter something unusual that catches your attention.',
        region,
        choices: [
            {
                id: uuidv4(),
                text: 'Investigate closely',
                outcome: {
                    resources: [{ type: 'insight', amount: 10, message: 'Your curiosity was rewarded with new knowledge.' }],
                    text: 'Your curiosity leads you to investigate more closely, yielding some interesting insights before you continue on your journey.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Observe from a distance',
                outcome: {
                    text: 'You decide to observe from a safe distance, gathering what information you can before resuming your course.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Ignore and continue on your path',
                outcome: {
                    text: 'You decide that whatever it is doesn\'t warrant further attention and continue on your planned route without delay.',
                    continuesToNextEncounter: true
                }
            }
        ]
    };
} 