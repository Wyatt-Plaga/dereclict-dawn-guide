# Game Provider Documentation

## Overview

The Game Provider in Derelict Dawn Guide serves as the crucial bridge between the core game systems and the React UI layer. It implements a React Context-based state management solution that provides all UI components with access to the game state and actions. The Game Provider initializes the Game Engine, subscribes to state updates, and ensures that UI components re-render efficiently when game state changes occur.

## Architecture

The Game Provider follows a React Context-based architecture with these key principles:

1. **Context-Based State Management**: Uses React Context to make game state and dispatch functions available throughout the component tree.
2. **Engine Lifecycle Management**: Initializes, starts, and stops the Game Engine based on component lifecycle.
3. **Event-Driven Updates**: Subscribes to the EventBus to receive state updates and propagate them to React components.
4. **Performance Optimization**: Implements debouncing and deep cloning to optimize rendering performance.
5. **Loading State Management**: Tracks and exposes initialization state to allow components to show loading indicators.

## Core Classes and Interfaces

### Primary Components
- **GameProvider**: The main context provider component that manages the game engine and state
  ```typescript
  export function GameProvider({ children }: { children: ReactNode }) {
    // ... implementation
  }
  ```

- **useGame**: The custom hook for consuming the game context
  ```typescript
  export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
      throw new Error('useGame must be used within a GameProvider');
    }
    return context;
  }
  ```

### Key Types
- **GameContextType**: Defines the shape of the game context
  ```typescript
  interface GameContextType {
    state: GameState;
    dispatch: (action: GameAction) => void;
    engine: GameEngine; // Exposing the engine for advanced use cases
    isInitializing: boolean; // Indicates if game is still loading
  }
  ```

- **GameAction**: The base interface for all dispatch actions
  ```typescript
  export interface GameAction {
    type: string;
    payload?: any;
  }
  ```

## Data Flow

1. **Initialization Flow**:
   - GameProvider component mounts
   - Game Engine instance is created
   - Initial state is retrieved from memory cache or initialized
   - Engine initialization is triggered asynchronously
   - Loading state is tracked during initialization
   - EventBus subscription is established

2. **State Update Flow**:
   - Game Engine processes updates (game loop or user actions)
   - Engine emits 'stateUpdated' event with new state
   - GameProvider receives update via EventBus subscription
   - State updates are debounced to prevent excessive re-renders
   - React setState is called with deep cloned state
   - React Context updates, triggering UI component re-renders

3. **Action Dispatch Flow**:
   - User interacts with UI component
   - Component calls dispatch function with action
   - Dispatch function (from context) logs action and forwards to engine
   - Engine processes action and updates state
   - State update flow is triggered (as above)

## Key Components

### GameProvider Implementation
```typescript
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

  // Create a stable dispatch function that won't change on re-renders
  const dispatch = useCallback((action: GameAction) => {
    Logger.debug(LogCategory.ACTIONS, `Dispatching action: ${action.type}`);
    engine.dispatch(action);
  }, [engine]);

  // Start/stop the game engine
  useEffect(() => {
    Logger.info(LogCategory.LIFECYCLE, "🚀 Starting game engine...", LogContext.STARTUP);
    
    // Initialize the game engine - will load saved game or start new game
    const initGame = async () => {
      try {
        await engine.initialize();
      } catch (error) {
        console.error("Failed to initialize game:", error);
        // Fallback to starting the game if initialization fails
        engine.start();
      } finally {
        // Mark initialization as complete
        setIsInitializing(false);
      }
    };
    
    initGame();

    return () => {
      Logger.info(LogCategory.LIFECYCLE, "⏹️ Stopping game engine...", LogContext.NONE);
      engine.stop();
    };
  }, [engine]);
  
  // Context value that includes state, dispatch, engine, and loading state
  const contextValue = { state, dispatch, engine, isInitializing };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}
```

### State Update Subscription
```typescript
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
    setState((prevState: GameState) => {
      // Deep clone to ensure React detects changes
      return JSON.parse(JSON.stringify(newState));
    });
  };
  
  const unsubscribe = engine.eventBus.on('stateUpdated', handleStateUpdate);
  
  return () => {
    isMounted = false;
    unsubscribe();
  };
}, [engine]);
```

