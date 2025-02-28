import { StateCreator } from 'zustand';
import { GameState, GameActions } from '../types';
import { ResourceType } from '@/types/game.types';
import { immer } from 'zustand/middleware/immer';

// Type for this specific slice
export interface ResourceSlice {
  resources: GameState['resources'];
  updateResource: GameActions['updateResource'];
  batchUpdateResources: GameActions['batchUpdateResources'];
}

type ResourceUpdate = {
  resourceType: ResourceType;
  property: string;
  value: number;
};

// Create the resources slice
export const createResourcesSlice: StateCreator<
  GameState & GameActions,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  ResourceSlice
> = (set) => ({
  resources: {
    energy: { amount: 0, capacity: 10, autoGeneration: 0 },
    insight: { amount: 0, capacity: 5, autoGeneration: 0 },
    crew: { amount: 0, capacity: 3, workerCrews: 0 },
    scrap: { amount: 0, capacity: 20, manufacturingBays: 0 }
  },
  
  updateResource: (resourceType: ResourceType, property: string, value: number) => {
    set((state) => {
      // Ensure the resource exists
      if (!state.resources[resourceType]) return;
      
      // Set the current timestamp
      const currentTime = new Date().toISOString();
      
      // Update the property and set latestSave timestamp
      const resource = state.resources[resourceType] as any;
      resource[property] = value;
      resource.latestSave = currentTime;
    });
    
    // No need to trigger save here - will be handled by middleware
  },
  
  batchUpdateResources: (updates: ResourceUpdate[]) => {
    set((state) => {
      // Set the current timestamp once
      const currentTime = new Date().toISOString();
      
      // Process all updates
      updates.forEach((update: ResourceUpdate) => {
        const { resourceType, property, value } = update;
        
        // Ensure the resource exists
        if (!state.resources[resourceType]) return;
        
        // Update the property and set latestSave timestamp
        const resource = state.resources[resourceType] as any;
        resource[property] = value;
        resource.latestSave = currentTime;
      });
    });
    
    // No need to trigger save here - will be handled by middleware
  }
}); 