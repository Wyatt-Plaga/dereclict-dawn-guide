"use client"

import React, { useEffect, useState } from 'react';
import { ResourcePage } from './resource-page';
import { useGameEngine } from '@/src/ui/providers/GameEngineProvider';

/**
 * ResourcePageAdapter
 * 
 * A simpler approach to connect existing UI with new game engine
 * This component doesn't try to modify the ResourcePage behavior
 * but instead syncs the game engine state with the ResourcePage component
 */
export function ResourcePageAdapter(props: React.ComponentProps<typeof ResourcePage>) {
  const { game, initialized } = useGameEngine();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize the resource in our game engine
  useEffect(() => {
    if (!initialized || !game) return;
    
    // Create the resource in our game engine if it doesn't exist
    const resourceRegistry = game.getResources();
    const resource = resourceRegistry.getResource(props.resourceType);
    
    if (!resource) {
      console.log(`Creating ${props.resourceType} resource in game engine`);
      resourceRegistry.createResource({
        id: props.resourceType,
        name: props.resourceName,
        type: props.resourceType,
        amount: 0,
        capacity: 100,
        lastUpdated: new Date().toISOString()
      });
      
      // Log resource creation
      game.getLogs().info(
        `Resource system for ${props.resourceName} initialized`,
        { resourceType: props.resourceType },
        game.getLogs().LogCategory.SYSTEM
      );
    }
    
    setIsInitialized(true);
  }, [initialized, game, props.resourceType, props.resourceName]);
  
  // Just render the original ResourcePage for now
  // We're just ensuring the game engine has the resource initialized
  return <ResourcePage {...props} />;
} 