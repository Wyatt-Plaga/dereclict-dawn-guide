/**
 * Reactor Category - Energy generation and storage
 */
export interface ReactorCategory {
    resources: {
        energy: number;
    };
    upgrades: {
        reactorExpansions: number;  // Increases energy capacity
        energyConverters: number;   // Automatic energy generation
        converterEfficiency?: number; // Improves energy converter output (salvage cost)
        shielding?: number;            // Enables shields (0/1)
        shieldBoosts?: number;         // Additional +100 shields per level (salvage cost)
        navigationUnlocked?: number;   // Unlocks navigation system (0/1)
    };
    stats: {
        energyCapacity: number;
        energyPerSecond: number;    // Auto-generation rate
    };
}

/**
 * Processor Category - Insight generation and computation
 */
export interface ProcessorCategory {
    resources: {
        insight: number;
    };
    upgrades: {
        mainframeExpansions: number;  // Increases insight capacity
        processingThreads: number;    // Automatic insight generation
        threadEfficiency?: number;   // Improves insight generation efficiency (salvage)
        unlocked?: number; // 0 = locked, 1 = unlocked
    };
    stats: {
        insightCapacity: number;
        insightPerSecond: number;     // Auto-generation rate
        insightPerClick: number;      // Currently fixed at 0.5
    };
}

/**
 * Crew Quarters Category - Crew management
 */
export interface CrewQuartersCategory {
    resources: {
        crew: number;
    };
    upgrades: {
        additionalQuarters: number;  // Increases crew capacity
        workerCrews: number;         // Automatic crew awakening
        crewEfficiency?: number;    // Improves crew awakening rate (salvage)
        unlocked?: number;
    };
    stats: {
        crewCapacity: number;
        crewPerSecond: number;       // Auto-awakening rate
        awakeningProgress: number;   // Tracks 0-10 clicks for manual awakening
    };
}

/**
 * Manufacturing Category - Resource gathering and production
 */
export interface ManufacturingCategory {
    resources: {
        scrap: number;
    };
    upgrades: {
        cargoHoldExpansions: number;  // Increases scrap capacity
        manufacturingBays: number;    // Automatic scrap collection
        bayEfficiency?: number;      // Improves scrap production efficiency (salvage cost)
        unlocked?: number;
    };
    stats: {
        scrapCapacity: number;
        scrapPerSecond: number;       // Auto-collection rate
    };
}

/**
 * Resource Cost
 */
export interface ResourceCost {
  type: string;
  amount: number;
}

/**
 * Resource Reward
 */
export interface ResourceReward {
    type: string;
    amount: number;
    message?: string;
}

