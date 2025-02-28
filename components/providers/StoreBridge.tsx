"use client"

import { useEffect } from 'react';
import { useSupabase } from '@/utils/supabase/context';
import { useGameStore } from '@/store/rootStore';
import { GameProgress } from '@/types/game.types';

/**
 * Bridge component that syncs between the old SupabaseContext and the new Zustand store.
 * This allows for a gradual migration from context to store.
 */
export function StoreBridge() {
  // Get data from the old context using the hook
  const { 
    gameProgress, 
    error: contextError
  } = useSupabase();
  
  // Get actions from the new store
  const setGameState = useGameStore(state => state.setGameState);
  const setError = useGameStore(state => state.setError);
  
  // When the context loads game progress, update the store
  useEffect(() => {
    if (gameProgress) {
      console.log('Syncing game progress from context to store');
      setGameState(gameProgress as GameProgress);
    }
  }, [gameProgress, setGameState]);
  
  // Sync errors from context to store
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError, setError]);
  
  // This component doesn't render anything
  return null;
}

/**
 * HOC to wrap components that need access to both store and context during migration
 */
export function withStoreBridge<P extends object>(Component: React.ComponentType<P>) {
  return function WithStoreBridge(props: P) {
    return (
      <>
        <StoreBridge />
        <Component {...props} />
      </>
    );
  };
} 