import { useState, useEffect } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { Resource } from '../../domain/resources/models/ResourceInterfaces';

/**
 * Hook for accessing game resources
 */
export const useGameResources = () => {
  const { game, initialized } = useGameEngine();
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesById, setResourcesById] = useState<Record<string, Resource>>({});
  
  // Load resources when game is initialized
  useEffect(() => {
    if (!initialized || !game) {
      return;
    }
    
    // Get all resources from the game
    const resourceList = game.getResources().getAllResources();
    setResources(resourceList);
    
    // Build a map of resources by ID
    const resourceMap: Record<string, Resource> = {};
    resourceList.forEach(resource => {
      resourceMap[resource.getId()] = resource;
    });
    setResourcesById(resourceMap);
    
    // Set up listener for resource changes
    const handleResourceUpdate = () => {
      const updatedList = game.getResources().getAllResources();
      setResources([...updatedList]);
      
      // Update resource map
      const updatedMap: Record<string, Resource> = {};
      updatedList.forEach(resource => {
        updatedMap[resource.getId()] = resource;
      });
      setResourcesById(updatedMap);
    };
    
    // Subscribe to resource change events
    game.on('resource_updated', handleResourceUpdate);
    game.on('resource_added', handleResourceUpdate);
    game.on('resource_removed', handleResourceUpdate);
    
    // Cleanup subscription
    return () => {
      game.off('resource_updated', handleResourceUpdate);
      game.off('resource_added', handleResourceUpdate);
      game.off('resource_removed', handleResourceUpdate);
    };
  }, [game, initialized]);
  
  // Get a resource by ID
  const getResource = (id: string): Resource | undefined => {
    return resourcesById[id];
  };
  
  // Add a specific amount to a resource
  const addResource = (id: string, amount: number): boolean => {
    if (!game) return false;
    
    const resource = getResource(id);
    if (!resource) return false;
    
    resource.add(amount);
    return true;
  };
  
  // Subtract a specific amount from a resource
  const subtractResource = (id: string, amount: number): boolean => {
    if (!game) return false;
    
    const resource = getResource(id);
    if (!resource) return false;
    
    if (!resource.canAfford(amount)) return false;
    
    resource.subtract(amount);
    return true;
  };
  
  // Check if a resource can afford a cost
  const canAfford = (id: string, amount: number): boolean => {
    if (!game) return false;
    
    const resource = getResource(id);
    if (!resource) return false;
    
    return resource.canAfford(amount);
  };
  
  // Check if multiple resource costs can be afforded
  const canAffordCosts = (costs: Record<string, number>): boolean => {
    if (!game) return false;
    
    for (const [id, amount] of Object.entries(costs)) {
      if (!canAfford(id, amount)) {
        return false;
      }
    }
    
    return true;
  };
  
  return {
    resources,
    getResource,
    addResource,
    subtractResource,
    canAfford,
    canAffordCosts
  };
}; 