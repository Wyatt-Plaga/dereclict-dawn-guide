"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useGameState } from "@/contexts/game/GameStateContext";
import { useOfflineProgress } from "@/contexts/game/OfflineProgressContext";
import { useDatabase } from "@/contexts/database/DatabaseContext";

// Example components showing the before and after for migrating from SupabaseContext

/**
 * Legacy component using the old SupabaseContext
 */
export function LegacyComponent() {
  // Old way of importing the context
  // @ts-ignore - This import will be flagged as deprecated
  import { useSupabase } from "@/utils/supabase/context";
  
  const { 
    gameProgress, 
    supabase, 
    user, 
    triggerSave, 
    calculateResourceOfflineProgress 
  } = useSupabase();
  
  useEffect(() => {
    if (gameProgress) {
      // Calculate offline progress for energy
      calculateResourceOfflineProgress('energy');
    }
  }, [gameProgress, calculateResourceOfflineProgress]);
  
  const handleUpdateEnergy = () => {
    if (!gameProgress) return;
    
    // Update energy amount
    const updatedProgress = {
      ...gameProgress,
      resources: {
        ...gameProgress.resources,
        energy: {
          ...gameProgress.resources.energy,
          amount: gameProgress.resources.energy.amount + 10
        }
      }
    };
    
    triggerSave(updatedProgress);
  };
  
  return (
    <div className="legacy-component">
      <h2>Legacy Component</h2>
      <p>Using the old monolithic SupabaseContext</p>
      <p>User: {user?.email || 'Not logged in'}</p>
      <p>Energy: {gameProgress?.resources.energy?.amount || 0}</p>
      <button onClick={handleUpdateEnergy}>Add Energy</button>
    </div>
  );
}

/**
 * Modern component using the new split contexts
 */
export function ModernComponent() {
  // New way of importing the separate contexts
  const { userId, userEmail, isAuthenticated } = useAuth();
  const { gameProgress, triggerSave } = useGameState();
  const { calculateResourceOfflineProgress } = useOfflineProgress();
  const { supabase } = useDatabase();
  
  useEffect(() => {
    if (gameProgress) {
      // Calculate offline progress for energy
      calculateResourceOfflineProgress('energy');
    }
  }, [gameProgress, calculateResourceOfflineProgress]);
  
  const handleUpdateEnergy = () => {
    if (!gameProgress) return;
    
    // Update energy amount
    const updatedProgress = {
      ...gameProgress,
      resources: {
        ...gameProgress.resources,
        energy: {
          ...gameProgress.resources.energy,
          amount: gameProgress.resources.energy.amount + 10
        }
      }
    };
    
    triggerSave(updatedProgress);
  };
  
  return (
    <div className="modern-component">
      <h2>Modern Component</h2>
      <p>Using the new split contexts</p>
      <p>User: {userEmail || 'Not logged in'}</p>
      <p>Energy: {gameProgress?.resources.energy?.amount || 0}</p>
      <button onClick={handleUpdateEnergy}>Add Energy</button>
    </div>
  );
}

/**
 * Example showing both components side by side
 */
export function MigrationExample() {
  return (
    <div className="migration-example">
      <h1>Context Migration Example</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4">
          <LegacyComponent />
        </div>
        <div className="border p-4">
          <ModernComponent />
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3>Migration Steps:</h3>
        <ol className="list-decimal pl-4">
          <li>Replace <code>import {'{ useSupabase }'} from "@/utils/supabase/context"</code> with the specific context hooks you need</li>
          <li>Replace <code>const {'{ gameProgress, supabase, etc }'} = useSupabase()</code> with individual calls to each context hook</li>
          <li>Update any component props to use the specific properties from each context</li>
          <li>Replace <code>{'<SupabaseProvider>'}</code> with <code>{'<RootProvider>'}</code> in your app layout</li>
        </ol>
      </div>
    </div>
  );
} 