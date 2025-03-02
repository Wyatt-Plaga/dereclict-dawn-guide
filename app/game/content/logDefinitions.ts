import { LogCategory, LogDefinition } from '../types';

/**
 * Log Definitions
 * 
 * This file contains all the logs that can be discovered in the game,
 * along with their unlock conditions.
 */
export const LOG_DEFINITIONS: Record<string, LogDefinition> = {
    "log_initial_awakening": {
        title: "Emergency Wake Protocol",
        content: "System log: Emergency wake protocol initiated. Ship AI detected critical system failure. One crew member revived from stasis to assess situation.\n\nStatus report: Life support at 18% capacity. Main reactor offline. Navigation systems offline. Communication systems offline.\n\nPriority: Restore power to essential systems.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { 
                type: 'RESOURCE_THRESHOLD', 
                category: 'reactor', 
                resourceType: 'energy', 
                threshold: 5 
            }
        ]
    },
    "log_reactor_malfunction": {
        title: "Reactor Status Report",
        content: "Chief Engineer's log: The main reactor suffered catastrophic damage during the asteroid collision. Emergency systems barely functioning. Need to restore power before life support fails completely.\n\nEngineering assessment: Core stabilization requires bypass of damaged control circuits. Manual regulation of coolant flow necessary until automated systems can be restored.\n\nNote: If you're reading this, proceed with caution. The reactor is highly unstable.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { 
                type: 'UPGRADE_PURCHASED', 
                category: 'reactor', 
                upgradeId: 'reactorExpansions' 
            }
        ]
    },
    "log_captain_final_entry": {
        title: "Captain's Final Entry",
        content: "Captain's log, final entry: The collision was no accident. We were deliberately targeted. The ship's trajectory was altered without authorization. Internal sabotage suspected.\n\nI've ordered all non-essential personnel into stasis. Security team investigating. If you're reading this, trust no one. The saboteur may still be active.\n\nEmergency protocols in effect. Command codes transferred to AI until situation resolved.\n\nMay whoever finds this have better luck than we did.",
        category: LogCategory.CREW_RECORDS,
        unlockConditions: [
            { 
                type: 'RESOURCE_THRESHOLD', 
                category: 'crewQuarters', 
                resourceType: 'crew', 
                threshold: 5 
            }
        ]
    },
    "log_mission_objectives": {
        title: "Project Dawn: Mission Brief",
        content: "CLASSIFIED - AUTHORIZATION LEVEL ALPHA\n\nMission Designation: Project Dawn\nVessel: UES Horizon\nObjective: Transport experimental quantum gateway technology to Proxima Centauri colony.\n\nSecondary objectives:\n- Field test of prototype warp drive (classified designation: SLIP-STREAM)\n- Collection of deep space phenomena data\n- Survey of uncharted systems en route\n\nNote: The official mission statement provided to crew is scientific exploration only. The quantum gateway technology remains classified to all but senior officers.",
        category: LogCategory.MISSION_DATA,
        unlockConditions: [
            { 
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'RESOURCE_THRESHOLD', category: 'processor', resourceType: 'insight', threshold: 20 },
                    { type: 'UPGRADE_PURCHASED', category: 'processor', upgradeId: 'mainframeExpansions' }
                ]
            }
        ]
    },
    "log_manufacturing_failure": {
        title: "Manufacturing Error Report",
        content: "Manufacturing System Alert: Critical error in fabrication bay 3.\n\nDiagnostic results: Molecular reassembler misaligned by 0.03 microns. Error correction failed. Resulting output shows quantum instability.\n\nRecommendation: Manual recalibration required. WARNING: Incorrect calibration may result in catastrophic molecular destabilization of nearby matter.\n\nNote: Last maintenance performed by Technician Reeves, who subsequently reported to medical with unexplained cellular degradation.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { 
                type: 'UPGRADE_PURCHASED', 
                category: 'manufacturing', 
                upgradeId: 'manufacturingBays' 
            }
        ]
    },
    "log_science_officer_notes": {
        title: "Science Officer's Notes",
        content: "Personal log, Science Officer Chen: The readings don't make sense. The quantum signatures we're detecting shouldn't be possible according to standard physics models.\n\nThe gateway prototype is exhibiting strange behavior. During the last test, I swear I saw... something... on the other side. Not stars or space as we understand it, but something else. Something watching.\n\nI've requested to suspend further testing until we can analyze the data more thoroughly. My request was denied. The captain insists we proceed on schedule.\n\nI fear we're meddling with forces we don't understand.",
        category: LogCategory.PERSONAL_LOGS,
        unlockConditions: [
            { 
                type: 'RESOURCE_THRESHOLD', 
                category: 'processor', 
                resourceType: 'insight', 
                threshold: 50 
            }
        ]
    },
    "log_unknown_transmission": {
        title: "Unknown Transmission",
        content: "//SIGNAL INTERCEPTED//\n//ORIGIN UNKNOWN//\n//TRANSLATION APPROXIMATE//\n\n...BREACH DETECTED...\n...QUARANTINE PROTOCOLS INITIATED...\n...VESSEL DESIGNATION: PRIMITIVE/DANGEROUS...\n...TECHNOLOGY LEVEL: PRE-ASCENSION/CONTAMINATED...\n...RECOMMENDATION: IMMEDIATE PURGE TO PREVENT SPREAD...\n\n//END TRANSMISSION//",
        category: LogCategory.UNKNOWN,
        unlockConditions: [
            { 
                type: 'MULTI_CONDITION',
                operator: 'AND',
                conditions: [
                    { type: 'RESOURCE_THRESHOLD', category: 'reactor', resourceType: 'energy', threshold: 100 },
                    { type: 'RESOURCE_THRESHOLD', category: 'processor', resourceType: 'insight', threshold: 100 },
                    { type: 'RESOURCE_THRESHOLD', category: 'crewQuarters', resourceType: 'crew', threshold: 10 },
                    { type: 'RESOURCE_THRESHOLD', category: 'manufacturing', resourceType: 'scrap', threshold: 100 }
                ]
            }
        ]
    }
}; 