import { create } from 'zustand';
import { Repositories } from '@/components/providers/repository-context';

// Type for the sync state store
interface SyncStore {
  lastSyncedAt: number | null;
  isSyncing: boolean;
  syncError: string | null;
  syncEnabled: boolean;
  isOnline: boolean;
  syncNow: () => Promise<void>;
  enableSync: () => void;
  disableSync: () => void;
}

// Options for sync configuration
interface SyncOptions {
  enabled?: boolean;
  debounceTime?: number;
  debug?: boolean;
}

// Function to sync state to repositories
async function syncStateToRepositories(state: any, repositories: Repositories): Promise<void> {
  // Placeholder implementation - would be customized for specific state structure
  return Promise.resolve();
}

/**
 * Creates a sync store to track synchronization state
 * This is a separate store from the main app store
 */
export const createSyncStore = (
  repositories: Repositories,
  options: SyncOptions = {}
) => {
  // Default options
  const {
    enabled = true,
    debounceTime = 2000,
    debug = false
  } = options;
  
  // The timeout for debouncing syncs
  let syncTimeout: NodeJS.Timeout | null = null;
  
  // Create and return the sync store
  const syncStore = create<SyncStore>((set, get) => ({
    // State
    lastSyncedAt: null,
    isSyncing: false,
    syncError: null,
    syncEnabled: enabled,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    
    // Actions
    syncNow: async () => {
      const state = get();
      
      // Skip if already syncing or offline
      if (state.isSyncing || !state.isOnline) {
        return;
      }
      
      set({ isSyncing: true });
      
      try {
        if (debug) {
          console.log('Manual sync started');
        }
        
        // Actual sync would be implemented here
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({
          isSyncing: false,
          lastSyncedAt: Date.now(),
          syncError: null
        });
        
        if (debug) {
          console.log('Manual sync completed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        set({
          isSyncing: false,
          syncError: errorMessage
        });
        
        if (debug) {
          console.error('Manual sync failed:', errorMessage);
        }
      }
    },
    
    enableSync: () => set({ syncEnabled: true }),
    
    disableSync: () => {
      set({ syncEnabled: false });
      if (syncTimeout) {
        clearTimeout(syncTimeout);
        syncTimeout = null;
      }
    }
  }));
  
  // Set up online/offline event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      syncStore.setState({ isOnline: true });
      
      // Sync when we come back online
      if (syncStore.getState().syncEnabled) {
        syncStore.getState().syncNow();
      }
    });
    
    window.addEventListener('offline', () => {
      syncStore.setState({ isOnline: false });
    });
  }
  
  /**
   * Queue a sync operation with debouncing
   */
  const queueSync = (stateToSync: any) => {
    const state = syncStore.getState();
    
    // Skip if sync is disabled or offline
    if (!state.syncEnabled || !state.isOnline) {
      return;
    }
    
    // Debounce
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    // Schedule the sync
    syncTimeout = setTimeout(async () => {
      syncStore.setState({ isSyncing: true });
      
      if (debug) {
        console.log('Auto sync started');
      }
      
      try {
        await syncStateToRepositories(stateToSync, repositories);
        
        syncStore.setState({
          isSyncing: false,
          lastSyncedAt: Date.now(),
          syncError: null
        });
        
        if (debug) {
          console.log('Auto sync completed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        syncStore.setState({
          isSyncing: false,
          syncError: errorMessage
        });
        
        if (debug) {
          console.error('Auto sync failed:', errorMessage);
        }
      }
    }, debounceTime);
  };
  
  return {
    syncStore,
    queueSync
  };
};

/**
 * Hook to access the sync state
 */
export function useSyncState(store: ReturnType<typeof createSyncStore>) {
  return store.syncStore;
} 