### GameLoader Component
```typescript
export default function GameLoader({ children }: GameLoaderProps) {
  const { isInitializing } = useGame();
  
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Derelict Dawn</h1>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading ship systems...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

## Integration Points

The Game Provider integrates with several systems:

1. **Game Engine**: 
   - Initializes and manages the lifecycle of the Game Engine
   - Forwards dispatched actions to the Game Engine for processing
   - Receives state updates from the engine via the EventBus

2. **EventBus**: 
   - Subscribes to 'stateUpdated' events to receive state changes
   - Handles unsubscription during component unmount
   - Uses the event-driven architecture for efficient state propagation

3. **Memory Cache**: 
   - Uses the memory cache for the initial state when available
   - Ensures state persistence during in-app navigation
   - Provides a seamless experience when navigating between pages

4. **React Components**: 
   - Exposes state, dispatch, and loading status to all child components
   - Manages the rendering lifecycle based on game state changes
   - Provides consistent patterns for action dispatching

5. **Logger**: 
   - Logs important lifecycle events and dispatched actions
   - Provides detailed context for debugging purposes
   - Helps trace action flow through the system

## UI Integration Patterns

The Game Provider enables several UI integration patterns:

1. **Generic State Access with useGame**:
   ```tsx
   // Pattern used in most UI components
   function SomeComponent() {
     const { state, dispatch } = useGame();
     
     // Use state directly
     const energy = state.categories.reactor.resources.energy;
     
     // Dispatch actions
     const handleClick = () => dispatch({
       type: 'CLICK_RESOURCE',
       payload: { category: 'reactor' }
     });
     
     return (/* JSX that uses state and handles interactions */);
   }
   ```

2. **Loading State Handling with GameLoader**:
   ```tsx
   // Used in page components to handle the loading state
   export default function SomePage() {
     return (
       <GameLoader>
         {/* Page content that assumes game is initialized */}
       </GameLoader>
     );
   }
   ```

3. **Direct Engine Access (Advanced Use Cases)**:
   ```tsx
   // Pattern for advanced scenarios requiring direct engine access
   function AdvancedComponent() {
     const { engine } = useGame();
     
     // Directly work with the engine for advanced operations
     useEffect(() => {
       const systems = engine.getSystems();
       // Do something with systems directly
     }, [engine]);
     
     return (/* JSX */);
   }
   ```

## Examples

### Basic Page Component with Game State
```tsx
export default function ReactorPage() {
  const { state, dispatch } = useGame();
  const { shouldFlicker } = useSystemStatus();
  
  // Get reactor data from game state
  const reactor = state.categories.reactor;
  const { energy } = reactor.resources;
  const { energyCapacity, energyPerSecond } = reactor.stats;
  
  // Handle reactor click
  const generateEnergy = () => {
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: { category: 'reactor' }
    });
  };
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          {/* UI components that use the state */}
          <div className="mb-4">Energy: {energy}/{energyCapacity}</div>
          <button onClick={generateEnergy}>Generate Energy</button>
        </div>
      </main>
    </GameLoader>
  );
}
```

### Handling Game Initialization
```tsx
// In _app.tsx or layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
```

### Creating a Specialized Game Hook
```tsx
/**
 * Custom hook for the Reactor category
 * Provides easier access to reactor-specific state and actions
 */
export function useReactor() {
  const { state, dispatch } = useGame();
  
  const reactor = state.categories.reactor;
  
  // Specialized action creators
  const generateEnergy = () => dispatch({
    type: 'CLICK_RESOURCE',
    payload: { category: 'reactor' }
  });
  
  const upgradeCapacity = () => dispatch({
    type: 'PURCHASE_UPGRADE',
    payload: {
      category: 'reactor',
      upgradeType: 'reactorExpansions'
    }
  });
  
  return {
    ...reactor,
    generateEnergy,
    upgradeCapacity
  };
}
```

## Future Considerations

1. **State Management Optimization**: Implement more advanced state diffing to reduce unnecessary re-renders by comparing old and new state before updates.

2. **TypeScript Type Safety**: Enhance type safety for actions by using discriminated unions and stricter typing for payloads.

3. **Middleware Support**: Add middleware support for the dispatch function to enable features like action logging, analytics, or state validation.

4. **Selector Pattern**: Implement a memoized selector pattern to optimize performance when components only need specific parts of the state.

5. **Component-Specific Context Slices**: Create specialized context providers for different parts of the game to reduce re-renders when unrelated state changes.

6. **Persistence Layer**: Enhance the integration with local storage or other persistence mechanisms for more robust save/load functionality.

7. **Testing Utilities**: Develop specialized testing utilities for components that consume the game context.

8. **Suspense Integration**: When React Suspense for data fetching becomes stable, consider integrating it with the loading state management.

9. **State Time-Travel Debugging**: Add development tools for time-travel debugging of game state changes.

10. **Action Batching**: Implement action batching for operations that require multiple state updates to reduce render cycles. 