/**
 * Encounter content for the game
 * Contains region-specific encounter probabilities and flavor text
 */

import { RegionType, ResourceReward, StoryEncounter } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Chances of getting encounters in different regions
 */
export const REGION_ENCOUNTER_CHANCES: Record<string, { combat: number, empty: number, narrative: number }> = {
    [RegionType.VOID]: { combat: 0.5, empty: 0.2, narrative: 0.3 },
    [RegionType.BLACK_HOLE]: { combat: 0.6, empty: 0.1, narrative: 0.3 },
    [RegionType.ASTEROID_FIELD]: { combat: 0.5, empty: 0.2, narrative: 0.3 },
    [RegionType.HABITABLE_ZONE]: { combat: 0.4, empty: 0.3, narrative: 0.3 },
    [RegionType.SUPERNOVA]: { combat: 0.7, empty: 0.1, narrative: 0.2 }
};

/**
 * Empty encounter titles by region
 */
export const EMPTY_ENCOUNTER_TITLES: Record<RegionType, string[]> = {
    'void': [
        "Silent Vacuum",
        "Empty Expanse",
        "Quiet Sector",
        "Interstellar Drift",
        "Cosmic Silence"
    ],
    'blackhole': [
        "Event Horizon",
        "Gravity Well",
        "Spacetime Distortion",
        "Singularity's Edge",
        "Temporal Anomaly"
    ],
    'asteroid': [
        "Rocky Passage",
        "Mineral Wealth",
        "Silent Stones",
        "Debris Field",
        "Floating Giants"
    ],
    'habitable': [
        "Stellar Garden",
        "Life-Bearing Zone",
        "Planetary Sanctuary",
        "Eden Sector",
        "Verdant Orbit"
    ],
    'supernova': [
        "Stellar Remnant",
        "Cosmic Furnace",
        "Star's Grave",
        "Fusion Aftermath",
        "Stellar Ash"
    ]
};

/**
 * Empty encounter descriptions by region
 */
