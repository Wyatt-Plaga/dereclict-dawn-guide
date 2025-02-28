/**
 * Core game event types
 * These are the standard events that can be emitted by the game engine
 */
export enum GameEventType {
  // Resource related events
  RESOURCE_CREATED = 'resource:created',
  RESOURCE_UPDATED = 'resource:updated',
  RESOURCE_DELETED = 'resource:deleted',
  RESOURCE_PRODUCTION_STARTED = 'resource:production:started',
  RESOURCE_PRODUCTION_STOPPED = 'resource:production:stopped',
  RESOURCE_CAPACITY_REACHED = 'resource:capacity:reached',
  
  // Command related events
  COMMAND_EXECUTED = 'command:executed',
  COMMAND_UNDONE = 'command:undone',
  COMMAND_FAILED = 'command:failed',
  
  // Upgrade related events
  UPGRADE_REGISTERED = 'upgrade:registered',
  UPGRADE_UNLOCKED = 'upgrade:unlocked',
  UPGRADE_PURCHASED = 'upgrade:purchased',
  UPGRADE_EFFECT_ACTIVATED = 'upgrade:effect:activated',
  UPGRADE_EFFECT_DEACTIVATED = 'upgrade:effect:deactivated',
  
  // Milestone related events
  MILESTONE_REACHED = 'milestone:reached',
  MILESTONE_PROGRESS = 'milestone:progress',
  
  // Game state events
  GAME_INITIALIZED = 'game:initialized',
  GAME_LOADED = 'game:loaded',
  GAME_SAVED = 'game:saved',
  GAME_RESET = 'game:reset',
  
  // Offline progress events
  OFFLINE_PROGRESS_CALCULATED = 'offline:progress:calculated',
  OFFLINE_PROGRESS_APPLIED = 'offline:progress:applied',
  
  // Log events
  LOG_CREATED = 'log:created',
  LOG_UPDATED = 'log:updated',
  LOG_BATCH_CREATED = 'log:batch:created',
  
  // UI events
  UI_NOTIFICATION = 'ui:notification',
  UI_MODAL_OPENED = 'ui:modal:opened',
  UI_MODAL_CLOSED = 'ui:modal:closed',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED = 'achievement:unlocked',
  ACHIEVEMENT_PROGRESS = 'achievement:progress',
  
  // Debug events
  DEBUG_INFO = 'debug:info',
  DEBUG_WARNING = 'debug:warning',
  DEBUG_ERROR = 'debug:error'
}

/**
 * Helper function to create a game event
 * @param type Event type
 * @param payload Event data
 * @returns GameEvent object
 */
export function createGameEvent<T>(type: GameEventType | string, payload: T) {
  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: Date.now(),
    payload
  };
}

/**
 * Type definition for common resource event payloads
 */
export interface ResourceEventPayload {
  resourceId: string;
  resourceType: string;
  amount?: number;
  capacity?: number;
  delta?: number;
  reason?: string;
}

/**
 * Type definition for common command event payloads
 */
export interface CommandEventPayload {
  commandId: string;
  commandType: string;
  result: {
    success: boolean;
    message?: string;
    data?: any;
  };
}

/**
 * Type definition for common upgrade event payloads
 */
export interface UpgradeEventPayload {
  upgradeId: string;
  upgradeType: string;
  level?: number;
  cost?: Record<string, number>;
  effects?: any[];
}

/**
 * Type definition for common milestone event payloads
 */
export interface MilestoneEventPayload {
  milestoneId: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
}

/**
 * Type definition for common log event payloads
 */
export interface LogEventPayload {
  logId: string;
  category: string;
  level: string;
  message: string;
  data?: any;
  traceId?: string;
}

/**
 * Type definition for common UI notification event payloads
 */
export interface NotificationEventPayload {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  duration?: number;
  dismissable?: boolean;
  action?: {
    label: string;
    callback: string;
  };
} 