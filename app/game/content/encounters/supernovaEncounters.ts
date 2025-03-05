import { StoryEncounter } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Supernova region
 */
export const SUPERNOVA_ENCOUNTERS: StoryEncounter[] = [
    {
        id: uuidv4(),
        type: 'story',
        title: 'Stellar Laboratory',
        description: 'Amidst the chaotic supernova remnant, you discover an abandoned research station specifically designed to study the aftermath of stellar death. Its reinforced structure has survived the cataclysm remarkably well.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Recover research data',
                outcome: {
                    resources: [{ type: 'insight', amount: 45, message: 'The supernova research data contains groundbreaking astrophysical insights.' }],
                    text: 'You download the station\'s extensive research archives. The data contains unprecedented observations of stellar collapse physics, element formation during supernovae, and theoretical models for harnessing the immense energy released during such events. This knowledge significantly advances your understanding of stellar phenomena.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Salvage specialized equipment',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 30, message: 'The specialized equipment contained rare radiation-resistant materials.' },
                        { type: 'energy', amount: 25, message: 'The station\'s shielded power cells were still functional.' }
                    ],
                    text: 'You dismantle the station\'s specialized research equipment. The radiation-hardened components and advanced sensor arrays are constructed from materials specifically designed to withstand stellar radiation. Additionally, the station\'s emergency power systems remain functional, providing a welcome energy boost to your reserves.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search for survivors',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 1, message: 'You found one survivor in emergency stasis.' },
                        { type: 'insight', amount: 15, message: 'The survivor shared crucial information about the supernova\'s unusual properties.' }
                    ],
                    text: 'In a specially reinforced chamber, you discover a single scientist in emergency stasis. Upon revival, they explain they were studying anomalous readings just before the star\'s collapse. Their firsthand knowledge of the supernova\'s unusual characteristics proves invaluable, and they gratefully join your crew.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Element Forge',
        description: 'Your sensors detect an area within the supernova remnant where heavy elements are still forming through ongoing nuclear fusion. The concentration of rare materials is unprecedented.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Collect newly formed elements',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 40, message: 'You harvested impossibly rare elements from the fusion zone.' },
                        { type: 'energy', amount: -15, message: 'The collection process required significant energy for shielding.' }
                    ],
                    text: 'You navigate into the fusion region with maximum shields. Using specialized collectors, you harvest elements that would be impossible to synthesize through conventional means. These super-heavy elements have extraordinary properties that could revolutionize your ship\'s capabilities, though the collection process drains your energy reserves.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Study the fusion process',
                outcome: {
                    resources: [{ type: 'insight', amount: 35, message: 'Observations of natural fusion provided breakthrough knowledge in energy production.' }],
                    text: 'Rather than collecting materials, you focus your sensors on understanding the ongoing fusion processes. The data you gather provides insights into sustainable fusion that far exceed Earth\'s theoretical models. This knowledge could potentially solve energy production challenges for generations to come.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Map the distribution of elements',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 20, message: 'The elemental map will be valuable for future mining operations.' },
                        { type: 'energy', amount: 10, message: 'You discovered a pocket of energetic particles that recharged your reserves.' }
                    ],
                    text: 'You conduct a detailed survey of element distribution throughout the supernova remnant. The resulting map identifies concentrations of various materials, making future harvesting operations far more efficient. During the mapping process, you also discover a pocket of energetic particles that your collectors can immediately harvest for power.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Neutron Star Birth',
        description: 'At the heart of the supernova remnant, your sensors detect the recently formed neutron star - the ultra-dense core of the original star compressed to incredible density. It pulses with intense radiation and gravitational waves.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Collect data on gravitational waves',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 50, message: 'The gravitational wave data represents a scientific breakthrough.' },
                        { type: 'energy', amount: -20, message: 'Close observation required significant energy for shielding and stabilization.' }
                    ],
                    text: 'You position your ship to precisely measure the gravitational waves emanating from the neutron star. The data provides unprecedented verification of advanced physics theories and suggests possibilities for faster-than-light communication. The extreme conditions tax your ship\'s systems, but the scientific value is immeasurable.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Attempt energy harvesting',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 100, message: 'The neutron star\'s radiation provided an extraordinary energy boost.' },
                        { type: 'crew', amount: -2, message: 'Two crew members were lost to radiation exposure despite precautions.' }
                    ],
                    text: 'You deploy specialized collectors to capture the intense radiation streaming from the neutron star. The energy harvest exceeds all expectations, flooding your reserves with power. However, despite safety precautions, two crew members receive fatal radiation doses when a shield fluctuation exposes them momentarily to the star\'s unfiltered emissions.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Observe from a safe distance',
                outcome: {
                    resources: [{ type: 'insight', amount: 25, message: 'Remote observations provided valuable data without risk.' }],
                    text: 'You maintain a prudent distance and conduct long-range observations of the neutron star. While the data isn\'t as detailed as could be obtained up close, it still provides valuable insights into stellar evolution and neutron star physics. Your cautious approach ensures the safety of your crew and systems.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 