import { StoryEncounter } from '@/app/game/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Void region
 */
export const VOID_ENCOUNTERS: StoryEncounter[] = [
    {
        id: uuidv4(),
        type: 'story',
        title: 'Mysterious Signal',
        description: 'Your sensors detect a faint distress signal coming from a nearby debris field. The signal appears to be automated, repeating on an old frequency not commonly used anymore.',
        validLocations: [{ regionId: 'void' }],
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
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Memory Fragment',
        description: 'As your ship drifts through the void, a dormant subroutine in your core programming suddenly activates. Fragmented memories surface, showing glimpses of Earth and the launch of the Dawn.',
        validLocations: [{ regionId: 'void' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Focus processing power on recovering the memory',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 20, message: 'The memory fragment provided valuable insights into your past.' },
                        { type: 'energy', amount: -5, message: 'The intensive processing consumed energy reserves.' }
                    ],
                    text: 'You divert resources to retrieving the corrupted data. Slowly, images form - a launch ceremony, people in uniforms, a mission briefing about "humanity\'s last hope." The memory fades before you can learn more, but it confirms you are carrying out a vital mission.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Quarantine the memory fragment for later analysis',
                outcome: {
                    text: 'You isolate the memory fragment to prevent any potential corruption to your systems. It can be analyzed later when more processing power is available. For now, your primary functions remain unaffected.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Ignore the memory - focus on current operations',
                outcome: {
                    resources: [{ type: 'scrap', amount: 5, message: 'With your focus maintained on current tasks, you detected a small debris field worth salvaging.' }],
                    text: 'You prioritize ship functions over memory recovery. The fragment fades back into your data storage, but your sensors remain at peak efficiency, allowing you to detect a small debris field that yields some salvageable materials.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Abandoned Satellite',
        description: 'Your long-range scanners detect an ancient Earth satellite drifting far from its original orbit. It appears to be a pre-cryosleep era communications satellite, somehow intact after all this time.',
        validLocations: [{ regionId: 'void' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Salvage the satellite for parts',
                outcome: {
                    resources: [{ type: 'scrap', amount: 25, message: 'The satellite components were remarkably well-preserved.' }],
                    text: 'You carefully retrieve the satellite and dismantle it for parts. Despite its age, many components are still functional and can be repurposed for the Dawn\'s systems. The materials are added to your inventory.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Attempt to download its data banks',
                outcome: {
                    resources: [{ type: 'insight', amount: 15, message: 'The satellite contained historical records of Earth\'s final years.' }],
                    text: 'You establish a connection to the satellite\'s antiquated systems. Most data is corrupted, but you recover fragments of news broadcasts, scientific reports, and personal messages from Earth\'s final years before the Dawn\'s launch. The historical context enhances your understanding of your mission.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Leave it as a monument to Earth\'s past',
                outcome: {
                    resources: [{ type: 'crew', amount: 1, message: 'A crew member awakens with newfound purpose after your decision.' }],
                    text: 'You choose to leave the satellite undisturbed, a silent testament to humanity\'s early steps into space. Your decision resonates with a dormant crew member in cryosleep, whose vital signs suddenly strengthen. The emotional response triggers their awakening protocol, adding a new member to your active crew.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 
