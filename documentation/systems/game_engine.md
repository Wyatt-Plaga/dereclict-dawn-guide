# Game Engine System

## Overview

The Game Engine is the central orchestrator of Derelict Dawn Guide, responsible for coordinating all game systems, maintaining the game state, and running the game loop. It serves as the "heart" of the game, driving the progression of time and ensuring all systems remain synchronized.

Key responsibilities include:
- Managing the game state
- Executing the game loop via requestAnimationFrame
- Processing player actions
- Coordinating updates across all game systems
- Handling state persistence (saving and loading)
- Facilitating communication between systems via the Event Bus

The Game Engine implements a time-based update system that ensures consistent game progression across different devices and frame rates.

## Architecture

The Game Engine follows a centralized orchestrator pattern with time-based updates and an event-driven communication system.

### Core Classes and Interfaces

```typescript
export class GameEngine {
    // Core state and dependencies
    private state: GameState;
    public eventBus: EventBus;
    private systems: GameSystemManager;
    
    // Game loop management
    private lastTick: number;
    private isRunning: boolean;
    
    // Persistence
    private saveSystem: SaveSystem;
    
    // Methods for game management
    constructor()
    start()
    stop()
    dispatch(action: GameAction)
    getState(): GameState
    saveGame(): Promise<string>
    loadGame(): Promise<boolean>
    
    // Private implementation details
    private gameLoop()
    private tick(delta: number)
    private processAction(action: GameAction)
    private setupEventHandlers()
}
```

### Data Flow

The Game Engine manages data flow in the following way:

1. Game initialization:
   - Load saved game or create a new game state
   - Initialize all game systems
   - Start the game loop

2. Game loop execution:
   - Calculate time delta since last update
   - Update all game systems with current delta time
   - Emit state updates if state has changed
   
3. Action processing:
   - Receive actions from UI components
   - Pass actions to appropriate game systems
   - Update state based on action results
   - Emit state updates

4. State persistence:
   - Cache state in memory for in-app navigation
   - Periodically save state to persistent storage
   - Load state from persistent storage when needed

## Key Components

### Game Loop

The game loop is the core timing mechanism that drives the game:

```typescript
private gameLoop() {
    // Exit if we're no longer running
    if (!this.isRunning) {
        console.error("🛑 Game loop stopped: isRunning=false");
        return;
    }

    // Calculate time since last update
    const now = Date.now();
    const delta = (now - this.lastTick) / 1000; // Convert to seconds
    
    // Performance tracking for game loop
    const endMeasure = Logger.measure("Game loop cycle", LogCategory.PERFORMANCE);
    
    // Update game state
    this.tick(delta);
    
    // Remember when we did this update
    this.lastTick = now;
    
    // End performance measurement
    endMeasure();

    // Schedule the next update
    requestAnimationFrame(() => this.gameLoop());
}
```

The game loop:
1. Calculates the time delta since the last update
2. Updates all game systems with the current time delta
3. Schedules the next game loop iteration using requestAnimationFrame

This approach ensures:
- Updates occur at a rate appropriate for the device's capabilities
- Game progression is time-based rather than frame-rate-based
- Systems receive accurate time deltas for determining resource generation

### State Update Mechanism

The tick method handles updating the game state each frame:

```typescript
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
        // Cache the state whenever it changes
        cacheState(this.state);
        
        this.eventBus.emit('stateUpdated', this.state);
    }
}
```

This method:
1. Updates the game's timestamp
2. Passes the state to all game systems for updates
3. Only emits state updates when actual changes occur
4. Caches the state for persistence during navigation

### Action Processing

The Game Engine handles player actions through the action processing system:

```typescript
private processAction(action: GameAction) {
    // Determine the context based on action type
    let context = LogContext.NONE;
    // Context setup code...
    
    Logger.debug(LogCategory.ENGINE, `Processing action: ${action.type}`, context);
    
    // Pass the action to game systems and get updated state
    const updatedState = this.systems.processAction(this.state, action);
    
    // Update the internal state
    this.state = updatedState;
    
    // Cache the state for in-app navigation
    cacheState(this.state);
    
    // Notify that state has been updated
    this.eventBus.emit('stateUpdated', this.state);
}

// Public interface for dispatching actions
dispatch(action: GameAction) {
    this.eventBus.emit('DISPATCH_ACTION', action);
}
```

