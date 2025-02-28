/**
 * Log Service for Derelict Dawn
 * This service provides structured logging capabilities and interfaces with the game store
 */

import { 
  LogCategory, 
  LogLevel, 
  LogImportance, 
  StructuredLogEntry, 
  LogFilter,
  LogSequence 
} from './log-interfaces';
import { useGameStore } from '@/store/rootStore';
import { v4 as uuidv4 } from 'uuid';
import { LogsSlice } from '@/store/logsSlice';

// Type for store API that contains logs slice actions
type StoreWithLogs = {
  logs: Record<string, StructuredLogEntry>;
  setLogs: (logs: Record<string, StructuredLogEntry>) => void;
  unlockLog: (logId: number | string) => void;
};

/**
 * Creates a new structured log entry
 */
export function createLogEntry(
  title: string,
  content: string,
  category: LogCategory,
  options: {
    level?: LogLevel,
    importance?: LogImportance,
    traceId?: string,
    metadata?: Record<string, any>,
    isUnlocked?: boolean,
    actions?: StructuredLogEntry['actions']
  } = {}
): StructuredLogEntry {
  const {
    level = LogLevel.INFO,
    importance = LogImportance.STANDARD,
    traceId = undefined,
    metadata = {},
    isUnlocked = false,
    actions = []
  } = options;
  
  // Generate a unique ID if not provided in metadata
  const id = metadata.id || uuidv4();
  
  return {
    id,
    title,
    content,
    category,
    timestamp: new Date().toISOString(),
    level,
    importance,
    traceId,
    metadata,
    actions,
    isUnlocked,
    unlockedAt: isUnlocked ? new Date().toISOString() : undefined
  };
}

/**
 * Registers a log in the system (without unlocking it)
 */
export function registerLog(
  log: StructuredLogEntry,
  storeApi: StoreWithLogs = useGameStore.getState() as unknown as StoreWithLogs
): void {
  // Get existing logs
  const existingLogs = storeApi.logs || {};
  
  // Add or update the log (without changing unlock status)
  storeApi.setLogs({
    ...existingLogs,
    [log.id]: {
      ...log,
      // Preserve the existing unlock status if the log already exists
      isUnlocked: existingLogs[log.id]?.isUnlocked || log.isUnlocked,
      unlockedAt: existingLogs[log.id]?.unlockedAt || log.unlockedAt
    }
  });
}

/**
 * Unlocks a log to make it visible to the player
 */
export function unlockLog(
  logId: string,
  storeApi: StoreWithLogs = useGameStore.getState() as unknown as StoreWithLogs
): void {
  // Get existing logs
  const existingLogs = storeApi.logs || {};
  const existingLog = existingLogs[logId];
  
  // If log doesn't exist or is already unlocked, do nothing
  if (!existingLog || existingLog.isUnlocked) {
    return;
  }
  
  // Update the log unlock status
  storeApi.setLogs({
    ...existingLogs,
    [logId]: {
      ...existingLog,
      isUnlocked: true,
      unlockedAt: new Date().toISOString()
    }
  });
  
  // Also add to the unlocked logs array for backward compatibility
  storeApi.unlockLog(logId);
  
  // Trigger any side effects associated with unlocking this log
  processLogUnlock(logId, existingLog, storeApi);
}

/**
 * Register and unlock a log in one operation
 */
export function addLog(
  title: string,
  content: string,
  category: LogCategory,
  options: Parameters<typeof createLogEntry>[3] = {},
  storeApi: StoreWithLogs = useGameStore.getState() as unknown as StoreWithLogs
): string {
  // Create the log entry
  const log = createLogEntry(title, content, category, {
    ...options,
    isUnlocked: true // Force unlock
  });
  
  // Register the log (will be unlocked by default)
  registerLog(log, storeApi);
  
  // Process any side effects
  processLogUnlock(log.id, log, storeApi);
  
  return log.id;
}

/**
 * Batch register multiple logs
 */
