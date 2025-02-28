import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/rootStore';
import { 
  LogCategory, 
  LogLevel, 
  LogImportance, 
  StructuredLogEntry,
  LogFilter
} from '@/lib/logging/log-interfaces';
import {
  filterLogs,
  sortLogs,
  groupLogsByCategory,
  findRelatedLogs,
  addLog,
  unlockLog as unlockStructuredLog
} from '@/lib/logging/log-service';

/**
 * Hook for accessing and managing game logs
 * Provides both legacy and structured log functionality
 */
export function useGameLogs() {
  // Legacy log state
  const unlockedLogs = useGameStore(state => state.unlockedLogs);
  const unlockLog = useGameStore(state => state.unlockLog);
  
  // Structured log state
  const logs = useGameStore(state => state.logs || {});
  const setLogs = useGameStore(state => state.setLogs);
  const setLogEntry = useGameStore(state => state.setLogEntry);
  const unlockStructuredLogAction = useGameStore(state => state.unlockStructuredLog);
  const removeLogEntry = useGameStore(state => state.removeLogEntry);
  
  /**
   * Legacy: Check if a log is unlocked
   */
  const isLogUnlocked = useCallback((logId: number) => {
    return unlockedLogs.includes(logId);
  }, [unlockedLogs]);
  
  /**
   * Legacy: Get count of unlocked logs
   */
  const getUnlockedLogsCount = useCallback(() => {
    return unlockedLogs.length;
  }, [unlockedLogs]);
  
  /**
   * Legacy: Unlock a batch of logs
   */
  const unlockLogs = useCallback((logIds: number[]) => {
    logIds.forEach(id => unlockLog(id));
  }, [unlockLog]);
  
  /**
   * Get structured log by ID
   */
  const getLog = useCallback((logId: string): StructuredLogEntry | undefined => {
    return logs[logId];
  }, [logs]);
  
  /**
   * Check if a structured log exists
   */
  const logExists = useCallback((logId: string): boolean => {
    return !!logs[logId];
  }, [logs]);
  
  /**
   * Check if a structured log is unlocked
   */
  const isStructuredLogUnlocked = useCallback((logId: string): boolean => {
    return !!logs[logId]?.isUnlocked;
  }, [logs]);
  
  /**
   * Get count of all structured logs
   */
  const getStructuredLogsCount = useCallback((): number => {
    return Object.keys(logs).length;
  }, [logs]);
  
  /**
   * Get count of unlocked structured logs
   */
  const getUnlockedStructuredLogsCount = useCallback((): number => {
    return Object.values(logs).filter(log => log.isUnlocked).length;
  }, [logs]);
  
  /**
   * Get all unlocked logs
   */
  const getUnlockedLogs = useCallback((): StructuredLogEntry[] => {
    return Object.values(logs).filter(log => log.isUnlocked);
  }, [logs]);
  
  /**
   * Get all logs of a specific category
   */
  const getLogsByCategory = useCallback((category: LogCategory): StructuredLogEntry[] => {
    return Object.values(logs).filter(log => log.isUnlocked && log.category === category);
  }, [logs]);
  
  /**
   * Get all logs for a given trace ID
   */
  const getLogsByTrace = useCallback((traceId: string): StructuredLogEntry[] => {
    return Object.values(logs).filter(log => log.isUnlocked && log.traceId === traceId);
  }, [logs]);
  
  /**
   * Filter logs based on criteria
   */
  const getFilteredLogs = useCallback((filter: LogFilter): StructuredLogEntry[] => {
    return filterLogs(logs, filter);
  }, [logs]);
  
  /**
   * Find logs related to a specific log
   */
  const getRelatedLogs = useCallback((logId: string): StructuredLogEntry[] => {
    return findRelatedLogs(logId, logs);
  }, [logs]);
  
  /**
   * Get logs sorted by timestamp
   */
  const getSortedLogs = useCallback((direction: 'asc' | 'desc' = 'desc'): StructuredLogEntry[] => {
    return sortLogs(Object.values(logs).filter(log => log.isUnlocked), direction);
  }, [logs]);
  
  /**
   * Get logs grouped by category
   */
  const getGroupedLogs = useCallback((): Record<LogCategory, StructuredLogEntry[]> => {
    return groupLogsByCategory(Object.values(logs).filter(log => log.isUnlocked));
  }, [logs]);
  
  /**
   * Add a new log (creates and unlocks it)
   */
  const addNewLog = useCallback((
    title: string,
    content: string,
    category: LogCategory,
    options: {
      level?: LogLevel,
      importance?: LogImportance,
      traceId?: string,
      metadata?: Record<string, any>,
      actions?: StructuredLogEntry['actions']
    } = {}
  ): string => {
    return addLog(title, content, category, {
      ...options,
      isUnlocked: true
    }, {
      logs,
      setLogs,
      unlockLog
    });
  }, [logs, setLogs, unlockLog]);
  
  /**
   * Unlock a structured log
   */
  const unlockLogById = useCallback((logId: string): void => {
    unlockStructuredLog(logId, {
      logs,
      setLogs,
      unlockLog
    });
  }, [logs, setLogs, unlockLog]);
  
  /**
   * Remove a log entry
   */
  const removeLog = useCallback((logId: string): void => {
    removeLogEntry(logId);
  }, [removeLogEntry]);
  
  // Return all functions
  return {
    // Legacy log functions
    isLogUnlocked,
    getUnlockedLogsCount,
    unlockLogs,
    
    // Structured log functions
    getLog,
    logExists,
    isStructuredLogUnlocked,
    getStructuredLogsCount,
    getUnlockedStructuredLogsCount,
    getUnlockedLogs,
    getLogsByCategory,
    getLogsByTrace,
    getFilteredLogs,
    getRelatedLogs,
    getSortedLogs,
    getGroupedLogs,
    addNewLog,
    unlockLogById,
    removeLog
  };
} 