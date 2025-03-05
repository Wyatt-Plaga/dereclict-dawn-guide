import { StoryEncounter } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Black Hole region
 */
export const BLACK_HOLE_ENCOUNTERS: StoryEncounter[] = [
    {
        id: uuidv4(),
        type: 'story',
        title: 'Event Horizon Research Station',
        description: 'You discover the remnants of a scientific outpost positioned to study the black hole. The facility appears to have been hastily evacuated, with equipment still running on emergency power.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Retrieve research data',
                outcome: {
                    resources: [{ type: 'insight', amount: 40, message: 'The black hole research data is exceptional and groundbreaking.' }],
                    text: 'You manage to extract the storage drives containing years of observational data. The findings about spacetime distortion and quantum fluctuations near the event horizon dramatically expand your scientific database and may lead to technological breakthroughs.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Salvage the advanced equipment',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 25, message: 'The specialized equipment contained valuable materials.' },
                        { type: 'energy', amount: 15, message: 'You salvaged some power cells that were still charged.' }
                    ],
                    text: 'You carefully dismantle and retrieve the advanced observation equipment. The specialized sensors and gravitational wave detectors will be valuable for ship upgrades, and you even find some auxiliary power cells that still hold a charge.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search for clues about the evacuation',
                outcome: {
                    resources: [{ type: 'crew', amount: 1, message: 'You found a survivor in a malfunctioning cryopod.' }],
                    text: 'You explore the station looking for logs about what caused the evacuation. In a sealed maintenance bay, you discover a malfunctioning cryopod containing a scientist in suspended animation. You manage to stabilize and revive them, adding a knowledgeable specialist to your crew.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Temporal Anomaly',
        description: 'Your sensors detect unusual temporal readings as you navigate near the black hole. Time appears to be flowing at different rates across various ship sections, and strange echoes of past communications flicker through your systems.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Collect data on the phenomenon',
                outcome: {
                    resources: [{ type: 'insight', amount: 30, message: 'The temporal data could lead to breakthroughs in FTL theory.' }],
                    text: 'You dedicate your sensors to documenting the time dilation effects. The data you collect suggests ways that time itself could be manipulated for faster-than-light travel. This theoretical breakthrough increases your understanding of physics dramatically.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Attempt to recover the past communications',
                outcome: {
                    resources: [{ type: 'insight', amount: 15, message: 'The recovered communications contained fragmented mission data.' }],
                    text: 'You focus on the strange echoes resonating through your communication systems. By fine-tuning the receivers, you manage to capture fragments of past transmissions – including fractured mission parameters and coordinates that were previously lost from your memory banks.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Retreat to safer space immediately',
                outcome: {
                    text: 'You engage the engines and pull away from the temporal distortion zone. As distance increases, the ship\'s systems return to normal synchronization. While you gained no immediate resources, you protected the integrity of your chronometers and navigational systems.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Gravitational Lens',
        description: 'The black hole creates a perfect gravitational lens, allowing you to observe an extremely distant part of the universe with unprecedented clarity. Your sensors detect something unusual in the magnified image.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Focus sensors on the astronomical observation',
                outcome: {
                    resources: [{ type: 'insight', amount: 25, message: 'The astronomical observation reveals a potential Earth-like planet in a distant galaxy.' }],
                    text: 'You calibrate your sensors to take advantage of the gravitational lens effect. The magnified image reveals a solar system with striking similarities to Earth\'s. You record detailed information about this potential "Earth 2.0" that could serve as an alternative destination if needed.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search for artificial signals in the magnified region',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 35, message: 'You detected an artificial signal of unknown origin.' },
                        { type: 'energy', amount: -5, message: 'The detailed scanning consumed additional energy.' }
                    ],
                    text: 'You scan for evidence of intelligent life in the magnified region. To your astonishment, you detect what appears to be an artificial signal – regular pulses that couldn\'t be naturally occurring. The discovery is monumental, but raises more questions than answers about humanity\'s place in the cosmos.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Use the lens to optimize your navigation charts',
                outcome: {
                    resources: [{ type: 'energy', amount: 10, message: 'Your updated navigation charts will improve fuel efficiency.' }],
                    text: 'You use the unprecedented view to update your stellar cartography database. The enhanced maps will allow for more efficient navigation through this sector, reducing energy consumption on future journeys.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 