import { StateCreator } from 'zustand';
import { GameState, GameActions } from '../types';
import { immer } from 'zustand/middleware/immer';

// Type for this specific slice
export interface LogsSlice {
  unlockedLogs: GameState['unlockedLogs'];
  unlockLog: GameActions['unlockLog'];
}

// Create the logs slice
export const createLogsSlice: StateCreator<
  GameState & GameActions,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  LogsSlice
> = (set) => ({
  unlockedLogs: [],
  
  unlockLog: (logId: number) => {
    set((state) => {
      // Only add if not already unlocked
      if (!state.unlockedLogs.includes(logId)) {
        state.unlockedLogs.push(logId);
        
        // Sort logs for consistent display
        state.unlockedLogs.sort((a, b) => a - b);
      }
    });
  }
}); 