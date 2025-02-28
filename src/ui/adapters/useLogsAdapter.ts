import { useEffect, useState } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useGameLogs } from '../hooks/useGameLogs';

/**
 * Adapter hook for connecting the old logs system with the new game engine logs
 * @param existingLogs Array of existing logs from the old system
 * @param unlockedLogsIds Array of unlocked log IDs from the old system
 */
export function useLogsAdapter(
  existingLogs: Array<{ id: number; title: string; content: string }>,
  unlockedLogIds: number[]
) {
  const { game, initialized } = useGameEngine();
  const { logs } = useGameLogs();
  const [logsSynced, setLogsSynced] = useState(false);
  
  // Synchronize logs with the game engine
  useEffect(() => {
    if (!initialized || !game || logsSynced) return;
    
    console.log('Synchronizing logs with game engine...');
    
    try {
      // Get LogManager from the game
      const logManager = game.getLogs();
      
      // Import existing logs into the game engine
      unlockedLogIds.forEach(logId => {
        const logEntry = existingLogs.find(log => log.id === logId);
        
        if (logEntry) {
          // Create a log entry in the game engine for each unlocked log
          logManager.createLog({
            id: `story_log_${logId}`,
            message: logEntry.title,
            details: logEntry.content,
            level: logManager.LogLevel.INFO,
            category: logManager.LogCategory.LORE,
            timestamp: Date.now() - (logId * 1000), // Spread out timestamps for better ordering
            visibility: 'visible'
          });
        }
      });
      
      // Add a special log to mark synchronization
      logManager.info(
        'Ship logs synchronized with central database',
        { syncedLogCount: unlockedLogIds.length },
        logManager.LogCategory.SYSTEM
      );
      
      setLogsSynced(true);
      console.log(`${unlockedLogIds.length} logs synchronized with game engine`);
    } catch (error) {
      console.error('Error synchronizing logs:', error);
    }
  }, [initialized, game, existingLogs, unlockedLogIds, logsSynced]);
  
  // Listen for new logs in the game engine
  useEffect(() => {
    if (!initialized || !game) return;
    
    const handleNewLog = (event: any) => {
      const { log } = event.payload || {};
      if (!log) return;
      
      console.log(`New log created in game engine: ${log.message}`);
      // Here you could handle updating the UI or notifying the user about new logs
    };
    
    // Subscribe to log created events
    game.on('log_created', handleNewLog);
    
    return () => {
      game.off('log_created', handleNewLog);
    };
  }, [initialized, game]);
  
  // Return values useful for the logs UI
  return {
    // Game engine logs
    engineLogs: logs,
    // Utility functions
    clearEngineLogs: () => { 
      // Would need implementation based on the game engine API
    },
    createEngineLog: (message: string, category: string = 'SYSTEM', level: string = 'INFO') => {
      if (game) {
        const logManager = game.getLogs();
        
        // Create log using the proper method on the LogManager
        logManager.createLog({
          message,
          category: logManager.LogCategory[category as keyof typeof logManager.LogCategory] || 
                   logManager.LogCategory.SYSTEM,
          level: logManager.LogLevel[level as keyof typeof logManager.LogLevel] || 
                logManager.LogLevel.INFO,
          timestamp: Date.now(),
          id: `manual_log_${Date.now()}`
        });
      }
    }
  };
} 