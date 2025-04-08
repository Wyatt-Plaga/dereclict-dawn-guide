import { StoryEncounter } from '@/app/game/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Asteroid Field region
 * 
 * Organized by subregions:
 * 1. Mining Frontier
 * 2. Resource Processing Hub
 * 3. Core Extraction Zone
 */
export const ASTEROID_FIELD_ENCOUNTERS: StoryEncounter[] = [
    // =====================
    // Mining Frontier Subregion
    // =====================
    {
        id: uuidv4(),
        type: 'story',
        title: 'Abandoned Outpost',
        description: 'You discover a small mining outpost floating amidst the asteroids, its systems on emergency power. The station appears to have been hastily abandoned.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Mining Frontier' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Investigate crew quarters',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 25, message: 'Personal logs provided valuable information about corporate activity in the sector.' },
                        { type: 'crew', amount: -1, message: 'One crew member was injured by an automated defense system.' }
                    ],
                    text: 'Your exploration team finds personal logs revealing the mining company abandoned the workers when an "unusual asteroid" was discovered, declaring the area off-limits. As they search deeper, an automated defense system activates, injuring one of your crew before it can be disabled. The information gained provides valuable insight into corporate activities in this sector.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Access main computer',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 30, message: 'You were able to siphon power from the station\'s reserves.' },
                        { type: 'insight', amount: 15, message: 'Mining data revealed unusual readings from deep core samples.' }
                    ],
                    text: 'You manage to bypass the security protocols on the main computer. Not only do you recover partial mining data showing abnormal readings from deep core samples and frantic final communications with corporate headquarters, but you\'re also able to siphon significant energy from the station\'s backup power reserves.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search emergency pods',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 35, message: 'The unused escape pod provided valuable salvageable materials.' },
                        { type: 'insight', amount: 10, message: 'The strange crystalline fragment has unusual properties worth studying.' }
                    ],
                    text: 'You discover one escape pod was never launched, containing a dead crew member clutching a strange crystalline fragment with unusual properties. While the circumstances are grim, the unused pod contains valuable materials that your team salvages. The crystalline fragment appears to respond to electrical currents in peculiar ways, warranting further study.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Claim Dispute',
        description: 'Your sensors detect a standoff between two mining vessels, weapons hot, fighting over a resource-rich asteroid.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Mining Frontier' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Support independent miners',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 2, message: 'Two grateful miners joined your crew.' },
                        { type: 'insight', amount: 20, message: 'Information about "restricted sectors" proved valuable.' }
                    ],
                    text: 'You deploy your weapons systems in support of the smaller vessel. The corporate ship retreats after a brief exchange of fire. The independent miners are grateful for your intervention and share information about "restricted sectors" where they found strange artifacts. Two of their crew ask to join your vessel, impressed by your willingness to stand against corporate bullying.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Assist corporate vessel',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 40, message: 'The corporation provided a generous reward of refined materials.' },
                        { type: 'energy', amount: 25, message: 'They also transferred specialized energy cells as thanks.' }
                    ],
                    text: 'You lend your firepower to the corporate vessel, quickly ending the dispute. The grateful corporate representative rewards you generously with refined materials and specialized energy cells. Their data contains redacted information about unusual discoveries in the asteroid belt, but you note the coordinates for future exploration. The independent miners flee, vowing revenge for your betrayal.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Negotiate a settlement',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 15, message: 'Both parties shared valuable information about the region.' },
                        { type: 'scrap', amount: 15, message: 'You received a modest share of the asteroid\'s resources.' },
                        { type: 'crew', amount: 1, message: 'A skilled negotiator from the corporate vessel joined your crew.' }
                    ],
                    text: 'Using your diplomatic subroutines, you broker a compromise where both parties agree to share the claim. They reveal complementary pieces of information about unusual phenomena they\'ve observed. As a mediator\'s fee, you receive a small portion of the asteroid\'s resources. Additionally, an impressed negotiator from the corporate vessel requests to join your crew, seeing greater opportunity aboard your ship.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Prospector\'s Discovery',
        description: 'A solitary mining vessel is drilling into an asteroid showing unusual energy signatures. The lone prospector is excited but nervous about their discovery.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Mining Frontier' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Offer protection',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 30, message: 'The ancient technological artifact provided significant research value.' },
                        { type: 'energy', amount: -20, message: 'Maintaining protection required significant energy expenditure.' }
                    ],
                    text: 'The grateful prospector shows you what they\'ve found: a metallic object embedded deep in the asteroid, clearly manufactured but of unknown origin. While you provide protection, your scientists study the artifact, determining it\'s far more advanced than current human technology. The protection detail requires significant energy to maintain against scavengers attracted by your presence, but the insights gained are invaluable.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Purchase their claim',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -25, message: 'You paid the prospector with refined materials.' },
                        { type: 'insight', amount: 35, message: 'The ancient data storage unit contained invaluable star charts.' },
                        { type: 'energy', amount: 15, message: 'The artifact emitted energy that your systems could harness.' }
                    ],
                    text: 'Buying the claim lets you excavate further, revealing an ancient data storage unit containing fragmented star charts marked with warning symbols. The prospector happily accepts your payment in refined materials. As your team works to extract the artifact, it begins emitting energy pulses that your systems can capture and utilize, partially offsetting the excavation costs.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Report to authorities',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 20, message: 'The corporate officer provided salvage permits as thanks.' },
                        { type: 'crew', amount: -1, message: 'The prospector was arrested, causing unrest among your more independent crew members.' }
                    ],
                    text: 'Corporate security quickly cordons off the area, arresting the prospector for mining in a restricted zone. A sympathetic officer secretly shares images of similar artifacts found throughout the belt as thanks for your cooperation. They also provide you with exclusive salvage permits for nearby sectors. However, some of your crew are disturbed by your willingness to hand over the independent prospector, and one resigns in protest.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    
    // =====================
    // Resource Processing Hub Subregion
    // =====================
    {
        id: uuidv4(),
        type: 'story',
        title: 'Processing Plant Malfunction',
        description: 'A massive automated processing facility is operating beyond safety parameters, its systems locked in an unusual processing loop.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Resource Processing Hub' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Override safety protocols',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 50, message: 'You diverted refined materials from the processing queue.' },
                        { type: 'crew', amount: -2, message: 'Two crew members were exposed to toxic compounds during the override.' }
                    ],
                    text: 'You gain access to the processing queue, discovering an unusual metallic compound being refined and stockpiled without shipment records. As you override the system to divert some of these materials to your ship, a containment breach exposes two of your crew to toxic compounds. The refined materials are exceptionally valuable, but the human cost was significant.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Check executive orders',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 40, message: 'The corporate directives revealed extensive details about valuable asteroid compositions.' }
                    ],
                    text: 'You bypass administrative security to access executive level communications. The facility received direct orders from corporate headquarters to process and contain unidentified materials found in specific asteroids. The detailed analysis and coordinates of these special asteroids provides invaluable insight into where similar valuable materials might be found throughout the belt.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Rescue trapped workers',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 3, message: 'Three grateful facility workers joined your crew.' },
                        { type: 'energy', amount: -15, message: 'Breaking into the safe room required significant energy expenditure.' }
                    ],
                    text: 'You detect faint life signs and communications from a reinforced safe room. Using significant energy to cut through the locked safety barriers, you rescue three workers who reveal they were ordered to continue operations after finding strange artifacts inside asteroids, then abandoned when they raised safety concerns. Grateful for their rescue and disillusioned with their employer, they volunteer to join your crew, bringing valuable industrial expertise.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Researcher\'s Hideout',
        description: 'Hidden within a hollowed asteroid near the processing hub, you find a makeshift laboratory established by a former corporate scientist.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Resource Processing Hub' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Review research data',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 45, message: 'The research on metallic fragments with impossible properties expanded your understanding exponentially.' }
                    ],
                    text: 'The scientist was studying metallic fragments with impossible properties - materials that seem to react to thoughts and change their molecular structure. Their comprehensive research notes detailing experiments, failures, and breakthroughs provide a quantum leap in your understanding of these unusual materials. You copy all data before departing, leaving the lab untouched for others who might find it.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Examine specimen containers',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 35, message: 'One of the specimens proved to be an extremely efficient energy catalyst.' },
                        { type: 'crew', amount: -1, message: 'A crew member was affected by an escaped specimen with mind-altering properties.' }
                    ],
                    text: 'You find catalogued samples showing progressive experiments, with notes indicating the researcher believed the fragments were "technology beyond our comprehension." While examining the specimens, one container breaks, releasing a substance that affects a crew member\'s mind. They must be sedated and returned to the ship. However, another specimen proves to be an extraordinary energy catalyst that your engineers immediately integrate into your power systems, significantly boosting efficiency.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Access personal logs',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 25, message: 'The researcher\'s personal journey provided context for their scientific discoveries.' },
                        { type: 'crew', amount: 1, message: 'You found the researcher hiding in a concealed compartment.' }
                    ],
                    text: 'You discover the researcher fled corporate employment after leadership demanded weaponization of the discovered materials. Their personal logs reveal an ethical crisis and fear for their life. As you prepare to leave, a hidden door opens, revealing the researcher themselves, who has been observing you. Impressed by your interest in knowledge rather than exploitation, they offer to join your crew, bringing their expertise in these mysterious materials.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Corporate Archives',
        description: 'A secure data storage facility floats at the hub\'s edge, its low profile suggesting it wasn\'t meant to be noticed.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Resource Processing Hub' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Breach security systems',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 40, message: 'Decades of classified research provided invaluable scientific knowledge.' },
                        { type: 'energy', amount: -25, message: 'Bypassing the sophisticated security systems drained significant power.' }
                    ],
                    text: 'You deploy sophisticated hacking protocols to breach the facility\'s formidable security systems, requiring significant energy to maintain the intrusion while downloading data. Access records show the corporation has been collecting unusual artifacts from the asteroid belt for decades, with escalating classification levels. The scientific knowledge accumulated over years of secret research exponentially expands your understanding of the region\'s anomalies.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Locate physical storage',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 30, message: 'You appropriated several artifact specimens for study and materials.' },
                        { type: 'insight', amount: 20, message: 'The specimen labels provided valuable location data.' }
                    ],
                    text: 'You dock at the facility and bypass physical security to access the specimen storage vault. Inside, you find preserved fragments of technology, each labeled with discovery locations forming a pattern through the asteroid belt. You take several specimens for study, noting they\'re composed of materials with extraordinary properties. The pattern of discovery locations also provides valuable insight into where more fragments might be found.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Retrieve executive communications',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 30, message: 'Executive messages revealed the broader context of artifact collection efforts.' },
                        { type: 'crew', amount: -1, message: 'A security system injured one crew member during the data theft.' }
                    ],
                    text: 'You focus on accessing the highest-level communications rather than the research itself. As your team downloads executive messages, a previously undetected security system activates, injuring one crew member before it can be disabled. The retrieved data reveals messages showing the corporation believes the artifacts are "components of something larger" scattered throughout the belt, with coordinates of collection efforts and speculation about their origin and purpose.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    
    // =====================
    // Core Extraction Zone Subregion
    // =====================
    {
        id: uuidv4(),
        type: 'story',
        title: 'Deep Core Facility',
        description: 'A massive drilling operation has penetrated unusually deep into a large asteroid. All standard mining protocols have been abandoned.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Core Extraction Zone' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Enter the core shaft',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 50, message: 'The ancient device emitted energy your systems could capture and utilize.' },
                        { type: 'crew', amount: -2, message: 'Two crew members experienced severe mental disturbances after exposure to the artifact.' }
                    ],
                    text: 'You descend the massive shaft to find an excavated chamber containing what appears to be part of a massive ancient device, partially exposed and emitting faint energy. As your team studies the artifact, two crew members who directly handled it begin experiencing severe mental disturbances, claiming to see "echoes of events yet to happen." While they must be quarantined, your engineers successfully harness the energy emissions from the device, significantly boosting your power reserves.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Access facility logs',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 35, message: 'The facility director\'s increasingly erratic records provided unexpected scientific breakthroughs.' },
                        { type: 'scrap', amount: 15, message: 'You salvaged some abandoned equipment on your way out.' }
                    ],
                    text: 'Discover records showing increasingly erratic behavior from the facility director, obsessed with extracting the artifact intact. Their logs detail increasingly brilliant but unstable theories about the artifact\'s purpose and origin. While clearly descending into madness, the director made several scientific breakthroughs in the process. You download all records and salvage some abandoned equipment before departing the unsettling facility.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Investigate quarantine zone',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 2, message: 'Two workers with unusual perceptual abilities joined your crew.' },
                        { type: 'insight', amount: 25, message: 'Their condition provided valuable insights into the artifact\'s effects.' }
                    ],
                    text: 'You find workers in isolation who were exposed to the artifact, exhibiting unusual perceptual abilities and speaking of "echoes of events yet to happen." After thorough medical examination confirms they\'re not a danger to themselves or others, two of them ask to join your crew. Their condition and experiences provide valuable insight into the artifact\'s nature, suggesting it somehow interacts with the normal flow of time and perception.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Corporate Black Site',
        description: 'Hidden among barren asteroids, a heavily guarded research station works with recovered artifacts from throughout the belt.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Core Extraction Zone' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Infiltrate the laboratory',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 45, message: 'Observing the assembly attempts provided revolutionary understanding of the artifacts.' },
                        { type: 'crew', amount: -2, message: 'Two crew members were captured during the infiltration.' }
                    ],
                    text: 'Your team stealthily enters the facility, observing scientists attempting to assemble fragments into a larger configuration, with simulations suggesting it forms part of a communication device. The technical knowledge gained is immense, but as you withdraw, two crew members are captured by security. You\'re forced to leave them behind, hoping they won\'t reveal your ship\'s identity under interrogation.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Access research data',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 30, message: 'The analysis of the artifact\'s signaling properties expanded your understanding of communication technology.' },
                        { type: 'energy', amount: -20, message: 'The sophisticated hack required significant energy resources.' }
                    ],
                    text: 'Rather than physical infiltration, you execute a sophisticated hack of their systems, requiring significant energy resources to maintain the connection while evading detection. You review analyses indicating the technology responds to specific energy patterns by generating signals directed toward the anomaly region. The theoretical frameworks developed by their scientists provide substantial insights into previously unknown principles of energy manipulation and communication.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Extract specimen storage',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: 40, message: 'The artifact fragment provided exceptionally valuable exotic materials.' },
                        { type: 'energy', amount: 25, message: 'The fragment seems to generate energy through unknown means.' }
                    ],
                    text: 'You execute a rapid strike on the facility\'s storage area, securing a fragment for your own study before security can fully respond. Upon return to your ship, the fragment triggers unusual readings in your systems that suggest compatibility with your AI architecture. Engineering analysis shows the fragment generates energy through unknown means, and its exotic materials can be partially utilized for critical system upgrades.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'The Core Nexus',
        description: 'At the gravitational center of the asteroid belt, a massive operation extracts asteroids showing trace energy signatures similar to the artifacts.',
        validLocations: [{ regionId: 'asteroid', subRegionId: 'Core Extraction Zone' }],
        choices: [
            {
                id: uuidv4(),
                text: 'Override security lockouts',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 50, message: 'The partial device assembly revealed fundamental principles that revolutionized your understanding.' },
                        { type: 'crew', amount: -3, message: 'Three crew members were lost in the ensuing security response.' }
                    ],
                    text: 'You launch an aggressive breach of the facility\'s central chamber where a partial assembly of collected artifacts forms an incomplete device of unknown purpose. As alarms blare, your team quickly scans and analyzes the assembly before security forces respond with lethal force. You lose three crew members in the fighting retreat, but the data obtained represents a quantum leap in understanding the artifacts and their collective purpose.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Recover operation directives',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 35, message: 'The excavation pattern based on ancient star charts revealed meaningful celestial alignments.' },
                        { type: 'energy', amount: 20, message: 'You were able to siphon power during the information extraction.' }
                    ],
                    text: 'You focus on accessing the operation\'s command center, finding orders revealing the corporation has been following a specific pattern of excavation sites based on ancient star charts. The pattern itself seems to have astronomical significance, possibly relating to celestial alignments from thousands of years ago. During your information extraction, you also manage to siphon significant power from their main grid to supplement your own reserves.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Confront the director',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 1, message: 'The facility director joined your crew, bringing valuable expertise.' },
                        { type: 'scrap', amount: 25, message: 'The director provided access to stored artifact fragments.' }
                    ],
                    text: 'You take the bold approach of directly communicating with the facility director, who is now paranoid and defensive. After tense negotiations, they reveal they believe the assembled device is meant to "stabilize the approaching disruption" and have grown disillusioned with corporate intentions for the technology. Convinced your mission aligns better with their own goals, the director defects to your ship, bringing both their expertise and access to stored artifact fragments they had kept hidden from their superiors.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 