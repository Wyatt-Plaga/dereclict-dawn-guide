import { useState, useEffect } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useLogsAdapter } from './useLogsAdapter';
import { useGameLogs } from '../hooks/useGameLogs';

type LogEntry = {
  id: number;
  title: string;
  content: string;
};

/**
 * Adapter hook for the Logs page
 * @param allLogEntries Array of all possible log entries
 * @param unlockedLogIds Array of log IDs that have been unlocked
 */
export function useLogsPageAdapter(
  allLogEntries: LogEntry[],
  unlockedLogIds: number[]
) {
  const { game, initialized } = useGameEngine();
  const { logs } = useGameLogs();
  const [isLoading, setIsLoading] = useState(true);
  const [unlockedLogs, setUnlockedLogs] = useState<LogEntry[]>([]);
  const [activeLog, setActiveLog] = useState<LogEntry | null>(null);
  
  // Initialize logs adapter
  const logsAdapter = useLogsAdapter(allLogEntries, unlockedLogIds);
  
  // Effect to update logs based on unlocked IDs
  useEffect(() => {
    if (!initialized || !game) return;
    
    // Filter logs based on unlocked IDs
    const unlocked = allLogEntries.filter(log => 
      unlockedLogIds.includes(log.id)
    );
    
    setUnlockedLogs(unlocked);
    
    // Set active log to first unlocked log if not set or not unlocked
    if (!activeLog || !unlockedLogIds.includes(activeLog.id)) {
      setActiveLog(unlocked.length > 0 ? unlocked[0] : null);
    }
    
    setIsLoading(false);
  }, [initialized, game, allLogEntries, unlockedLogIds, activeLog]);
  
  // Function to set the active log
  const handleSetActiveLog = (log: LogEntry) => {
    setActiveLog(log);
    
    // Create a log in the game engine about viewing this log
    if (game && initialized) {
      // Use the logsAdapter to create a log
      logsAdapter.createEngineLog(
        `Accessed log: ${log.title}`,
        'SYSTEM',
        'INFO'
      );
    }
  };
  
  return {
    isLoading,
    unlockedLogs,
    activeLog,
    setActiveLog: handleSetActiveLog,
    engineLogs: logs,
    
    // Check if all logs have been unlocked
    allLogsUnlocked: unlockedLogs.length === allLogEntries.length,
    
    // Create a new log in the game engine
    createLog: logsAdapter.createEngineLog
  };
} 