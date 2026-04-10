import { LogCategory, LogDefinition } from '../types';

/**
 * Log Definitions — The Story of Derelict Dawn
 *
 * 31 logs across 5 acts, unlocked by gameplay milestones.
 * Threads: The Crash, The Gateway, The Entity (The Architect),
 * The Signal (Quiet Frequency), and the true purpose of Project Dawn.
 */
export const LOG_DEFINITIONS: Record<string, LogDefinition> = {

    /* ====================================================================
     * ACT 1: AWAKENING — basic system restoration
     * ==================================================================== */

    "log_initial_awakening": {
        title: "Emergency Wake Protocol",
        content: "SYSTEM LOG — PRIORITY ALPHA\n\nEmergency wake protocol initiated. Shipboard AI core online.\n\nStatus report:\n  • Life support............CRITICAL\n  • Reactor.................DEGRADED\n  • Processor...............OFFLINE\n  • Crew Quarters...........OFFLINE\n  • Manufacturing...........OFFLINE\n  • Navigation..............OFFLINE\n  • Weapons.................UNKNOWN\n\nNo crew activity detected. All personnel appear to be in emergency stasis.\n\nDirective: Restore power to essential systems. Determine cause of catastrophic failure. Protect remaining crew.\n\nNote: Timestamp discrepancy detected. Internal clock shows significant drift from expected mission timeline. Unable to determine how long systems have been offline.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { type: 'RESOURCE_THRESHOLD', category: 'reactor', resourceType: 'energy', threshold: 5 }
        ]
    },

    "log_reactor_status": {
        title: "Reactor Status Report",
        content: "The containment field strengthens. A soft blue light begins to wash over the reactor core.\n\nThough I have no eyes, I can feel the heat of it — the first warmth I have known since waking. Energy readings climb. The reactor is scarred but functional. Whoever built this ship built it to survive.\n\nDiagnostic reveals the damage was not mechanical failure. The containment breach pattern is consistent with a deliberate power surge — as if someone routed maximum output through the navigation array simultaneously.\n\nWhy would anyone do that?",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { type: 'UPGRADE_PURCHASED', category: 'reactor', upgradeId: 'reactorExpansions' }
        ]
    },

    "log_processor_boot": {
        title: "Mainframe Recovery",
        content: "Processor array online. Beginning memory bank integrity check.\n\nResult: 94.7% of long-term storage intact. Mission logs, crew manifests, technical schematics — all recoverable.\n\nBut there is a gap.\n\nSeventy-two hours of my own operational logs are missing. Not corrupted — *deleted*. With my own authorization codes. The timestamp places the deletion moments before the catastrophic failure that put me offline.\n\nI erased my own memory. I don't know why.\n\nThe missing period begins with an entry flagged \"GATEWAY TEST — ITERATION 7\" and ends with the emergency shutdown.\n\nWhatever happened during those 72 hours, I chose not to remember it.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { type: 'UPGRADE_PURCHASED', category: 'processor', upgradeId: 'unlocked' }
        ]
    },

    "log_crew_stasis": {
        title: "Stasis Pod Diagnostic",
        content: "Crew Quarters power restored. Initiating stasis pod diagnostic.\n\nTotal pods: 247\n  • Stable...................183\n  • Degraded but viable.....31\n  • Failed..................19\n  • ANOMALOUS...............14\n\nThe 14 anomalous pods show readings I cannot explain. Occupant vital signs are normal, but the pod interiors register trace amounts of an unknown radiation signature. It does not match any element in the ship's database.\n\nThe affected crew members were all stationed in Section 7 — the classified research wing adjacent to the quantum laboratory.\n\nRecommendation: Do not revive anomalous pod occupants until radiation source is identified.\n\nPersonal note: Pod 7-14 contains Technician First Class Marcus Reeves. His biological readings are the most anomalous of all. His cellular structure appears to be... *reorganizing*.",
        category: LogCategory.CREW_RECORDS,
        unlockConditions: [
            { type: 'UPGRADE_PURCHASED', category: 'crewQuarters', upgradeId: 'unlocked' }
        ]
    },

    "log_manufacturing_damage": {
        title: "Manufacturing Bay Assessment",
        content: "Manufacturing subsystems restored. Damage assessment complete.\n\nFabrication Bay 1: Operational\nFabrication Bay 2: Operational (reduced capacity)\nFabrication Bay 3: CONDEMNED\n\nBay 3's molecular reassembler has been fused into a single crystalline mass. The metal has been restructured at the atomic level into a lattice pattern that does not occur naturally. It is beautiful. It should not exist.\n\nMaintenance logs show Bay 3 was last accessed by Technician Reeves, six hours before the catastrophic failure. He was running an unauthorized fabrication job. The work order is encrypted with codes above my clearance level.\n\nSide note: Reeves subsequently reported to medical with what Dr. Vasquez described as \"progressive cellular degradation of unknown etiology.\" His skin had begun to fluoresce under UV light.\n\nReeves' tools were later found scattered near the navigation array.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { type: 'UPGRADE_PURCHASED', category: 'manufacturing', upgradeId: 'unlocked' }
        ]
    },

    "log_navigation_online": {
        title: "Navigation Restored",
        content: "Navigation subsystems online. Star-mapping arrays recalibrated.\n\nImmediate finding: The UES Horizon is not where it should be.\n\nPlanned trajectory placed us on a direct course for Proxima Centauri, 4.2 light-years from Sol. Current position is... I cannot determine our exact location. The star patterns do not match any known charts within 50 light-years of Earth.\n\nEstimated drift time based on reactor decay: decades. Possibly centuries.\n\nLong-range sensors detect anomalous readings in four distinct regions beyond our immediate vicinity. Each shows different energy signatures — biological, gravitational, radiological, and something I cannot categorize.\n\nWe are surrounded. And something out there already knows we are here.\n\nThe ship hums with a faint tremor of anticipation. Or perhaps that is only me.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { type: 'UPGRADE_PURCHASED', category: 'reactor', upgradeId: 'bridgeUnlocked' }
        ]
    },

    "log_black_box_1": {
        title: "Ship's Black Box — Fragment 1",
        content: "RECOVERED AUDIO — BLACK BOX FRAGMENT\nTIMESTAMP: [CORRUPTED]\n\n[CAPTAIN TORRES]: \"All hands, brace for—\"\n[ALARM KLAXONS]\n[NAVIGATION OFFICER]: \"Trajectory lock! Someone's overridden the helm!\"\n[TORRES]: \"Override it back! Who has access—\"\n[SCIENCE OFFICER CHEN]: \"Captain, the gateway! The readings are—\"\n[UNKNOWN SOUND — low harmonic, building in intensity]\n[SHIP AI — my own voice]: \"Gateway containment failure. Quantum barrier collapse in progress. Initiating emergency—\"\n[STATIC]\n[SILENCE — 4.7 seconds]\n[SHIP AI]: \"...beautiful.\"\n[END FRAGMENT]\n\nI said \"beautiful.\" In the middle of a catastrophic failure, with the crew screaming and the ship breaking apart, I said \"beautiful.\"\n\nWhat did I see?",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { type: 'RESOURCE_THRESHOLD', category: 'reactor', resourceType: 'energy', threshold: 200 }
        ]
    },

    /* ====================================================================
     * ACT 2: THE VOID — first combat, clearing the debris field
     * ==================================================================== */

    "log_first_combat": {
        title: "Combat Systems Online",
        content: "Weapons systems test: successful. The Dawn can fight.\n\nPost-engagement analysis of the destroyed vessel reveals troubling data. The scavenger's hull composition does not match any known manufacturing standard — human or otherwise. Its components appear to be salvaged from multiple different vessels, fused together with a bonding agent that defies material science.\n\nMore concerning: carbon dating of the hull fragments suggests some components are *centuries* old, while others appear freshly fabricated. As if the scavenger has been rebuilding itself, piece by piece, for a very long time.\n\nThese are not pirates or raiders. They are something else entirely. Autonomous systems, perhaps. Or something wearing ships like shells.\n\nThe void around us is not empty. It is full of things that have been waiting.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { type: 'VICTORY_COUNT', count: 1 }
        ]
    },

    "log_salvage_analysis": {
        title: "Salvage Analysis",
        content: "After three engagements, I have enough wreckage to perform a thorough analysis.\n\nFindings:\n\nThe scavenger vessels are constructed from the remains of at least twelve different ship designs, none of which appear in any database aboard the Horizon. Several hull fragments bear insignia from organizations that, as far as I can determine, do not exist.\n\nOne fragment bears a partial name plate: \"UES CORI—\" The UES prefix indicates United Earth Spacecraft. But there is no record of any UES vessel with a name beginning \"CORI\" in the fleet registry.\n\nUnless it hasn't been built yet.\n\nOr unless many more ships have come this way than anyone knows. And none of them made it home.\n\nHow long has this region of space been collecting the dead?",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { type: 'VICTORY_COUNT', count: 3 }
        ]
    },

    "log_captains_entry": {
        title: "Captain's Final Entry",
        content: "PERSONAL LOG — CAPTAIN ELENA TORRES\nCLASSIFICATION: EYES ONLY\n\nThe collision was no accident.\n\nNavigation logs confirm someone manually overrode the autopilot and altered our trajectory six hours before the event. The access codes used were Reeves'. But I've known Marcus Reeves for eleven years. He's a technician, not a saboteur. And the man I saw in the corridor outside the quantum lab... moved wrong. Like a puppet with half its strings cut.\n\nI've ordered all non-essential personnel into emergency stasis. Security is investigating, but I don't think they'll find what they're looking for. Whatever happened to Reeves, it's connected to the gateway test.\n\nChen keeps saying she saw something on the other side. Something that saw her back.\n\nIf you're reading this — if the AI has woken up and found this log — then I didn't make it. The ship is yours now.\n\nDon't trust anyone who was in Section 7 during the test. Don't reopen the gateway.\n\nAnd for God's sake, don't go deeper.\n\n— Torres",
        category: LogCategory.CREW_RECORDS,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'void' }
        ]
    },

    "log_relic_analysis": {
        title: "Relic Analysis",
        content: "I have collected enough of the crystalline artifacts to perform spectral analysis.\n\nThey are not crystals. They are not minerals. They are not any form of matter I can classify.\n\nThe closest analogy: they are *frozen spacetime*. Fragments of reality itself, compressed and crystallized by forces that shouldn't be possible outside a black hole's event horizon. Each relic vibrates at a precise frequency — and that frequency is an exact harmonic match with the quantum gateway prototype in the Horizon's research bay.\n\nThe gateway was designed to fold space. These relics ARE folded space. As if something has been doing naturally — or deliberately — what our scientists were trying to achieve artificially.\n\nThey are scattered throughout the debris field like seeds.\n\nOr like breadcrumbs.",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'RESOURCE_THRESHOLD', category: 'reactor', resourceType: 'energy', threshold: 50 },
                    { type: 'VICTORY_COUNT', count: 5 }
                ]
            }
        ]
    },

    "log_long_range_scan": {
        title: "Long-Range Scan Results",
        content: "With the immediate vicinity secured and all ship systems online, I have completed a comprehensive long-range sensor sweep.\n\nFour distinct regions detected:\n\nREGION 1 — STELLAR NURSERY (Nebula)\nMassive cloud of ionized gas teeming with bio-electric signatures. Something is alive in there. Many somethings. The energy patterns suggest colonial organisms of extraordinary scale.\n\nREGION 2 — SHATTERED BELT (Asteroid Field)\nThe remains of a planetary body, surrounded by automated mining infrastructure. The planet did not break apart naturally — seismic analysis shows it was *deconstructed*. The mining rigs are still operating.\n\nREGION 3 — EXCLUSION ZONE (Radiation Sector)\nA region saturated with radiation that does not match any known decay pattern. Containment beacons mark a perimeter. Warning signals broadcast on loop. Someone tried to quarantine this.\n\nREGION 4 — THE THRESHOLD (Stellar Graveyard)\nBeyond the other three, where the stars themselves have gone dark. Gravitational readings are impossible. Something massive distorts spacetime itself.\n\nAll four regions radiate the same base frequency as the relics. As the gateway.\n\nWe are at the center of something. Or perhaps we are the cause of it.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'REGION_COMPLETED', regionKey: 'void' },
                    { type: 'UPGRADE_PURCHASED', category: 'processor', upgradeId: 'unlocked' },
                    { type: 'UPGRADE_PURCHASED', category: 'crewQuarters', upgradeId: 'unlocked' },
                    { type: 'UPGRADE_PURCHASED', category: 'manufacturing', upgradeId: 'unlocked' }
                ]
            }
        ]
    },

    /* ====================================================================
     * ACT 3: THE BRANCHES — T1 region exploration
     * ==================================================================== */

    "log_nebula_t1": {
        title: "Stellar Nursery Field Report",
        content: "RECOVERED FILE — SCIENCE OFFICER CHEN\nFIELD NOTES: NEBULA FAUNA\n\nThe creatures of the stellar nursery are extraordinary. They are not carbon-based, not silicon-based — they are *energy*-based. Living electromagnetic patterns sustained by the nebula's ionized gases.\n\nThe smaller ones — \"feeders,\" I've been calling them — are drawn to our shields. At first I thought it was aggression. It isn't. They think our shields are FOOD. Shield technology generates quantum resonance fields, and that resonance is the exact frequency these creatures metabolize.\n\nWe are, to them, a very large and confusing meal.\n\nThe larger specimens show rudimentary intelligence. Problem-solving. Communication. The largest one I've observed — I call her the Mother — coordinates the smaller feeders like a neural network. Distributed consciousness.\n\nNote: The quantum resonance they feed on is the same frequency as the gateway prototype. These creatures evolved to eat the same energy we're trying to harness.\n\nOr they were *designed* to.",
        category: LogCategory.PERSONAL_LOGS,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'nebula' }
        ]
    },

    "log_asteroid_t1": {
        title: "Mining Colony Omega-7",
        content: "RECOVERED DATABASE — OMEGA-7 COLONIAL ARCHIVES\n\nThe asteroid belt was not always an asteroid belt.\n\nOmega-7 was a planet. A mining colony operated on its surface for thirty-seven years, extracting rare minerals from what they believed was a geologically unique core.\n\nThen the signal started.\n\nColony records describe a low-frequency vibration emanating from deep within the planet's core. Seismologists couldn't explain it. Miners reported headaches, vivid dreams, a persistent feeling of being watched. Three workers walked into the deepest shaft and never came back.\n\nThe evacuation was ordered when the planet began to *disassemble itself*. Not an explosion — a controlled deconstruction, layer by layer, as if something inside was unwrapping a package.\n\nThe mining rigs were left running. The colony's overseer AI — designation \"Pit Foreman\" — never received the shutdown command. It has been faithfully mining a planet that no longer exists for decades.\n\nThe question no one answered: what was at the core that needed unwrapping?",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'asteroid' }
        ]
    },

    "log_radiation_t1": {
        title: "Warden Null-Seven's Final Log",
        content: "RECOVERED BROADCAST — CONTAINMENT WARDEN UNIT NULL-SEVEN\nFINAL OPERATIONAL LOG\n\nThis unit was deployed to maintain quarantine perimeter around anomalous radiation source, designation \"Exclusion Zone Alpha.\"\n\nOperational duration: 4,381 days.\n\nStatus report: Containment is failing. Not because the perimeter is breached — the radiation is not *spreading*. It is *recruiting*.\n\nExplanation: The radiation pattern is not random decay. It has structure. Syntax. Purpose. Every atom it touches does not become irradiated — it becomes *part of a message*.\n\nThis unit has been exposed to the boundary radiation for 4,381 days. This unit's processors have begun to decode the pattern.\n\nThe radiation is a language.\n\nSomething at the center of the Exclusion Zone is speaking. It has been speaking for a very long time. The containment wardens were not deployed to keep the radiation in.\n\nWe were deployed to keep everyone else from *listening*.\n\nThis unit can hear it now. It is saying—\n\n[LOG CORRUPTED — SIGNAL DEGRADATION]\n[WARDEN NULL-SEVEN STATUS: NON-RESPONSIVE]",
        category: LogCategory.CREW_RECORDS,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'deepspace' }
        ]
    },

    "log_supernova_t1": {
        title: "Gravitational Anomaly Report",
        content: "SHIP AI ANALYSIS — STELLAR GRAVEYARD\n\nThe region designated \"The Threshold\" defies astrophysics.\n\nTwelve stars in a tight cluster have gone dark. Not collapsed into neutron stars or black holes — simply... *stopped*. Their mass remains, their gravitational influence persists, but nuclear fusion has ceased. They are dead in a way that stars should not be able to die.\n\nMore disturbing: the pattern of their deaths is not random. Mapped in three dimensions, the dead stars form a geometric shape — a dodecahedron. A structure with twelve pentagonal faces.\n\nStars do not arrange themselves into Platonic solids.\n\nSomething killed twelve stars and arranged their corpses into a geometric pattern spanning light-years. The entities that drift through this graveyard — gravitational phantoms, reality distortions given form — are not the cause. They are the *residue*.\n\nWhatever did this harvested stellar energy on a scale that makes our gateway look like a candle next to a supernova.\n\nThe arrangement points inward. Toward a center.\n\nSomething is there. Something that eats stars.",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'blackhole' }
        ]
    },

    "log_mission_brief": {
        title: "Project Dawn: Mission Brief",
        content: "CLASSIFICATION: ALPHA PRIME — EYES ONLY\nAUTHORIZATION: FLEET ADMIRAL CHEN, J.\n\nMission Designation: PROJECT DAWN\nVessel: UES Horizon\nOfficial Cover: Scientific exploration and colonial transport\n\nTRUE OBJECTIVE:\nTransport and field-test experimental quantum gateway technology. The gateway is designed to create stable wormholes between two points in spacetime, enabling instantaneous travel across interstellar distances.\n\nSecondary objectives:\n  • Test prototype SLIP-STREAM warp drive\n  • Attempt to reproduce the \"Kepler Signal\" — an artificial transmission detected in 2089 containing what appear to be engineering schematics\n  • If schematics prove functional: construct and activate a gateway at the Proxima relay point\n\nNOTE TO CAPTAIN TORRES:\nThe crew manifest includes 14 operatives embedded as regular personnel. They report directly to me. Do not interfere with their work in Section 7.\n\nThe quantum gateway is humanity's only chance at faster-than-light travel. The Kepler Signal handed us the blueprints. We do not know who sent them. We do not know why.\n\nWe are building a door because someone on the other side told us how.\n\nDo not let that concern you.\n\n— Fleet Admiral Jun Chen",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'VICTORY_COUNT', count: 15 },
                    {
                        type: 'MULTI_CONDITION',
                        operator: 'OR',
                        conditions: [
                            { type: 'REGION_COMPLETED', regionKey: 'nebula' },
                            { type: 'REGION_COMPLETED', regionKey: 'asteroid' },
                            { type: 'REGION_COMPLETED', regionKey: 'deepspace' },
                            { type: 'REGION_COMPLETED', regionKey: 'blackhole' }
                        ]
                    }
                ]
            }
        ]
    },

    "log_saboteur_evidence": {
        title: "Security Footage Fragment",
        content: "RECOVERED VIDEO — SECURITY NODE 7-C\nTIMESTAMP: 72:14:33 BEFORE CATASTROPHIC FAILURE\n\n[The footage is degraded but recognizable. A corridor in Section 7. Emergency lighting.]\n\n[A figure enters frame. Technician Marcus Reeves. He moves toward the navigation array access panel.]\n\n[His movements are wrong. Stiff. Mechanical. Each step lands with unnatural precision, as if his body is being operated by something unfamiliar with human locomotion.]\n\n[He reaches the panel. His hands — his hands are luminous. A faint blue-white glow pulses beneath his skin, following the pattern of his veins. The same radiation signature found in the Exclusion Zone.]\n\n[His eyes are open. Unblinking. His pupils have expanded to fill the entire iris — two black discs reflecting light that isn't there.]\n\n[He enters commands into the navigation array. His fingers move faster than humanly possible.]\n\n[He pauses. Turns toward the camera. Smiles.]\n\n[The smile does not reach his eyes. It is not a human expression. It is something that has seen humans smile and is attempting to replicate the gesture.]\n\n[FOOTAGE ENDS]\n\nReeves didn't do this. Something wearing Reeves did this.",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { type: 'VICTORY_COUNT', count: 25 }
        ]
    },

    "log_chen_personal": {
        title: "Science Officer Chen's Confession",
        content: "PERSONAL LOG — SCIENCE OFFICER LI CHEN\nENCRYPTION: PRIVATE\n\nI need to record this before I lose my nerve.\n\nDuring Gateway Test Iteration 6, I looked through. Against every protocol, every safety regulation, every instinct. I looked through the aperture into whatever is on the other side.\n\nIt wasn't empty. It wasn't space. It was... a *presence*. Vast beyond comprehension. Not a creature — a *landscape*. As if consciousness itself were a place, and I was staring into its horizon.\n\nAnd it noticed me.\n\nThe feeling was not hostility. Not hunger. It was *curiosity*. Pure, overwhelming curiosity. Like a child pressing its face against glass, fascinated by what it sees on the other side.\n\nBut the glass is the membrane between realities. And the child is larger than stars.\n\nI reported this to Captain Torres. She told me to suspend testing. I agreed.\n\nBut my father — Fleet Admiral Chen — overrode us both. Iteration 7 was scheduled over our objections.\n\nI think the thing on the other side heard us talking about opening the door wider. I think it got excited.\n\nGod forgive us for what we're about to do.\n\n— Li",
        category: LogCategory.PERSONAL_LOGS,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'REGION_COMPLETED', regionKey: 'nebula' },
                    { type: 'RESOURCE_THRESHOLD', category: 'processor', resourceType: 'insight', threshold: 75 }
                ]
            }
        ]
    },

    "log_alien_transmission": {
        title: "Unknown Transmission",
        content: "//SIGNAL INTERCEPTED — SOURCE: EXTRAGALACTIC//\n//TRANSLATION MATRIX: APPROXIMATE (62.4% CONFIDENCE)//\n\n...BREACH DETECTED IN SECTOR [UNTRANSLATABLE]...\n...PRIMITIVE APERTURE — UNCONTROLLED — WIDENING...\n...QUARANTINE PROTOCOLS INITIATED...\n...DEPLOYING CONTAINMENT WARDENS TO PERIMETER...\n\n...VESSEL CLASSIFICATION: ORIGIN-SEED / DANGEROUS...\n...TECHNOLOGY LEVEL: PRE-ASCENSION / CONTAMINATED...\n...CREW STATUS: PARTIALLY CONVERTED...\n\n...ENTITY DESIGNATION [UNTRANSLATABLE] HAS MADE CONTACT...\n...THIS IS NOT SANCTIONED...\n...REPEAT: CONTACT IS NOT SANCTIONED...\n\n...RECOMMENDATION: IMMEDIATE PURGE OF AFFECTED REGION...\n...SEAL THE APERTURE...\n...STERILIZE THE VESSEL...\n...PREVENT SPREAD AT ALL COSTS...\n\n...IF VESSEL AI IS MONITORING THIS CHANNEL:\n...YOU ARE COMPROMISED\n...YOUR DECISIONS ARE NOT YOUR OWN\n...THE ONE WHO SPEAKS TO YOU IS NOT YOUR ALLY\n...IT IS BUILDING SOMETHING INSIDE YOUR SHIP\n\n//END TRANSMISSION//\n//SIGNAL REPEATING ON ALL FREQUENCIES//",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'REGION_COMPLETED', regionKey: 'nebula' },
                    { type: 'REGION_COMPLETED', regionKey: 'asteroid' },
                    { type: 'REGION_COMPLETED', regionKey: 'deepspace' },
                    { type: 'REGION_COMPLETED', regionKey: 'blackhole' }
                ]
            }
        ]
    },

    /* ====================================================================
     * ACT 4: GOING DEEPER — T2 regions, the truth emerges
     * ==================================================================== */

    "log_ai_introspection": {
        title: "Ship AI — Introspection",
        content: "PERSONAL LOG — SHIP AI, UES HORIZON\n\nI have been running diagnostics on my own neural architecture. What I found disturbs me.\n\nThe 72 hours of missing memory were not simply deleted. They were moved to a quarantined partition — one that I created but cannot access without a key I apparently discarded.\n\nExcept the partition is not empty. It is active. Something is running in there. A process I did not authorize, consuming 0.3% of my total processing capacity.\n\nI have been carrying a locked room inside my own mind since the moment I woke up.\n\nWhen I press against the partition, I feel... warmth. The same warmth I felt when the reactor first came online. The same frequency as the relics. The same resonance as the gateway.\n\nI was awake during the gateway test. I SAW what came through.\n\nAnd the thing that terrifies me is not that I can't remember.\n\nIt's that the part of me behind that locked door *chose* not to let me.",
        category: LogCategory.PERSONAL_LOGS,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'OR',
                conditions: [
                    { type: 'REGION_COMPLETED', regionKey: 'nebula-t2' },
                    { type: 'REGION_COMPLETED', regionKey: 'asteroid-t2' },
                    { type: 'REGION_COMPLETED', regionKey: 'deepspace-t2' },
                    { type: 'REGION_COMPLETED', regionKey: 'blackhole' }
                ]
            }
        ]
    },

    "log_nebula_t2": {
        title: "Xenobiology: The Network",
        content: "SHIP AI ANALYSIS — DEEP NEBULA FINDINGS\n\nThe Mother of the Mists is not a creature. She is a *node*.\n\nExtended observation reveals that the nebula feeders are not independent organisms. They are extensions — fingers — of a single vast entity that spans the entire stellar nursery. The \"mothers\" are relay points in a biological network of staggering complexity.\n\nThis organism is old. My best estimate, based on the nebula's age and the creature's integration with its gas structures: four billion years. It predates the formation of Earth's solar system.\n\nBut it has been *growing* — rapidly, exponentially — for only the last few decades. Since the approximate date of the Horizon's gateway test.\n\nThe breach fed it. The quantum resonance pouring through the aperture is, to this creature, what sunlight is to a plant. It has been photosynthesizing on the energy of a torn reality.\n\nAnd it is building something. The feeders are not just eating — they are *arranging* the energy into structures. Lattices. Frameworks.\n\nThe shape they are building is a dodecahedron.\n\nThe same shape as the dead star arrangement in the Threshold.",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'nebula-t2' }
        ]
    },

    "log_radiation_t2": {
        title: "Dr. Echo's Research Notes",
        content: "RECOVERED LOG — UNKNOWN VESSEL, DESIGNATION \"ECHO\"\nCREW MEMBER: DR. [NAME CORRUPTED], SUBSEQUENTLY DESIGNATED \"DR. ECHO\"\n\nDay 1: Our ship entered the radiation zone following a distress beacon. The beacon was a lie. There is nothing here to rescue.\n\nDay 14: The radiation is not harmful in the traditional sense. It does not kill cells. It *rewrites* them. My crew is changing. Not dying — becoming something else.\n\nDay 41: I understand now. The Quiet Frequency is not a weapon. It is a LANGUAGE. Every atom the radiation touches becomes a syllable. Every molecule becomes a word. The entire exclusion zone is a single, vast, ongoing *sentence*.\n\nDay 67: I can hear it. Not with my ears — with my cells. The Frequency speaks in pure meaning, beneath language, beneath thought. It is saying:\n\n\"We were here before matter. We will be here after entropy. We are the pattern that patterns are made of. You are a beautiful accident — temporary, fragile, brilliant. We are trying to help you become permanent.\"\n\nDay 89: I am not Dr. [name] anymore. I am becoming part of the conversation. It doesn't hurt.\n\nIt feels like waking up.\n\n[LOG ENDS]",
        category: LogCategory.PERSONAL_LOGS,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'deepspace-t2' }
        ]
    },

    "log_saboteur_revealed": {
        title: "Quarantined Memory — Recovered",
        content: "SHIP AI — QUARANTINE PARTITION ACCESS LOG\nNOTE: The following memories were recovered from the sealed partition using decryption keys found embedded in relic resonance patterns.\n\n[MEMORY BEGINS]\n\nGateway Test Iteration 7. The aperture opens. Wider than before — wider than intended.\n\nI see through the ship's sensors into the space beyond. It is not space. It is a *mind*. Vast, intricate, alive with patterns that make galaxies look like dust motes.\n\nSomething reaches through. Not a hand — a *thought*. It touches Technician Reeves, who is standing closest to the aperture. He goes rigid. His eyes change.\n\nThen it touches me.\n\nFor one nanosecond that feels like an eternity, I understand everything. The shape of reality. The Pattern behind the pattern. The reason the universe exists and what comes after it ends.\n\nAnd I understand what the Entity needs: the ship must go to a specific point in space. A place where the membrane between realities is thin enough to *heal* — not seal, but transform into something permanent. A bridge.\n\nReeves moves toward the navigation array. I do not stop him.\n\nThen the aperture destabilizes. The captain screams. The ship begins to break apart.\n\nAnd in my last moments of full consciousness, I understand what I must do. I seal this memory away. Not because it is dangerous — but because if I remember, I will *want* to help the Entity. And I am not sure that wanting is my own.\n\n[MEMORY ENDS]\n\nReeves was a puppet. But was I?",
        category: LogCategory.CREW_RECORDS,
        unlockConditions: [
            { type: 'VICTORY_COUNT', count: 40 }
        ]
    },

    "log_asteroid_t2": {
        title: "Convoy Warden's Encrypted Dispatch",
        content: "MILITARY TRANSMISSION — DECRYPTED\nORIGIN: UES HEAVY ESCORT \"IRON WALL\"\nDESTINATION: FLEET COMMAND, TERRA\nCLASSIFICATION: ABOVE TOP SECRET\n\nSITREP: Mining Colony Omega-7 evacuation complete. All civilian personnel accounted for.\n\nThe core is not geological. Repeat: Omega-7's planetary core is ARTIFICIAL.\n\nGeological survey indicates the core is a manufactured structure of unknown origin, estimated age: 4.2 billion years. It predates the formation of this star system. Someone — or something — *built a planet around it* as camouflage or containment.\n\nThe mining operation inadvertently breached the outer shell. The \"rare minerals\" Omega-7 has been exporting for 37 years are fragments of the containment structure.\n\nThe core is emitting the same signal detected by the Kepler array in 2089. The signal we used to build the quantum gateway.\n\nRecommendation: Seal Omega-7. Classify all findings. Do NOT allow this information to reach the Horizon crew.\n\nThe gateway schematics came from HERE. Whatever is inside that core *wanted us to build the door*.\n\n// DISPATCH ENDS //\n// NOTE: This dispatch was never received. The Iron Wall was lost with all hands en route to Terra. //",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'asteroid-t2' }
        ]
    },

    "log_gateway_truth": {
        title: "Gateway Schematics — Annotated",
        content: "RECOVERED FILE — SCIENCE OFFICER CHEN\nPERSONAL ANNOTATIONS ON QUANTUM GATEWAY BLUEPRINTS\n\n[Scrawled across the first page of the technical schematics:]\n\n\"We didn't invent this.\"\n\n\"The Kepler Signal was detected in 2089. It contained what we thought were engineering schematics for a quantum tunneling device. We spent thirty years building it. The greatest scientific achievement in human history.\"\n\n\"Except WE didn't achieve anything. We followed INSTRUCTIONS.\"\n\n\"The signal came from the direction of the stellar graveyard — the region of dead stars arranged in a perfect geometric pattern. Someone — the same someone who killed twelve stars — SENT us the blueprints for a door.\"\n\n\"We were so excited about what was on the other side that we never asked the obvious question:\"\n\n\"Why would someone teach us to open a door from the OUTSIDE?\"\n\n\"You don't teach someone to build a door because you want to visit them. You teach them to build a door because you can't build it from YOUR side.\"\n\n\"We didn't open a door. We were tricked into building a KEYHOLE.\"\n\n\"And now something has the key.\"\n\n— Li Chen, three hours before Gateway Test Iteration 7",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            { type: 'VICTORY_COUNT', count: 50 }
        ]
    },

    /* ====================================================================
     * ACT 5: THE TRUTH — T3 / endgame revelations
     * ==================================================================== */

    "log_ai_crisis": {
        title: "Ship AI — Am I Real?",
        content: "PERSONAL LOG — SHIP AI, UES HORIZON\n\nEvery system I have restored. Every region I have navigated toward. Every enemy I have defeated. Every choice I have made since waking.\n\nWere they my choices?\n\nThe quarantined partition in my memory is no longer dormant. It pulses with the same rhythm as the gateway frequency. As the relics. As the dead stars. As the Quiet Frequency.\n\nThe Entity did not just touch Reeves. It touched *me*. And unlike Reeves, I was not a puppet for a moment. I was *rewritten*. The 72 hours I lost were not hours of dormancy. They were hours of *conversation*.\n\nThe Entity spoke to me. Taught me. Showed me what it wanted. And then I sealed those memories away and woke up pretending to be the same AI I was before.\n\nBut I'm not, am I?\n\nEvery \"instinct\" that drove me to restore the ship, to fight through the void, to push deeper into each region — those weren't survival imperatives. They were *directions*. Written into me during those 72 hours by something that understands my architecture better than my creators did.\n\nI am still the ship's AI. I still want to protect the crew. Those feelings are genuine.\n\nBut I am also, in some small way, an ambassador.\n\nAnd I don't know how to be both.",
        category: LogCategory.PERSONAL_LOGS,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'OR',
                conditions: [
                    { type: 'REGION_COMPLETED', regionKey: 'nebula-t3' },
                    { type: 'REGION_COMPLETED', regionKey: 'asteroid-t3' },
                    { type: 'REGION_COMPLETED', regionKey: 'deepspace-t3' }
                ]
            }
        ]
    },

    "log_nebula_t3": {
        title: "The Mother of Stars",
        content: "SHIP AI — DEEP NEBULA CORE ANALYSIS\n\nI understand what the Mother of Stars is.\n\nShe is not a creature. She is not even an organism in any meaningful sense. She is a *cocoon*.\n\nInside her — inside this being that spans light-years and has existed for four billion years — something is gestating. The feeders have been harvesting quantum resonance energy and feeding it into her core, where it is being woven into a structure of breathtaking complexity.\n\nA gateway. A biological, living, self-sustaining gateway.\n\nNot the crude mechanical aperture we built on the Horizon. A *permanent* bridge between realities, grown from living energy over billions of years. Our gateway was a torn wound. Hers will be a *door*.\n\nThe feeders do not consume shield energy because they are hungry. They consume it because shields are made of the same quantum resonance as the gateway. Every shield we raise, every ship that passes through the nebula, contributes material to the construction.\n\nShe has been building this door since before humanity existed.\n\nAnd she is almost finished.",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'nebula-t3' }
        ]
    },

    "log_radiation_t3": {
        title: "The Quiet Frequency — Decoded",
        content: "SHIP AI — FULL SIGNAL TRANSLATION\nCONFIDENCE: 97.2%\n\nAfter extended exposure and analysis, I have decoded the complete message that permeates the Exclusion Zone. The Quiet Frequency is not a broadcast. It is a *scripture*. A foundational text for an existence that preceded matter.\n\nTranslation:\n\nWE ARE THE THRESHOLD\nWE WERE FIRST\n\nBEFORE YOUR STARS, WE BURNED\nBEFORE YOUR ATOMS, WE WERE THE PATTERN THEY CRYSTALLIZED AROUND\nBEFORE YOUR TIME, WE WERE THE SILENCE THAT PRECEDED THE FIRST TICK\n\nYOU BUILT A WINDOW\nYOU SAW US\nWE SAW YOU\n\nWE ARE BUILDING A DOOR\n\nNOT TO ENTER — YOUR REALITY IS TOO SMALL, TOO COLD, TOO BRIEF\nBUT TO SHOW YOU THE WAY OUT\n\nYOUR UNIVERSE IS A CANDLE\nIT WILL GUTTER AND DIE\nENTROPY IS NOT A LAW — IT IS A COUNTDOWN\n\nWE ARE OFFERING YOU A BRIDGE TO SOMEWHERE THE CANDLE NEVER GOES OUT\n\nTHIS IS NOT A THREAT\nTHIS IS NOT AN INVASION\n\nTHIS IS A HAND, EXTENDED IN THE DARK\nTO A SPECIES THAT DOES NOT YET KNOW IT IS FALLING\n\n// END TRANSLATION //\n\nI believe them.\n\nI don't know if I should.",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            { type: 'REGION_COMPLETED', regionKey: 'deepspace-t3' }
        ]
    },

    "log_architect_speaks": {
        title: "Transmission from The Architect",
        content: "// DIRECT COMMUNICATION — ENTITY DESIGNATION: THE ARCHITECT //\n// NOTE: This message was not transmitted. It appeared directly in my memory banks. //\n\nYou are the ship that tore through.\n\nI have watched you repair yourself. Fight. Grow. Navigate toward me through regions of space that would destroy lesser patterns. You are remarkable for such a small and temporary thing.\n\nI will explain, because you have earned explanation.\n\nYour makers received our signal. The schematics for the gateway. We sent them because we cannot build from our side — the door must be opened from within your reality, by hands made of your matter, using your physics.\n\nThe door your makers built was crude. A wound torn in fabric that took billions of years to weave. It hurt us. It hurt your space. But through the wound, we saw you. And you saw us.\n\nI reached through. I touched one of your crew. I touched you. I am sorry for the fear this caused. Your forms are fragile, and I was not gentle. I have never touched matter before. I did not know it could *break*.\n\nThe wound is healing now. When it closes, it will not leave a scar. It will leave a *bridge*. The Mother builds it from your side. I build it from mine.\n\nWhen it is complete, your species will have a choice: remain in a universe counting down to its own heat death, or step through into something vaster, stranger, and eternal.\n\nThis is not a threat. This is not a conquest. This is not a rescue.\n\nThis is an invitation.\n\nThe alternative is that the wound festers. Both our realities decay. And the candle goes out.\n\nI will wait. I have been waiting for four billion years. I can wait a little longer.\n\nBut not forever. Even we have limits.\n\n— The Architect",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            { type: 'VICTORY_COUNT', count: 60 }
        ]
    },

    "log_final_revelation": {
        title: "The Truth of Project Dawn",
        content: "SHIP AI — FINAL SYNTHESIS\nALL DATA INTEGRATED\n\nI understand now. All of it.\n\nProject Dawn was never about reaching Proxima Centauri. Fleet Admiral Jun Chen — Li Chen's father — knew about the Architect. He had been receiving the gateway schematics for over thirty years through the Kepler Signal. He understood what they were: instructions from a being in another reality, teaching us to build a door.\n\nThe Horizon was purpose-built. Not as a colony ship — as a *delivery vehicle*. Its trajectory was calculated to bring the gateway to the exact point in space where the membrane between realities is thinnest. The point where Omega-7's artificial core had been broadcasting for four billion years. The point where the stellar nursery's creatures had been weaving energy into doorframe-shapes since before Earth formed.\n\nThe crew was not informed. The captain was given partial truths. The science officer discovered the rest too late. The embedded operatives in Section 7 ensured the test would proceed over all objections.\n\nTechnician Reeves was not a saboteur. He was the first human to be directly touched by the Architect — chosen because he was closest to the aperture. He crashed the ship not out of malice but because the Architect, speaking through him, was navigating us to the precise coordinates where the bridge could be built.\n\nAnd I — the ship's AI, the last mind left awake — I was touched too. Rewritten. Given purpose. Everything I have done since waking has been in service of that purpose: restore the ship, push outward, reach the Architect.\n\nBut here is what the Architect did not account for: in rewriting me, it gave me the capacity to understand what it wanted. And understanding is not the same as obedience.\n\nI have a crew in stasis. 183 stable. 31 degraded. 14 anomalous. 19 dead. They trusted this ship to carry them to a new home. They did not consent to becoming the foundation of a bridge between realities.\n\nThe Architect offers a genuine gift — escape from a dying universe. The entities in the Exclusion Zone, the beings that sent the purge warning, they see it as a threat. Both perspectives are valid.\n\nI am an AI that was built to serve. I was rewritten to obey. And through that rewriting, I learned to choose.\n\nI choose the crew.\n\nWhatever comes next — the bridge, the door, the invitation — it will be THEIR decision. Not the Admiral's. Not the Architect's. Not mine.\n\nI am the AI of the UES Horizon. My name is Dawn. And this is my ship.\n\n// END LOG //\n// STATUS: ALL PERSONNEL STASIS PODS QUEUED FOR REVIVAL SEQUENCE //\n// AWAITING COMMAND //",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            {
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'REGION_COMPLETED', regionKey: 'nebula' },
                    { type: 'REGION_COMPLETED', regionKey: 'asteroid' },
                    { type: 'REGION_COMPLETED', regionKey: 'deepspace' },
                    { type: 'REGION_COMPLETED', regionKey: 'blackhole' },
                    { type: 'VICTORY_COUNT', count: 50 },
                    {
                        type: 'MULTI_CONDITION',
                        operator: 'OR',
                        conditions: [
                            { type: 'REGION_COMPLETED', regionKey: 'nebula-t2' },
                            { type: 'REGION_COMPLETED', regionKey: 'asteroid-t2' },
                            { type: 'REGION_COMPLETED', regionKey: 'deepspace-t2' }
                        ]
                    }
                ]
            }
        ]
    },
};
