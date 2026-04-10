/**
 * Log Categories
 */
export enum LogCategory {
    SHIP_SYSTEMS = "Ship Systems",
    CREW_RECORDS = "Crew Records",
    MISSION_DATA = "Mission Data",
    PERSONAL_LOGS = "Personal Logs",
    UNKNOWN = "Unknown"
}

/**
 * Log Entry interface
 */
export interface LogEntry {
    id: string;
    title: string;
    content: string;
    timestamp: number; // When it was discovered
    category: LogCategory;
    isRead: boolean;
}

// Circular dependency note: LogUnlockCondition refers to GameState properties.
// We might need to use generic strings or Partial<GameState> to avoid importing GameState here.
// For now, let's define the structure without explicit GameState type dependency if possible,
// or accept that we might need to keep these in index.ts if they strictly depend on GameState.
// Actually, they depend on keys of GameState['categories'].

export type LogUnlockCondition =
    | ResourceThresholdCondition
    | UpgradePurchasedCondition
    | MultiCondition
    | RegionCompletedCondition
    | VictoryCountCondition;

export interface ResourceThresholdCondition {
    type: 'RESOURCE_THRESHOLD';
    category: string; // We use string here to avoid circular dep, or we can export CategoryKeys from resources.ts
    resourceType: string;
    threshold: number;
}

export interface UpgradePurchasedCondition {
    type: 'UPGRADE_PURCHASED';
    category: string;
    upgradeId: string;
}

export interface MultiCondition {
    type: 'MULTI_CONDITION';
    operator: 'AND' | 'OR';
    conditions: LogUnlockCondition[];
}

export interface RegionCompletedCondition {
    type: 'REGION_COMPLETED';
    regionKey: string;  // e.g. "void", "nebula", "nebula-t2"
}

export interface VictoryCountCondition {
    type: 'VICTORY_COUNT';
    count: number;  // total combat victories >= this
}

/**
 * Log Definition interface
 */
export interface LogDefinition {
    title: string;
    content: string;
    category: LogCategory;
    unlockConditions: LogUnlockCondition[];
}

