import { useEffect, useState } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useGameResources } from '../hooks/useGameResources';

type LegacyResource = {
  id: string;
  name: string;
  description?: string;
  amount: number;
  capacity?: number;
  rate?: number;
  // Any other properties from the old resource system
};

/**
 * Adapter hook for connecting the old resources system with the new game engine resources
 * @param existingResources Array of existing resources from the old system
 */
export function useResourcesAdapter(existingResources: LegacyResource[]) {
  const { game, initialized } = useGameEngine();
  const { resources, getResource } = useGameResources();
  const [resourcesSynced, setResourcesSynced] = useState(false);
  
  // Synchronize resources with the game engine
  useEffect(() => {
    if (!initialized || !game || resourcesSynced) return;
    
    console.log('Synchronizing resources with game engine...');
    
    try {
      // Import existing resources into the game engine
      existingResources.forEach(resource => {
        try {
          // Check if resource already exists in the game engine
          const existingResource = getResource(resource.id);
          if (existingResource) {
            console.log(`Resource ${resource.id} already exists in game engine`);
            
            // Update the resource amount if different
            const currentAmount = existingResource.getAmount();
            if (currentAmount !== resource.amount) {
              // Use the game's command system to update the resource
              game.executeCommand({
                id: `update_resource_${resource.id}`,
                type: 'UPDATE_RESOURCE',
                execute: () => {
                  try {
                    // Add or subtract resources to match the desired amount
                    const difference = resource.amount - currentAmount;
                    if (difference > 0) {
                      // Add resources
                      existingResource.add(difference);
                    } else if (difference < 0) {
                      // Subtract resources
                      existingResource.subtract(Math.abs(difference));
                    }
                    
                    return {
                      success: true,
                      message: `Resource ${resource.id} amount updated to ${resource.amount}`,
                      data: null
                    };
                  } catch (error) {
                    console.error('Error updating resource amount:', error);
                    return {
                      success: false,
                      message: `Failed to update resource ${resource.id} amount`,
                      data: null
                    };
                  }
                }
              });
            }
            
            return;
          }
          
          // Log that we can't create resources dynamically yet
          console.log(`Resource ${resource.id} not found in game engine. Resources need to be pre-registered in the game engine.`);
          
          // If we had a proper way to register resources, we would do it here
          // For now, we'll rely on resources being pre-registered in the game engine
          
        } catch (error) {
          console.error(`Error processing resource ${resource.id}:`, error);
        }
      });
      
      setResourcesSynced(true);
      console.log(`${existingResources.length} resources synchronized with game engine`);
    } catch (error) {
      console.error('Error synchronizing resources:', error);
    }
  }, [initialized, game, existingResources, resourcesSynced, getResource]);
  
  // Listen for resource events from the game engine
  useEffect(() => {
    if (!initialized || !game) return;
    
    const handleResourceUpdated = (event: any) => {
      const { resourceId, amount } = event.payload || {};
      if (!resourceId) return;
      
      console.log(`Resource ${resourceId} updated in game engine: ${amount}`);
      
      // Here you would update the old system's resource state
      // This depends on how your old system tracks resources
    };
    
    // Subscribe to resource updated events
    game.on('resource_updated', handleResourceUpdated);
    
    return () => {
      game.off('resource_updated', handleResourceUpdated);
    };
  }, [initialized, game]);
  
  // Provide utility functions for working with resources
  return {
    // Returns resource from the game engine if available, falls back to old system
    getResource: (id: string) => {
      const engineResource = getResource(id);
      if (engineResource) {
        return {
          id: engineResource.getId(),
          name: engineResource.properties.name,
          description: engineResource.properties.description,
          amount: engineResource.getAmount(),
          capacity: engineResource.getCapacity(),
          rate: engineResource.getRate ? engineResource.getRate() : 0
        };
      }
      
      // Fall back to the old system
      return existingResources.find(r => r.id === id);
    },
    
    // Get the current amount of a resource
    getAmount: (id: string) => {
      // Check new system first
      const resource = getResource(id);
      if (resource) {
        return resource.getAmount();
      }
      
      // Fall back to old system
      const oldResource = existingResources.find(r => r.id === id);
      return oldResource?.amount || 0;
    },
    
    // Get the current capacity of a resource
    getCapacity: (id: string) => {
      // Check new system first
      const resource = getResource(id);
      if (resource) {
        return resource.getCapacity();
      }
      
      // Fall back to old system
      const oldResource = existingResources.find(r => r.id === id);
      return oldResource?.capacity || 0;
    },
    
    // Get the current rate of a resource
    getRate: (id: string) => {
      // Check new system first
      const resource = getResource(id);
      if (resource && resource.getRate) {
        return resource.getRate();
      }
      
      // Fall back to old system
      const oldResource = existingResources.find(r => r.id === id);
      return oldResource?.rate || 0;
    }
  };
} 