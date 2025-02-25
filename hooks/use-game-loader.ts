import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabase } from '@/utils/supabase/context';

export interface GameLoaderProps {
  resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
  onLoadSuccess?: (data: any) => void;
}

export function useGameLoader({
  resourceType,
  onLoadSuccess,
}: GameLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineGains, setOfflineGains] = useState<number>(0);
  const [lastOnline, setLastOnline] = useState<number | null>(null);
  const { userId } = useAuth();
  const { gameProgress, loadGameProgress } = useSupabase();

  // Function to load game data
  const loadGameData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to load from API first
      const lastOnlineParam = localStorage.getItem(`${resourceType}_last_online`);
      const currentTime = Date.now();
      let apiUrl = `/api/progress?userId=${userId}`;
      
      if (lastOnlineParam) {
        apiUrl += `&lastOnline=${lastOnlineParam}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch game data from API');
      }
      
      const data = await response.json();
      
      // Save current time as last online time
      localStorage.setItem(`${resourceType}_last_online`, currentTime.toString());
      
      if (data.progress && data.progress.resources) {
        const resources = data.progress.resources;
        const offlineData = data.offlineGains || {};
        
        // Extract resource data based on resource type
        const amountKey = `${resourceType}_amount`;
        const capacityKey = `${resourceType}_capacity`;
        const autoGenKey = `${resourceType}_auto_gen`;
        
        // Default values based on resource type
        const defaultCapacity = 
          resourceType === 'energy' ? 100 : 
          resourceType === 'insight' ? 50 : 
          resourceType === 'crew' ? 50 : 100;
        
        const resourceData = {
          amount: resources[amountKey] !== undefined ? resources[amountKey] : 0,
          capacity: resources[capacityKey] !== undefined ? resources[capacityKey] : defaultCapacity,
          autoGeneration: resources[autoGenKey] !== undefined ? resources[autoGenKey] : 0,
        };
        
        // Calculate offline gain
        const offlineGain = offlineData[resourceType] || 0;
        
        if (offlineGain > 0) {
          setOfflineGains(offlineGain);
          setLastOnline(currentTime - (data.timeSinceLastOnline * 1000 || 0));
        }
        
        // Call the success callback with the loaded data
        if (onLoadSuccess) {
          onLoadSuccess({
            ...resourceData,
            offlineGain,
            timeSinceLastOnline: data.timeSinceLastOnline * 1000 || 0
          });
        }
      } else {
        // If API data is incomplete, try context method
        await loadGameProgress();
        
        if (gameProgress && gameProgress.resources) {
          // Use the context data as a Record<string, any>
          const resources = gameProgress.resources as Record<string, any>;
          
          // Extract resource data based on resource type
          const amountKey = `${resourceType}_amount`;
          const capacityKey = `${resourceType}_capacity`;
          const autoGenKey = `${resourceType}_auto_gen`;
          
          // Default values based on resource type
          const defaultCapacity = 
            resourceType === 'energy' ? 100 : 
            resourceType === 'insight' ? 50 : 
            resourceType === 'crew' ? 50 : 100;
          
          const resourceData = {
            amount: resources[amountKey] !== undefined ? resources[amountKey] : 0,
            capacity: resources[capacityKey] !== undefined ? resources[capacityKey] : defaultCapacity,
            autoGeneration: resources[autoGenKey] !== undefined ? resources[autoGenKey] : 0,
          };
          
          // Call the success callback with the loaded data
          if (onLoadSuccess) {
            onLoadSuccess(resourceData);
          }
        }
      }
    } catch (err) {
      console.error('Error loading game data:', err);
      setError('Failed to load game progress. Please try again.');
      
      // Try context method as fallback
      try {
        await loadGameProgress();
        
        if (gameProgress && gameProgress.resources) {
          // Use the context data as a Record<string, any>
          const resources = gameProgress.resources as Record<string, any>;
          
          // Extract resource data based on resource type
          const amountKey = `${resourceType}_amount`;
          const capacityKey = `${resourceType}_capacity`;
          const autoGenKey = `${resourceType}_auto_gen`;
          
          // Default values based on resource type
          const defaultCapacity = 
            resourceType === 'energy' ? 100 : 
            resourceType === 'insight' ? 50 : 
            resourceType === 'crew' ? 50 : 100;
          
          const resourceData = {
            amount: resources[amountKey] !== undefined ? resources[amountKey] : 0,
            capacity: resources[capacityKey] !== undefined ? resources[capacityKey] : defaultCapacity,
            autoGeneration: resources[autoGenKey] !== undefined ? resources[autoGenKey] : 0,
          };
          
          // Call the success callback with the loaded data
          if (onLoadSuccess) {
            onLoadSuccess(resourceData);
          }
        }
      } catch (contextErr) {
        console.error('Context fallback also failed:', contextErr);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on initial mount if user is authenticated
  useEffect(() => {
    if (userId) {
      loadGameData();
    }
  }, [userId]);
  
  return {
    isLoading,
    error,
    offlineGains,
    lastOnline,
    loadGameData,
  };
} 