export const EMPTY_ENCOUNTER_DESCRIPTIONS: Record<RegionType, string[]> = {
    'void': [
        "Your ship drifts through an unremarkable sector of space. Sensors indicate nothing of significance in the vicinity.",
        "The emptiness of space stretches out in all directions. This sector appears to be devoid of noteworthy phenomena.",
        "A quiet region where little happens. The background radiation is slightly higher than normal, but otherwise unremarkable.",
        "Stars glitter distantly as you traverse this empty section of void. The sensors remain quiet, detecting no threats or opportunities."
    ],
    'blackhole': [
        "Your ship skirts the edge of the black hole's influence, where light bends and time dilates perceptibly.",
        "The accretion disk glows with intense radiation as matter spirals toward the event horizon, creating a hypnotic visual display.",
        "Spacetime warps around the massive gravitational well, creating strange visual distortions that challenge perception.",
        "Light bends eerily around the black hole, creating phantom images of distant stars and galaxies as you carefully maintain a safe distance."
    ],
    'asteroid': [
        "Your ship navigates through a field of tumbling space rocks. Some appear to contain valuable minerals worth investigating.",
        "Several large asteroids float peacefully in this sector. Long-range scanners detect metal deposits in some of them.",
        "A collection of space rocks tumble slowly through the void. They appear to be the remnants of a larger celestial body.",
        "The ship's navigation system plots a safe course through the densely packed rocks, identifying potential mining opportunities."
    ],
    'habitable': [
        "The gentle light of a stable star bathes nearby planets with perfect conditions for life to flourish.",
        "Lush green and blue worlds orbit at the perfect distance from their star, teeming with ecological diversity.",
        "Your scanners detect multiple planets with oxygen-rich atmospheres and abundant water in this stable stellar zone.",
        "The conditions here are perfect for life - planets orbit in the sweet spot between too hot and too cold, with atmospheres perfect for organic development."
    ],
    'supernova': [
        "The shattered remains of a once-mighty star spread across this sector, still glowing with residual energy.",
        "Waves of superheated gas and exotic particles wash over your shields as you navigate through the stellar graveyard.",
        "The aftermath of stellar death surrounds your ship, beautiful yet deadly with radiation and gravitational anomalies.",
        "Brilliant colors illuminate the cosmos where the star exploded, leaving behind a nebula of stellar debris and intense energy."
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
    'blackhole': [
        "Time slows perceptibly as you navigate near the event horizon. Your sensors struggle to make sense of the warped physics.",
        "The black hole's gravitational pull tugs gently at your ship, requiring constant course corrections to maintain a safe orbit.",
        "Strange quantum fluctuations appear on your sensors. The black hole's gravity well distorts space into impossible geometries.",
        "The accretion disk of the black hole glows with ethereal beauty, matter spiraling inward toward the event horizon in a cosmic light show.",
        "Your ship's AI reports unusual mathematical patterns in the space-time distortions surrounding you. There seems to be an order to the chaos."
    ],
    'asteroid': [
        "You navigate between floating rocks of various sizes. They tumble silently in the void, ancient witnesses to the solar system's formation.",
        "A small asteroid passes harmlessly by your ship. Surface scans reveal a composition rich in rare elements and minerals.",
        "Your scanners detect valuable minerals in nearby asteroids. With more time, this area could yield substantial mining returns.",
        "The asteroid field is sparse enough to navigate safely, yet dense enough to shield you from long-range scans. A good place to catch your breath.",
        "Crystalline formations glint on the surface of nearby asteroids, reflecting starlight like a field of cosmic diamonds."
    ],
    'habitable': [
        "Lush planetary bodies orbit in the perfect zone for life to flourish. The vibrant colors of vegetation are visible even from orbit.",
        "A gentle star provides ideal conditions for the planets in this zone. Sensors detect water oceans, oxygen atmospheres, and complex ecosystems.",
        "This region reminds the crew of Earth - temperate worlds orbit at the perfect distance from their star, with conditions ideal for human settlement.",
        "Scans reveal planets with diverse biospheres - from ocean worlds to forest planets. The conditions here could support colonization efforts.",
        "The habitable planets in this zone appear untouched by advanced civilization, preserving pristine ecosystems that evolved in perfect isolation."
    ],
    'supernova': [
        "The shockwave of the supernova has long passed, but the region still teems with radiation and exotic particles.",
        "What was once a massive star is now a brilliant nebula of gas and dust, gradually cooling and dispersing into the void.",
        "The sensors register intense radiation and magnetic fields - the aftereffects of stellar death that will linger for millennia.",
        "Elements forged in the heart of the supernova float through space - the building blocks of future planets and perhaps even life.",
        "The supernova remnant glows in spectacular colors, illuminating the surrounding space with the final legacy of a dead star."
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
    const resourceMessages: Record<string, Partial<Record<string, string[]>>> = {
        void: {
            energy: [
                "Your sensors detected trace amounts of energy residue, allowing for a small collection.",
                "The Dawn's energy collectors captured stray particles from the void.",
                "A small energy fluctuation in the void provided a minor boost to ship systems."
            ],
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
        habitable: {
            insight: [
                "Scans of diverse planetary ecosystems yielded valuable biological data.",
                "Analysis of habitable zone atmospheric compositions expanded scientific understanding.",
                "Observations of evolving life forms provided insights into planetary development."
            ],
            crew: [
                "A small settlement on one of the habitable moons agreed to send a volunteer to join your mission.",
                "A stranded explorer was rescued from a habitable world and joined your crew.",
                "A curious native with valuable knowledge of this region requested passage on your vessel."
            ],
            energy: [
                "Solar collectors achieved peak efficiency in this perfectly positioned stellar region.",
                "Atmospheric harvesting from a gas giant yielded substantial energy resources.",
                "The balanced radiation from the nearby star charged your collectors to capacity."
            ]
        },
        supernova: {
            insight: [
                "Analysis of the supernova remnant provided valuable astrophysical data.",
                "The Dawn's scientific instruments recorded rare nuclear processes occurring in the stellar debris.",
                "Scans of the supernova aftermath revealed previously unknown stellar phenomena."
            ],
            energy: [
                "Residual energy from the stellar explosion was captured by your collectors.",
                "Highly charged particles from the supernova remnant were harvested for power.",
                "The intense radiation field surrounding the stellar remnant provided abundant energy."
            ],
            scrap: [
                "Heavy elements forged in the supernova were collected from the debris field.",
                "Rare metals formed during stellar death were added to your material reserves.",
                "Elements only created in stellar explosions were harvested from the remnant cloud."
            ]
        }
    };

    // Get a random message for a given resource type and region
    const getRandomMessage = (region: string, type: string): string => {
        const messagesForRegion = resourceMessages[region] || {};
        const messagesForType = messagesForRegion[type] || [];
        
        if (messagesForType.length === 0) {
            return `The Dawn collected ${type} resources from the ${region} region.`;
        }
        
        return messagesForType[Math.floor(Math.random() * messagesForType.length)];
    };
    
    // Different regions provide different resources and amounts
    switch(region) {
        case RegionType.VOID:
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 5) + 1,
                    message: getRandomMessage('void', 'energy')
                });
            }
            break;
        case RegionType.BLACK_HOLE:
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
        case RegionType.ASTEROID_FIELD:
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
        case RegionType.HABITABLE_ZONE:
            if (Math.random() < 0.6) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 5) + 3,
                    message: getRandomMessage('habitable', 'insight')
                });
            }
            if (Math.random() < 0.4) {
                rewards.push({ 
                    type: 'crew', 
                    amount: Math.random() < 0.3 ? 1 : 0,
                    message: Math.random() < 0.3 ? getRandomMessage('habitable', 'crew') : undefined
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage('habitable', 'energy')
                });
            }
            break;
        case RegionType.SUPERNOVA:
            if (Math.random() < 0.7) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage('supernova', 'insight')
                });
            }
            if (Math.random() < 0.5) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 15) + 10,
                    message: getRandomMessage('supernova', 'energy')
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'scrap', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage('supernova', 'scrap')
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