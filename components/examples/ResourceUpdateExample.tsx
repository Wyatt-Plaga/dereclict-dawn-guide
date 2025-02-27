import { useState, useEffect } from 'react';
import { ResourceManager } from '@/utils/managers/ResourceManager';
import { Logger } from '@/utils/logging/Logger';
import { GameProgress, ResourceType } from '@/types/game.types';

// Create a module-specific logger
const logger = new Logger('ResourceUpdateExample');

/**
 * Example component that demonstrates using ResourceManager and Logger
 * This shows how to update resources, perform batch updates, and handle offline progress
 */
export function ResourceUpdateExample() {
  // Mock game state for this example
  const [gameState, setGameState] = useState<GameProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial game state
  useEffect(() => {
    logger.info('Initializing ResourceUpdateExample component');
    
    // In a real app, this would load from a database or localStorage
    const initialGameState = ResourceManager.createDefaultGameProgress();
    setGameState(initialGameState);
    setIsLoading(false);
    
    // ResourceManager.createDefaultGameProgress() guarantees these properties exist
    logger.debug('Initial game state loaded', { 
      energy: initialGameState.resources.energy?.amount ?? 0,
      insight: initialGameState.resources.insight?.amount ?? 0
    });
  }, []);

  // Handle resource update
  const handleResourceUpdate = (
    resourceType: ResourceType,
    property: string,
    value: number
  ) => {
    if (!gameState) {
      logger.warn('Cannot update resource: game state is null');
      return;
    }
    
    logger.info(`Updating ${resourceType}.${property} to ${value}`);
    
    // Use ResourceManager to update the resource
    const updatedGameState = ResourceManager.updateResource(
      gameState,
      resourceType,
      property,
      value,
      saveGameProgress
    );
    
    // Update local state
    setGameState(updatedGameState);
  };

  // Mock save function (would persist to database/localStorage in real app)
  const saveGameProgress = (progress: GameProgress) => {
    logger.info('Saving game progress', { timestamp: new Date().toISOString() });
    // In a real app, this would save to a database
    console.log('Game progress saved', progress);
  };

  // Handle batch update of multiple resources
  const handleBatchUpdate = () => {
    if (!gameState) {
      logger.warn('Cannot perform batch update: game state is null');
      return;
    }
    
    logger.info('Performing batch update of resources');
    
    // Define batch updates for multiple resources
    const updates = [
      { resourceType: 'energy' as ResourceType, property: 'amount', value: 50 },
      { resourceType: 'insight' as ResourceType, property: 'amount', value: 25 },
      { resourceType: 'crew' as ResourceType, property: 'amount', value: 10 }
    ];
    
    // Use ResourceManager to perform batch update
    const updatedGameState = ResourceManager.batchUpdateResources(
      gameState,
      updates,
      saveGameProgress
    );
    
    // Update local state
    setGameState(updatedGameState);
  };

  // Simulate offline progress calculation
  const simulateOfflineProgress = () => {
    if (!gameState) {
      logger.warn('Cannot calculate offline progress: game state is null');
      return;
    }
    
    logger.info('Calculating offline progress');
    
    // Modify the last online time to simulate being offline for 2 hours
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    const modifiedGameState = {
      ...gameState,
      lastOnline: twoHoursAgo.toISOString()
    };
    
    // Calculate offline progress
    const { updatedResources, gains, minutesPassed } = 
      ResourceManager.calculateOfflineProgress(modifiedGameState);
    
    logger.info(`Calculated offline progress for ${minutesPassed.toFixed(1)} minutes`, { gains });
    
    // Update game state with offline progress
    setGameState({
      ...gameState,
      resources: updatedResources
    });
  };

  if (isLoading || !gameState) {
    return <div className="p-4">Loading game state...</div>;
  }

  // Safely access resources with null checks
  const energy = gameState.resources.energy;
  const insight = gameState.resources.insight;
  const crew = gameState.resources.crew;
  const scrap = gameState.resources.scrap;

  // ResourceManager.createDefaultGameProgress() guarantees these will exist,
  // but TypeScript needs these checks
  if (!energy || !insight || !crew || !scrap) {
    return <div className="p-4">Error: Missing resource data</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Resource Manager Example</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-md">
          <h3 className="font-semibold">Energy</h3>
          <p>Amount: {energy.amount.toFixed(1)}</p>
          <p>Capacity: {energy.capacity}</p>
          <p>Auto Generation: {energy.autoGeneration}</p>
        </div>
        
        <div className="p-3 bg-purple-50 rounded-md">
          <h3 className="font-semibold">Insight</h3>
          <p>Amount: {insight.amount.toFixed(1)}</p>
          <p>Capacity: {insight.capacity}</p>
          <p>Auto Generation: {insight.autoGeneration}</p>
        </div>
        
        <div className="p-3 bg-green-50 rounded-md">
          <h3 className="font-semibold">Crew</h3>
          <p>Amount: {crew.amount.toFixed(1)}</p>
          <p>Capacity: {crew.capacity}</p>
          <p>Worker Crews: {crew.workerCrews}</p>
        </div>
        
        <div className="p-3 bg-amber-50 rounded-md">
          <h3 className="font-semibold">Scrap</h3>
          <p>Amount: {scrap.amount.toFixed(1)}</p>
          <p>Capacity: {scrap.capacity}</p>
          <p>Manufacturing Bays: {scrap.manufacturingBays}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Update Single Resource</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleResourceUpdate('energy', 'amount', energy.amount + 10)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add 10 Energy
            </button>
            
            <button
              onClick={() => handleResourceUpdate('insight', 'amount', insight.amount + 5)}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add 5 Insight
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Batch Update Resources</h3>
          <button
            onClick={handleBatchUpdate}
            className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Batch Update Resources
          </button>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Simulate Offline Progress</h3>
          <button
            onClick={simulateOfflineProgress}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Simulate 2 Hours Offline
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h3 className="font-semibold">Log Output</h3>
          <p className="text-sm text-gray-600">Check your browser console to see logged messages.</p>
          <button
            onClick={() => logger.info('Log example: This button was clicked')}
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Generate Log Entry
          </button>
        </div>
      </div>
    </div>
  );
} 