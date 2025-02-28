/**
 * Time Domain Interfaces
 * Defines the core interfaces for the time domain
 */

/**
 * Interface for time-based effects
 */
export interface TimeEffect {
  id: string;
  expireTime: number;
  onExpire: () => void;
  data?: any;
}

/**
 * Types of time-tracked activities
 */
export enum TimeTrackedActivityType {
  RESOURCE_COLLECTION = 'resource_collection',
  RESOURCE_PRODUCTION = 'resource_production',
  UPGRADE_EFFECT = 'upgrade_effect',
  OFFLINE_PROGRESS = 'offline_progress',
  ACHIEVEMENT = 'achievement',
  GAMEPLAY_SESSION = 'gameplay_session',
  MILESTONE = 'milestone'
}

/**
 * Interface for timestamp entries
 */
export interface TimestampEntry {
  id: string;
  type: TimeTrackedActivityType;
  timestamp: number;
  data?: any;
}

/**
 * Interface for time tracking statistics
 */
export interface TimeStatistics {
  totalPlayTime: number;
  sessionStartTime: number;
  currentSessionDuration: number;
  longestSession: number;
  averageSessionLength: number;
  sessionCount: number;
  lastOfflineTime: number;
  lastOfflineDuration: number;
}

/**
 * Progress calculation strategies
 */
export enum ProgressStrategy {
  LINEAR = 'linear',          // Continuous production at a constant rate
  CAPPED = 'capped',          // Linear but with a max amount cap
  DIMINISHING = 'diminishing', // Returns diminish over time
  ACCELERATING = 'accelerating', // Returns increase over time
  STEP = 'step',              // Production happens in steps/batches
  PERIODIC = 'periodic'       // Production happens at fixed intervals
}

/**
 * Interface for a progress calculation result
 */
export interface ProgressResult {
  resourceId: string;
  previousAmount: number;
  newAmount: number;
  delta: number;
  elapsedTime: number;
  strategy: ProgressStrategy;
  cappedAt?: number;
  efficiency?: number;
}

/**
 * Options for capped progress
 */
export interface CappedProgressOptions {
  maxAmount: number;    // Maximum amount of progress allowed
  percentOfMax?: number; // Percent of max allowed when offline (0-100)
}

/**
 * Options for diminishing progress
 */
export interface DiminishingProgressOptions {
  halfLifeMs: number;   // Time after which efficiency drops to 50%
  minEfficiency: number; // Minimum efficiency (0-1)
}

/**
 * Options for accelerating progress
 */
export interface AcceleratingProgressOptions {
  rampUpTimeMs: number; // Time to reach full efficiency
  maxMultiplier: number; // Maximum multiplier for production
}

/**
 * Options for step progress
 */
export interface StepProgressOptions {
  batchSize: number;    // How much is produced in each batch
  batchTimeMs: number;  // Time between batches
  maxBatches?: number;  // Maximum number of batches (optional)
}

/**
 * Options for periodic progress
 */
export interface PeriodicProgressOptions {
  intervalMs: number;   // Time between periodic gains
  amountPerInterval: number; // Amount gained each interval
  maxIntervals?: number; // Maximum intervals to calculate
}

/**
 * Configuration for a specific resource's progress calculation
 */
export interface ResourceProgressConfig {
  resourceId: string;
  strategy: ProgressStrategy;
  baseRate: number;
  options?: CappedProgressOptions | DiminishingProgressOptions | 
    AcceleratingProgressOptions | StepProgressOptions | PeriodicProgressOptions;
  activeTimestamp?: string; // ID of timestamp to use for elapsed time (optional)
  upgradeModifiers?: Array<{
    upgradeId: string;
    multiplier: number;
  }>;
}

/**
 * Interface for offline bonus configuration
 */
export interface OfflineBonusConfig {
  // Base multiplier for offline progress (1.0 = 100% of calculated progress)
  baseMultiplier: number;
  
  // Whether to enable time-based bonus scaling
  enableTimeScaling: boolean;
  
  // Maximum time for bonus scaling in milliseconds
  maxBonusTime?: number;
  
  // Maximum bonus multiplier from time scaling
  maxTimeMultiplier?: number;
  
  // Time threshold after which special events can occur
  specialEventThreshold?: number;
  
  // Probability of special events (0-1)
  specialEventProbability?: number;
}

/**
 * Offline special event types
 */
export enum OfflineSpecialEventType {
  RESOURCE_JACKPOT = 'resource_jackpot', // Multiplied gains for a resource
  RESOURCE_BOOST = 'resource_boost',     // Temporary production boost
  NEW_DISCOVERY = 'new_discovery',       // Unlock something special
  RARE_RESOURCE = 'rare_resource',       // Find a rare resource
  MYSTERY_BONUS = 'mystery_bonus'        // Random bonus effect
}

/**
 * Interface for special event results
 */
export interface OfflineSpecialEvent {
  type: OfflineSpecialEventType;
  description: string;
  resourceId?: string;
  multiplier?: number;
  duration?: number;
  data?: any;
}

/**
 * Result of offline progress calculation
 */
export interface OfflineProgressResult {
  // Elapsed offline time in milliseconds
  elapsedTime: number;
  
  // Actual time processed (after caps) in milliseconds
  processedTime: number;
  
  // Resource progress results
  resourceResults: Map<string, ProgressResult>;
  
  // Applied bonus multiplier
  bonusMultiplier: number;
  
  // Any special events that occurred
  specialEvents: OfflineSpecialEvent[];
  
  // Timestamp when the player was last online
  lastOnlineTime: number;
  
  // Timestamp when the player came back online
  currentTime: number;
} 