import { useGameStore } from "@/store/rootStore";

/**
 * Custom hook to access and manage game logs from the Zustand store
 */
export function useGameLogs() {
  // Get store data and actions
  const unlockLog = useGameStore(state => state.unlockLog);
  const unlockedLogs = useGameStore(state => state.unlockedLogs);
  
  /**
   * Check if a specific log has been unlocked
   * @param logId - The unique identifier of the log to check
   * @returns Boolean indicating if the log is unlocked
   */
  const isLogUnlocked = (logId: number): boolean => {
    return unlockedLogs.includes(logId);
  };
  
  /**
   * Get an array of all unlocked log IDs, sorted
   * @returns Array of unlocked log IDs
   */
  const getUnlockedLogs = (): number[] => {
    return [...unlockedLogs].sort((a, b) => a - b);
  };
  
  /**
   * Get the total number of unlocked logs
   * @returns The count of unlocked logs
   */
  const getUnlockedLogsCount = (): number => {
    return unlockedLogs.length;
  };
  
  /**
   * Unlock a log if it hasn't been unlocked already
   * @param logId - The unique identifier of the log to unlock
   * @returns Boolean indicating if the log was newly unlocked
   */
  const unlockLogIfNew = (logId: number): boolean => {
    if (isLogUnlocked(logId)) return false;
    
    unlockLog(logId);
    return true;
  };
  
  /**
   * Unlocks multiple logs at once if they are new
   * @param logIds - Array of log IDs to unlock
   * @returns Array of log IDs that were newly unlocked
   */
  const unlockMultipleLogs = (logIds: number[]): number[] => {
    const newlyUnlocked: number[] = [];
    
    logIds.forEach(logId => {
      if (unlockLogIfNew(logId)) {
        newlyUnlocked.push(logId);
      }
    });
    
    return newlyUnlocked;
  };
  
  return {
    // Actions
    unlockLog,
    unlockLogIfNew,
    unlockMultipleLogs,
    
    // Selectors
    isLogUnlocked,
    getUnlockedLogs,
    getUnlockedLogsCount,
    
    // Direct state access (for advanced use cases)
    unlockedLogs
  };
} 