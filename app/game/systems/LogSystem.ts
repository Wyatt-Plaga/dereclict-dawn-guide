import { GameState, LogUnlockCondition, ResourceThresholdCondition, UpgradePurchasedCondition, LogDefinition } from '../types';
import { LOG_DEFINITIONS } from '../content/logDefinitions';
import { EventBus } from 'core/EventBus';
import { GameEventMap } from 'core/events';
import { getCategoryEntity } from 'core/ecs/selectors';
import { ResourceStorage, Upgradable, UpgradeKey } from '../components/interfaces';

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
    private currentState?: GameState;

    constructor(private bus?: EventBus<GameEventMap>) {
        this.logDefinitions = LOG_DEFINITIONS;

        if (this.bus) {
            this.bus.on('markLogRead', ({ state, logId }) => {
                this.markLogRead(state, logId);
                this.bus?.emit('stateUpdated', state);
            });

            this.bus.on('markAllLogsRead', ({ state }) => {
                this.markAllLogsRead(state);
                this.bus?.emit('stateUpdated', state);
            });

            // Phase-5 namespaced actions
            this.bus.on('action:mark_log_read', ({ logId }) => {
                if (!this.currentState) return;
                this.markLogRead(this.currentState, logId);
                this.bus?.emit('stateUpdated', this.currentState);
            });

            this.bus.on('action:mark_all_logs', () => {
                if (!this.currentState) return;
                this.markAllLogsRead(this.currentState);
                this.bus?.emit('stateUpdated', this.currentState);
            });

            // Re-run unlock checks when key lifecycle events occur
            const triggerRecheck = (state: GameState) => {
                // Re-evaluate unlock conditions immediately
                this.update(state, 0);
                this.bus?.emit('stateUpdated', state);
            };

            this.bus.on('combatEnded', ({ state }) => triggerRecheck(state));
            this.bus.on('encounterCompleted', ({ state }) => triggerRecheck(state));
            this.bus.on('upgradePurchased', ({ state }) => triggerRecheck(state));
        }
    }

    /**
     * Update the log system
     * Checks for any logs that should be unlocked based on current game state
     * 
     * @param state - Current game state
     * @param delta - Time passed in seconds
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(state: GameState, _delta: number) {
        // cache state for action handlers
        this.currentState = state;
        // Check for unlockable logs based on state
        this.checkForUnlockableLogs(state);
    }

    /**
     * Mark a log as read
     * 
     * @param state - Current game state
     * @param logId - ID of the log to mark as read
     * @returns Updated game state
     */
    markLogRead(state: GameState, logId: string): GameState {
        // Directly modify the state
        if (state.logs.discovered[logId]) {
            state.logs.discovered[logId].isRead = true;
            
            // Remove from unread list
            const index = state.logs.unread.indexOf(logId);
            if (index !== -1) {
                // Directly splice the array instead of creating a new one
                state.logs.unread.splice(index, 1);
            }
        }
        
        return state;
    }

    /**
     * Mark all logs as read
     * 
     * @param state - Current game state
     * @returns Updated game state
     */
    markAllLogsRead(state: GameState): GameState {
        // Directly update the logs in the state
        
        // Mark all discovered logs as read
        Object.keys(state.logs.discovered).forEach(logId => {
            state.logs.discovered[logId].isRead = true;
        });
        
        // Clear the unread list
        state.logs.unread = [];
        
        return state;
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
                const multiCondition = condition as unknown as { operator: 'AND' | 'OR'; conditions: LogUnlockCondition[] };
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
            if (['energy', 'insight', 'crew', 'scrap'].includes(resourceType)) {
                const entity = getCategoryEntity(state.world, category);
                if (!entity) return false;
                const storage = entity.get<ResourceStorage>('ResourceStorage');
                if (!storage) return false;
                return storage.current >= threshold;
            }

            // Non-storage scalar resources remain on GameState (combatComponents, bossMatrix)
            switch (resourceType) {
                case 'combatComponents':
                    return (state.combatComponents ?? 0) >= threshold;
                case 'bossMatrix':
                    return (state.bossMatrix ?? 0) >= threshold;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error checking resource threshold (ECS refactor):', error);
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

        const upgradeKey = legacyToUpgradeKey[upgradeId];
        if (!upgradeKey) return false;

        try {
            const entity = getCategoryEntity(state.world, category);
            if (!entity) return false;
            const upg = entity.get<Upgradable>(upgradeKey);
            if (!upg) return false;
            return upg.level > 0;
        } catch (error) {
            console.error('Error checking upgrade purchased (ECS refactor):', error);
            return false;
        }
    }
}

// Map legacy upgrade IDs to namespaced keys (copy from UpgradeSystem until shared config is made)
const legacyToUpgradeKey: Record<string, UpgradeKey> = {
    reactorExpansions: 'reactor:expansions',
    energyConverters: 'reactor:converters',
    mainframeExpansions: 'processor:expansions',
    processingThreads: 'processor:threads',
    additionalQuarters: 'crew:quartersExpansion',
    workerCrews: 'crew:workerCrews',
    cargoHoldExpansions: 'manufacturing:expansions',
    manufacturingBays: 'manufacturing:bays',
}; 