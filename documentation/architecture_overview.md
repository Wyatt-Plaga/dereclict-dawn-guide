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
- [State Persistence](#state-persistence)
  - [Memory Caching](#memory-caching)
  - [Loading States](#loading-states)
- [Logging System](#logging-system)
- [Encounter System](#encounter-system)
  - [Encounter Types](#encounter-types)
  - [Encounter Generation](#encounter-generation)
  - [Region Integration](#region-integration)
  - [Story Choices and Outcomes](#story-choices-and-outcomes)
  - [UI Components](#encounter-ui-components)
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
   - Handles loading states during initialization
   - Manages the memory cache for persistent state during navigation

2. **useGame Hook**:
   - Custom hook for accessing game state and actions
   - Provides a consistent interface for components to interact with the game
   - Returns loading state to allow components to respond appropriately

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
5. Handle loading states appropriately using the `GameLoader` component

Example from the Reactor page:

```tsx
// Location: app/reactor/page.tsx
export default function ReactorPage() {
  const { state, dispatch, loading } = useGame();
  
  // Wrap page content with GameLoader to handle loading states
  return (
    <GameLoader>
      {/* Component content */}
    </GameLoader>
  );
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

## State Persistence

The game implements several mechanisms for state persistence to ensure a smooth user experience and prevent data loss.

### Memory Caching

To maintain game state during navigation between different pages within the application, a memory caching system is implemented:

1. **In-Memory Cache**: A singleton memory cache stores the game state when navigating between pages
2. **Game Engine Integration**: The game engine checks for cached state during initialization
3. **Navigation Persistence**: State is preserved when users navigate between different game areas

```typescript
// Memory cache implementation
// Location: app/game/core/MemoryCache.ts
export class MemoryCache {
  private static instance: MemoryCache;
  private cache: Record<string, any> = {};

  static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  set(key: string, value: any): void {
    this.cache[key] = value;
  }

  get(key: string): any {
    return this.cache[key];
  }

  has(key: string): boolean {
    return key in this.cache;
  }

  clear(key?: string): void {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }
}
```

### Loading States

The application handles loading states to provide a smooth user experience:

1. **GameLoader Component**: A dedicated component manages loading states to prevent UI flashes
2. **Loading Indicators**: Visual feedback is provided during state initialization or data fetching
3. **Graceful Degradation**: Components handle loading states to prevent errors or empty states

```tsx
// GameLoader component for handling loading states
// Location: app/components/GameLoader.tsx
export function GameLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useGame();
  
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-blue-300">Initializing systems...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

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

## Encounter System

The Encounter System adds a narrative and exploratory layer to the game, allowing players to discover resources and make decisions as they travel through different regions of space. This system integrates with the existing game architecture to provide dynamic gameplay events.

### Encounter Types

The game features multiple types of encounters, each with different gameplay mechanics:

1. **EmptyEncounter**: Simple encounters that may provide resource rewards but don't require player choices.
2. **StoryEncounter**: Narrative-driven encounters that present players with choices, leading to different outcomes and rewards.

All encounters derive from a base interface that ensures consistent structure:

```typescript
// Location: app/game/types/index.ts
export interface BaseEncounter {
  type: 'empty' | 'story';
  title: string;
  description: string;
  region: RegionType;
}

export interface EmptyEncounter extends BaseEncounter {
  type: 'empty';
  message?: string;
  resources?: ResourceReward[];
}

export interface StoryEncounter extends BaseEncounter {
  type: 'story';
  choices: EncounterChoice[];
}

export interface EncounterChoice {
  id: string;
  text: string;
  outcome: {
    text: string;
    resources?: ResourceReward[];
  };
}
```

### Encounter Generation

The `EncounterSystem` is responsible for generating and managing encounters:

1. **Region-Based Generation**: Encounters are generated based on the player's current region.
2. **Probability Distribution**: Different encounter types have different probabilities of occurring.
3. **Resource Integration**: Encounters can reward players with various resources (energy, insight, crew, scrap).

```typescript
// Location: app/game/systems/EncounterSystem.ts
// Example encounter generation method
generateEncounter(state: GameState): BaseEncounter {
  // Determine the current region
  const region = state.navigation.currentRegion;
  
  // Weighted chance of encounter types (70% empty, 30% story)
  const randomValue = Math.random();
  
  if (randomValue < 0.7) {
    return this.generateEmptyEncounter(region);
  } else {
    return this.generateStoryEncounter(region);
  }
}
```

### Region Integration

The encounter system is tightly integrated with the region system, providing region-specific content:

1. **Region-Specific Encounters**: Each region (void, nebula, asteroid, deepspace, blackhole) has unique encounters.
2. **Visual Differentiation**: Encounters use region-specific visual effects and color schemes.
3. **Progressive Difficulty**: Encounters in later regions may offer greater rewards but with higher risks.

```typescript
// Location: app/game/systems/EncounterSystem.ts
// Example of region-specific encounter generation
generateStoryEncounter(region: RegionType): StoryEncounter {
  switch (region) {
    case 'void':
      return {
        type: 'story',
        title: 'Mysterious Signal',
        description: 'Your sensors detect an unusual signal...',
        region: 'void',
        choices: [
          // Region-specific choices
        ]
      };
    // Other regions...
  }
}
```

### Story Choices and Outcomes

The story encounter system provides narrative choices with meaningful consequences:

1. **Decision Points**: Players make choices that impact the outcome of the encounter.
2. **Outcome Variety**: Choices lead to different narrative outcomes and resource rewards.
3. **Risk-Reward Mechanics**: Some choices offer higher potential rewards but with greater risk.

The ActionSystem processes these choices through a specific action type:

```typescript
// Location: app/game/systems/ActionSystem.ts
// Example of handling story choices
private handleStoryChoice(state: GameState, action: MakeStoryChoiceAction) {
  const { choiceId } = action.payload;
  
  // Validate the choice ID and complete the encounter
  if (this.manager && choiceId) {
    this.manager.encounter.completeEncounter(state, choiceId);
  }
}
```

### Encounter UI Components

The UI layer for encounters uses specialized components:

1. **EncounterDisplay**: The main component for rendering encounters and managing user interaction.
2. **Resource Visualization**: Resources are displayed with type-specific icons and colors.
3. **Region Effects**: Visual effects based on the current region enhance immersion.

```tsx
// Location: app/components/EncounterDisplay.tsx
// Main encounter rendering component
const EncounterDisplay: React.FC<EncounterDisplayProps> = ({ encounter, onComplete }) => {
  // Component manages state for:
  // - Selected choices
  // - Outcome text and resources
  // - Animation states
  
  // Renders different UIs based on encounter type
  return (
    <div className="relative w-full">
      {/* Region-specific effects */}
      <div className="absolute inset-0 -m-4 md:-m-8 z-0 overflow-hidden opacity-20">
        <div className={`${getRegionEffectClass(encounter.region)}`}></div>
      </div>
      
      {/* Encounter content */}
      <div className="system-panel p-6 mb-6 relative z-10">
        {/* Title, description, choices, and outcomes */}
      </div>
    </div>
  );
};
```

The encounter UI integrates with the game's action system through its `onComplete` handler, which dispatches the appropriate actions based on player choices.

## Design Patterns

The architecture employs several design patterns:

1. **Observer Pattern**: The event bus implements this pattern to allow systems to subscribe to events
2. **Singleton Pattern**: The game engine is effectively a singleton within the React application
3. **Strategy Pattern**: Different game systems implement specialized strategies for handling different aspects of gameplay
4. **Factory Pattern**: The GameSystemManager acts as a factory for creating and managing game systems
5. **Command Pattern**: Game actions follow the command pattern, encapsulating requests as objects

## Future Considerations

The current architecture supports several potential extensions:

1. **Enhanced Saving/Loading**: The current memory cache could be extended with persistent storage options like localStorage or IndexedDB
2. **Multiplayer Features**: The event-driven architecture could be extended to sync with server events
3. **New Game Systems**: Additional systems can be added to the GameSystemManager with minimal changes
4. **Game Balancing**: The separation of game logic makes it easier to tune and balance game parameters
5. **Mobile Optimization**: The throttled state updates already consider performance on mobile devices
6. **Progressive Web App**: The architecture supports conversion to a PWA for offline play

---

This document provides an overview of the architecture as of March 24, 2024. As the game evolves, this architecture may be refined and extended to meet new requirements. 