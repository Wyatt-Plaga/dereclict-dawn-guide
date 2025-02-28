"use client"

import { useEffect } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useSupabase } from '@/utils/supabase/context';
import { BaseResource } from '../../../engine/resources/BaseResource';

/**
 * ResourceSynchronizer
 * 
 * This component synchronizes the existing game state with our new game engine.
 * It doesn't render anything visible, but runs in the background to keep both
 * systems in sync during the transition period.
 */
export function ResourceSynchronizer() {
  const { game, initialized } = useGameEngine();
  const { gameProgress } = useSupabase();
  
  // Synchronize existing resources with game engine
  useEffect(() => {
    if (!initialized || !game || !gameProgress?.resources) {
      console.log('Game not initialized or no resources in gameProgress');
      return;
    }
    
    console.log('Synchronizing resources with game engine');
    
    try {
      // For each resource in the existing game state, ensure it exists in the game engine
      Object.entries(gameProgress.resources).forEach(([resourceType, resourceData]) => {
        // Check if the resource exists in the game engine
        const resource = game.getResource(resourceType);
        
        if (!resource) {
          // Resource doesn't exist, create it
          console.log(`Creating ${resourceType} resource in game engine`);
          
          // Create resource properties
          const resourceProps = {
            id: resourceType,
            name: resourceType.charAt(0).toUpperCase() + resourceType.slice(1), // Capitalize first letter
            type: resourceType,
            amount: resourceData.amount || 0,
            capacity: resourceData.capacity || 100,
            lastUpdated: new Date().toISOString()
          };
          
          // Create the resource
          const newResource = new BaseResource(resourceProps);
          
          // Register it with the game
          game.registerResource(newResource);
        } else {
          // Resource exists, update its properties
          console.log(`Updating ${resourceType} resource in game engine`);
          
          // Update the resource properties
          resource.update({
            amount: resourceData.amount || resource.getAmount(),
            capacity: resourceData.capacity || resource.getCapacity(),
            lastUpdated: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.error('Error synchronizing resources:', error);
    }
    
    // Listen for game engine resource changes to sync back to old system
    const handleResourceUpdated = (event: any) => {
      const { resourceId } = event.payload || {};
      if (!resourceId || !gameProgress) return;
      
      const resource = game.getResource(resourceId);
      if (!resource) return;
      
      console.log(`Game engine resource ${resourceId} updated, syncing to old system`);
      
      // We would need to update the old system here
      // This part depends on how your existing system handles updates
      // Something like:
      // updateResourceInOldSystem(resourceId, resource.getAmount(), resource.getCapacity());
    };
    
    // Subscribe to resource change events
    game.on('resource_updated', handleResourceUpdated);
    
    return () => {
      // Unsubscribe when component unmounts
      game.off('resource_updated', handleResourceUpdated);
    };
  }, [initialized, game, gameProgress]);
  
  // This component doesn't render anything visible
  return null;
} 