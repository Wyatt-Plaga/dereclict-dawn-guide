/**
 * Encounter content for the game
 * Contains region-specific encounter probabilities and flavor text
 */

import { ResourceReward, StoryEncounter } from '../types';
import { RegionType } from '../types/combat';
import { v4 as uuidv4 } from 'uuid';

/**
 * Chances of getting encounters in different regions
 */
export const REGION_ENCOUNTER_CHANCES: Record<RegionType, { combat: number, empty: number, narrative: number }> = {
    [RegionType.VOID]: { combat: 0.5, empty: 0.2, narrative: 0.3 },
    [RegionType.BLACK_HOLE]: { combat: 0.6, empty: 0.1, narrative: 0.3 },
    [RegionType.ASTEROID_FIELD]: { combat: 0.5, empty: 0.2, narrative: 0.3 },
    [RegionType.HABITABLE_ZONE]: { combat: 0.4, empty: 0.3, narrative: 0.3 },
    [RegionType.SUPERNOVA]: { combat: 0.7, empty: 0.1, narrative: 0.2 },
    [RegionType.ANOMALY]: { combat: 0.8, empty: 0.1, narrative: 0.1 }
};

/**
 * Empty encounter titles by region
 */
export const EMPTY_ENCOUNTER_TITLES: Record<RegionType, string[]> = {
    [RegionType.VOID]: [
        "Silent Vacuum",
        "Empty Space",
        "Stellar Void",
        "Deep Space",
        "Quiet Sector"
    ],
    [RegionType.BLACK_HOLE]: [
        "Gravitational Anomaly",
        "Light's End",
        "Event Horizon",
        "Space-Time Distortion",
        "Singularity"
    ],
    [RegionType.ASTEROID_FIELD]: [
        "Drifting Rocks",
        "Mineral Field",
        "Debris Cluster",
        "Resource Belt",
        "Floating Giants"
    ],
    [RegionType.HABITABLE_ZONE]: [
        "Stellar Garden",
        "Life-Bearing Zone",
        "Planetary Sanctuary",
        "Temperate System",
        "Goldilocks Orbit"
    ],
    [RegionType.SUPERNOVA]: [
        "Stellar Remnant",
        "Energy Cascade",
        "Radiation Cloud",
        "Shattered Star",
        "Cosmic Explosion"
    ],
    [RegionType.ANOMALY]: [
        "Quantum Distortion",
        "Reality Fracture",
        "Dimensional Rift",
        "Strange Phenomenon",
        "Unknown Manifestation"
    ]
};

/**
 * Empty encounter descriptions by region
 */
export const EMPTY_ENCOUNTER_DESCRIPTIONS: Record<RegionType, string[]> = {
    [RegionType.VOID]: [
        "Your ship drifts through an unremarkable sector of space. Sensors indicate nothing of significance in the vicinity.",
        "The emptiness of space stretches in all directions. This region appears to be devoid of any notable features.",
        "A quiet section of void space. There are no celestial bodies or phenomena of interest within scanning range.",
        "This area of space contains nothing but distant stars. Your sensors detect no immediate points of interest.",
        "You've entered a region of empty space. According to your navigation system, there are no significant objects nearby."
    ],
    [RegionType.BLACK_HOLE]: [
        "The gravitational pull of a distant black hole warps the surrounding space, but you maintain a safe distance.",
        "Your sensors detect the telltale signs of a black hole in this region, though it poses no immediate threat at this distance.",
        "Light bends strangely in this region due to the presence of a massive singularity nearby. Your navigation systems compensate automatically.",
        "The black hole's accretion disk glows faintly in the distance, a beautiful yet deadly cosmic phenomenon.",
        "Space itself seems to curve around you, a reminder of the massive gravitational force of the black hole in this region."
    ],
    [RegionType.ASTEROID_FIELD]: [
        "Your ship navigates through a sparse section of the asteroid field. The nearby rocks pose no immediate threat.",
        "A relatively clear path through the asteroid field. Your sensors detect potential mining opportunities in the vicinity.",
        "This area of the asteroid belt is less dense than others, allowing for safer passage.",
        "Small rocky bodies drift lazily around your ship. None are on a collision course or contain particularly valuable minerals.",
        "The ship's navigation system plots a safe course through the densely packed rocks, identifying potential mining opportunities."
    ],
    [RegionType.HABITABLE_ZONE]: [
        "The gentle light of a stable star bathes nearby planets with perfect conditions for life to flourish.",
        "Lush green and blue worlds orbit at the perfect distance from their star, teeming with ecological diversity.",
        "Your scanners detect multiple planets with oxygen-rich atmospheres and abundant water in this stable stellar zone.",
        "This system contains planets in the habitable zone, where conditions are just right for supporting complex life forms.",
        "A series of planets orbit within the life-supporting band around a stable star, showcasing a variety of biomes and ecosystems."
    ],
    [RegionType.SUPERNOVA]: [
        "Waves of stellar material from a recent supernova wash through this region, creating beautiful luminescent patterns.",
        "The aftermath of a stellar explosion has filled this area with superheated gas and radiation. Your shields provide adequate protection.",
        "This region bears the marks of a star that violently ended its life, scattering its elements across hundreds of light years.",
        "The supernova remnant glows with an eerie beauty, as radiation interacts with the ship's shields creating a spectacular light show.",
        "Sensors detect unusual element formations created in the extreme heat and pressure of the supernova that shaped this region."
    ],
    [RegionType.ANOMALY]: [
        "Reality seems to fluctuate in this strange region. Standard physics calculations require constant recalibration.",
        "Your sensors detect quantum irregularities that defy conventional analysis. This region appears to operate under altered physical laws.",
        "The fabric of spacetime exhibits unusual properties here. Navigation systems report occasional unexplainable readings.",
        "This sector represents a true anomaly - phenomena observed here have no explanation in current scientific understanding.",
        "Your ship's systems register periodic fluctuations in background radiation and gravitational constants unique to this region."
    ]
};

