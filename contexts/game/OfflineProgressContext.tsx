"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useGameState, ResourceState, GameProgress } from "@/contexts/game/GameStateContext";
import { calculateOfflineProgress } from "@/utils/offline-progress";
import { reportError } from "@/utils/error/error-service";

// Offline gains types
interface ResourceOfflineGains {
  resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
  minutesPassed: number;
  gain: number;
}

interface GlobalOfflineGains {
  minutesPassed: number;
  gains: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
  };
}

// Context interface
interface OfflineProgressContextType {
  offlineGains: GlobalOfflineGains | null;
  dismissOfflineGains: () => void;
  resourceOfflineGains: ResourceOfflineGains | null;
  dismissResourceOfflineGains: () => void;
  calculateResourceOfflineProgress: (resourceType: 'energy' | 'insight' | 'crew' | 'scrap') => void;
}

// Create the context with default values
const OfflineProgressContext = createContext<OfflineProgressContextType>({
  offlineGains: null,
  dismissOfflineGains: () => {},
  resourceOfflineGains: null,
  dismissResourceOfflineGains: () => {},
  calculateResourceOfflineProgress: () => {}
});

// Provider component
export function OfflineProgressProvider({ children }: { children: ReactNode }) {
  const { gameProgress, triggerSave } = useGameState();
  const [offlineGains, setOfflineGains] = useState<GlobalOfflineGains | null>(null);
  const [resourceOfflineGains, setResourceOfflineGains] = useState<ResourceOfflineGains | null>(null);

  // Calculate global offline progress on initial load
  useEffect(() => {
    if (!gameProgress) return;
    
    try {
      // Don't recalculate if we've already shown offline gains
      if (offlineGains) return;
      
      const { updatedResources, minutesPassed, gains } = calculateOfflineProgress(gameProgress);
      
      // Only show offline progress if significant time has passed and there are gains
      const hasGains = Object.values(gains).some(value => value > 0);
      if (minutesPassed > 0 && hasGains) {
        setOfflineGains({ minutesPassed, gains });
        
        // Update the game progress with the new resources
        const updatedProgress = {
          ...gameProgress,
          resources: updatedResources
        };
        
        // Save the progress with the updated resources
        triggerSave(updatedProgress);
      }
    } catch (error) {
      reportError(error);
    }
  }, [gameProgress, offlineGains]);

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
    
    try {
      // Import function dynamically to avoid circular dependencies
      import('@/utils/offline-progress').then(({ calculateResourceOfflineProgress }) => {
        const { updatedResource, minutesPassed, gain } = calculateResourceOfflineProgress(
          resourceType,
          gameProgress,
          1440 // 24 hours max
        );
        
        // If there are gains, show the popup and update the resource
        if (gain > 0 && minutesPassed > 0 && updatedResource) {
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
        }
      });
    } catch (error) {
      reportError(error);
    }
  }, [gameProgress, triggerSave]);

  return (
    <OfflineProgressContext.Provider value={{
      offlineGains,
      dismissOfflineGains,
      resourceOfflineGains,
      dismissResourceOfflineGains,
      calculateResourceOfflineProgress
    }}>
      {children}
    </OfflineProgressContext.Provider>
  );
}

// Hook to use the offline progress functionality
export function useOfflineProgress() {
  const context = useContext(OfflineProgressContext);
  if (context === undefined) {
    throw new Error('useOfflineProgress must be used within an OfflineProgressProvider');
  }
  return context;
} 