This system:
1. Routes actions to appropriate game systems
2. Updates the internal state with the results
3. Caches the updated state
4. Emits state update events to notify UI components

### State Persistence

The Game Engine handles saving and loading game state:

```typescript
public async saveGame(): Promise<string> {
    // Cache the state as we save
    cacheState(this.state);
    return await this.saveSystem.save(this.getState());
}

public async loadGame(): Promise<boolean> {
    const saveData = await this.saveSystem.load();
    
    if (!saveData) {
        return false;
    }
    
    // Replace current state with saved state
    this.state = saveData.state;
    
    // Cache the newly loaded state
    cacheState(this.state);
    
    // Notify about state update
    this.eventBus.emit('stateUpdated', this.state);
    
    // Start the game if not already running
    if (!this.isRunning) {
        this.start();
    }
    
    return true;
}
```

State persistence includes:
1. Saving state to persistent storage
2. Loading state from persistent storage
3. In-memory caching for navigation within the app
4. Notifications to UI when state is loaded

## Integration Points

The Game Engine integrates with almost every part of the application.

### Events Emitted

| Event Name | Data | Purpose |
|------------|------|---------|
| `stateUpdated` | `GameState` | Broadcast when game state changes |
| `DISPATCH_ACTION` | `GameAction` | Forward player actions to game systems |

### Events Consumed

| Event Name | Handler | Purpose |
|------------|---------|---------|
| `DISPATCH_ACTION` | `processAction` | Process player actions |

### System Integration

The Game Engine integrates with all game systems through the GameSystemManager:

```typescript
// Initialization
this.systems = new GameSystemManager(this.eventBus);

// Update cycle
this.systems.update(this.state, delta);

// Action processing
const updatedState = this.systems.processAction(this.state, action);
```

This architecture allows the Game Engine to coordinate all systems without detailed knowledge of their implementation.

## UI Components (if applicable)

While the Game Engine itself doesn't have direct UI components, it plays a critical role in updating the UI:

- **GameProvider**: Creates and manages the Game Engine instance
- **UI Components**: Receive state updates through the GameProvider context

## Configuration

Key configuration options for the Game Engine include:

| Configuration | Location | Purpose |
|---------------|----------|---------|
| Initial Game State | `initialGameState` | Default starting state for new games |
| Autosave Interval | `250ms` | Frequency of state autosaving |

## Examples

### Game Initialization

```typescript
// Creating and initializing the game engine
const engine = new GameEngine();
await engine.initialize();
```

### Action Dispatching

```typescript
// Dispatching a player action
engine.dispatch({
  type: 'CLICK_RESOURCE',
  payload: {
    category: 'reactor'
  }
});
```

### State Access

```typescript
// Getting the current game state
const currentState = engine.getState();
console.log(`Current energy: ${currentState.categories.reactor.resources.energy.amount}`);
```

## Future Considerations

1. **Performance Optimization**: As the game grows more complex, the JSON.stringify comparison for state changes may become expensive. Consider implementing a more efficient dirty-checking mechanism.

2. **Web Worker Support**: Move the Game Engine to a Web Worker to prevent UI blocking during intensive calculations.

3. **Crash Recovery**: Implement snapshot mechanism to recover from crashes or unexpected terminations.

4. **Cross-Device Synchronization**: Add support for cloud saves to enable playing across multiple devices.

5. **Time Manipulation**: Support for time acceleration or game speed controls could enhance player experience.

6. **Offline Support**: Enhance the persistence system to support fully offline operation as a Progressive Web App.

7. **Debugging Tools**: Add a debugging mode that provides insights into engine performance and state changes.

8. **Selective State Updates**: Rather than emitting the entire state, consider emitting only the changed portions to improve performance. 