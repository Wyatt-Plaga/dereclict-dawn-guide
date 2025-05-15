"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { GameEngine } from 'core/GameEngine';
import { GameState } from '../types';
import { ActionKey, ActionMap } from '../actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { getCachedState } from 'core/memoryCache';

/**
 * The shape of our Game Context
 */
interface GameContextType {
  state: GameState;
  dispatchAction: <K extends ActionKey>(type: K, payload: ActionMap[K]) => void;
  engine: GameEngine; // Exposing the engine for advanced use cases
  isInitializing: boolean; // Indicates if game is still loading
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
  // Track initialization state
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Create a game engine instance that persists across renders
  const [engine] = useState(() => {
    Logger.info(LogCategory.LIFECYCLE, "Creating game engine instance", LogContext.STARTUP);
    return new GameEngine();
  });
  
  // Track the current game state - use cached state for initial value if available
  const [state, setState] = useState(() => {
    // Use memory cache if available, or get from engine
    const initialState = getCachedState() || engine.getState();
    Logger.debug(
      LogCategory.STATE, 
      "Initializing React state with game state", 
      LogContext.STARTUP
    );
    return initialState;
  });

  // ---------------------------------------------------------------------
  // Phase-5 typed action dispatcher – bypasses GameEngine.dispatch
  // ---------------------------------------------------------------------
  const dispatchAction = useCallback(<K extends ActionKey>(type: K, payload: ActionMap[K]) => {
    // We assert here because ActionKey subset exists in GameEventMap.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.eventBus.publish(type as any, payload as any);
  }, [engine]);

  // Fix by using a ref to stabilize the engine reference:
  const engineRef = useRef(engine);

  // Start/stop the game engine
  useEffect(() => {
    Logger.info(LogCategory.LIFECYCLE, "🚀 Starting game engine...", LogContext.STARTUP);
    
    // Initialize the game engine - will load saved game or start new game
    const initGame = async () => {
      try {
        await engineRef.current.initialize();
      } catch (error) {
        console.error("Failed to initialize game:", error);
        // Fallback to starting the game if initialization fails
        engineRef.current.start();
      } finally {
        // Mark initialization as complete
        setIsInitializing(false);
      }
    };
    
    initGame();

    return () => {
      Logger.info(LogCategory.LIFECYCLE, "⏹️ Stopping game engine...", LogContext.NONE);
      engineRef.current.stop();
    };
  }, []);

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
      setState(() => JSON.parse(JSON.stringify(newState)));
    };
    
    const unsubscribe = engineRef.current.eventBus.on('stateUpdated', handleStateUpdate);
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Include isInitializing in the context value
  const contextValue: GameContextType = {
    state,
    dispatchAction,
    engine,
    isInitializing
  };

  return (
    <GameContext.Provider value={contextValue}>
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
 *   - isInitializing: Whether the game is still loading
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
} 