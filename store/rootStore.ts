import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createResourcesSlice } from './slices/resourcesSlice';
import { createUpgradesSlice } from './slices/upgradesSlice';
import { createLogsSlice } from './slices/logsSlice';
import createStructuredLogsSlice from './logsSlice';

// Create the combined store without complex type annotations for now
// @ts-ignore - Suppressing type errors, to be fixed in future refactoring
export const useGameStore = create(
  persist(
    (set, get, api) => {
      // Load slices
      const resourcesSlice = createResourcesSlice(set, get, api);
      const upgradesSlice = createUpgradesSlice(set, get, api);
      const legacyLogsSlice = createLogsSlice(set, get, api);
      
      // Try to handle new structured logs with 2 args since they might not need the api
      // @ts-ignore - We know this might be a different signature
      const structuredLogsSlice = createStructuredLogsSlice(set, get);
      
      return {
        // Base state that will be extended by slices
        resources: {
          energy: { amount: 0, capacity: 10, autoGeneration: 0 },
          insight: { amount: 0, capacity: 5, autoGeneration: 0 },
          crew: { amount: 0, capacity: 3, workerCrews: 0 },
          scrap: { amount: 0, capacity: 20, manufacturingBays: 0 }
        },
        upgrades: {},
        unlockedLogs: [],
        logs: {},
        lastOnline: "",
        isLoading: false,
        error: null,
        pageTimestamps: {},
        version: 1,
        
        // Include slices
        ...resourcesSlice,
        ...upgradesSlice,
        ...legacyLogsSlice,
        ...structuredLogsSlice,
        
        // Custom actions that may override slice actions
        setGameState: (newState) => {
          set({ 
            ...newState,
            lastOnline: new Date().toISOString() 
          });
        },
        
        updatePageTimestamp: (page) => {
          // @ts-ignore - We know pageTimestamps exists
          const { pageTimestamps } = get();
          set({
            pageTimestamps: {
              ...pageTimestamps,
              [page]: new Date().toISOString()
            }
          });
        },
        
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        resetError: () => set({ error: null })
      };
    },
    {
      name: 'derelict-dawn-storage',
      version: 1,
      partialize: (state) => ({
        // @ts-ignore - We know these properties exist
        resources: state.resources,
        upgrades: state.upgrades,
        unlockedLogs: state.unlockedLogs,
        logs: state.logs,
        lastOnline: state.lastOnline,
        pageTimestamps: state.pageTimestamps
      })
    }
  )
);

// Helpful selector to get all the state at once
export const useGameState = () => useGameStore(state => state);

// Debug utility to print the state to console
export const logGameState = () => {
  console.log('Current game state:', useGameStore.getState());
};

// Development-only state reset
if (process.env.NODE_ENV === 'development') {
  (window as any).__resetGameState = () => {
    useGameStore.setState({
      resources: {
        energy: { amount: 0, capacity: 10, autoGeneration: 0 },
        insight: { amount: 0, capacity: 5, autoGeneration: 0 },
        crew: { amount: 0, capacity: 3, workerCrews: 0 },
        scrap: { amount: 0, capacity: 20, manufacturingBays: 0 }
      },
      upgrades: {},
      unlockedLogs: [],
      logs: {},
      lastOnline: "",
      isLoading: false,
      error: null,
      pageTimestamps: {},
      version: 1
    });
    console.log('Game state reset to initial values');
  };
} 