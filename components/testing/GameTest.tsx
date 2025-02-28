"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useGameEngine } from '@/src/ui/providers/GameEngineProvider';
import { useGameResources } from '@/src/ui/hooks/useGameResources';
import { useGameUpgrades } from '@/src/ui/hooks/useGameUpgrades';
import { useGameLogs } from '@/src/ui/hooks/useGameLogs';

const GameTest: React.FC = () => {
  const { game, initialized, loading, error } = useGameEngine();
  const { resources, getResource, addResource } = useGameResources();
  const { upgrades, isUpgradeAvailable, purchaseUpgrade } = useGameUpgrades();
  const { logs, LogCategory, LogLevel } = useGameLogs();
  
  const [tickCount, setTickCount] = useState(0);
  const isInitializedRef = useRef(false);
  
  // Initialize the game with some resources and upgrades
  useEffect(() => {
    if (!initialized || !game) return;
    
    // Initialize resources with error handling
    const initializeResources = () => {
      try {
        // Create energy resource if it doesn't exist
        const energy = getResource('energy');
        if (!energy) {
          game.getResources().createResource({
            id: 'energy',
            name: 'Energy',
            type: 'energy',
            amount: 50,
            capacity: 1000,
            lastUpdated: new Date().toISOString()
          });
        }
        
        // Create minerals if they don't exist
        const minerals = getResource('minerals');
        if (!minerals) {
          game.getResources().createResource({
            id: 'minerals',
            name: 'Minerals',
            type: 'material',
            amount: 25,
            capacity: 500,
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (error: any) {
        console.error('Error initializing resources:', error);
        // Log to game logs as well
        game.getLogs().createLog({
          message: `Resource initialization error: ${error.message}`,
          level: LogLevel.ERROR,
          category: LogCategory.SYSTEM
        });
      }
    };

    // Only run initialization once
    if (!isInitializedRef.current) {
      initializeResources();
      isInitializedRef.current = true;
    }
    
    // Set up a game ticker
    const interval = setInterval(() => {
      // Add some energy each tick
      try {
        addResource('energy', 1);
        setTickCount(prev => prev + 1);
      } catch (error: any) {
        console.error('Error in game tick:', error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [initialized, game, getResource, addResource, LogLevel, LogCategory]);
  
  if (loading) {
    return <div className="p-4">Loading game engine...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }
  
  if (!initialized || !game) {
    return <div className="p-4">Game engine not initialized</div>;
  }
  
  const handleAddEnergy = () => {
    addResource('energy', 10);
  };
  
  const handleAddMinerals = () => {
    addResource('minerals', 5);
  };
  
  const handleSaveGame = () => {
    const state = game.saveState();
    console.log('Game state:', state);
    localStorage.setItem('saved_game_state', JSON.stringify(state));
    
    // Log the action using the LogManager
    game.getLogs().createLog({
      message: 'Game saved successfully',
      level: LogLevel.INFO,
      category: LogCategory.SYSTEM
    });
  };

  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Game Status</h2>
        <div className="grid gap-2">
          <p>Game Initialized: {initialized ? 'Yes' : 'No'}</p>
          <p>Tick Count: {tickCount}</p>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Resources</h2>
        <div className="grid gap-4">
          {resources.map(resource => (
            <div key={resource.getId()} className="flex justify-between items-center">
              <span>{resource.getId()}: {resource.getAmount()} / {resource.getCapacity()}</span>
              
              <div className="space-x-2">
                {resource.getId() === 'energy' && (
                  <button 
                    onClick={handleAddEnergy}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    +10 Energy
                  </button>
                )}
                
                {resource.getId() === 'minerals' && (
                  <button 
                    onClick={handleAddMinerals}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    +5 Minerals
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Game Logs</h2>
        <div className="h-40 overflow-y-auto space-y-2 border p-2 rounded">
          {logs.map(log => (
            <div key={log.getId()} className="text-sm">
              <span className="opacity-50">[{new Date(log.getTimestamp()).toLocaleTimeString()}]</span>{' '}
              <span>{log.getMessage()}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Game Actions</h2>
        <div className="flex space-x-4">
          <button 
            onClick={handleSaveGame}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Save Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameTest; 