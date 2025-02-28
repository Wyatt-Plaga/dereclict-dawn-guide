import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createResourcesSlice } from './slices/resourcesSlice';
import { createUpgradesSlice } from './slices/upgradesSlice';
import { createLogsSlice } from './slices/logsSlice';
import { GameState, GameActions, STORE_VERSION } from './types';
import { GameProgress } from '@/types/game.types';

type SetState = Parameters<Parameters<typeof immer>[0]>[0];
type GetState = Parameters<Parameters<typeof immer>[0]>[1];
type StoreApi = Parameters<Parameters<typeof immer>[0]>[2];

// Middleware for handling migration between different versions
const migrationMiddleware = (config: Function) => (
  set: SetState,
  get: GetState,
  api: StoreApi
) => {
  // Initialize the store with the config
  const initialState = config(set, get, api);

  return {
    ...initialState,
    version: STORE_VERSION,
    
    // General state actions
    setGameState: (gameProgress: GameProgress) => {
      set((state: GameState & GameActions) => {
        // Update the entire state from GameProgress object
        state.resources = gameProgress.resources;
        state.upgrades = gameProgress.upgrades;
        state.unlockedLogs = gameProgress.unlockedLogs;
        state.lastOnline = gameProgress.lastOnline;
        state.pageTimestamps = gameProgress.page_timestamps || {};
        state.availablePages = gameProgress.availablePages;
        state.version = STORE_VERSION; // Ensure version is set
      });
    },
    
    setLoading: (isLoading: boolean) => {
      set((state: GameState & GameActions) => {
        state.isLoading = isLoading;
      });
    },
    
    setError: (error: string | null) => {
      set((state: GameState & GameActions) => {
        state.error = error;
      });
    },
    
    resetError: () => {
      set((state: GameState & GameActions) => {
        state.error = null;
      });
    },
    
    // Page actions
    updatePageTimestamp: (pageName: string) => {
      set((state: GameState & GameActions) => {
        state.pageTimestamps[pageName] = new Date().toISOString();
      });
    },
    
    addAvailablePage: (pageName: string) => {
      set((state: GameState & GameActions) => {
        if (!state.availablePages.includes(pageName)) {
          state.availablePages.push(pageName);
        }
      });
    }
  };
};

// Create the root store with the version property included in the state
export const useGameStore = create<GameState & GameActions>()(
  immer(
    persist(
      (set, get, api) => ({
        // Initial state
        lastOnline: new Date().toISOString(),
        pageTimestamps: { reactor: new Date().toISOString() },
        availablePages: ['reactor'],
        isLoading: false,
        error: null,
        version: STORE_VERSION, // Add version to initial state
        
        // Combine all slices
        ...createResourcesSlice(set, get, api),
        ...createUpgradesSlice(set, get, api),
        ...createLogsSlice(set, get, api),
        
        // General state actions
        setGameState: (gameProgress: GameProgress) => {
          set((state) => {
            // Update the entire state from GameProgress object
            state.resources = gameProgress.resources;
            state.upgrades = gameProgress.upgrades;
            state.unlockedLogs = gameProgress.unlockedLogs;
            state.lastOnline = gameProgress.lastOnline;
            state.pageTimestamps = gameProgress.page_timestamps || {};
            state.availablePages = gameProgress.availablePages;
            state.version = STORE_VERSION; // Ensure version is set
          });
        },
        
        setLoading: (isLoading: boolean) => {
          set((state) => {
            state.isLoading = isLoading;
          });
        },
        
        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },
        
        resetError: () => {
          set((state) => {
            state.error = null;
          });
        },
        
        // Page actions
        updatePageTimestamp: (pageName: string) => {
          set((state) => {
            state.pageTimestamps[pageName] = new Date().toISOString();
          });
        },
        
        addAvailablePage: (pageName: string) => {
          set((state) => {
            if (!state.availablePages.includes(pageName)) {
              state.availablePages.push(pageName);
            }
          });
        }
      }),
      {
        name: 'game-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          resources: state.resources,
          upgrades: state.upgrades,
          unlockedLogs: state.unlockedLogs,
          lastOnline: state.lastOnline,
          pageTimestamps: state.pageTimestamps,
          availablePages: state.availablePages,
          version: state.version,
        }),
        // Version-based migration
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('Error rehydrating game store:', error);
          } else if (state) {
            console.log('Game store rehydrated successfully');
            
            // Handle version migrations if needed
            if (state.version !== STORE_VERSION) {
              console.log(`Migrating store from version ${state.version || 'unknown'} to ${STORE_VERSION}`);
              // Future migration logic would go here
            }
          }
        },
      }
    )
  )
); 