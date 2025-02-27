"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useDatabase } from "@/contexts/database/DatabaseContext";
import { useSession } from "@clerk/nextjs";
import { useDebounce } from "@/hooks/use-debounce";
import { reportError } from "@/utils/error/error-service";
import { validateGameData } from "@/utils/error-handling";
import { useSaveStatus } from "@/components/providers/save-status-provider";
// @ts-ignore
import { useBeforeUnload } from 'react-use';

// Game state types
export interface ResourceState {
  energy?: {
    amount: number;
    capacity: number;
    autoGeneration: number;
    latestSave?: string; // ISO timestamp when this resource was last updated
  };
  insight?: {
    amount: number;
    capacity: number;
    autoGeneration: number;
    latestSave?: string; // ISO timestamp when this resource was last updated
  };
  crew?: {
    amount: number;
    capacity: number;
    workerCrews: number;
    latestSave?: string; // ISO timestamp when this resource was last updated
  };
  scrap?: {
    amount: number;
    capacity: number;
    manufacturingBays: number;
    latestSave?: string; // ISO timestamp when this resource was last updated
  };
}

export interface GameProgress {
  resources: ResourceState;
  upgrades: Record<string, boolean>;
  unlockedLogs: number[];
  lastOnline: string; // ISO timestamp
  page_timestamps?: Record<string, string>; // Timestamps for when each page was last visited
}

// Context interface
interface GameStateContextType {
  gameProgress: GameProgress | null;
  loadGameProgress: () => Promise<GameProgress | null>;
  saveGameProgress: (progress: GameProgress) => Promise<void>;
  triggerSave: (progress: GameProgress) => void;
  unlockLog: (logId: number) => void;
  updatePageTimestamp: (pageName: string) => void;
  loading: boolean;
}

// Default game state
export const defaultGameProgress: GameProgress = {
  resources: {
    energy: { amount: 0, capacity: 100, autoGeneration: 0 },
    insight: { amount: 0, capacity: 50, autoGeneration: 0 },
    crew: { amount: 0, capacity: 5, workerCrews: 0 },
    scrap: { amount: 0, capacity: 100, manufacturingBays: 0 }
  },
  upgrades: {},
  unlockedLogs: [1, 2, 3], // Initial unlocked logs
  lastOnline: new Date().toISOString(),
  page_timestamps: {
    reactor: new Date().toISOString(),
    processor: new Date().toISOString(),
    "crew-quarters": new Date().toISOString(),
    manufacturing: new Date().toISOString()
  }
};

// Create the context with default values
const GameStateContext = createContext<GameStateContextType>({
  gameProgress: null,
  loadGameProgress: async () => null,
  saveGameProgress: async () => {},
  triggerSave: () => {},
  unlockLog: () => {},
  updatePageTimestamp: () => {},
  loading: false
});

