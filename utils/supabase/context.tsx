"use client"

import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode, useState, useEffect, useCallback } from "react";
import { displayErrorToast, validateGameData } from "@/utils/error-handling";
import debounce from 'lodash.debounce';
// @ts-ignore
import { useBeforeUnload } from 'react-use';
import { useSaveStatus } from "@/components/providers/save-status-provider";
import { calculateOfflineProgress } from "@/utils/offline-progress";

// Define game state types
export interface ResourceState {
    energy?: {
        amount: number;
        capacity: number;
        autoGeneration: number;
    };
    insight?: {
        amount: number;
        capacity: number;
        autoGeneration: number;
    };
    crew?: {
        amount: number;
        capacity: number;
        workerCrews: number;
    };
    scrap?: {
        amount: number;
        capacity: number;
        manufacturingBays: number;
    };
}

export interface GameProgress {
    resources: ResourceState;
    upgrades: Record<string, boolean>;
    unlockedLogs: number[];
    lastOnline: string; // ISO timestamp
}

// Context interface including game state functionality
interface SupabaseContextType {
    supabase: SupabaseClient | null;
    gameProgress: GameProgress | null;
    loadGameProgress: () => Promise<GameProgress | null>;
    saveGameProgress: (progress: GameProgress) => Promise<void>;
    triggerSave: (progress: GameProgress) => void;
    unlockLog: (logId: number) => void;
    loading: boolean;
    error: string | null;
    offlineGains: {
        minutesPassed: number;
        gains: {
            energy: number;
            insight: number;
            crew: number;
            scrap: number;
        };
    } | null;
    dismissOfflineGains: () => void;
}

// Default game state
const defaultGameProgress: GameProgress = {
    resources: {
        energy: { amount: 0, capacity: 100, autoGeneration: 0 },
        insight: { amount: 0, capacity: 50, autoGeneration: 0 },
        crew: { amount: 0, capacity: 5, workerCrews: 0 },
        scrap: { amount: 0, capacity: 100, manufacturingBays: 0 }
    },
    upgrades: {},
    unlockedLogs: [1, 2, 3], // Initial unlocked logs
    lastOnline: new Date().toISOString()
};

const SupabaseContext = createContext<SupabaseContextType>({
    supabase: null,
    gameProgress: null,
    loadGameProgress: async () => null,
    saveGameProgress: async () => {},
    triggerSave: () => {},
    unlockLog: () => {},
    loading: false,
    error: null,
    offlineGains: null,
    dismissOfflineGains: () => {}
});

