import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabase } from '@/utils/supabase/context';
import { GameProgress } from '@/utils/supabase/context';
import _ from 'lodash'; // Import all of lodash to avoid type issues

export interface AutoSaveHookProps {
  resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
  resourceData: {
    amount: number;
    capacity: number;
    autoGeneration: number;
  };
  debounceTime?: number;
}

export function useAutoSave({
  resourceType,
  resourceData,
  debounceTime = 3000, // Default to 3 seconds debounce
}: AutoSaveHookProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const { saveGameProgress, gameProgress } = useSupabase();

  // Function to save the game state
  const saveGameState = async (data: typeof resourceData) => {
    if (!data) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Try to save via API first
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // Include userId in the request
          resources: {
            [`${resourceType}_amount`]: data.amount,
            [`${resourceType}_capacity`]: data.capacity,
            [`${resourceType}_auto_gen`]: data.autoGeneration,
          },
        }),
      });
      
      if (!response.ok) {
        // If API fails, try context method as fallback
        console.log('API save failed, trying context method');
        const updatedProgress: GameProgress = {
          resources: {
            ...gameProgress?.resources || {},
            [`${resourceType}_amount`]: data.amount,
            [`${resourceType}_capacity`]: data.capacity,
            [`${resourceType}_auto_gen`]: data.autoGeneration,
          },
          upgrades: gameProgress?.upgrades || {},
          unlockedLogs: gameProgress?.unlockedLogs || [],
          lastOnline: new Date().toISOString()
        };
        await saveGameProgress(updatedProgress);
      }
    } catch (err) {
      console.error('Error saving game state:', err);
      setError('Failed to save game progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Create a debounced version of the save function
  const debouncedSave = _.debounce(saveGameState, debounceTime);
  
  // Effect to trigger save when resourceData changes
  useEffect(() => {
    if (resourceData && userId) {
      debouncedSave(resourceData);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [resourceData, userId, debouncedSave]);
  
  return {
    isSaving,
    error,
    saveGameState: () => saveGameState(resourceData),
  };
} 