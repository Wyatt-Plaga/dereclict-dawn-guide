/**
 * Game Text Content
 * 
 * This file contains all the text content used throughout the game.
 * Having this content in a dedicated file makes it easier to update text,
 * internationalize the game, and maintain consistency.
 */

/**
 * Crew Quarters related text content
 */
export const CrewQuartersTexts = {
  /**
   * Text descriptions for different stages of crew awakening
   */
  awakeningStages: {
    dormant: "Cryopod dormant",
    warmup: "Initiating warmup",
    stabilizing: "Vital signs stabilizing",
    neural: "Neural activity detected",
    consciousness: "Consciousness returning",
    final: "Final wake protocols"
  },
  
  /**
   * Flavor text displayed during crew awakening
   */
  awakeningFlavor: [
    "Defrosting cryogel",
    "Restarting circulatory system",
    "Stimulating neural pathways",
    "Administering revival compounds",
    "Raising core temperature",
    "Checking cognitive functions", 
    "Clearing cryogenic fog",
    "Restoring memory functions",
    "Calibrating muscle response",
    "Finalizing wake sequence"
  ],
  
  /**
   * Text descriptions for crew quarters upgrades
   */
  upgradeDescriptions: {
    additionalQuarters: "Prepare {0} more crew quarters, increasing capacity to {1}",
    workerCrews: "Dedicate crew to help awaken others (+{0} awakening progress per second)"
  },
  
  /**
   * UI text elements for the crew quarters page
   */
  ui: {
    title: "Crew Quarters",
    description: "Awaken and manage the ship's crew from cryostasis. Each crew member can be assigned to help with ship operations.",
    crewMembersLabel: "Crew Members",
    awakenButton: "Awaken Crew Member",
    awakenHint: "Click to begin awakening",
    progressLabel: "Progress",
    upgradesTitle: "Upgrades",
    assignmentsTitle: "Crew Assignments",
    assignmentsDescription: "Assign crew to boost operations in other ship systems",
    comingSoon: "[Coming Soon]"
  }
};

/**
 * Reactor related text content
 */
export const ReactorTexts = {
  // For future implementation
};

/**
 * Processor related text content
 */
export const ProcessorTexts = {
  // For future implementation
};

/**
 * Manufacturing related text content
 */
export const ManufacturingTexts = {
  // For future implementation
}; 
