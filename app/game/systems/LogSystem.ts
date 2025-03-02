import { GameState, LogUnlockCondition, ResourceThresholdCondition, UpgradePurchasedCondition, LogDefinition } from '../types';
import { LOG_DEFINITIONS } from '../content/logDefinitions';

/**
 * LogSystem
 * 
 * Responsible for managing game logs, including:
 * - Checking conditions for unlocking new logs
 * - Marking logs as read/unread
 * - Managing the log discovery process
 */
export class LogSystem {
    private logDefinitions: Record<string, LogDefinition>;

    constructor() {
        this.logDefinitions = LOG_DEFINITIONS;
    }

    /**
     * Update the log system
     * Checks for any logs that should be unlocked based on current game state
     * 
     * @param state - Current game state
     * @param delta - Time passed in seconds
     */
    update(state: GameState, delta: number) {
        // Check for unlockable logs based on state
        this.checkForUnlockableLogs(state);
    }

    /**
     * Mark a log as read
     * 
     * @param state - Current game state
     * @param logId - ID of the log to mark as read
     */
    markLogRead(state: GameState, logId: string) {
        if (state.logs.discovered[logId]) {
            state.logs.discovered[logId].isRead = true;
            
            // Remove from unread list
            const index = state.logs.unread.indexOf(logId);
            if (index !== -1) {
                state.logs.unread.splice(index, 1);
            }
        }
    }

    /**
     * Mark all logs as read
     * 
     * @param state - Current game state
     */
    markAllLogsRead(state: GameState) {
        // Mark all logs as read
        Object.keys(state.logs.discovered).forEach(logId => {
            state.logs.discovered[logId].isRead = true;
        });
        
        // Clear the unread list
        state.logs.unread = [];
    }

    /**
     * Check for logs that should be unlocked based on current game state
     * 
     * @param state - Current game state
     */
    private checkForUnlockableLogs(state: GameState) {
        // Make sure logs structure exists
        if (!state.logs) {
            state.logs = { discovered: {}, unread: [] };
        } else if (!state.logs.discovered) {
            state.logs.discovered = {};
            state.logs.unread = state.logs.unread || [];
        }
        
        Object.entries(this.logDefinitions).forEach(([logId, logDef]) => {
            // Skip already discovered logs
            if (state.logs.discovered[logId]) return;
            
            // Check if conditions are met
            if (this.checkUnlockConditions(state, logDef.unlockConditions)) {
                this.unlockLog(state, logId);
            }
        });
    }

    /**
     * Unlock a log in the game state
     * 
     * @param state - Current game state
     * @param logId - ID of the log to unlock
     */
    private unlockLog(state: GameState, logId: string) {
        const logDef = this.logDefinitions[logId];
        state.logs.discovered[logId] = {
            id: logId,
            title: logDef.title,
            content: logDef.content,
            timestamp: Date.now(),
            category: logDef.category,
            isRead: false
        };
        state.logs.unread.push(logId);
    }

    /**
     * Check if all conditions for unlocking a log are met
     * 
     * @param state - Current game state
     * @param conditions - Array of conditions to check
     * @returns True if all conditions are met, false otherwise
     */
    private checkUnlockConditions(state: GameState, conditions: LogUnlockCondition[]): boolean {
        return conditions.every(condition => this.checkSingleCondition(state, condition));
    }

    /**
     * Check if a single condition for unlocking a log is met
     * 
     * @param state - Current game state
     * @param condition - Condition to check
     * @returns True if the condition is met, false otherwise
     */
    private checkSingleCondition(state: GameState, condition: LogUnlockCondition): boolean {
        switch (condition.type) {
            case 'RESOURCE_THRESHOLD':
                return this.checkResourceThreshold(state, condition as ResourceThresholdCondition);
            case 'UPGRADE_PURCHASED':
                return this.checkUpgradePurchased(state, condition as UpgradePurchasedCondition);
            case 'MULTI_CONDITION':
                const multiCondition = condition as any; // TypeScript workaround
                return multiCondition.operator === 'AND' 
                    ? multiCondition.conditions.every((c: LogUnlockCondition) => this.checkSingleCondition(state, c))
                    : multiCondition.conditions.some((c: LogUnlockCondition) => this.checkSingleCondition(state, c));
            default:
                return false;
        }
    }

    /**
     * Check if a resource threshold condition is met
     * 
     * @param state - Current game state
     * @param condition - Resource threshold condition to check
     * @returns True if the resource amount meets or exceeds the threshold
     */
    private checkResourceThreshold(state: GameState, condition: ResourceThresholdCondition): boolean {
        const { category, resourceType, threshold } = condition;
        
        try {
            // Safety check: Make sure category exists
            if (!state.categories[category]) {
                return false;
            }
            
            // Get category resources with proper typing
            const categoryResources = state.categories[category].resources;
            
            // Safety check: Make sure resources object exists
            if (!categoryResources) {
                return false;
            }
            
            // Use type assertion to access the dynamic property
            const resourceValue = categoryResources[resourceType as keyof typeof categoryResources];
            
            // Return false if resource doesn't exist
            if (resourceValue === undefined) {
                return false;
            }
            
            // Handle different resource structures (object vs number)
            const amount = typeof resourceValue === 'object' 
                ? (resourceValue as any).amount || 0 
                : resourceValue as number;
            
            return amount >= threshold;
        } catch (error) {
            // Log error and return false if any exception occurs
            console.error('Error checking resource threshold:', error);
            return false;
        }
    }

    /**
     * Check if an upgrade purchased condition is met
     * 
     * @param state - Current game state
     * @param condition - Upgrade purchased condition to check
     * @returns True if the upgrade has been purchased (level > 0)
     */
    private checkUpgradePurchased(state: GameState, condition: UpgradePurchasedCondition): boolean {
        const { category, upgradeId } = condition;
        
        try {
            // Safety check: Make sure category exists
            if (!state.categories[category]) {
                return false;
            }
            
            // Get category upgrades with proper typing
            const categoryUpgrades = state.categories[category].upgrades;
            
            // Safety check: Make sure upgrades object exists
            if (!categoryUpgrades) {
                return false;
            }
            
            // Use type assertion to access the dynamic property
            const upgradeValue = categoryUpgrades[upgradeId as keyof typeof categoryUpgrades];
            
            // Return false if upgrade doesn't exist
            if (upgradeValue === undefined) {
                return false;
            }
            
            // Check if upgrade level is greater than 0
            return upgradeValue > 0;
        } catch (error) {
            // Log error and return false if any exception occurs
            console.error('Error checking upgrade purchased:', error);
            return false;
        }
    }
} 