/**
 * Empty encounter messages by region - more detailed and atmospheric
 */
export const EMPTY_ENCOUNTER_MESSAGES: Record<RegionType, string[]> = {
    [RegionType.VOID]: [
        "The void is quiet. You find nothing of particular interest, but the empty space gives the crew a moment to reflect on their journey.",
        "Stars twinkle in the distance, but this area of space is otherwise unremarkable. The ship's systems run a routine diagnostic during the calm passage.",
        "The emptiness of space surrounds you. No contacts on sensors, no anomalous readings. Just the gentle hum of the ship's systems as you drift through the void.",
        "This region of space is particularly empty, even by void standards. The crew takes the opportunity to perform maintenance on systems that cannot be serviced during more eventful encounters.",
        "An unremarkable patch of vacuum. The navigator updates the star charts with minor corrections based on the clear view of distant constellations."
    ],
    [RegionType.BLACK_HOLE]: [
        "The black hole's gravity well distorts your sensors, but your algorithms compensate automatically. The phenomenon remains at a safe distance.",
        "Time dilation effects become noticeable as you skirt the edges of the black hole's influence. The crew reports experiencing the passage of time slightly differently throughout the ship.",
        "The accretion disk of the black hole provides a spectacular view. The matter spiraling into oblivion releases energy that your sensors collect valuable data on.",
        "Light bends around you in impossible ways, creating mirror images of distant stars. Your navigation system uses these gravitational lensing effects to refine its positioning algorithms.",
        "The immense gravity of the black hole tugs gently at your ship, but poses no danger at this distance. The engineering team observes how the structural integrity field responds to the gravitational gradients."
    ],
    [RegionType.ASTEROID_FIELD]: [
        "The ship weaves effortlessly between floating rocks. Your navigation system identifies several asteroids with unusual mineral compositions, though none valuable enough to warrant stopping.",
        "A peaceful section of the asteroid field where rocks drift serenely through the void. The occasional ping of micro-debris against your shields is the only indication of the potential dangers lurking elsewhere in the field.",
        "Your sensors map the surrounding asteroids, adding the data to your navigational charts. This information may prove useful for future journeys through this sector.",
        "The surrounding asteroids tumble slowly through space, some bearing the marks of previous mining operations long abandoned. There is nothing of immediate value here.",
        "Crystalline formations glint on the surface of nearby asteroids, reflecting starlight like a field of cosmic diamonds."
    ],
    [RegionType.HABITABLE_ZONE]: [
        "Lush planetary bodies orbit in the perfect zone for life to flourish. The vibrant colors of vegetation are visible even from orbit.",
        "A gentle star provides ideal conditions for the planets in this zone. Sensors detect water oceans, oxygen atmospheres, and complex ecosystems.",
        "This region reminds the crew of Earth - temperate worlds orbit at the perfect distance from their star, with conditions ideal for human settlement.",
        "Your biological sensors detect a rich diversity of life forms on several planets in this habitable zone. Each world represents a unique evolutionary path.",
        "The perfect balance of stellar radiation and planetary conditions has created a haven for life forms in this region. Several crew members request permission to record the breathtaking views."
    ],
    [RegionType.SUPERNOVA]: [
        "The ship passes through a cloud of stellar material, the remnants of a star that exploded centuries ago. Your shields shimmer as they deflect the radiation.",
        "Brilliant colors wash over your viewports as light interacts with the supernova remnant. Sensors record unusual element formations created in the stellar explosion.",
        "The energy released by the supernova still resonates through this region, creating waves of radiation that your ship's systems carefully monitor and shield against.",
        "Heavy elements, forged in the heart of the stellar explosion, drift through this region. Some are so rare they can only be created in the extreme conditions of a supernova.",
        "Your ship passes through a region where time seems condensed - the birth, life, and violent death of a star all evidenced in the surrounding cosmic debris."
    ],
    [RegionType.ANOMALY]: [
        "Reality itself seems uncertain in this region. Quantum fluctuations cause minor systems to behave unpredictably, though critical ship functions remain stable.",
        "The laws of physics appear to bend in subtle ways here. Crew members report strange sensations and minor hallucinations that the medical team attributes to the region's unusual properties.",
        "Your sensors detect phenomena that should be impossible according to standard physical models. The science team records everything, eager to analyze the data once you've left this strange place.",
        "Time and space seem less rigid here. Occasional flashes of what might be parallel realities bleed through, visible for just moments before disappearing.",
        "This region defies conventional understanding. Energy readings fluctuate without cause, and light sometimes appears to travel along curved paths with no gravitational source to explain it."
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
        [RegionType.VOID]: {
            energy: [
                "Your sensors detected trace amounts of energy residue, allowing for a small collection.",
                "The Dawn's energy collectors captured stray particles from the void.",
                "A small energy fluctuation in the void provided a minor boost to ship systems."
            ],
        },
        [RegionType.BLACK_HOLE]: {
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
        [RegionType.ASTEROID_FIELD]: {
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
        [RegionType.HABITABLE_ZONE]: {
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
        [RegionType.SUPERNOVA]: {
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
        },
        [RegionType.ANOMALY]: {
            insight: [
                "Analysis of the anomalous sensor readings provided groundbreaking theoretical insights.",
                "Fluctuating energy fields unique to this anomaly were partially captured."
            ],
            energy: [
                "Fluctuating energy fields unique to this anomaly were partially captured."
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
        case RegionType.VOID:
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 5) + 1,
                    message: getRandomMessage(RegionType.VOID, 'energy')
                });
            }
            break;
        case RegionType.BLACK_HOLE:
            if (Math.random() < 0.7) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage(RegionType.BLACK_HOLE, 'insight')
                });
            }
            if (Math.random() < 0.5) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 15) + 10,
                    message: getRandomMessage(RegionType.BLACK_HOLE, 'energy')
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'scrap', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage(RegionType.BLACK_HOLE, 'scrap')
                });
            }
            break;
        case RegionType.ASTEROID_FIELD:
            if (Math.random() < 0.5) {
                rewards.push({ 
                    type: 'scrap', 
                    amount: Math.floor(Math.random() * 15) + 5,
                    message: getRandomMessage(RegionType.ASTEROID_FIELD, 'scrap')
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 8) + 3,
                    message: getRandomMessage(RegionType.ASTEROID_FIELD, 'energy')
                });
            }
            break;
        case RegionType.HABITABLE_ZONE:
            if (Math.random() < 0.6) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 5) + 3,
                    message: getRandomMessage(RegionType.HABITABLE_ZONE, 'insight')
                });
            }
            if (Math.random() < 0.4) {
                rewards.push({ 
                    type: 'crew', 
                    amount: Math.random() < 0.3 ? 1 : 0,
                    message: Math.random() < 0.3 ? getRandomMessage(RegionType.HABITABLE_ZONE, 'crew') : undefined
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage(RegionType.HABITABLE_ZONE, 'energy')
                });
            }
            break;
        case RegionType.SUPERNOVA:
            if (Math.random() < 0.7) {
                rewards.push({ 
                    type: 'insight', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage(RegionType.SUPERNOVA, 'insight')
                });
            }
            if (Math.random() < 0.5) {
                rewards.push({ 
                    type: 'energy', 
                    amount: Math.floor(Math.random() * 15) + 10,
                    message: getRandomMessage(RegionType.SUPERNOVA, 'energy')
                });
            }
            if (Math.random() < 0.3) {
                rewards.push({ 
                    type: 'scrap', 
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage(RegionType.SUPERNOVA, 'scrap')
                });
            }
            break;
        case RegionType.ANOMALY:
            if (Math.random() < 0.9) {
                rewards.push({
                    type: 'insight',
                    amount: Math.floor(Math.random() * 15) + 10,
                    message: getRandomMessage(RegionType.ANOMALY, 'insight')
                });
            }
            if (Math.random() < 0.2) {
                rewards.push({
                    type: 'energy',
                    amount: Math.floor(Math.random() * 10) + 5,
                    message: getRandomMessage(RegionType.ANOMALY, 'energy')
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
    [RegionType.VOID]: [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Mysterious Signal',
            description: 'Your sensors detect a faint distress signal coming from a nearby debris field. The signal appears to be automated, repeating on an old frequency not commonly used anymore.',
            region: RegionType.VOID,
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
    [RegionType.BLACK_HOLE]: [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Gravitational Lens Observatory',
            description: 'You discover the remains of a scientific outpost positioned to use the black hole as a gravitational lens for deep space observation. The facility appears to have been hastily evacuated.',
            region: RegionType.BLACK_HOLE,
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
    ],
    [RegionType.ASTEROID_FIELD]: [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Mining Outpost',
            description: 'You discover an abandoned mining outpost attached to a large asteroid. The facility appears to have been evacuated in a hurry, with equipment left running and personal belongings scattered about.',
            region: RegionType.ASTEROID_FIELD,
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
    [RegionType.HABITABLE_ZONE]: [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Pirate Outpost',
            description: 'You detect a small outpost hidden in the orbit of a habitable moon. The settlement appears to be a haven for space pirates and smugglers, using the nearby planet as cover from authorities.',
            region: RegionType.HABITABLE_ZONE,
            choices: [
                {
                    id: uuidv4(),
                    text: 'Approach openly for trade',
                    outcome: {
                        resources: [
                            { type: 'scrap', amount: 15, message: 'You acquired rare materials through unconventional trade channels.' },
                            { type: 'energy', amount: -10, message: 'The pirates demanded energy cells as part of the deal.' }
                        ],
                        text: 'You signal your peaceful intentions and are granted permission to dock. The pirates are suspicious but willing to trade. You acquire useful materials, though at the cost of some energy cells they demanded as payment.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Infiltrate covertly to gather intelligence',
                    outcome: {
                        resources: [{ type: 'insight', amount: 25, message: 'The stolen navigational data reveals valuable route information.' }],
                        text: 'You send a small team disguised as traders to infiltrate the outpost. They return with stolen navigational data containing information about secret routes and the locations of other pirate strongholds in the sector.',
                        continuesToNextEncounter: true
                    }
                },
                {
                    id: uuidv4(),
                    text: 'Avoid the outpost entirely',
                    outcome: {
                        text: 'You decide the risk of engaging with pirates outweighs any potential benefits. You alter your course to give the outpost a wide berth, using the habitable moon\'s gravity to slingshot away from the area quickly and efficiently.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ],
    [RegionType.SUPERNOVA]: [
        {
            id: uuidv4(),
            type: 'story',
            title: 'Stellar Remnant',
            description: 'The remnants of a supernova glow in the distance, a testament to the violent end of a star.',
            region: RegionType.SUPERNOVA,
            choices: [
                {
                    id: uuidv4(),
                    text: 'Collect energy samples',
                    outcome: {
                        resources: [{ type: 'energy', amount: 25, message: 'The energy collection was successful despite the risks.' }],
                        text: 'You carefully navigate to the edge of the glowing region and extend your collection arrays. Despite some minor radiation exposure to your outer hull, you successfully harvest a significant amount of energy.',
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
                        text: 'You decide that the potential risks outweigh any benefits and carefully navigate around the glowing region. While you gain no immediate resources, your cautious approach ensures the safety of your crew and vessel.',
                        continuesToNextEncounter: true
                    }
                }
            ]
        }
    ],
    [RegionType.ANOMALY]: []  // Empty for now as requested
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