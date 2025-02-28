/**
 * Time Domain
 * Export all public interfaces, models, and services
 */

// Models
export type {
  TimeEffect,
  TimestampEntry,
  TimeStatistics,
  ProgressResult,
  CappedProgressOptions,
  DiminishingProgressOptions,
  AcceleratingProgressOptions,
  StepProgressOptions,
  PeriodicProgressOptions,
  ResourceProgressConfig,
  OfflineBonusConfig,
  OfflineSpecialEvent,
  OfflineProgressResult
} from './models/TimeInterfaces';

export {
  TimeTrackedActivityType,
  ProgressStrategy,
  OfflineSpecialEventType
} from './models/TimeInterfaces';

// Services
export { GameTime } from './services/GameTime';
export { TimeManager } from './services/TimeManager';
export { ProgressCalculator } from './services/ProgressCalculator';
export { OfflineManager } from './services/OfflineManager'; 