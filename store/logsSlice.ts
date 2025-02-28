import { StateCreator } from 'zustand';
import { StructuredLogEntry } from '@/lib/logging/log-interfaces';

export interface LogsState {
  // Legacy logs support (numeric IDs)
  unlockedLogs: number[];
  
  // New structured logs (string IDs)
  logs: Record<string, StructuredLogEntry>;
}

export interface LogsActions {
  // Legacy actions
  unlockLog: (logId: number) => void;
  
  // New structured log actions
  setLogs: (logs: Record<string, StructuredLogEntry>) => void;
  setLogEntry: (logId: string, log: StructuredLogEntry) => void;
  unlockStructuredLog: (logId: string) => void;
  removeLogEntry: (logId: string) => void;
}

export type LogsSlice = LogsState & LogsActions;

const createLogsSlice: StateCreator<LogsSlice> = (set, get) => ({
  // Initial state
  unlockedLogs: [],
  logs: {},
  
  // Legacy log actions
  unlockLog: (logId: number) => {
    set((state) => {
      // Check if already unlocked
      if (state.unlockedLogs.includes(logId)) {
        return state;
      }
      
      return {
        unlockedLogs: [...state.unlockedLogs, logId].sort((a, b) => a - b),
      };
    });
  },
  
  // New structured log actions
  setLogs: (logs: Record<string, StructuredLogEntry>) => {
    set({ logs });
  },
  
  setLogEntry: (logId: string, log: StructuredLogEntry) => {
    set((state) => ({
      logs: {
        ...state.logs,
        [logId]: log,
      },
    }));
  },
  
  unlockStructuredLog: (logId: string) => {
    set((state) => {
      const log = state.logs[logId];
      if (!log || log.isUnlocked) {
        return state;
      }
      
      return {
        logs: {
          ...state.logs,
          [logId]: {
            ...log,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
          },
        },
      };
    });
  },
  
  removeLogEntry: (logId: string) => {
    set((state) => {
      const newLogs = { ...state.logs };
      delete newLogs[logId];
      return { logs: newLogs };
    });
  },
});

export default createLogsSlice; 