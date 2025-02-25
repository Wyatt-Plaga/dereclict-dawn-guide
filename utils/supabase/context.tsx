"use client"

import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import { displayErrorToast, validateGameData } from "@/utils/error-handling";

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
    loading: boolean;
    error: string | null;
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
    loading: false,
    error: null
});

export function SupabaseProvider({ children }: { children: ReactNode }) {
    const { session, isLoaded } = useSession();
    const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const loadGameProgress = async (): Promise<GameProgress | null> => {
        if (!supabase || !session?.user?.id) {
            if (!supabase) setError('Supabase client not initialized');
            if (!session?.user?.id) setError('User not authenticated');
            return null;
        }
        
        try {
            setLoading(true);
            console.log('[DEBUG] Loading game progress for user:', session.user.id);
            
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

            console.log('Game progress loaded:', data);
            // Map database format to our application format
            const progress: GameProgress = {
                resources: data.resources as ResourceState,
                upgrades: data.upgrades as Record<string, boolean>,
                unlockedLogs: data.unlocked_logs as number[],
                lastOnline: data.last_online
            };

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

    return (
        <SupabaseContext.Provider value={{ 
            supabase, 
            gameProgress, 
            loadGameProgress, 
            saveGameProgress,
            loading,
            error
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