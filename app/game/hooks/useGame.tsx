"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { GameEngine } from '../core/GameEngine';
import { GameState } from '../types';
import { GameAction } from '../types/actions';

/**
 * The shape of our Game Context
 */
interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
  engine: GameEngine; // Exposing the engine for advanced use cases
}

/**
 * Create a React Context for the game
 * This allows components to access the game state without prop drilling
 */
const GameContext = createContext<GameContextType | null>(null);

/**
 * GameProvider Component
 * 
 * Wraps the application and provides game state and dispatch function to all children
 */
export function GameProvider({ children }: { children: ReactNode }) {
  // Create a game engine instance that persists across renders
  const [engine] = useState(() => new GameEngine());
  
  // Track the current game state
  const [state, setState] = useState(engine.getState());

  // Create a stable dispatch function that won't change on re-renders
  const dispatch = useCallback((action: GameAction) => {
    console.log('Dispatching action:', action.type);
    engine.dispatch(action);
  }, [engine]);

  useEffect(() => {
    // Subscribe to state updates from the game engine
    const unsubscribe = engine.eventBus.on('stateUpdated', (newState: GameState) => {
      setState(newState);
    });

    // Start the game engine
    engine.start();

    // Initialize the game by dispatching a startup action if needed
    // dispatch({ type: 'GAME_INIT' });

    // Cleanup when unmounted
    return () => {
      engine.stop();
      unsubscribe();
    };
  }, [engine]);

  // Create the context value object with stable references
  const contextValue = useCallback(() => ({
    state,
    dispatch,
    engine
  }), [state, dispatch, engine]);

  return (
    <GameContext.Provider value={contextValue()}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * useGame Hook
 * 
 * Custom hook for accessing the game state and dispatching actions
 * 
 * @returns {Object} An object containing:
 *   - state: The current game state
 *   - dispatch: Function to dispatch game actions
 *   - engine: Direct access to the game engine (for advanced use cases)
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
} 