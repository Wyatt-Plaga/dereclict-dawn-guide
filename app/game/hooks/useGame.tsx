"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { GameEngine } from '../core/GameEngine';
import { GameState } from '../types';
import { GameAction } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

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
  const [engine] = useState(() => {
    Logger.info(LogCategory.LIFECYCLE, "Creating game engine instance", LogContext.STARTUP);
    return new GameEngine();
  });
  
  // Track the current game state
  const [state, setState] = useState(() => {
    // Deep clone the initial state to ensure proper React state management
    const initialState = JSON.parse(JSON.stringify(engine.getState()));
    Logger.debug(LogCategory.STATE, "Initializing React state with game state", LogContext.STARTUP);
    return initialState;
  });

  // Create a stable dispatch function that won't change on re-renders
  const dispatch = useCallback((action: GameAction) => {
    // Determine appropriate context based on action type
    let context = LogContext.NONE;
    if (action.type === 'CLICK_RESOURCE') {
      const category = action.payload.category;
      if (category === 'reactor') {
        context = LogContext.REACTOR_LIFECYCLE;
      } else if (category === 'processor') {
        context = LogContext.PROCESSOR_LIFECYCLE;
      } else if (category === 'crewQuarters') {
        context = LogContext.CREW_LIFECYCLE;
      } else if (category === 'manufacturing') {
        context = LogContext.MANUFACTURING_LIFECYCLE;
      }
    } else if (action.type === 'PURCHASE_UPGRADE') {
      context = LogContext.UPGRADE_PURCHASE;
    }
    
    Logger.debug(LogCategory.ACTIONS, `Dispatching action: ${action.type}`, context);
    engine.dispatch(action);
  }, [engine]);

  // Fix by using a ref to stabilize the engine reference:
  const engineRef = useRef(engine);

  // Only set up the event listener once
  useEffect(() => {
    // Track if the component is mounted
    let isMounted = true;
    
    // Debounce state updates to prevent rapid re-renders
    let lastUpdateTime = 0;
    const updateThreshold = 50; // ms
    
    const handleStateUpdate = (newState: GameState) => {
      if (!isMounted) return;
      
      const now = Date.now();
      if (now - lastUpdateTime < updateThreshold) return;
      lastUpdateTime = now;
      
      // Use functional setState to avoid dependency on current state
      setState(prevState => {
        // Only update if something meaningful changed
        // Optional: implement deep comparison here
        return JSON.parse(JSON.stringify(newState));
      });
    };
    
    const unsubscribe = engineRef.current.eventBus.on('stateUpdated', handleStateUpdate);
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array - only run once

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