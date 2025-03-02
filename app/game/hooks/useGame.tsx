"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GameEngine } from '../core/GameEngine';
import { GameState } from '../types';

/**
 * The shape of our Game Context
 */
interface GameContextType {
  engine: GameEngine;
  state: GameState;
}

/**
 * Create a React Context for the game
 * This allows components to access the game state without prop drilling
 */
const GameContext = createContext<GameContextType | null>(null);

/**
 * GameProvider Component
 * 
 * Wraps the application and provides game state to all children
 */
export function GameProvider({ children }: { children: ReactNode }) {
  // Create a game engine instance that persists across renders
  const [engine] = useState(() => new GameEngine());
  
  // Track the current game state
  const [state, setState] = useState(engine.getState());

  useEffect(() => {
    // Subscribe to state updates from the game engine
    const unsubscribe = engine.eventBus.on('stateUpdated', (newState: GameState) => {
      setState(newState);
    });

    // Start the game engine
    engine.start();

    // Cleanup when unmounted
    return () => {
      engine.stop();
      unsubscribe();
    };
  }, [engine]);

  return (
    <GameContext.Provider value={{ engine, state }}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * useGame Hook
 * 
 * Custom hook for accessing the game state and engine
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
} 