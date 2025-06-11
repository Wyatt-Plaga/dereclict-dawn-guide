import { StoryEncounter } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Narrative encounters for the Supernova region
 * 
 * Organized by subregions:
 * 1. Outer Shell - The expanded outer layers of the exploded star
 * 2. Midfield Ruins - Shattered planets and fragmented civilization remains
 * 3. Core Remnant - The ultra-dense central region with the neutron star
 */

export const SUPERNOVA_ENCOUNTERS: StoryEncounter[] = [
    // =====================
    // Outer Shell Subregion
    // =====================
    
    {
        id: uuidv4(),
        type: 'story',
        title: 'The Last Transmission',
        description: 'Your ship\'s sensors detect a weak signal emanating from a partially intact communications array drifting through the debris field. The technology appears to be centuries old, yet somehow still functional.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Recover the transmitter core (Requires 25 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -25, message: 'Materials were used to safely extract the fragile transmitter core.' },
                        { type: 'insight', amount: 35, message: 'The transmitter contained valuable historical data about the pre-supernova civilization.' },
                        { type: 'scrap', amount: 40, message: 'The transmitter\'s exotic materials are impossible to synthesize with current technology.' }
                    ],
                    text: 'Your engineers carefully disassemble the radiation-damaged array to extract its core. The transmitter components are made from materials specifically designed to survive extreme conditions, making them invaluable. The data stored within reveals glimpses of a thriving star system in its final days - scientific outposts, orbital habitats, and planetary colonies all unaware of their imminent destruction. The historical value is immense, and the materials themselves are impossible to synthesize with current technology.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Boost and clean the signal (Requires 30 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -30, message: 'Power was diverted to signal processing and amplification systems.' },
                        { type: 'insight', amount: 45, message: 'The final transmissions from the doomed civilization contained invaluable scientific knowledge.' }
                    ],
                    text: 'You divert power to your ship\'s communication systems to boost and clean the degraded signal. As the static clears, you hear the final transmissions of a doomed civilization - emergency broadcasts, scientific observations of the star\'s collapse, and personal messages from those who knew they wouldn\'t survive. Most haunting are the scientific readings taken right up to the final moments, showing that some researchers continued their work even as destruction approached, hoping their data might someday be recovered by others.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Deploy a remote probe (Requires 20 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -20, message: 'Technical expertise was required to program the probe for optimal data recovery.' },
                        { type: 'energy', amount: 25, message: 'The probe discovered a still-functioning power cell in the array.' },
                        { type: 'crew', amount: -1, message: 'A crew member was lost when unexpected radiation surge overwhelmed the probe\'s shields.' }
                    ],
                    text: 'You deploy a probe to investigate the array from a safe distance, protecting your crew from potential radiation hazards. The probe successfully interfaces with the array and begins downloading its data, but suddenly an unexpected radiation surge overwhelms its shields. Your technician, monitoring the probe from your ship, attempts an emergency patch to maintain the connection and is exposed to lethal radiation when the feedback pulse travels through the command link. The data retrieved proves valuable, but the cost was high.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Adrift in Time',
        description: 'A massive habitat structure floats silently among the stellar debris. Scans show its internal time dilation fields are still functioning, preserving a bubble of the civilization that perished here centuries ago.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Send a boarding party',
                outcome: {
                    resources: [
                        { type: 'crew', amount: -2, message: 'Two crew members were lost when the time field destabilized during extraction.' },
                        { type: 'scrap', amount: 50, message: 'Extremely rare materials were recovered from the time-preserved habitat.' },
                        { type: 'insight', amount: 40, message: 'Firsthand observation of the dead civilization yielded extraordinary anthropological insights.' }
                    ],
                    text: 'Your boarding team enters the habitat through an airlock designed for ships long since reduced to atoms. Inside, they find a perfectly preserved moment from centuries ago - people frozen in mid-motion, atmospheric gases suspended like invisible sculptures. As they collect samples and record observations, the time field begins to destabilize. Most of the team escapes, but two crew members are caught as time suddenly accelerates in isolated pockets, aging them hundreds of years in seconds. The scientific and material gain is substantial, but the unsettling sight of your crewmates reduced to dust haunts the survivors.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Hack the time field generators (Requires 40 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -40, message: 'Expert knowledge was required to safely interface with the temporal technology.' },
                        { type: 'energy', amount: 60, message: 'You successfully redirected some of the temporal energy to your ship\'s systems.' },
                        { type: 'insight', amount: 35, message: 'Analysis of the time dilation technology provided revolutionary theoretical understanding.' }
                    ],
                    text: 'Your science team establishes a careful remote connection to the habitat\'s systems, delicately probing the time field generators without disrupting them. After days of painstaking work, they manage to redirect a portion of the temporal energy to your ship while keeping the field stable. The insights gained from studying functional time manipulation technology are revolutionary, potentially allowing for breakthroughs in numerous scientific fields. More immediately practical, the harnessed temporal energy provides a substantial boost to your power reserves.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Study the field boundaries (Requires 25 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -25, message: 'Power was diverted to specialized sensors for temporal analysis.' },
                        { type: 'insight', amount: 55, message: 'The time field boundary studies revolutionized understanding of temporal mechanics.' }
                    ],
                    text: 'You keep your distance but deploy specialized sensors to study the boundaries where normal space meets the time-dilated field. The data collected reveals extraordinary insights into how time itself can be manipulated and contained. Your scientists observe phenomena that challenge fundamental assumptions about physics - cause occurring after effect, entropy locally reversing, and matter existing in temporal superposition. This knowledge, while largely theoretical, represents a massive leap forward in understanding the nature of time itself.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Monument to the Lost',
        description: 'A colossal structure emerges from the nebula - an artificial planet-sized sphere covered in trillions of tiny lights. Each light represents a life lost when the star exploded, a memorial built by unknown entities after the catastrophe.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Interface with the monument database (Requires 35 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -35, message: 'Significant expertise was required to decode the alien database structure.' },
                        { type: 'insight', amount: 70, message: 'The monument database contained complete records of the lost civilization.' }
                    ],
                    text: 'Your specialists create an interface with the monument\'s vast database, carefully navigating its alien architecture. What they unlock is astounding - a complete record of the civilization that perished here. Names, personal histories, cultural achievements, scientific knowledge - all preserved in meticulous detail. Most poignant are the interactive recordings of daily life, allowing you to virtually walk through cities as they were before the cataclysm. The database also reveals that the monument was built by a reclusive species that dedicates itself to preserving the memory of extinct civilizations across the galaxy - cosmic archaeologists ensuring nothing is truly forgotten.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Divert power to the fading sections (Requires 40 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -40, message: 'Energy was transferred to power the monument\'s failing systems.' },
                        { type: 'crew', amount: 2, message: 'Two survivors were found in suspended animation within the monument\'s maintenance systems.' }
                    ],
                    text: 'You notice sections of the monument are dimming as its power systems fail after centuries of operation. Something compels you to connect your ship\'s power to restore these fading memories. As energy flows into the ancient systems, previously dark sections illuminate, revealing millions more lives thought lost forever. Unexpectedly, this power surge activates a maintenance subroutine, and two suspension pods activate their revival sequence. Inside are maintenance workers from the dead civilization, preserved for centuries in the hope of eventual rescue. Disoriented but alive, they join your crew, the last survivors of a world that exists now only in memory.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Collect memory crystal samples (Requires 30 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -30, message: 'Materials were used to safely extract and contain the memory crystals.' },
                        { type: 'scrap', amount: 45, message: 'The memory crystal technology is far beyond current manufacturing capabilities.' },
                        { type: 'insight', amount: 30, message: 'Analysis of the crystal storage medium provided new data compression insights.' }
                    ],
                    text: 'You identify the data storage medium used in the monument - remarkable crystalline structures that store information at the quantum level. With careful extraction, you collect samples of these crystals, each containing thousands of preserved lives. Your science team is amazed by the storage density and preservation capabilities, far beyond any known technology. Each crystal contains not just data but perfect recordings of consciousness itself, raising philosophical questions about whether these are merely records or if some essence of the individuals persists within the crystalline lattice.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },

    // =====================
    // Midfield Ruins Subregion
    // =====================
    
    {
        id: uuidv4(),
        type: 'story',
        title: 'The Element Crucible',
        description: 'The remains of what appears to be a massive research installation orbit a dense region of ongoing nuclear fusion. The scientists were attempting to predict and perhaps prevent the supernova.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Recover research materials (Requires 35 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -35, message: 'Materials were used to safely extract and transport the research equipment.' },
                        { type: 'scrap', amount: 60, message: 'The specialized research equipment contains rare materials designed for extreme conditions.' },
                        { type: 'insight', amount: 40, message: 'The recovered research data shows how close the scientists came to predicting the supernova.' }
                    ],
                    text: 'Your engineers construct specialized equipment to salvage what remains of the research station. They recover remarkable instruments designed to withstand stellar conditions, along with intact data cores. The research shows that the scientists had detected warning signs of the impending supernova and were racing to develop evacuation technologies. Most sobering is a countdown clock that was tracking the time until detonation - they had calculated it almost perfectly, but were off by just enough that their warning came too late for most of the population. Their final entries show them working until the very end, hoping their research might someday save others.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Complete their final experiment (Requires 45 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -45, message: 'Your scientific expertise was required to understand and complete the experiment.' },
                        { type: 'energy', amount: 80, message: 'The completed experiment generated an extraordinary amount of energy.' },
                        { type: 'insight', amount: 50, message: 'Finishing the scientists\' work led to breakthrough understanding of stellar collapse.' }
                    ],
                    text: 'After studying the research station\'s data, you realize the scientists were one step away from a breakthrough in understanding stellar collapse. Using their equipment and your own expertise, you complete their final experiment, successfully modeling the exact process that destroyed their star. The simulation generates an unexpected energy surge that your ship captures, but more valuable is the knowledge gained. You now understand precisely how to detect imminent supernovae years in advance - knowledge that could save billions of lives across the galaxy. You transmit this data on all frequencies as a monument to the researchers who almost saved their own civilization.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Harvest fusion byproducts (Requires 30 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -30, message: 'Power was diverted to specialized collectors to harvest the fusion materials.' },
                        { type: 'scrap', amount: 70, message: 'The fusion byproducts include elements that exist nowhere else in the universe.' }
                    ],
                    text: 'The ongoing fusion reactions in this region are creating elements that cannot form under any other known conditions. You deploy specialized collectors and shields, diverting significant power to protect them from the extreme environment. The materials harvested have properties that defy conventional physics - metals that remember their previous shapes, alloys that conduct energy with zero loss, and compounds that can store and release energy on command. These materials alone could revolutionize technology across human space, if you can safely transport them back.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Shattered Fleet',
        description: 'Dozens of military and civilian vessels float in formation, flash-frozen in their final evacuation attempt. Their hulls are partially melted and twisted by the supernova blast, preserving the moment of their destruction.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Salvage military technology (Requires 40 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -40, message: 'Materials were used to safely extract the highly unstable weapon systems.' },
                        { type: 'scrap', amount: 75, message: 'The military technology includes advanced alloys and weapon systems beyond current capabilities.' },
                        { type: 'energy', amount: -25, message: 'The salvage operation required significant power for safety systems.' }
                    ],
                    text: 'Your salvage teams carefully approach the military vessels, many of which still have active weapons systems in standby mode. They recover remarkable technology: targeting systems that can predict enemy movements, shield generators capable of withstanding direct energy weapon impacts, and hull materials that self-repair when damaged. Most impressive is a prototype propulsion system that appears to generate its own spacetime distortion for faster-than-light travel. The salvage is dangerous work, with several close calls when damaged systems suddenly reactivate, but the technological rewards are immense.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Download navigation archives (Requires 30 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -30, message: 'Expertise was required to interface with the ancient navigation systems.' },
                        { type: 'insight', amount: 65, message: 'The navigation archives contain star charts for regions you\'ve never seen mapped before.' }
                    ],
                    text: 'You establish connections to the fleet\'s command vessels, specifically targeting their navigation computers. After bypassing security systems frozen in their final authentication states, you download extraordinary data: detailed maps of regions never chartered by human explorers, coordinates for hundreds of habitable worlds, and trade routes to civilizations whose existence was previously only theoretical. Most valuable are the quantum entanglement communications protocols that allowed instantaneous communication across vast distances - technology thought impossible with current scientific understanding. This knowledge could redefine humanity\'s place in the galaxy, revealing just how vast the network of intelligent life once was before this sector\'s destruction.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Honor the dead',
                outcome: {
                    resources: [
                        { type: 'crew', amount: 3, message: 'The ceremony inspired crew members to work with renewed purpose and dedication.' }
                    ],
                    text: 'Something about the perfect preservation of the moment of death - thousands of beings frozen in their final acts of courage and desperation - moves your crew deeply. You call for a ship-wide moment of silence, and together you bear witness to the tragedy before you. Ship logs reveal the fleet was attempting to evacuate millions of civilians, with military vessels providing escort. In their final moments, several warships positioned themselves to shield civilian transports, sacrificing themselves in a futile but noble gesture. Your crew is profoundly affected by this display of sacrifice, finding renewed purpose in their own mission. Three crew members who had been considering leaving service recommit themselves with a dedication that inspires everyone aboard.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'The Philosopher\'s Vault',
        description: 'A heavily reinforced structure designed to survive stellar death contains the uploaded consciousness of the system\'s greatest thinkers, preserved to guide whoever might come after the inevitable cataclysm.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Consult the philosopher archive (Requires 50 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -50, message: 'Your best minds were needed to grasp the advanced concepts presented by the philosophers.' },
                        { type: 'insight', amount: 90, message: 'The philosophical and scientific insights from the archive are revolutionary.' }
                    ],
                    text: 'Your specialists create an interface with the consciousness archive, establishing direct communication with the preserved minds. The experience is overwhelming - centuries of accumulated wisdom from beings whose intelligence and perspective dwarf your own. They share freely, discussing everything from the nature of consciousness to the fundamental structure of reality. They explain that they foresaw the supernova centuries before it happened, but their civilization refused to believe them until it was too late. They built this vault not out of hope for themselves, but as a gift to whoever might follow. The knowledge they impart reshapes your understanding of existence itself, answering questions humans have pondered for millennia while raising new ones you\'d never thought to ask.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Extract computation cores (Requires 45 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -45, message: 'Materials were required to safely extract and transport the quantum cores.' },
                        { type: 'scrap', amount: 80, message: 'The computation technology is centuries beyond current capabilities.' },
                        { type: 'insight', amount: -20, message: 'The extraction process damaged some of the stored consciousness data.' }
                    ],
                    text: 'You decide to salvage the remarkable quantum computation technology that houses these ancient minds. The extraction is delicate work, and despite your best efforts, some of the stored consciousnesses are damaged or lost in the process. Those that remain express both understanding and sadness - they knew this might happen eventually, but hoped their knowledge would survive intact. The technology itself is extraordinary: computation cores that operate on principles that unify quantum mechanics and gravity, storage media that encode information in the fabric of spacetime itself, and interfaces that can connect directly to organic neural systems. With these cores, humanity\'s technological development could leap forward by centuries.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Apply their predictive models (Requires 40 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -40, message: 'Power was diverted to run the intensive predictive simulations.' },
                        { type: 'insight', amount: 60, message: 'The predictive models revealed patterns in cosmic phenomena previously thought to be random.' },
                        { type: 'energy', amount: 30, message: 'The philosophers helped optimize your ship\'s energy systems as thanks.' }
                    ],
                    text: 'You connect your ship\'s systems to the vault, allowing the philosopher consciousnesses to access your data on cosmic phenomena. They rapidly develop predictive models that reveal patterns in events you had thought random - from stellar formation to the movement of interstellar gases. Most valuable is their analysis of other potential supernovae in nearby regions, giving you the ability to predict with startling accuracy which stars are approaching collapse. As thanks for this new data, they analyze your ship\'s systems and suggest optimization improvements that significantly increase your energy efficiency. Before disconnecting, they share a final message: "We failed to save our civilization because knowledge without action is empty. You now know what we knew - what will you do differently?"',
                    continuesToNextEncounter: true
                }
            }
        ]
    },

    // =====================
    // Core Remnant Subregion
    // =====================
    
    {
        id: uuidv4(),
        type: 'story',
        title: 'Heart of Darkness',
        description: 'The neutron star pulses at the center of the remnant, its gravitational force so intense that light itself warps around it. Scans detect unusual patterns in its emissions that suggest artificial modification.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Deploy gravity probes (Requires 50 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -50, message: 'Significant power was required to operate and shield the gravity probes.' },
                        { type: 'insight', amount: 75, message: 'The gravity data reveals artificial modifications to the neutron star\'s structure.' },
                        { type: 'energy', amount: 40, message: 'One probe successfully harvested energy from the gravitational field.' }
                    ],
                    text: 'You launch specialized probes designed to measure and withstand extreme gravitational conditions. They spiral inward toward the neutron star, transmitting data until the last possible moment before crossing the threshold where recovery becomes impossible. The readings are astounding - the neutron star\'s gravitational field has been artificially modified, with structures embedded within the star itself that shouldn\'t be possible under known physics. These modifications appear designed to harness the star\'s rotational energy, possibly as a power source of unimaginable scale. One probe manages to tap into this field before being lost, sending back a surge of power along its tether.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Analyze emission patterns (Requires 45 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -45, message: 'Significant scientific expertise was needed to decode the complex signal patterns.' },
                        { type: 'insight', amount: 85, message: 'The neutron star emissions contain encoded messages from the pre-supernova civilization.' }
                    ],
                    text: 'Your scientists focus on the peculiar patterns in the neutron star\'s emissions, analyzing them through various decryption algorithms. After days of work, they make a breakthrough discovery: the patterns are an encoded message, deliberately embedded into the very structure of the neutron star by the civilization before their end. The message contains scientific knowledge, historical records, and a warning about something they discovered in their star\'s core just before the supernova - an anomaly they believe may exist in other stars as well. They theorize that certain supernovae may not be natural at all, but triggered by an unknown process or entity that feeds on the resulting energy release. The evidence is incomplete, but disturbing in its implications for other inhabited systems.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Search for structures (Requires 40 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -40, message: 'Materials were used to construct specialized scanning equipment.' },
                        { type: 'scrap', amount: 65, message: 'You discovered artificial structures made from unknown materials capable of withstanding neutron star conditions.' },
                        { type: 'crew', amount: -1, message: 'One crew member was lost when a scanner malfunctioned under the extreme conditions.' }
                    ],
                    text: 'You develop specialized scanning equipment to search for artificial structures near the neutron star. The scans reveal something impossible - a network of installations actually embedded within the outer layers of the neutron star itself, somehow surviving conditions that should atomize any known material. As you attempt to get closer readings, one of your scanners catastrophically fails, the feedback pulse killing the operator instantly. The remaining data shows that these structures form an enormous energy collection system, designed to harness the neutron star\'s rotation and emissions. The materials used in their construction defy analysis, suggesting technology far beyond even the advanced civilization that once inhabited this system - perhaps evidence of visitors from elsewhere who arrived before or after the catastrophe.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'Gravity\'s Lighthouse',
        description: 'A massive structure orbits dangerously close to the neutron star, somehow resisting its gravitational pull. The installation appears to be channeling and redirecting the star\'s emissions toward distant points in space.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Intercept beacon destinations (Requires 55 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -55, message: 'Exceptional scientific expertise was required to track and decode the beacon signals.' },
                        { type: 'insight', amount: 95, message: 'You discovered the beacon network connects to dozens of similar stellar remnants across the galaxy.' }
                    ],
                    text: 'Your science team works to track and decode the destinations of the beams emitted by the lighthouse structure. After complex calculations accounting for stellar drift over centuries, they make an astonishing discovery: the beams target dozens of other stellar remnants across the galaxy, each containing a similar neutron star. These appear to be part of a vast communication network established either before or after the supernova events, connecting these stellar graveyards in a galaxy-spanning web. More disturbing is the realization that the network is still active, with data flowing between nodes according to patterns your team cannot fully decode. Whatever or whoever built this network clearly operates on a scale beyond any single civilization, with purposes unknown but surely significant given the immense energy expenditure required.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Boost the transmission power (Requires 60 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -60, message: 'Massive energy was required to amplify the lighthouse transmissions.' },
                        { type: 'energy', amount: -30, message: 'The response surge overloaded some of your power systems.' },
                        { type: 'insight', amount: 80, message: 'The response to your transmission contains coordinates for similar structures throughout the galaxy.' }
                    ],
                    text: 'You connect your ship\'s power systems to the lighthouse, boosting its signal strength significantly. The response is immediate and unexpected - the entire network of beacons lights up with increased activity, and a powerful transmission is directed back toward your location. The surge temporarily overloads some of your systems, but the data packet you receive is worth the damage. It contains precise coordinates for every node in the network - hundreds of similar structures orbiting neutron stars throughout the galaxy, each marking the site of a former civilization destroyed by stellar cataclysm. The transmission also includes what appears to be an invitation or request, though parts remain untranslatable. Whatever intelligence monitors this network, it now knows of your presence and appears to be inviting further contact.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Recover transmission technology (Requires 50 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -50, message: 'Materials were required to safely extract components from the gravity lighthouse.' },
                        { type: 'scrap', amount: 90, message: 'The recovered technology includes gravity manipulation systems beyond current scientific understanding.' },
                        { type: 'crew', amount: -2, message: 'Two crew members were lost when a gravity fluctuation crushed their shuttle.' }
                    ],
                    text: 'You send a heavily shielded team to extract components from the lighthouse structure. The technology is unlike anything you\'ve encountered - not just advanced, but based on principles that current science doesn\'t even theorize. The core of the lighthouse contains a gravity manipulation system that doesn\'t just resist the neutron star\'s pull but actively harvests it for energy, converting gravitational potential into coherent beams of exotic particles. During the extraction, a sudden fluctuation in the neutron star\'s rotation causes a gravity wave that crushes one of your shuttles, killing two crew members instantly. The recovered technology, while incredible in potential, comes at a high cost, and your engineers estimate it will take years of study before any practical applications can be derived.',
                    continuesToNextEncounter: true
                }
            }
        ]
    },
    {
        id: uuidv4(),
        type: 'story',
        title: 'The Rebirth Chamber',
        description: 'At the point of highest radiation and gravitational distortion, you discover an ancient temple-like structure. Inside, energies from the neutron star converge in patterns that seem to be forming a coherent entity from pure stellar matter.',
        region: 'supernova',
        choices: [
            {
                id: uuidv4(),
                text: 'Disrupt the formation process (Requires 70 Energy)',
                outcome: {
                    resources: [
                        { type: 'energy', amount: -70, message: 'Enormous power was required to counteract the formation energies.' },
                        { type: 'energy', amount: 100, message: 'The disrupted formation released a massive surge of harvestable energy.' },
                        { type: 'crew', amount: -3, message: 'Three crew members were lost when the backlash damaged your ship\'s life support systems.' }
                    ],
                    text: 'Something about the forming entity strikes you as dangerous - perhaps the way it seems to consume surrounding matter and energy with increasing hunger. You divert maximum power to generate a countervailing energy field, attempting to disrupt the formation process. The reaction is violent and immediate. The partially-formed entity lets out what can only be described as a scream that transcends normal sensory perception, felt rather than heard throughout your ship. The backlash damages several critical systems, killing three crew members when a life support section decompresses. However, as the entity destabilizes, it releases an enormous surge of energy that your collectors harvest. Your surviving science team believes you may have prevented something catastrophic, but the true nature of what was forming remains a mystery that will haunt your dreams.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Accelerate the process (Requires 65 Insight)',
                outcome: {
                    resources: [
                        { type: 'insight', amount: -65, message: 'Exceptional scientific understanding was needed to interact with the formation process.' },
                        { type: 'insight', amount: 100, message: 'Communion with the stellar entity provided transcendent understanding of cosmic forces.' },
                        { type: 'crew', amount: -1, message: 'One crew member physically merged with the entity during the communion process.' }
                    ],
                    text: 'Fascination overcomes caution as your science team determines that the entity forming is not a threat but a natural evolution of stellar consciousness. You carefully direct additional energy into the process, catalyzing what might otherwise take decades more to complete. As the entity takes coherent form - a swirling mass of plasma and light that somehow conveys sentience - it attempts communication. Your xenolinguists establish a rudimentary connection, and one particularly gifted officer volunteers for direct neural interface. The communion is successful but irreversible; her consciousness merges with the entity as her physical form dissipates into energy. Through this sacrifice, you gain unprecedented insights into stellar evolution, quantum gravity, and the interconnected nature of consciousness throughout the cosmos. The entity, now fully formed and carrying a part of your crew member within it, departs toward the galactic core, leaving you with knowledge that will take generations to fully comprehend.',
                    continuesToNextEncounter: true
                }
            },
            {
                id: uuidv4(),
                text: 'Establish communication protocols (Requires 60 Scrap)',
                outcome: {
                    resources: [
                        { type: 'scrap', amount: -60, message: 'Materials were used to construct specialized communication equipment.' },
                        { type: 'insight', amount: 80, message: 'Limited communication with the forming entity revealed its true nature.' },
                        { type: 'crew', amount: 4, message: 'Four new consciousness matrices from the entity were downloaded into biomechanical bodies.' }
                    ],
                    text: 'You construct specialized equipment to establish communication with whatever is forming within the chamber. Initial contact reveals a startling truth: this is not a single entity but a collective consciousness - the merged minds of billions who perished in the supernova, somehow preserved in the exotic matter of the neutron star and now coalescing into a new form of existence. They explain that they are neither truly alive nor dead, but transformed. After centuries of isolation, they hunger for connection. In an unprecedented exchange, they offer to share a fragment of their collective - four consciousness matrices downloaded into biomechanical bodies your engineers construct. These new crew members possess knowledge spanning centuries and a perspective utterly alien yet deeply familiar. They warn that their larger self continues forming and will soon emerge, driven by needs and motivations even they cannot fully articulate from their now-individualized perspective.',
                    continuesToNextEncounter: true
                }
            }
        ]
    }
]; 
