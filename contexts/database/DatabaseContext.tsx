"use client"

import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import { reportError } from "@/utils/error/error-service";
import type { Database } from "@/types/database.types";

// Interface for the database context
interface DatabaseContextType {
  supabase: SupabaseClient<Database> | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const DatabaseContext = createContext<DatabaseContextType>({
  supabase: null,
  isInitialized: false,
  loading: false,
  error: null
});

// Provider component that wraps your app and makes the client available
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create the Supabase client
  const supabase = useMemo(() => {
    // Make sure we're using the correct environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not found');
      setError('Supabase configuration is missing. Please check your environment variables.');
      return null;
    }
    
    try {
      // Create a basic client
      const client = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false // Don't persist the Supabase session since we're using Clerk
        }
      });
      
      setIsInitialized(true);
      console.log('Supabase client initialized successfully');
      return client;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      reportError(err);
      setError(`Failed to initialize Supabase: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, []);  // Only recreate the client when necessary

  // Update loading state when session information is loaded
  useEffect(() => {
    if (isLoaded) {
      if (session) {
        console.log('User authenticated with Clerk, session ID:', session.id);
      } else {
        console.log('No active session - user is anonymous');
      }
      
      // Clear loading state once we have session info
      setLoading(false);
    }
  }, [session, isLoaded]);

  return (
    <DatabaseContext.Provider value={{ 
      supabase, 
      isInitialized,
      loading,
      error
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook to use the Supabase client
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
} 