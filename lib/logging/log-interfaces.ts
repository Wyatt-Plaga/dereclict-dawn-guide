/**
 * Enhanced logging interfaces for Derelict Dawn
 * These interfaces define the structure for our logging system
 */

/**
 * Log levels to indicate severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  NOTICE = 'notice',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Log categories for organization
 */
export enum LogCategory {
  SYSTEM = 'System',
  STORY = 'Story',
  RESOURCE = 'Resource',
  UPGRADE = 'Upgrade',
  ACHIEVEMENT = 'Achievement',
  ENGINEERING = 'Engineering',
  SCIENCE = 'Science',
  EXPLORATION = 'Exploration',
  COMMUNICATIONS = 'Communications',
  SECURITY = 'Security',
  MEDICAL = 'Medical',
  COMMAND = 'Command',
  PERSONAL = 'Personal',
  EXTERNAL = 'External'
}

/**
 * Flag indicating if a log entry is a milestone in the story
 */
export enum LogImportance {
  STANDARD = 'standard',
  MILESTONE = 'milestone',
  CRITICAL_PATH = 'critical-path'
}

/**
 * Relation between logs, e.g., part of a sequence or thread
 */
export interface LogRelation {
  relatedLogIds: string[];
  relationType: 'sequence' | 'thread' | 'response' | 'cause-effect';
  relationMetadata?: Record<string, any>;
}

/**
 * Base log entry interface with enhanced fields
 */
export interface StructuredLogEntry {
  id: string;
  title: string;
  content: string;
  category: LogCategory;
  timestamp: string;
  level: LogLevel;
  importance: LogImportance;
  traceId?: string;
  relations?: LogRelation[];
  metadata?: Record<string, any>;
  unlockConditions?: any[];
  actions?: LogAction[];
  isUnlocked: boolean;
  unlockedAt?: string;
}

/**
 * Actions that can be performed based on a log
 */
export interface LogAction {
  id: string;
  label: string;
  type: 'navigation' | 'resource' | 'upgrade' | 'achievement' | 'external';
  target: string;
  conditions?: any[];
  metadata?: Record<string, any>;
}

/**
 * Interface for filtering logs
 */
export interface LogFilter {
  categories?: LogCategory[];
  levels?: LogLevel[];
  importance?: LogImportance[];
  search?: string;
  fromDate?: string;
  toDate?: string;
  traceId?: string;
  onlyUnlocked?: boolean;
}

/**
 * Interface for defining a log sequence (e.g., a quest or story arc)
 */
export interface LogSequence {
  id: string;
  title: string;
  description: string;
  logIds: string[];
  isCompleted: boolean;
  progress: number;
  rewards?: any[];
  unlockConditions?: any[];
}

/**
 * Definition for log display preferences
 */
export interface LogDisplayOptions {
  groupByCategory: boolean;
  showTimestamp: boolean;
  sortDirection: 'asc' | 'desc';
  expandedByDefault: boolean;
  highlightNew: boolean;
  showFilters: boolean;
  defaultFilter?: LogFilter;
} 