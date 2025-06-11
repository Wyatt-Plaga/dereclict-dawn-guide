import { StoryEncounter } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Black Hole region
 * 
 * Organized by subregions:
 * 1. Accretion Disk
 * 2. Ergosphere
 * 3. Event Horizon
 */
export const BLACK_HOLE_ENCOUNTERS: StoryEncounter[] = [
    // =====================
    // Accretion Disk Subregion
    // =====================
    {
        id: uuidv4(),
        type: 'story',
        title: 'Observer Station Sigma',
        description: 'A scientific outpost suspended in the swirling matter of the accretion disk. Its instruments point toward the black hole, but emergency power flickers throughout the station.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Access Research Logs',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 40, message: 'The gravitational measurement data provides revolutionary theoretical insights.' },
                        { type: 'crew', amount: -1, message: 'One crew member displays signs of cognitive corruption after interfacing with the corrupted data systems.' }
                    ],
                    text: 'Your science team establishes a connection to the station\'s data core, downloading years of gravitational measurements. The data shows increasingly inexplicable readings over time - objects appearing to exist in multiple spatial positions simultaneously, causality reversals, and particles that aged backwards. One of your crew who integrated directly with the systems begins speaking in mathematical equations instead of words, describing geometries that cannot exist in three-dimensional space.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Salvage Observatory Equipment (Requires 20 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -20, message: 'Power was required to safely extract the sensitive equipment.' },
                        { type: 'scrap', amount: 45, message: 'The advanced sensors and instruments contain rare materials and exotic components.' },
                        { type: 'energy', amount: 30, message: 'The observatory\'s specialized power cells were still charged.' }
                    ],
                    text: 'Your engineering team carefully dismantles the station\'s primary sensor array, designed to measure quantum fluctuations at the event horizon. The equipment logs reveal they had detected the same events occurring multiple times, with slight variations, as if observing parallel timelines briefly overlapping. The power systems used a novel gravitational amplification technique, providing surplus energy once salvaged properly.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Investigate Crew Quarters',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 25, message: 'The personal logs document the psychological effects of proximity to a black hole.' },
                        { type: 'crew', amount: 2, message: 'You discover two scientists in deep stasis, temporally desynchronized but recoverable.' }
                    ],
                    text: 'The living quarters tell a disturbing story. Personal logs document crew members experiencing the same events repeatedly, some claiming to have lived the same day dozens of times. Calendar markings show multiple contradictory dates maintained by different crew members. In a sealed stasis chamber, you find two scientists who appear to be cycling through time at irregular intervals. Your medical team manages to stabilize them, though they sometimes answer questions seconds before they\'re asked.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Signal from the Void',
        description: 'Your sensors detect a repeating transmission emanating from deeper within the accretion disk, its pattern too regular to be natural.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Triangulate Signal Source (Requires 15 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -15, message: 'Navigating the treacherous debris field required precise thruster control.' },
                        { type: 'scrap', amount: 35, message: 'The probe\'s exotic materials are unlike any known alloy.' },
                        { type: 'insight', amount: 20, message: 'The probe\'s construction reveals advanced technological principles.' }
                    ],
                    text: 'Navigation through the debris field is treacherous, but you locate the signal source: a probe of unusual design. Its construction materials show no signs of degradation despite the extreme conditions, and its design incorporates technologies that appear centuries beyond current capabilities. Dating analysis produces contradictory results - the probe appears to be both centuries old and manufactured with techniques that don\'t yet exist. Its memory contains astronomical data for star positions that match future configurations rather than past or present ones.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Analyze Signal Pattern',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 50, message: 'The predictive information in the signal revolutionizes your understanding of temporal physics.' },
                        { type: 'energy', amount: -10, message: 'The intense computation required for the analysis depleted energy reserves.' }
                    ],
                    text: 'Your communications team isolates the signal and analyzes its structure, discovering it contains data packets that appear to be from your own systems - including log entries with future timestamps. More disturbing still, some entries describe events your crew has already experienced, but with subtle differences, as if from a slightly different timeline. The signal appears to be caught in a temporal loop, broadcasting from multiple points in time simultaneously. The processing load to untangle the temporal encoding severely taxes your ship\'s systems.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Broadcast Response (Requires 10 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -10, message: 'Advanced encoding algorithms were needed to formulate the response.' },
                        { type: 'insight', amount: 30, message: 'The interaction with what appears to be your future self provides startling revelations.' },
                        { type: 'crew', amount: -2, message: 'Two crew members suffer severe temporal disorientation after the exchange.' }
                    ],
                    text: 'You carefully craft a response using advanced encoding algorithms developed from your analysis. Almost immediately, you receive a reply that mirrors your message exactly, but contains additional information that addresses questions you were about to ask but hadn\'t yet formulated. The exchange becomes increasingly disturbing as the signal begins to predict your responses with perfect accuracy before you send them. Two of your communications specialists collapse, claiming they can\'t distinguish between thoughts they\'ve had and thoughts they\'re going to have.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Gravity\'s Crucible',
        description: 'An area of the accretion disk where matter is being compressed into exotic states before falling into the black hole, creating a natural laboratory of extreme physics.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Collect Exotic Particles',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 60, message: 'The ultra-dense matter provides an extraordinary energy source when properly contained.' },
                        { type: 'scrap', amount: -20, message: 'Hull integrity was compromised during collection, requiring immediate repairs.' }
                    ],
                    text: 'You maneuver your ship to intercept streams of ultra-compressed matter, deploying specialized collection fields. The material exists in a state between conventional matter and energy, and when successfully contained, provides power output orders of magnitude beyond standard fuel. However, the gravitational stresses during collection create micro-fractures throughout your hull, requiring immediate allocation of materials for repairs. Your engineers note that the collected particles occasionally seem to vanish and reappear, as if briefly existing in another dimension.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Study Compression Phenomena (Requires 15 Crew)',
                outcome: {
                    resources: [
                        { type: 'crew', amount: -15, message: 'A full science team is deployed in shifts to observe the phenomena.' },
                        { type: 'insight', amount: 55, message: 'The observations revolutionize your understanding of matter under extreme conditions.' },
                        { type: 'crew', amount: -3, message: 'Three crew members experience severe temporal displacement syndrome.' }
                    ],
                    text: 'You deploy your full science team in shifts to observe the extraordinary compression phenomena. They document matter transitioning through states that violate known physical laws - particles occupying multiple positions simultaneously, spontaneous organization of random particles into complex structures, and matter that ages in reverse. The theoretical insights gained are immeasurable, but the observational teams experience severe temporal disorientation. Three crew members begin experiencing their personal timelines non-linearly, sometimes responding to events before they happen or reliving moments from hours ago.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Deploy Sensor Drones (Requires 25 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -25, message: 'Specialized drones were constructed using valuable materials.' },
                        { type: 'insight', amount: 35, message: 'The remote observations provide valuable data without risking crew exposure.' },
                        { type: 'energy', amount: 20, message: 'One drone returns with its energy storage mysteriously overcapacity.' }
                    ],
                    text: 'You construct specialized drones designed to withstand extreme gravitational conditions, sending them into the heart of the compression zone. Most transmit extraordinary data before being crushed, but one returns in an impossible state - its structural integrity seems enhanced rather than damaged, and its power cells contain more energy than should be physically possible. Analysis suggests it may have briefly passed through a region where the laws of physics were fundamentally different, or possibly encountered a pocket of space with altered time flow.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },

    // =====================
    // Ergosphere Subregion
    // =====================
    {
        id: uuidv4(),
        type: 'story',
        title: 'Research Platform Omega',
        description: 'An advanced facility built to harvest rotational energy from the black hole itself. Its structure is warped, stretching and compressing in impossible ways as space-time distorts around it.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Investigate Energy Collectors',
                outcome: {
                    resources: [
                        { type: 'energy', amount: 50, message: 'The Penrose process technology provides a revolutionary energy extraction method.' },
                        { type: 'insight', amount: 30, message: 'The theoretical principles behind the collectors expand your understanding of energy physics.' }
                    ],
                    text: 'The facility\'s energy collection system extends into the ergosphere itself, using the frame-dragging effect to extract rotational energy from the black hole. Your engineers are astounded by the efficiency - it\'s essentially extracting energy from the fabric of space-time itself. More remarkable still, the system appears to occasionally draw power from configurations it will have in the future, as if the energy is flowing backward through time. With careful study, you\'re able to adapt some of these principles to your own systems, though fully understanding the technology will take years.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Access Experimental Data (Requires 20 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -20, message: 'Advanced scientific knowledge was required to interpret the complex experimental data.' },
                        { type: 'insight', amount: 60, message: 'The experiments on localized time manipulation represent a quantum leap in theoretical physics.' },
                        { type: 'crew', amount: -2, message: 'Two scientists are temporally desynchronized after studying the experimental results.' }
                    ],
                    text: 'The facility\'s research data reveals they had progressed beyond energy collection to actual time flow manipulation. By creating precise gravitational lenses in the ergosphere, they could accelerate or decelerate time in contained areas, effectively creating temporal bubbles where time flowed at different rates. The final experiments suggest they had achieved limited success in sending information back in time by microseconds. Two of your scientists become temporally desynchronized while analyzing the data, experiencing time at different rates than the rest of the crew.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search for Survivors (Requires 10 Energy, 5 Crew)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -10, message: 'Power was needed to maintain stable temporal fields during the search.' },
                        { type: 'crew', amount: -5, message: 'A search team was deployed to locate survivors experiencing time at different rates.' },
                        { type: 'crew', amount: 3, message: 'Three researchers with unique temporal experiences join your crew.' },
                        { type: 'insight', amount: 25, message: 'The survivors provide firsthand accounts of time dilation effects.' }
                    ],
                    text: 'Following temporal distortion signatures, your search team locates survivors experiencing time at different rates. Some have lived mere days since the facility\'s abandonment, while others have experienced subjective years. Three researchers ask to join your crew, bringing both their expertise and their unique perspective of having lived in temporal flux. They explain that the facility wasn\'t actually abandoned - from their reference frame, the evacuation is still ongoing in slow-motion, while to others it happened centuries ago. Their understanding of subjective time provides valuable insights into the nature of the black hole.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Gravimetric Shearing Zone',
        description: 'A region where the rotation of space creates a boundary between different reference frames, causing objects to appear to split and recombine as they cross the boundary.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Deploy Frame Stabilizers (Requires 30 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -30, message: 'Specialized field generators were constructed to create a stable reference frame.' },
                        { type: 'insight', amount: 45, message: 'The stabilized reference frame allows for unprecedented observations of frame-dragging effects.' },
                        { type: 'scrap', amount: -20, message: 'The stabilizers are damaged beyond repair by the extreme conditions.' }
                    ],
                    text: 'Your engineers construct specialized field generators that create a stabilized reference frame around a small probe. When deployed into the shearing zone, it transmits remarkable data about how space itself rotates around the black hole. The observations confirm theoretical models but also reveal unexpected patterns in how quantum fields behave in curved space-time. However, the gravitational forces ultimately overwhelm the stabilizers, tearing them apart along with the valuable equipment attached to them.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Study Duplication Effect',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 40, message: 'The apparent duplication phenomenon provides revolutionary insights into quantum superposition at macroscopic scales.' },
                        { type: 'crew', amount: -2, message: 'Two crew members experience severe psychological trauma from perceiving their own temporal duplicates.' }
                    ],
                    text: 'You observe objects crossing the reference frame boundary, witnessing the stunning effect as they appear to exist in multiple states simultaneously before resolving back into singular entities. Your scientists theorize this is not actual duplication, but rather objects existing across multiple timelines simultaneously when in the boundary zone. The effect becomes disturbingly personal when monitoring crew in environmental suits - each briefly perceives alternate versions of themselves making slightly different decisions. Two crew members suffer severe psychological breaks after making visual contact with their duplicates, reporting impossible memories of lives they never lived.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Collect Frame-Dragged Materials (Requires 25 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -25, message: 'Specialized collection fields required significant power to operate in the distorted space-time.' },
                        { type: 'scrap', amount: 50, message: 'The fundamentally altered materials have extraordinary properties for advanced engineering.' },
                        { type: 'energy', amount: 30, message: 'Some collected materials exist in energy states that can be harvested.' }
                    ],
                    text: 'Using specialized collection fields, you gather materials that have been subjected to extreme frame dragging. The atomic structure of these substances has been fundamentally altered, creating alloys with impossible properties - metals that change density based on observation, crystalline structures that exist in quantum superposition, and materials that appear to conduct energy more efficiently than should be physically possible. Your engineering team identifies numerous applications, though handling the materials requires extraordinary precautions as some pieces occasionally phase in and out of conventional reality.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Temporal Fracture',
        description: 'A vast tear in the fabric of space-time, where objects from different times briefly coexist before being pulled back to their original moments.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Observe Timeline Convergence',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 70, message: 'The observation of multiple timelines provides unprecedented understanding of temporal mechanics.' },
                        { type: 'crew', amount: -4, message: 'Four crew members suffer severe psychological trauma from perceiving multiple timeline variants.' }
                    ],
                    text: 'Positioning your ship at a safe distance, you observe the fracture through specialized temporal filters. The sight defies comprehension - you witness the same section of space in multiple time states simultaneously, with objects, ships, and even entire stellar phenomena appearing at different stages of their existence. Most disturbing are the multiple versions of what appears to be your own ship, each making slightly different decisions. Four crew members cannot process the cognitive dissonance of seeing multiple potential futures and pasts simultaneously, suffering severe dissociative episodes.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Retrieve Displaced Artifacts (Requires 20 Energy, 10 Crew)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -20, message: 'Power was required to operate the collection drones in the temporal fracture.' },
                        { type: 'crew', amount: -10, message: 'Skilled personnel were needed to identify and retrieve stable artifacts.' },
                        { type: 'scrap', amount: 60, message: 'The temporally displaced artifacts contain advanced technologies from various timelines.' },
                        { type: 'insight', amount: 40, message: 'Studying objects from other timelines provides revolutionary theoretical insights.' }
                    ],
                    text: 'You deploy collection drones to retrieve objects that appear solid and stable within the fracture. The recovered items defy conventional analysis - technology with design principles that don\'t match any known civilization, yet bear markings in recognizable languages. Most remarkable is a data storage device containing technical schematics dated three centuries in the future, incorporating theoretical principles that your scientists have only begun to formulate. Other artifacts appear to be from alternative timelines where technological development took dramatically different paths.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Record Predictive Data (Requires 35 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -35, message: 'Advanced theoretical knowledge was required to interpret future timeline data.' },
                        { type: 'insight', amount: 65, message: 'The future data provides strategic advantages but creates worrying temporal paradoxes.' },
                        { type: 'energy', amount: 40, message: 'Knowledge of future energy technology allows for immediate efficiency improvements.' }
                    ],
                    text: 'Using advanced temporal filters, you focus on regions of the fracture showing future timelines. The data you record is both invaluable and disturbing - you observe future versions of your ship and crew, technological advancements, and even glimpses of the mysterious anomaly you\'re seeking. The knowledge creates worrying paradoxes - are you now bound to make certain decisions because you\'ve seen yourself make them in the future? Your philosophers debate free will while your engineers quietly implement future technologies they\'ve observed, creating bootstrap paradoxes where the origin of the knowledge becomes impossible to determine.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },

    // =====================
    // Event Horizon Subregion
    // =====================
    {
        id: uuidv4(),
        type: 'story',
        title: 'Edge of Forever',
        description: 'The boundary beyond which nothing can return, appearing as a perfect spherical darkness against the backdrop of warped starlight.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Deploy Horizon Probes (Requires 40 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -40, message: 'Specialized probes were constructed to withstand extreme conditions near the event horizon.' },
                        { type: 'insight', amount: 75, message: 'The final transmissions from the event horizon fundamentally revolutionize physics.' },
                        { type: 'energy', amount: 30, message: 'One probe returns quantum entanglement data that enables energy efficiency improvements.' }
                    ],
                    text: 'You launch specialized probes designed to transmit data for as long as possible as they cross the event horizon. In the final milliseconds before communication ceases, they send information that defies understanding - equations describing spaces with more than three dimensions, evidence that information can escape the event horizon through quantum entanglement, and measurements suggesting that time stops completely at the boundary. One probe manages to establish a quantum link that persists even after it crosses over, providing ongoing data that your physicists will spend years trying to fully comprehend.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Analyze Boundary Conditions',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 60, message: 'The quantum fluctuations at the boundary reveal fundamental truths about space-time.' },
                        { type: 'crew', amount: -2, message: 'Two scientists experience quantum uncertainty at a macroscopic level after prolonged observation.' }
                    ],
                    text: 'Your science team focuses all instruments on the precise boundary where light can no longer escape. They observe quantum fluctuations that briefly connect points across vast distances, suggesting the event horizon isn\'t as absolute as classical physics would indicate. Information appears to leak through these quantum connections, though distorted and fragmented. Two scientists working with quantum field equations begin to experience reality itself as probabilistic rather than definite, their consciousness seemingly affected by the phenomena they\'re observing, existing in states of quantum uncertainty.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Observe Light Echo (Requires 30 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -30, message: 'Specialized sensors required significant power to capture the preserved light reflections.' },
                        { type: 'insight', amount: 55, message: 'The preserved images of ancient civilizations provide unprecedented xenoarchaeological data.' },
                        { type: 'crew', amount: 2, message: 'Two xenoarchaeologists request to join your crew to study the light echo data.' }
                    ],
                    text: 'Using specialized sensors, you capture the final light reflections from objects that fell into the black hole centuries or even millennia ago, preserved at the boundary due to extreme time dilation. The images reveal fragments of ancient spacecraft, including designs unlike anything in your database. Most remarkable are the preserved images of beings from civilizations long vanished, their final moments stretched across centuries at the edge of the event horizon. Two xenoarchaeologists who had been studying these light echoes from a nearby research vessel request to join your crew, bringing their specialized knowledge.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Reality\'s End',
        description: 'A region where the fundamental forces of reality begin to decouple, creating pockets of space operating under different physical laws.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Study Force Decoupling (Requires 25 Insight, 10 Crew)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -25, message: 'Advanced theoretical knowledge was required to understand the decoupled forces.' },
                        { type: 'crew', amount: -10, message: 'A science team was deployed to observe the physics-defying regions.' },
                        { type: 'insight', amount: 80, message: 'Observations of decoupled forces provide revolutionary understanding of unified field theory.' },
                        { type: 'crew', amount: -3, message: 'Three crew members are partially decoupled from conventional physical laws.' }
                    ],
                    text: 'Your scientists observe regions where gravity, electromagnetism, and nuclear forces operate independently rather than in unified harmony. The implications are profound - brief windows into what the universe might have looked like in its earliest moments, before forces combined in their present configuration. Three crew members who venture too close to a boundary region return fundamentally changed, exhibiting localized violations of physics - objects sometimes fall upward around them, light occasionally bends in their presence, and their molecular cohesion requires constant medical intervention to maintain.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Harvest Exotic Energy States (Requires 50 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -50, message: 'Specialized collection equipment was constructed to harvest energy from altered physics zones.' },
                        { type: 'energy', amount: 100, message: 'The exotic energy states provide unprecedented power generation capabilities.' },
                        { type: 'scrap', amount: -20, message: 'Several collection devices are destroyed by unpredictable energy behavior.' }
                    ],
                    text: 'You construct specialized collection equipment to harvest energy from pockets where physical constants have shifted. The power you obtain defies conventional measures - energy that exists in quantum superposition, particles that generate more energy than they should possibly contain, and fields that appear to draw power from other dimensions. While the potential applications are revolutionary, the unpredictable nature of these energy states destroys several collection devices and creates momentary aberrations in your ship\'s systems, where basic physical laws briefly stop functioning in localized areas.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Map Reality Variances',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 50, message: 'The reality variance map provides safe navigation through dangerous regions.' },
                        { type: 'energy', amount: -20, message: 'The intensive sensor sweeps required significant power expenditure.' }
                    ],
                    text: 'Your navigation team conducts comprehensive scans to map where different physics zones begin and end, creating a navigational chart of reality variations. The resulting map reveals patterns that shouldn\'t exist - microscopic black holes that appear and disappear, regions where time flows backward, and boundaries where probability itself seems to branch into multiple outcomes. The map provides safe passage but comes at a cost, as crew members report disturbing dreams of realities where physical constants differ just enough to make existence unrecognizable yet still conscious.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'The Observer Effect',
        description: 'A phenomenon where your very act of observation seems to alter what exists beyond the event horizon, creating a hall of mirrors effect with reality itself.',
        region: 'blackhole',
        choices: [
            {
                id: uuidv4(),
                text: 'Calibrate Observation Methods (Requires 40 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -40, message: 'Advanced theoretical frameworks were needed to structure the observation experiments.' },
                        { type: 'insight', amount: 70, message: 'Understanding how consciousness interacts with the singularity provides profound theoretical breakthroughs.' },
                        { type: 'energy', amount: 40, message: 'The interaction between observation and reality yields novel energy principles.' }
                    ],
                    text: 'Your science team experiments with different sensors and perception methods, from classical instruments to direct human observation. They discover that the results differ dramatically depending on the observation method - and more disturbingly, on the expectations of the observer. The black hole appears to reflect back information consistent with whatever the observers anticipated finding, suggesting a fundamental connection between consciousness and the singularity that defies conventional physics. This insight leads to revolutionary theoretical breakthroughs about the nature of reality itself, though it raises profound questions about whether any observation near the event horizon can be considered objective.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Record Reality Fluctuations',
                outcome: {
                    resources: [
                        { type: 'insight', amount: 60, message: 'The documented fluctuations provide evidence of reality responding to thought.' },
                        { type: 'crew', amount: -2, message: 'Two scientists can no longer distinguish between observation and creation.' }
                    ],
                    text: 'You meticulously document how perceived reality near the event horizon changes based on observer expectations, creating a catalog of fluctuations. The patterns reveal that the black hole may be serving as a mirror for consciousness itself - reflecting, amplifying, and sometimes distorting the thoughts directed toward it. Two of your scientists develop a troubling condition where they can no longer distinguish between observing reality and creating it, their perceptions becoming self-fulfilling in limited but measurable ways. The philosophical implications are as significant as the scientific ones, suggesting consciousness may be more fundamental to reality than matter itself.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Attempt Direct Perception (Requires 15 Crew)',
                outcome: {
                    resources: [
                        { type: 'crew', amount: -15, message: 'Volunteer crew members attempt unfiltered perception of the event horizon.' },
                        { type: 'insight', amount: 90, message: 'The direct perception experiences provide revolutionary understanding of consciousness and reality.' },
                        { type: 'crew', amount: -5, message: 'Five crew members are lost to alternative perception states.' }
                    ],
                    text: 'Volunteers from your crew attempt the ultimate experiment - direct, unfiltered perception of the event horizon without technological intermediaries. Each reports an entirely different experience, yet all describe a profound sense that the black hole is not merely an object but a state of perception itself. They report experiencing multiple timelines simultaneously, consciousness spread across possible realities, and direct awareness of quantum states normally hidden from macroscopic perception. Five crew members cannot return from these altered states of perception, their consciousness apparently expanded beyond the confines of conventional reality. Those who do return bring insights that will revolutionize understanding of both physics and consciousness.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 
