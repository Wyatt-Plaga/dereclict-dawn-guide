"use client"

import { useSupabase } from "./context";
import { useGameState } from "@/contexts/game/GameStateContext";
import { useOfflineProgress } from "@/contexts/game/OfflineProgressContext";
import { ReactNode, useEffect } from "react";

/**
 * This component is a temporary bridge between the old SupabaseProvider system
 * and the new split context system. It allows for incremental migration
 * by ensuring that features that still rely on the old context continue to work.
 */
export function SupabaseContextBridge({ children }: { children: ReactNode }) {
  const legacyContext = useSupabase();
  const { 
    gameProgress, 
    loadGameProgress, 
    saveGameProgress, 
    triggerSave, 
    unlockLog, 
    updatePageTimestamp 
  } = useGameState();
  
  const {
    offlineGains,
    dismissOfflineGains,
    resourceOfflineGains,
    dismissResourceOfflineGains,
    calculateResourceOfflineProgress
  } = useOfflineProgress();
  
  // Log the migration status
  useEffect(() => {
    console.log("Using SupabaseContextBridge - This is a temporary migration component");
    console.log("You should update your components to use the new context hooks directly:");
    console.log("- useDatabase() instead of useSupabase() for database operations");
    console.log("- useGameState() for game state management");
    console.log("- useOfflineProgress() for offline progress functionality");
  }, []);
  
  return children;
}

/**
 * This is a warning component to indicate that the legacy SupabaseProvider
 * is still being used. It will log a deprecation warning in development.
 */
export function LegacySupabaseProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn("WARNING: You are using the legacy SupabaseProvider.");
      console.warn("This provider is deprecated and will be removed in a future update.");
      console.warn("Please migrate to the new context system:");
      console.warn("1. Replace SupabaseProvider with RootProvider from @/contexts/RootProvider");
      console.warn("2. Update component imports to use the new hooks:");
      console.warn("   - useDatabase() for database operations");
      console.warn("   - useGameState() for game state management");
      console.warn("   - useOfflineProgress() for offline calculations");
    }
  }, []);
  
  return <>{children}</>;
} 