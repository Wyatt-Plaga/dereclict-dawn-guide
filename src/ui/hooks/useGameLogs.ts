import { useState, useEffect } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { Log } from '../../domain/logs/models/Log';
import { LogCategory, LogLevel, LogVisibility } from '../../domain/logs/models/Log';
import { LogFilter } from '../../domain/logs/services/LogManager';

/**
 * Extended filter with limit option for pagination
 */
interface UILogFilter extends LogFilter {
  limit?: number;
}

/**
 * Hook for accessing game logs
 */
export const useGameLogs = () => {
  const { game, initialized } = useGameEngine();
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState<UILogFilter>({
    level: LogLevel.INFO,
    visibility: LogVisibility.PLAYER,
    limit: 100
  });
  
  // Load logs when game is initialized
  useEffect(() => {
    if (!initialized || !game) {
      return;
    }
    
    // Get filtered logs from the game
    const logList = game.getLogs().filterLogs(filter);
    // Apply additional limit if needed
    const limitedList = filter.limit ? logList.slice(0, filter.limit) : logList;
    setLogs(limitedList);
    
    // Set up listener for log changes
    const handleLogUpdate = () => {
      const updatedList = game.getLogs().filterLogs(filter);
      // Apply additional limit if needed
      const limitedUpdatedList = filter.limit ? updatedList.slice(0, filter.limit) : updatedList;
      setLogs([...limitedUpdatedList]);
    };
    
    // Subscribe to log change events
    game.on('log_added', handleLogUpdate);
    game.on('log_cleared', handleLogUpdate);
    
    // Cleanup subscription
    return () => {
      game.off('log_added', handleLogUpdate);
      game.off('log_cleared', handleLogUpdate);
    };
  }, [game, initialized, filter]);
  
  // Update the log filter
  const updateFilter = (newFilter: Partial<UILogFilter>) => {
    setFilter(current => ({
      ...current,
      ...newFilter
    }));
  };
  
  // Clear all logs
  const clearLogs = () => {
    if (!game) return;
    game.getLogs().clearLogs();
  };
  
  // Get logs by category
  const getLogsByCategory = (category: LogCategory): Log[] => {
    return logs.filter(log => log.properties.category === category);
  };
  
  // Get logs by level
  const getLogsByLevel = (level: LogLevel): Log[] => {
    return logs.filter(log => log.properties.level === level);
  };
  
  return {
    logs,
    filter,
    updateFilter,
    clearLogs,
    getLogsByCategory,
    getLogsByLevel,
    LogCategory,
    LogLevel,
    LogVisibility
  };
}; 