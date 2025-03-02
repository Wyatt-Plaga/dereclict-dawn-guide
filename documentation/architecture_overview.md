# Derelict Dawn Guide - Architecture Overview

## Table of Contents
- [Introduction](#introduction)
- [Architectural Overview](#architectural-overview)
- [Core Components](#core-components)
  - [Game Engine](#game-engine)
  - [Event Bus](#event-bus)
  - [Game Systems](#game-systems)
  - [Game State](#game-state)
- [React Integration](#react-integration)
  - [GameProvider & useGame Hook](#gameprovider--usegame-hook)
  - [UI Components](#ui-components)
- [Data Flow](#data-flow)
- [Logging System](#logging-system)
- [Design Patterns](#design-patterns)
- [Future Considerations](#future-considerations)

## Introduction

Derelict Dawn Guide is a browser-based incremental/idle game where players manage resources, unlock upgrades, and repair systems on a derelict spaceship. The game features multiple interconnected systems (Reactor, Processor, Crew Quarters, Manufacturing) that the player must manage to progress.

This document provides a comprehensive overview of the application architecture, focusing on how the different components interact, the data flow, and the design decisions that inform the architecture.

## Architectural Overview

The application follows a hybrid architecture combining elements of:

1. **Entity-Component-System (ECS)** for game logic
2. **Event-Driven Architecture** for communication between systems
3. **React Context API** for UI state management
4. **Functional React Components** for the UI layer

The architecture is designed to maintain a clear separation between:
- Game logic (managed by the game engine and systems)
- UI components (React components that display game state)
- Communication layer (event bus that facilitates communication)

This separation allows for easier testing, maintenance, and extension of the game's features.

## Core Components

### Game Engine

The `GameEngine` is the central orchestrator of the game, responsible for:

- Maintaining the current game state
- Running the game loop via `requestAnimationFrame`
- Processing user actions
- Coordinating game systems
- Emitting state updates through the EventBus

Key features:
- Time-based updates (`tick` method) that ensure consistent game progress across devices
- Deep copy of state to ensure immutability
- Action processing pipeline that routes actions to appropriate systems

```typescript
// Location: app/game/core/GameEngine.ts
// Key method: tick(delta)
// This updates all game systems based on elapsed time
private tick(delta: number) {
    // Store the previous state for comparison
    const prevState = JSON.stringify(this.state);
    
    // Update the last update timestamp
    this.state.lastUpdate = Date.now();
    
    // Update all game systems
    this.systems.update(this.state, delta);
    
    // Only emit state updates if something actually changed
    const currentState = JSON.stringify(this.state);
    if (currentState !== prevState) {
        this.eventBus.emit('stateUpdated', this.state);
    }
}
```

### Event Bus

The `EventBus` provides a publish-subscribe mechanism for communication between game components. It:

- Allows different parts of the game to communicate without direct dependencies
- Enables decoupling of game systems
- Provides a consistent way to broadcast and listen for events

Key features:
- Event subscription with callback-based listeners
- Event emission with optional data payloads
- Throttling for state updates to prevent excessive re-renders
- Deep cloning of state data to ensure proper React updates

```typescript
// Location: app/game/core/EventBus.ts
// Example of throttled state updates to improve performance
emit(event: string, data: any) {
    // Add throttling for state updates
    if (event === 'stateUpdated') {
        const now = Date.now();
        
        // Skip if we've emitted a state update too recently
        if (this.lastStateUpdateTime && now - this.lastStateUpdateTime < 50) {
            return;
        }
        
        this.lastStateUpdateTime = now;
    }
    
    // When emitting state updates, clone the data to ensure React detects changes
    let dataToEmit = data;
    if (event === 'stateUpdated') {
        dataToEmit = JSON.parse(JSON.stringify(data));
    }
    
    // Call each listener with the event data
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(dataToEmit));
}
```

### Game Systems

The game employs a modular system architecture with specialized systems for different aspects of gameplay:

1. **ResourceSystem**: Manages resource production, consumption, and storage
2. **UpgradeSystem**: Handles purchase and application of upgrades
3. **ActionSystem**: Processes player actions (clicks, purchases)
4. **GameSystemManager**: Coordinates all systems and provides a unified interface

This approach allows for:
- Separation of concerns
- Easier testing and maintenance
- Modular extension of game features

```typescript
// Example from GameSystemManager
// Location: app/game/systems/index.ts
export class GameSystemManager {
    public resource: ResourceSystem;
    public upgrade: UpgradeSystem;
    public action: ActionSystem;
    
    constructor() {
        this.resource = new ResourceSystem();
        this.upgrade = new UpgradeSystem();
        this.action = new ActionSystem();
    }
    
    // Update all systems with the current delta time
    update(state: GameState, delta: number) {
        this.resource.update(state, delta);
    }
    
    // Process player actions by delegating to the ActionSystem
    processAction(state: GameState, action: GameAction) {
        this.action.process(state, action, this.upgrade);
    }
}
```

### Game State

The game state is a structured object hierarchy that represents the entire game state including:

- Resources for each category (energy, insight, crew, scrap)
- Upgrades purchased for each system
- Stats derived from upgrades (capacities, production rates)
- Global game state (last update timestamp)

The state structure follows a consistent pattern across all game categories:

```typescript
// Location: app/game/types/index.ts
export interface GameState {
    lastUpdate: number;
    categories: {
        reactor: GameCategory;
        processor: GameCategory;
        crewQuarters: GameCategory;
        manufacturing: GameCategory;
    };
}

export interface GameCategory {
    resources: CategoryResources;
    upgrades: CategoryUpgrades;
    stats: CategoryStats;
}
```

## React Integration

### GameProvider & useGame Hook

The React integration centers around the `GameProvider` component and `useGame` hook:

1. **GameProvider**: 
   - Creates and maintains the game engine instance
   - Subscribes to state updates from the event bus
   - Provides game state and dispatch function to React components

2. **useGame Hook**:
   - Custom hook for accessing game state and actions
   - Provides a consistent interface for components to interact with the game

```typescript
// Location: app/game/hooks/useGame.tsx
export function useGame() {
    const context = useContext(GameContext);
    
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    
    return context;
}
```

A critical aspect of the implementation is ensuring that React properly detects state changes:

```typescript
// Important implementation detail in GameProvider
// Creates deep copies of state to ensure React detects changes
useEffect(() => {
    const handleStateUpdate = (newState: GameState) => {
        setState(JSON.parse(JSON.stringify(newState)));
    };
    
    const unsubscribe = engineRef.current.eventBus.on('stateUpdated', handleStateUpdate);
    
    return () => {
        unsubscribe();
    };
}, []);
```

### UI Components

The UI components follow a consistent pattern:
1. Access game state via the `useGame` hook
2. Extract relevant data for the current view
3. Dispatch actions back to the game engine
4. Render based on the current state

Example from the Reactor page:

```tsx
// Location: app/reactor/page.tsx
export default function ReactorPage() {
  const { state, dispatch } = useGame();
  
  // Get reactor data from game state
  const reactor = state.categories.reactor;
  const { energy } = reactor.resources;
  const { energyCapacity, energyPerSecond } = reactor.stats;
  
  // Generate energy on manual click
  const generateEnergy = () => {
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: {
        category: 'reactor'
      }
    });
  };
  
  // Component rendering...
}
```

## Data Flow

The data flow in the application follows a unidirectional pattern:

1. **User Interaction** → UI Component
2. UI Component → **Action Dispatch** (via useGame hook)
3. Action Dispatch → **Game Engine**
4. Game Engine → **Game Systems** (for processing)
5. Game Systems → **State Update**
6. State Update → **Event Bus** (emit 'stateUpdated')
7. Event Bus → **GameProvider** (setState with deep clone)
8. GameProvider → **React Context Update**
9. React Context Update → **UI Component Re-render**

This unidirectional flow ensures predictable state updates and clear data paths through the application.

## Logging System

The application implements a comprehensive logging system that provides:

- Different log levels (ERROR, WARN, INFO, DEBUG, TRACE)
- Categorized logs (ENGINE, EVENT_BUS, STATE, etc.)
- Context-aware logging (REACTOR_LIFECYCLE, UI_RENDER, etc.)
- Performance measurement capabilities

This logging system aids in debugging and provides insight into the application flow:

```typescript
// Location: app/utils/logger.ts
// Example of context-aware logging
Logger.debug(
  LogCategory.ENGINE, 
  `Processing action: ${action.type}`, 
  LogContext.REACTOR_LIFECYCLE
);
```

## Design Patterns

The architecture employs several design patterns:

1. **Observer Pattern**: The event bus implements this pattern to allow systems to subscribe to events
2. **Singleton Pattern**: The game engine is effectively a singleton within the React application
3. **Strategy Pattern**: Different game systems implement specialized strategies for handling different aspects of gameplay
4. **Factory Pattern**: The GameSystemManager acts as a factory for creating and managing game systems
5. **Command Pattern**: Game actions follow the command pattern, encapsulating requests as objects

## Future Considerations

The current architecture supports several potential extensions:

1. **Saving/Loading**: The clean state structure facilitates easy serialization for save/load functionality
2. **Multiplayer Features**: The event-driven architecture could be extended to sync with server events
3. **New Game Systems**: Additional systems can be added to the GameSystemManager with minimal changes
4. **Game Balancing**: The separation of game logic makes it easier to tune and balance game parameters
5. **Mobile Optimization**: The throttled state updates already consider performance on mobile devices

---

This document provides an overview of the architecture as of March 24, 2024. As the game evolves, this architecture may be refined and extended to meet new requirements. 