/**
 * Encounter content for the game
 * Contains region-specific encounter probabilities and flavor text
 */

import { RegionType, ResourceReward } from '../types';

/**
 * Chances of getting encounters in different regions
 */
export const REGION_ENCOUNTER_CHANCES: Record<RegionType, { combat: number, empty: number }> = {
    'void': { combat: 0.1, empty: 0.9 },
    'nebula': { combat: 0.3, empty: 0.7 },
    'asteroid': { combat: 0.5, empty: 0.5 },
    'deepspace': { combat: 0.7, empty: 0.3 },
    'blackhole': { combat: 0.9, empty: 0.1 }
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