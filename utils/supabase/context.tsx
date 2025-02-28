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

// Context interface including game state functionality
interface SupabaseContextType {
    supabase: SupabaseClient | null;
    gameProgress: GameProgress | null;
    loadGameProgress: () => Promise<GameProgress | null>;
    saveGameProgress: (progress: GameProgress) => Promise<void>;
    triggerSave: (progress: GameProgress) => void;
    unlockLog: (logId: number) => void;
    unlockUpgrade: (upgradeId: string) => void; // Add function to unlock upgrades
    updatePageTimestamp: (pageName: string) => void; // Add function to update page timestamps
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
    // Add resource-specific offline progress functionality
    calculateResourceOfflineProgress: (resourceType: 'energy' | 'insight' | 'crew' | 'scrap') => void;
    resourceOfflineGains: {
        resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
        minutesPassed: number;
        gain: number;
    } | null;
    dismissResourceOfflineGains: () => void;
}

// Default game state - modified for progression system
const defaultGameProgress: GameProgress = {
    resources: {
        energy: { amount: 0, capacity: 10, autoGeneration: 0 }, // Initial energy capacity is 10
        insight: { amount: 0, capacity: 5, autoGeneration: 0 }, // Will be unlocked later
        crew: { amount: 0, capacity: 3, workerCrews: 0 }, // Will be unlocked later
        scrap: { amount: 0, capacity: 20, manufacturingBays: 0 } // Will be unlocked later
    },
    upgrades: {},
    unlockedLogs: [], // Start with no logs unlocked
    lastOnline: new Date().toISOString(),
    page_timestamps: {
        reactor: new Date().toISOString() // Only reactor is initially accessible
    }
};

