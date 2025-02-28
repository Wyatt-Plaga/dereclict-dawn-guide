import React, { createContext, useContext, useEffect, useState } from 'react';
import { Game } from '../../core/game/Game';
import { GameEngineState } from '../../core/game/GameInterfaces';

// Define the context type
interface GameEngineContextType {
  game: Game | null;
  initialized: boolean;
  loading: boolean;
  error: Error | null;
}

// Create the context with default values
const GameEngineContext = createContext<GameEngineContextType>({
  game: null,
  initialized: false,
  loading: true,
  error: null
});

// Provider props
interface GameEngineProviderProps {
  initialState?: Partial<GameEngineState>;
  children: React.ReactNode;
}

/**
 * Game Engine Provider
 * Initializes and provides the game engine to React components
 */
export const GameEngineProvider: React.FC<GameEngineProviderProps> = ({ 
  initialState, 
  children 
}) => {
  // Game instance state
  const [game, setGame] = useState<Game | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize the game engine
  useEffect(() => {
    try {
      // Create a new game instance
      const gameInstance = new Game(initialState);
      
      // Set the game instance
      setGame(gameInstance);
      setInitialized(true);
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize game engine:', err);
      setError(err instanceof Error ? err : new Error('Unknown error initializing game engine'));
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (game) {
        game.cleanup();
      }
    };
  }, []);
  
  // Context value
  const contextValue: GameEngineContextType = {
    game,
    initialized,
    loading,
    error
  };
  
  return (
    <GameEngineContext.Provider value={contextValue}>
      {children}
    </GameEngineContext.Provider>
  );
};

/**
 * Hook to use the game engine
 */
export const useGameEngine = (): GameEngineContextType => {
  const context = useContext(GameEngineContext);
  
  if (context === undefined) {
    throw new Error('useGameEngine must be used within a GameEngineProvider');
  }
  
  return context;
}; 