export function registerLogs(
  logs: StructuredLogEntry[],
  storeApi: StoreWithLogs = useGameStore.getState() as unknown as StoreWithLogs
): void {
  // Get existing logs
  const existingLogs = storeApi.logs || {};
  
  // Create a new logs object with the added logs
  const updatedLogs = logs.reduce((acc, log) => {
    acc[log.id] = {
      ...log,
      // Preserve existing unlock status
      isUnlocked: existingLogs[log.id]?.isUnlocked || log.isUnlocked,
      unlockedAt: existingLogs[log.id]?.unlockedAt || log.unlockedAt
    };
    return acc;
  }, { ...existingLogs });
  
  // Update the store
  storeApi.setLogs(updatedLogs);
}

/**
 * Process side effects when a log is unlocked
 * This includes running actions, updating sequences, etc.
 */
function processLogUnlock(
  logId: string,
  log: StructuredLogEntry,
  storeApi: StoreWithLogs
): void {
  // Add side effects here when a log is unlocked
  // Examples:
  // - Check if this log completes a sequence
  // - Trigger achievements
  // - Update game state based on log content
  // - Add resources or other rewards
  
  // For now, we'll just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Log unlocked: ${log.title} (${logId})`);
  }
}

/**
 * Filter logs based on criteria
 */
export function filterLogs(
  logs: Record<string, StructuredLogEntry>,
  filter: LogFilter
): StructuredLogEntry[] {
  return Object.values(logs).filter(log => {
    // Skip logs that aren't unlocked if onlyUnlocked is true
    if (filter.onlyUnlocked && !log.isUnlocked) {
      return false;
    }
    
    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(log.category)) {
        return false;
      }
    }
    
    // Filter by levels
    if (filter.levels && filter.levels.length > 0) {
      if (!filter.levels.includes(log.level)) {
        return false;
      }
    }
    
    // Filter by importance
    if (filter.importance && filter.importance.length > 0) {
      if (!filter.importance.includes(log.importance)) {
        return false;
      }
    }
    
    // Filter by trace ID
    if (filter.traceId && log.traceId !== filter.traceId) {
      return false;
    }
    
    // Filter by date range
    if (filter.fromDate) {
      const fromDate = new Date(filter.fromDate).getTime();
      const logDate = new Date(log.timestamp).getTime();
      if (logDate < fromDate) {
        return false;
      }
    }
    
    if (filter.toDate) {
      const toDate = new Date(filter.toDate).getTime();
      const logDate = new Date(log.timestamp).getTime();
      if (logDate > toDate) {
        return false;
      }
    }
    
    // Filter by search text
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const titleMatches = log.title.toLowerCase().includes(searchLower);
      const contentMatches = log.content.toLowerCase().includes(searchLower);
      if (!titleMatches && !contentMatches) {
        return false;
      }
    }
    
    // Passed all filters
    return true;
  });
}

/**
 * Sort logs by timestamp
 */
export function sortLogs(
  logs: StructuredLogEntry[],
  direction: 'asc' | 'desc' = 'desc'
): StructuredLogEntry[] {
  return [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return direction === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Group logs by category
 */
export function groupLogsByCategory(
  logs: StructuredLogEntry[]
): Record<LogCategory, StructuredLogEntry[]> {
  return logs.reduce((grouped, log) => {
    const category = log.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(log);
    return grouped;
  }, {} as Record<LogCategory, StructuredLogEntry[]>);
}

/**
 * Find logs related to a specific log
 */
export function findRelatedLogs(
  logId: string,
  logs: Record<string, StructuredLogEntry>
): StructuredLogEntry[] {
  // Get the log
  const targetLog = logs[logId];
  if (!targetLog || !targetLog.relations) {
    return [];
  }
  
  // Extract all related log IDs
  const relatedIds = targetLog.relations.flatMap(relation => relation.relatedLogIds);
  
  // Return the related logs that exist and are unlocked
  return relatedIds
    .map(id => logs[id])
    .filter(log => log && log.isUnlocked);
} 