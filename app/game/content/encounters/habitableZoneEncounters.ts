import { StoryEncounter } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Habitable Zone region
 */
export const HABITABLE_ZONE_ENCOUNTERS: StoryEncounter[] = [
    {
        id: uuidv4(),
        type: 'story',
        title: 'Lush Exoplanet',
        description: 'Your sensors detect a planet within the habitable zone that shows signs of advanced ecosystem development. Lush forests, vast oceans, and diverse life forms populate its surface.',
        region: 'habitable',
        choices: [
            {
                id: uuidv4(),
                text: 'Send a landing party to collect samples',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 30, message: 'The biological samples contained revolutionary medical compounds.' },
                        { type: 'crew', amount: -1, message: 'One crew member was affected by an alien pathogen.' }
                    ],
                    text: 'Your team collects samples from various ecosystems on the planet. The biological diversity is astounding, with potential applications for medicine and agriculture. However, one crew member contracts an alien pathogen despite decontamination protocols and must remain in quarantine indefinitely.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Deploy automated drones for safer exploration',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 20, message: 'Remote exploration yielded valuable ecological data.' },
                        { type: 'energy', amount: -5, message: 'Drone operations consumed energy reserves.' }
                    ],
                    text: 'You deploy a fleet of drones to explore the planet\'s surface. They capture footage of extraordinary biodiversity - plants that communicate through bioluminescence, symbiotic relationships between different species, and evidence of rapid evolutionary adaptation. The data expands your biological database significantly without risking crew exposure.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Establish an observation post in orbit',
                outcome: {
                    resources: [{ type: 'insight', amount: 15, message: 'Long-term observation provided valuable understanding of the planet\'s cycles.' }],
                    text: 'You set up an automated satellite to observe the planet over time. The data reveals fascinating planetary cycles, weather patterns, and migration behaviors. You note the location in your charts as a potential future colony site, should the need arise.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Ancient Ruins',
        description: 'Orbital scans of a habitable moon reveal geometric structures too regular to be natural. The ruins appear to be thousands of years old, suggesting an advanced civilization once inhabited this region.',
        region: 'habitable',
        choices: [
            {
                id: uuidv4(),
                text: 'Explore the ruins for technology',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 25, message: 'You recovered a still-functioning power source of unknown design.' },
                        { type: 'insight', amount: 20, message: 'The alien technology reveals new energy production methods.' }
                    ],
                    text: 'Your expedition discovers an underground complex beneath the primary ruins. Most systems are non-functional, but you recover a power source that still operates after millennia. Your engineering team is fascinated by its design, which produces energy through methods previously unknown to human science.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search for historical records or artifacts',
                outcome: {
                    resources: [{ type: 'insight', amount: 35, message: 'The recovered archives contained star maps and historical data.' }],
                    text: 'In what appears to be a central archive chamber, you discover preserved data crystals containing star maps, historical records, and cultural information. The civilization appears to have spread across multiple star systems before mysteriously disappearing. Their knowledge of sustainable colonization techniques could prove invaluable to your mission.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Investigate what happened to the civilization',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 25, message: 'You discovered evidence of a catastrophic climate collapse.' },
                        { type: 'crew', amount: 1, message: 'One of your cryopod passengers awakened with special knowledge about the findings.' }
                    ],
                    text: 'Your investigation reveals disturbing parallels to Earth\'s history. The civilization appears to have collapsed due to environmental degradation and resource depletion, despite their advanced technology. The findings trigger an emergency awakening protocol for a specialist in your cryopods, a xenoarchaeologist whose expertise will be crucial for interpreting these warnings from the past.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Primitive Sentient Species',
        description: 'On a habitable world orbiting a yellow star, your sensors detect evidence of a pre-industrial sentient species. They appear to have developed agriculture, basic metallurgy, and complex social structures.',
        region: 'habitable',
        choices: [
            {
                id: uuidv4(),
                text: 'Make contact with the native population',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 2, message: 'Two natives volunteered to join your mission as cultural exchange.' },
                        { type: 'insight', amount: 10, message: 'The cultural exchange provided new perspectives on social organization.' }
                    ],
                    text: 'Against protocol, you establish cautious contact with the native leadership. After initial fear, they receive your representatives with curiosity. Their understanding of sustainable agriculture in their planet\'s specific ecology is impressive. Two curious individuals volunteer to join your journey, eager to share knowledge and learn from the stars.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Observe from orbit without interference',
                outcome: {
                    resources: [{ type: 'insight', amount: 15, message: 'Anthropological observations expanded your cultural database.' }],
                    text: 'You maintain distance and study the civilization through remote observation. Their development appears to be following a different path than humanity\'s, with greater emphasis on communal living and environmental harmony. These observations provide valuable insights into alternative social evolution that might benefit future human colonies.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Leave a hidden monitoring station',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -10, message: 'The monitoring station required materials to construct.' },
                        { type: 'energy', amount: -5, message: 'Setting up the station consumed energy reserves.' }
                    ],
                    text: 'You deploy a cloaked observation satellite in high orbit to monitor the civilization\'s development long-term. The station will transmit data to deep space beacons, creating a valuable anthropological record even after your mission moves on. This investment of resources may not provide immediate returns, but represents a commitment to scientific knowledge preservation.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 