const SupabaseContext = createContext<SupabaseContextType>({
    supabase: null,
    gameProgress: null,
    loadGameProgress: async () => null,
    saveGameProgress: async () => {},
    triggerSave: () => {},
    unlockLog: () => {},
    unlockUpgrade: () => {}, // Add to default context
    updatePageTimestamp: () => {}, // Add to default context
    loading: false,
    error: null,
    offlineGains: null,
    dismissOfflineGains: () => {},
    // Add resource-specific offline progress functionality
    calculateResourceOfflineProgress: () => {},
    resourceOfflineGains: null,
    dismissResourceOfflineGains: () => {}
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
    
    // Add state for resource-specific offline progress
    const [resourceOfflineGains, setResourceOfflineGains] = useState<{
        resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
        minutesPassed: number;
        gain: number;
    } | null>(null);

    // Log game save mechanisms on initial render
    useEffect(() => {
        console.log(`
┌────────────────────────────────────────────────────┐
│             DERELICT DAWN SAVE SYSTEM              │
├────────────────────────────────────────────────────┤
│ • LOCAL STORAGE: Immediate backup on every change  │
│                                                    │
│ • SUPABASE SAVE: After 2 second debounce           │
│   - Triggered by any game state change             │
│   - Provides conflict resolution with local backup │
│                                                    │
│ • AUTO-SAVE: Every 30 seconds                      │
│   - Both local storage and Supabase                │
│   - If online, will sync with server               │
│                                                    │
│ • PAGE UNLOAD: When closing page or navigating away│
│   - Local storage only (Supabase async not possible)│
├────────────────────────────────────────────────────┤
│ [SAVE] logs show detailed save operations          │
└────────────────────────────────────────────────────┘
`);
    }, []);

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
                
                const saveStartTime = new Date();
                console.log(`[SAVE] Starting debounced save at ${saveStartTime.toLocaleTimeString()}...`);
                
                // First save to localStorage as backup
                localStorage.setItem('gameProgressBackup', JSON.stringify({
                    ...progress,
                    lastSaved: new Date().toISOString()
                }));
                console.log(`[SAVE] ✓ Local storage save completed at ${new Date().toLocaleTimeString()}`);
                
                // Then save to Supabase if user is authenticated
                if (supabase && session?.user?.id) {
                    console.log(`[SAVE] Attempting Supabase save for user: ${session.user.id.substring(0, 8)}...`);
                    await saveGameProgress(progress);
                    console.log(`[SAVE] ✓ Supabase save completed (took ${new Date().getTime() - saveStartTime.getTime()}ms)`);
                } else {
                    console.log(`[SAVE] ✗ Supabase save skipped - ${supabase ? 'Not authenticated' : 'No Supabase client'}`);
                }
                
                setSaved(); // Set status to saved
            } catch (error) {
                console.error('[SAVE] ✗ Error in debounced save:', error);
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
                const saveStartTime = new Date();
                console.log(`[SAVE] Starting 30-second interval save at ${saveStartTime.toLocaleTimeString()}...`);
                
                // Use a callback to ensure we have the latest state
                saveGameProgress({
                    ...gameProgress,
                    lastOnline: new Date().toISOString()
                }).then(() => {
                    console.log(`[SAVE] ✓ Interval Supabase save completed at ${new Date().toLocaleTimeString()} (took ${new Date().getTime() - saveStartTime.getTime()}ms)`);
                    setSaved(); // Set status to saved
                }).catch(error => {
                    console.error("[SAVE] ✗ Interval Supabase save failed:", error);
                    setSaveError(error instanceof Error ? error.message : 'Error during interval save');
                });
                
                // Also update local storage as a backup
                localStorage.setItem('gameProgressBackup', JSON.stringify({
                    ...gameProgress,
                    lastOnline: new Date().toISOString(),
                    lastSaved: new Date().toISOString()
                }));
                console.log(`[SAVE] ✓ Interval local storage save completed`);
            }
        }, 30000); // 30 seconds
        
        return () => clearInterval(intervalId);
    }, [gameProgress]);
    
    // Save on page unload
    useBeforeUnload(() => {
        if (gameProgress) {
            // Cancel debounce and save immediately
            debouncedSaveProgress.cancel();
            console.log('[SAVE] Page unload detected - saving to localStorage only (Supabase async save not possible on unload)');
            
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
            console.log(`[LOAD] Loading game progress for user: ${session.user.id.substring(0, 8)}...`);
            
            // Check for local backup first
            let localBackup: GameProgress | null = null;
            const localBackupJson = localStorage.getItem('gameProgressBackup');
            if (localBackupJson) {
                try {
                    localBackup = JSON.parse(localBackupJson) as GameProgress;
                    console.log(`[LOAD] Found local backup from: ${new Date(localBackup.lastOnline).toLocaleString()}`);
                } catch (e) {
                    console.error('[LOAD] ✗ Failed to parse local backup:', e);
                }
            } else {
                console.log(`[LOAD] No local backup found, will rely on server data`);
            }
            
            const startTime = new Date();
            const { data, error } = await supabase
                .from('game_progress')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                // If no data found, create a new entry with default values
                if (error.code === 'PGRST116') {
                    console.log('[LOAD] No game progress found in Supabase, creating new entry');
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
                        console.error('[LOAD] ✗ Error creating game progress:', insertError);
                        setError(`Error creating game progress: ${insertError.message}`);
                        return null;
                    }

                    console.log('[LOAD] ✓ New game progress created in Supabase');
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
                    console.error('[LOAD] ✗ Error loading game progress from Supabase:', error);
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
                console.log(`[LOAD] ✓ Game progress loaded from Supabase (took ${new Date().getTime() - startTime.getTime()}ms)`);
                progress = {
                    resources: data.resources as ResourceState,
                    upgrades: data.upgrades as Record<string, boolean>,
                    unlockedLogs: data.unlocked_logs as number[],
                    lastOnline: data.last_online,
                    page_timestamps: data.page_timestamps as Record<string, string>
                };
                
                // Compare with local backup and use the most recent one
                if (localBackup && new Date(localBackup.lastOnline) > new Date(progress.lastOnline)) {
                    console.log('[LOAD] Local backup is more recent than Supabase data, using local version');
                    progress = localBackup;
                } else if (localBackup) {
                    console.log('[LOAD] Supabase data is more recent than local backup, using server version');
                }
            } else if (localBackup) {
                // No data from server but we have a local backup
                console.log('[LOAD] No data from Supabase but found local backup, using local version');
                progress = localBackup;
            } else {
                // Default new game progress
                console.log('[LOAD] No game data found anywhere, creating new game with default values');
                progress = { ...defaultGameProgress };
            }
            
            // Calculate offline progress
            console.log('[LOAD] Calculating offline progress since last online time...');
            const { updatedResources, minutesPassed, gains } = calculateOfflineProgress(progress);
            
            // Only show offline progress if significant time has passed and there are gains
            const hasGains = Object.values(gains).some(value => value > 0);
            if (minutesPassed > 0 && hasGains) {
                console.log(`[LOAD] ✓ Calculated ${minutesPassed} minutes of offline progress with resource gains`);
                setOfflineGains({ minutesPassed, gains });
                progress.resources = updatedResources;
            } else {
                console.log(`[LOAD] No significant offline progress to apply (${minutesPassed} minutes passed)`);
            }
            
            // Update the server with the new values
            if (minutesPassed > 0) {
                try {
                    console.log('[LOAD] Updating Supabase with offline progress calculations...');
                    await supabase
                        .from('game_progress')
                        .update({
                            resources: updatedResources,
                            last_online: new Date().toISOString()
                            // Don't update page_timestamps here as they need to remain unchanged
                        })
                        .eq('user_id', session.user.id);
                    console.log('[LOAD] ✓ Updated Supabase with offline progress');
                } catch (e) {
                    console.error('[LOAD] ✗ Failed to update Supabase with offline progress:', e);
                }
            }

            setGameProgress(progress);
            return progress;
        } catch (e: any) {
            console.error('[LOAD] ✗ Unexpected error loading game progress:', e);
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
            console.log(`[SUPABASE] Starting save for user ID: ${session.user.id.substring(0, 8)}...`);
            
            // Validate data before saving
            const validation = validateGameData(progress);
            if (!validation.valid) {
                console.error('[SUPABASE] Invalid game data:', validation.errors);
                throw new Error(`Invalid game data: ${validation.errors.join(', ')}`);
            }
            
            const saveStartTime = new Date();
            
            // First check if a record exists for this user
            const { data: existingRecord, error: checkError } = await supabase
                .from('game_progress')
                .select('id')
                .eq('user_id', session.user.id)
                .maybeSingle();
                
            if (checkError) {
                console.error('[SUPABASE] Error checking for existing record:', checkError);
                setError(`Error checking existing record: ${checkError.message}`);
                return;
            }
            
            let error;
            
            if (existingRecord) {
                // Update existing record
                console.log(`[SUPABASE] Updating existing game progress record (ID: ${existingRecord.id})`);
                const { error: updateError } = await supabase
                    .from('game_progress')
                    .update({
                        resources: progress.resources,
                        upgrades: progress.upgrades,
                        unlocked_logs: progress.unlockedLogs,
                        last_online: new Date().toISOString(),
                        page_timestamps: progress.page_timestamps || {} // Save page timestamps
                    })
                    .eq('user_id', session.user.id);
                    
                error = updateError;
            } else {
                // Insert new record
                console.log('[SUPABASE] Creating new game progress record');
                const { error: insertError } = await supabase
                    .from('game_progress')
                    .insert({
                        user_id: session.user.id,
                        resources: progress.resources,
                        upgrades: progress.upgrades,
                        unlocked_logs: progress.unlockedLogs,
                        last_online: new Date().toISOString(),
                        page_timestamps: progress.page_timestamps || {} // Save page timestamps
                    });
                    
                error = insertError;
            }

            if (error) {
                console.error('[SUPABASE] Error saving game progress:', error);
                setError(`Error saving game progress: ${error.message}`);
            } else {
                const duration = new Date().getTime() - saveStartTime.getTime();
                console.log(`[SUPABASE] Game progress saved successfully (took ${duration}ms)`);
                setGameProgress(progress);
            }
        } catch (e: any) {
            console.error('[SUPABASE] Unexpected error saving game progress:', e);
            setError(`Unexpected error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Function to trigger the debounced save
    const triggerSave = useCallback((progress: GameProgress) => {
        try {
            const now = new Date();
            console.log(`[SAVE] Triggering user-initiated save at ${now.toLocaleTimeString()} (will debounce for 2s)`);
            setSaving(); // Update save status to indicate saving is in progress
            
            // Update the state immediately
            setGameProgress(progress);
            
            // Save to localStorage as immediate backup
            localStorage.setItem('gameProgressBackup', JSON.stringify({
                ...progress,
                lastSaved: now.toISOString()
            }));
            console.log(`[SAVE] ✓ Immediate local storage backup complete, Supabase save pending...`);
            
            // Schedule the save with debounce
            debouncedSaveProgress(progress);
        } catch (error) {
            console.error("[SAVE] ✗ Error in triggerSave:", error);
            setSaveError(error instanceof Error ? error.message : 'Unknown error saving game');
        }
    }, [debouncedSaveProgress]);
    
    // Function to dismiss offline gains notification
    const dismissOfflineGains = useCallback(() => {
        setOfflineGains(null);
    }, []);

    // Function to dismiss resource offline gains notification
    const dismissResourceOfflineGains = useCallback(() => {
        setResourceOfflineGains(null);
    }, []);

    // Function to calculate resource-specific offline progress
    const calculateResourceOfflineProgress = useCallback((resourceType: 'energy' | 'insight' | 'crew' | 'scrap') => {
        if (!gameProgress) return;
        
        console.log(`[OFFLINE] Calculating offline progress for ${resourceType}`);
        
        // Import function dynamically to avoid circular dependencies
        import('@/utils/offline-progress').then(({ calculateResourceOfflineProgress }) => {
            const { updatedResource, minutesPassed, gain } = calculateResourceOfflineProgress(
                resourceType,
                gameProgress,
                1440 // 24 hours max
            );
            
            // If there are gains, show the popup and update the resource
            if (gain > 0 && minutesPassed > 0 && updatedResource) {
                console.log(`[OFFLINE] ${resourceType} gained ${gain} over ${minutesPassed} minutes`);
                
                // Update the resource state
                const updatedResources = {
                    ...gameProgress.resources,
                    [resourceType]: updatedResource
                };
                
                // Update the game progress
                const updatedProgress = {
                    ...gameProgress,
                    resources: updatedResources
                };
                
                // Set the state for the popup
                setResourceOfflineGains({
                    resourceType,
                    minutesPassed,
                    gain
                });
                
                // Save the updated progress
                triggerSave(updatedProgress);
            } else {
                console.log(`[OFFLINE] No ${resourceType} gains to apply`);
            }
        });
    }, [gameProgress, triggerSave]);

    // Load game progress on session change
    useEffect(() => {
        if (isLoaded && session && supabase) {
            console.log('[LOAD] Session loaded, initializing game data...');
            loadGameProgress();
        } else if (isLoaded && !session) {
            console.log('[LOAD] No authenticated session, resetting game progress');
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
                    console.log('[LOAD] Attempting to load game from local storage (no session)');
                    const parsedBackup = JSON.parse(localBackup) as GameProgress;
                    setGameProgress(parsedBackup);
                    console.log('[LOAD] ✓ Successfully loaded game from local storage');
                } catch (error) {
                    console.error('[LOAD] ✗ Error parsing local backup:', error);
                }
            } else {
                console.log('[LOAD] No local backup found for offline play');
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

    // Add the updatePageTimestamp function in the SupabaseProvider component
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
        
        console.log(`Page timestamp updated for ${pageName}: ${currentTime}`);
    }, [gameProgress, triggerSave]);

    // Add the unlockUpgrade function in the SupabaseProvider component
    const unlockUpgrade = useCallback((upgradeId: string) => {
        if (!gameProgress) return;

        // Check if the upgrade is already unlocked
        if (gameProgress.upgrades && gameProgress.upgrades[upgradeId]) return;

        // Create updated upgrades object
        const updatedUpgrades = {
            ...(gameProgress.upgrades || {}),
            [upgradeId]: true
        };

        // Special handling for wing unlock upgrades
        if (upgradeId === 'unlock-wing') {
            // This will be handled by a special UI component
            console.log('Wing selection upgrade unlocked');
        } else if (upgradeId === 'unlock-next-wing') {
            // Set crew quarters directly in upgrades
            updatedUpgrades['selected-wing-crew-quarters'] = true;
            console.log('Crew quarters unlocked');
        } else if (upgradeId === 'unlock-final-wing') {
            // Set manufacturing directly in upgrades
            updatedUpgrades['selected-wing-manufacturing'] = true;
            console.log('Manufacturing bay unlocked');
        }

        // Update the game progress
        const updatedProgress = {
            ...gameProgress,
            upgrades: updatedUpgrades
        };

        // Save the updated progress
        triggerSave(updatedProgress);

        // Show notification for upgrade unlock
        if (typeof window !== "undefined" && window.notifications) {
            window.notifications.addToast({
                message: `Upgrade unlocked: ${upgradeId}`,
                type: "success",
                duration: 5000,
                category: "upgrade-unlock"
            });
        } else {
            // Fallback
            console.log(`Upgrade unlocked: ${upgradeId}`);
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
            unlockUpgrade,
            updatePageTimestamp,
            loading,
            error,
            offlineGains,
            dismissOfflineGains,
            calculateResourceOfflineProgress,
            resourceOfflineGains,
            dismissResourceOfflineGains
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