import { StoryEncounter } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Asteroid Field region
 */
export const ASTEROID_FIELD_ENCOUNTERS: StoryEncounter[] = [
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
                        { type: 'scrap', amount: 15, message: 'You also collected some loose metal fragments.' }
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
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Unusual Asteroid Composition',
        description: 'Your sensors detect an asteroid with an unusual molecular structure. Its composition doesn\'t match any material in your database, suggesting it might be of extraterrestrial origin.',
        region: 'asteroid',
        choices: [
            {
                id: uuidv4(),
                text: 'Collect samples for analysis',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 25, message: 'The alien material revealed revolutionary molecular properties.' },
                        { type: 'scrap', amount: 10, message: 'You collected some of the material for future use.' }
                    ],
                    text: 'You send a small team to collect samples of the exotic material. Initial analysis shows it has remarkable properties – self-healing capabilities, unusual energy conductivity, and molecular memory. This discovery could lead to breakthrough technologies if properly studied.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Attempt to mine the entire asteroid',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 40, message: 'You successfully harvested a large quantity of the alien material.' },
                        { type: 'energy', amount: -15, message: 'The mining operation consumed significant energy.' },
                        { type: 'crew', amount: -1, message: 'One crew member was lost to an unexpected reaction with the material.' }
                    ],
                    text: 'You set up a full mining operation to harvest the alien material. During extraction, the material exhibits unexpected properties – releasing energy bursts that damage equipment and injure personnel. While you collect a significant amount, the operation costs you dearly in resources and one crew member is lost to an unpredictable reaction.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Study it remotely for safety reasons',
                outcome: {
                    resources: [{ type: 'insight', amount: 15, message: 'Remote analysis provided useful but limited data.' }],
                    text: 'Taking a cautious approach, you conduct detailed scans from a safe distance. The data suggests the asteroid may be a fragment from another star system entirely, with properties evolved under different physical laws. While your analysis is limited, you avoid any potential hazards from direct contact.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Ancient Space Station',
        description: 'Nestled in a dense cluster of asteroids, you discover what appears to be an ancient space station of unknown origin. It\'s partially embedded in a large asteroid, suggesting it\'s been here for centuries.',
        region: 'asteroid',
        choices: [
            {
                id: uuidv4(),
                text: 'Board the station to explore',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 30, message: 'The station contained advanced technology beyond your understanding.' },
                        { type: 'energy', amount: 20, message: 'You managed to activate and harvest from the station\'s power core.' }
                    ],
                    text: 'Your team carefully boards the derelict station. The architecture is unlike anything in your database, with strange curved corridors and unfamiliar technology. You manage to activate a portion of the station\'s power systems and download fragments of data in an untranslatable language. The power core technology is far advanced and provides a significant energy boost.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Scan for any active systems or life signs',
                outcome: {
                    resources: [{ type: 'crew', amount: 2, message: 'You discovered two survivors in suspended animation chambers.' }],
                    text: 'Your detailed scans detect minimal power signatures deep within the station. To your astonishment, you find two beings in some form of suspended animation. After careful extraction and medical attention, they regain consciousness. Though communication is initially difficult, they seem grateful and willing to join your crew, bringing unfamiliar but valuable skills.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Salvage exterior components only',
                outcome: {
                    resources: [{ type: 'scrap', amount: 35, message: 'The exterior technology provided valuable and exotic materials.' }],
                    text: 'Choosing caution over curiosity, you extract only external components from the station. The materials are unlike anything you\'ve encountered – lightweight yet incredibly durable alloys, strange crystalline power conduits, and sensor arrays that function on principles your science team can\'t fully comprehend. The salvage operation is successful without risking contamination or unknown dangers from within.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 