// Provider component
export function GameStateProvider({ children }: { children: ReactNode }) {
  const { supabase, isInitialized } = useDatabase();
  const { session, isLoaded } = useSession();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { setSaving, setSaved, setError: setSaveError } = useSaveStatus();
  
  // Load game progress
  const loadGameProgress = async (): Promise<GameProgress | null> => {
    if (!supabase || !session?.user?.id) {
      return null;
    }
    
    try {
      setLoading(true);
      
      // Check for local backup first
      let localBackup: GameProgress | null = null;
      const localBackupJson = localStorage.getItem('gameProgressBackup');
      if (localBackupJson) {
        try {
          localBackup = JSON.parse(localBackupJson) as GameProgress;
        } catch (e) {
          console.error('Failed to parse local backup:', e);
        }
      }
      
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        // If no data found, create a new entry with default values
        if (error.code === 'PGRST116') {
          // Create new game progress
          const { data: newData, error: insertError } = await supabase
            .from('game_progress')
            .insert([{ 
              user_id: session.user.id,
              resources: defaultGameProgress.resources,
              upgrades: defaultGameProgress.upgrades,
              unlocked_logs: defaultGameProgress.unlockedLogs,
              last_online: defaultGameProgress.lastOnline,
              page_timestamps: defaultGameProgress.page_timestamps
            }])
            .select();

          if (insertError) {
            reportError(insertError);
            return null;
          }

          const progress = {
            resources: newData[0].resources as ResourceState,
            upgrades: newData[0].upgrades as Record<string, boolean>,
            unlockedLogs: newData[0].unlocked_logs as number[],
            lastOnline: newData[0].last_online,
            page_timestamps: newData[0].page_timestamps as Record<string, string>
          };

          setGameProgress(progress);
          return progress;
        } else {
          reportError(error);
          return null;
        }
      }

      // Map database format to our application format
      let progress: GameProgress;
      
      if (data) {
        progress = {
          resources: data.resources as ResourceState,
          upgrades: data.upgrades as Record<string, boolean>,
          unlockedLogs: data.unlocked_logs as number[],
          lastOnline: data.last_online,
          page_timestamps: data.page_timestamps as Record<string, string>
        };
        
        // Compare with local backup and use the most recent one
        if (localBackup && new Date(localBackup.lastOnline) > new Date(progress.lastOnline)) {
          progress = localBackup;
        }
      } else if (localBackup) {
        // No data from server but we have a local backup
        progress = localBackup;
      } else {
        // Default new game progress
        progress = { ...defaultGameProgress };
      }
      
      setGameProgress(progress);
      return progress;
    } catch (e: any) {
      reportError(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save game progress
  const saveGameProgress = async (progress: GameProgress): Promise<void> => {
    if (!supabase || !session?.user?.id) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate data before saving
      const validation = validateGameData(progress);
      if (!validation.valid) {
        throw new Error(`Invalid game data: ${validation.errors.join(', ')}`);
      }
      
      // First check if a record exists for this user
      const { data: existingRecord, error: checkError } = await supabase
        .from('game_progress')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
          
      if (checkError) {
        reportError(checkError);
        return;
      }
      
      let error;
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('game_progress')
          .update({
            resources: progress.resources,
            upgrades: progress.upgrades,
            unlocked_logs: progress.unlockedLogs,
            last_online: new Date().toISOString(),
            page_timestamps: progress.page_timestamps || {}
          })
          .eq('user_id', session.user.id);
              
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('game_progress')
          .insert({
            user_id: session.user.id,
            resources: progress.resources,
            upgrades: progress.upgrades,
            unlocked_logs: progress.unlockedLogs,
            last_online: new Date().toISOString(),
            page_timestamps: progress.page_timestamps || {}
          });
              
        error = insertError;
      }

      if (error) {
        reportError(error);
      } else {
        setGameProgress(progress);
      }
    } catch (e: any) {
      reportError(e);
    } finally {
      setLoading(false);
    }
  };

  // Create a debounced save function
  const debouncedSave = useDebounce(
    async (progress: GameProgress) => {
      try {
        setSaving(); // Set status to saving
        
        // First save to localStorage as backup
        localStorage.setItem('gameProgressBackup', JSON.stringify({
          ...progress,
          lastSaved: new Date().toISOString()
        }));
        
        // Then save to Supabase if user is authenticated
        if (supabase && session?.user?.id) {
          await saveGameProgress(progress);
        }
        
        setSaved(); // Set status to saved
      } catch (error) {
        reportError(error);
        setSaveError(error instanceof Error ? error.message : 'Unknown error saving game');
      }
    }, 
    2000, // 2 second debounce
    [supabase, session]
  );

  // Add a type assertion for the debouncedSave function to include cancel property
  (debouncedSave as { cancel?: () => void }).cancel = () => {
    // This is a placeholder since our useDebounce doesn't expose a cancel method
    // If needed, we can modify the useDebounce hook to provide this functionality
    console.log('Attempted to cancel debounced save');
  };

  // Function to trigger the debounced save
  const triggerSave = useCallback((progress: GameProgress) => {
    try {
      setSaving(); // Set status to saving
      
      // Update the state immediately
      setGameProgress(progress);
      
      // Save to localStorage as immediate backup
      localStorage.setItem('gameProgressBackup', JSON.stringify({
        ...progress,
        lastSaved: new Date().toISOString()
      }));
      
      // Schedule the save with debounce
      debouncedSave(progress);
    } catch (error) {
      reportError(error);
      setSaveError(error instanceof Error ? error.message : 'Unknown error saving game');
    }
  }, [debouncedSave, setSaving, setSaveError]);

  // Set up interval save
  useEffect(() => {
    if (!gameProgress) return;
    
    const intervalId = setInterval(() => {
      // Save current game state every 30 seconds
      if (gameProgress) {
        saveGameProgress({
          ...gameProgress,
          lastOnline: new Date().toISOString()
        }).then(() => {
          setSaved(); // Set status to saved
        }).catch(error => {
          reportError(error);
          setSaveError(error instanceof Error ? error.message : 'Error during interval save');
        });
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [gameProgress]);
  
  // Save on page unload
  useBeforeUnload(() => {
    if (gameProgress) {
      // Instead of trying to cancel the debounce, just save directly to localStorage
      
      // Save to localStorage synchronously (this will work during unload)
      localStorage.setItem('gameProgressBackup', JSON.stringify({
        ...gameProgress,
        lastOnline: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      }));
    }
    
    return true; // Return true to satisfy the type requirement
  });

  // Add this where appropriate in the GameStateProvider component
  const unlockLog = useCallback((logId: number) => {
    if (!gameProgress) return;

    // Check if the log is already unlocked
    if (gameProgress.unlockedLogs.includes(logId)) return;

    // Create a new array with the unlocked log
    const updatedUnlockedLogs = [...gameProgress.unlockedLogs, logId];

    // Update the game progress
    const updatedProgress = {
      ...gameProgress,
      unlockedLogs: updatedUnlockedLogs
    };

    // Save the updated progress
    triggerSave(updatedProgress);

    // Show a mysterious notification that a new log was discovered
    if (typeof window !== "undefined" && (window as any).notifications) {
      (window as any).notifications.newLogUnlocked();
    } else {
      // Fallback if notification system not available
      console.log(`New log unlocked: ${logId}`);
    }
  }, [gameProgress, triggerSave]);

  // Add the updatePageTimestamp function
  const updatePageTimestamp = useCallback((pageName: string) => {
    if (!gameProgress) return;
    
    const currentTime = new Date().toISOString();
    
    // Create updated page timestamps
    const updatedTimestamps = {
      ...(gameProgress.page_timestamps || {}),
      [pageName]: currentTime
    };
    
    // Update the game progress with new timestamp
    const updatedProgress = {
      ...gameProgress,
      page_timestamps: updatedTimestamps
    };
    
    // Save the updated progress
    setGameProgress(updatedProgress);
    
    // Always trigger save to ensure timestamps are consistently tracked
    triggerSave(updatedProgress);
  }, [gameProgress, triggerSave]);

  // Load game progress on session change
  useEffect(() => {
    if (isLoaded && session && isInitialized) {
      loadGameProgress();
    } else if (isLoaded && !session) {
      // Reset game progress if no session
      setGameProgress(null);
      setLoading(false);
    }
  }, [isLoaded, session, isInitialized]);

  // Try to load from localStorage on initial mount if there is no game progress yet
  useEffect(() => {
    if (!gameProgress && isLoaded && !session) {
      const localBackup = localStorage.getItem('gameProgressBackup');
      if (localBackup) {
        try {
          const parsedBackup = JSON.parse(localBackup) as GameProgress;
          setGameProgress(parsedBackup);
        } catch (error) {
          reportError(error);
        }
      }
    }
  }, [gameProgress, isLoaded, session]);

  return (
    <GameStateContext.Provider value={{
      gameProgress,
      loadGameProgress,
      saveGameProgress,
      triggerSave,
      unlockLog,
      updatePageTimestamp,
      loading
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

// Hook to use the game state
export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
} 