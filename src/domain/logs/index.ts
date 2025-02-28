/**
 * Logs Domain
 * 
 * This module contains all log-related models, interfaces, and services.
 */

// Models and Enums
export { 
  Log, 
  LogLevel, 
  LogCategory, 
  LogVisibility
} from './models/Log';

// Types
export type { LogProperties } from './models/Log';
export type { LogFilter } from './services/LogManager';

// Services
export { LogManager } from './services/LogManager'; 