export function SupabaseProvider({ children }: { children: ReactNode }) {
    const { session, isLoaded } = useSession();
    const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setSaving, setSaved, setError: setSaveError } = useSaveStatus();
    
    // Add state for offline progress
    const [offlineGains, setOfflineGains] = useState<{
        minutesPassed: number;
        gains: {
            energy: number;
            insight: number;
            crew: number;
            scrap: number;
        };
    } | null>(null);

    // Create the Supabase client
    const supabase = useMemo(() => {
        // Make sure we're using the correct environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('[DEBUG] Supabase credentials not found:', { 
                urlExists: !!supabaseUrl, 
                keyExists: !!supabaseKey 
            });
            setError('Supabase configuration is missing. Please check your environment variables.');
            return null;
        }
        
        console.log('[DEBUG] Creating Supabase client with:', { 
            url: supabaseUrl.substring(0, 10) + '...',  // Log partial URL for debugging
            keyLength: supabaseKey?.length || 0,
            sessionExists: !!session,
            sessionLoaded: isLoaded
        });
        
        try {
            // Create a basic client first - we'll handle authentication separately
            return createClient(supabaseUrl, supabaseKey);
        } catch (err) {
            console.error('[DEBUG] Error creating Supabase client:', err);
            setError(`Failed to initialize Supabase: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return null;
        }
    }, []);  // Only recreate the client when necessary, not on every session change

    // Auth token management
    useEffect(() => {
        // When session changes, update the supabase auth
        if (supabase && session) {
            const updateSupabaseAuth = async () => {
                try {
                    // Instead of trying to get a Supabase token from Clerk,
                    // just note that we're authenticated but skip the token part
                    console.log('[DEBUG] User authenticated with Clerk, but Supabase JWT template not configured');
                    console.log('[DEBUG] Using user ID from Clerk directly:', session.user?.id);
                    
                    // Since we're not using JWT tokens, we'll now rely on the service role in the API routes
                    // and the user ID for identification without Row Level Security
                    
                    // Clear any previous errors so the UI shows we're connected
                    setError(null);
                } catch (err) {
                    console.error('[DEBUG] Error in auth handling:', err);
                    setError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            };
            
            updateSupabaseAuth();
        }
    }, [session, supabase]);

    // Create a debounced save function
    const debouncedSaveProgress = useMemo(() => 
        debounce(async (progress: GameProgress) => {
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
                console.error('Error in debounced save:', error);
                setSaveError(error instanceof Error ? error.message : 'Unknown error saving game');
            }
        }, 2000), // 2 second debounce
        [supabase, session]
    );

    // Set up interval save
    useEffect(() => {
        if (!gameProgress) return;
        
        const intervalId = setInterval(() => {
            // Save current game state every 30 seconds
            if (gameProgress) {
                // Use a callback to ensure we have the latest state
                saveGameProgress({
                    ...gameProgress,
                    lastOnline: new Date().toISOString()
                }).then(() => {
                    console.log("Interval save completed at", new Date().toTimeString());
                    setSaved(); // Set status to saved
                }).catch(error => {
                    console.error("Interval save failed:", error);
                    setSaveError(error instanceof Error ? error.message : 'Error during interval save');
                });
            }
        }, 30000); // 30 seconds
        
        return () => clearInterval(intervalId);
    }, [gameProgress]);
    
    // Save on page unload
    useBeforeUnload(() => {
        if (gameProgress) {
            // Cancel debounce and save immediately
            debouncedSaveProgress.cancel();
            
            // Save to localStorage synchronously (this will work during unload)
            localStorage.setItem('gameProgressBackup', JSON.stringify({
                ...gameProgress,
                lastOnline: new Date().toISOString(),
                lastSaved: new Date().toISOString()
            }));
        }
        
        return true; // Return true to satisfy the type requirement
    });

    const loadGameProgress = async (): Promise<GameProgress | null> => {
        if (!supabase || !session?.user?.id) {
            if (!supabase) setError('Supabase client not initialized');
            if (!session?.user?.id) setError('User not authenticated');
            return null;
        }
        
        try {
            setLoading(true);
            console.log('[DEBUG] Loading game progress for user:', session.user.id);
            
            // Check for local backup first
            let localBackup: GameProgress | null = null;
            const localBackupJson = localStorage.getItem('gameProgressBackup');
            if (localBackupJson) {
                try {
                    localBackup = JSON.parse(localBackupJson) as GameProgress;
                    console.log('[DEBUG] Found local backup from:', new Date(localBackup.lastOnline));
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
                    console.log('No game progress found, creating new entry');
                    // Create new game progress
                    const { data: newData, error: insertError } = await supabase
                        .from('game_progress')
                        .insert([{ 
                            user_id: session.user.id,
                            resources: defaultGameProgress.resources,
                            upgrades: defaultGameProgress.upgrades,
                            unlocked_logs: defaultGameProgress.unlockedLogs,
                            last_online: defaultGameProgress.lastOnline
                        }])
                        .select();

                    if (insertError) {
                        console.error('Error creating game progress:', insertError);
                        setError(`Error creating game progress: ${insertError.message}`);
                        return null;
                    }

                    console.log('New game progress created:', newData);
                    const progress = {
                        resources: newData[0].resources as ResourceState,
                        upgrades: newData[0].upgrades as Record<string, boolean>,
                        unlockedLogs: newData[0].unlocked_logs as number[],
                        lastOnline: newData[0].last_online
                    };

                    setGameProgress(progress);
                    return progress;
                } else {
                    console.error('Error loading game progress:', error);
                    setError(`Error loading game progress: ${error.message}`);
                    
                    // Check if table doesn't exist and provide more helpful error
                    if (error.message.includes('relation') && error.message.includes('does not exist')) {
                        setError('Database table "game_progress" does not exist. Please run the migrations.');
                    }
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
                    lastOnline: data.last_online
                };
                
                // Compare with local backup and use the most recent one
                if (localBackup && new Date(localBackup.lastOnline) > new Date(progress.lastOnline)) {
                    console.log('[DEBUG] Local backup is more recent, using that instead');
                    progress = localBackup;
                }
            } else if (localBackup) {
                // No data from server but we have a local backup
                progress = localBackup;
            } else {
                // Default new game progress
                progress = { ...defaultGameProgress };
            }
            
            // Calculate offline progress
            const { updatedResources, minutesPassed, gains } = calculateOfflineProgress(progress);
            
            // Only show offline progress if significant time has passed and there are gains
            const hasGains = Object.values(gains).some(value => value > 0);
            if (minutesPassed > 0 && hasGains) {
                setOfflineGains({ minutesPassed, gains });
                progress.resources = updatedResources;
            }
            
            // Update the server with the new values
            if (minutesPassed > 0) {
                try {
                    await supabase
                        .from('game_progress')
                        .update({
                            resources: updatedResources,
                            last_online: new Date().toISOString()
                        })
                        .eq('user_id', session.user.id);
                } catch (e) {
                    console.error('Failed to update server with offline progress:', e);
                }
            }

            setGameProgress(progress);
            return progress;
        } catch (e: any) {
            console.error('Unexpected error loading game progress:', e);
            setError(`Unexpected error: ${e.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveGameProgress = async (progress: GameProgress): Promise<void> => {
        if (!supabase || !session?.user?.id) {
            if (!supabase) setError('Supabase client not initialized');
            if (!session?.user?.id) setError('User not authenticated');
            return;
        }
        
        try {
            setLoading(true);
            console.log('[DEBUG] Saving game progress for user:', session.user.id);
            
            // Validate data before saving
            const validation = validateGameData(progress);
            if (!validation.valid) {
                console.error('Invalid game data:', validation.errors);
                throw new Error(`Invalid game data: ${validation.errors.join(', ')}`);
            }
            
            // First check if a record exists for this user
            const { data: existingRecord, error: checkError } = await supabase
                .from('game_progress')
                .select('id')
                .eq('user_id', session.user.id)
                .maybeSingle();
                
            if (checkError) {
                console.error('Error checking for existing record:', checkError);
                setError(`Error checking existing record: ${checkError.message}`);
                return;
            }
            
            let error;
            
            if (existingRecord) {
                // Update existing record
                console.log('[DEBUG] Updating existing game progress record');
                const { error: updateError } = await supabase
                    .from('game_progress')
                    .update({
                        resources: progress.resources,
                        upgrades: progress.upgrades,
                        unlocked_logs: progress.unlockedLogs,
                        last_online: new Date().toISOString()
                    })
                    .eq('user_id', session.user.id);
                    
                error = updateError;
            } else {
                // Insert new record
                console.log('[DEBUG] Creating new game progress record');
                const { error: insertError } = await supabase
                    .from('game_progress')
                    .insert({
                        user_id: session.user.id,
                        resources: progress.resources,
                        upgrades: progress.upgrades,
                        unlocked_logs: progress.unlockedLogs,
                        last_online: new Date().toISOString()
                    });
                    
                error = insertError;
            }

            if (error) {
                console.error('Error saving game progress:', error);
                setError(`Error saving game progress: ${error.message}`);
            } else {
                console.log('Game progress saved successfully');
                setGameProgress(progress);
            }
        } catch (e: any) {
            console.error('Unexpected error saving game progress:', e);
            setError(`Unexpected error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Function to trigger the debounced save
    const triggerSave = useCallback((progress: GameProgress) => {
        try {
            console.log("Triggering save...", new Date().toTimeString());
            setSaving(); // Update save status to indicate saving is in progress
            
            // Update the state immediately
            setGameProgress(progress);
            
            // Save to localStorage as immediate backup
            localStorage.setItem('gameProgressBackup', JSON.stringify({
                ...progress,
                lastSaved: new Date().toISOString()
            }));
            
            // Schedule the save with debounce
            debouncedSaveProgress(progress);
        } catch (error) {
            console.error("Error in triggerSave:", error);
            setSaveError(error instanceof Error ? error.message : 'Unknown error saving game');
        }
    }, [debouncedSaveProgress]);
    
    // Function to dismiss offline gains notification
    const dismissOfflineGains = useCallback(() => {
        setOfflineGains(null);
    }, []);

    // Load game progress on session change
    useEffect(() => {
        if (isLoaded && session && supabase) {
            console.log('Session loaded, initializing game data');
            loadGameProgress();
        } else if (isLoaded && !session) {
            console.log('No session, resetting game progress');
            setGameProgress(null);
            setLoading(false);
        }
    }, [isLoaded, session, supabase]);

    // Try to load from localStorage on initial mount if there is no game progress yet
    useEffect(() => {
        if (!gameProgress && isLoaded && !session) {
            const localBackup = localStorage.getItem('gameProgressBackup');
            if (localBackup) {
                try {
                    const parsedBackup = JSON.parse(localBackup) as GameProgress;
                    setGameProgress(parsedBackup);
                } catch (error) {
                    console.error('Error parsing local backup:', error);
                }
            }
        }
    }, [gameProgress, isLoaded, session]);

    // Add this where appropriate in the SupabaseProvider component
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
        if (typeof window !== "undefined" && window.notifications) {
            window.notifications.newLogUnlocked();
        } else {
            // Fallback if notification system not available
            console.log(`New log unlocked: ${logId}`);
        }
    }, [gameProgress, triggerSave]);

    return (
        <SupabaseContext.Provider value={{ 
            supabase, 
            gameProgress, 
            loadGameProgress, 
            saveGameProgress,
            triggerSave,
            unlockLog,
            loading,
            error,
            offlineGains,
            dismissOfflineGains
        }}>
            {children}
        </SupabaseContext.Provider>
    );
}

// Hook to use the Supabase client and game state
export function useSupabase() {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
}