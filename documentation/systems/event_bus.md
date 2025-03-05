# Event Bus System

## Overview

The Event Bus is a core communication system in Derelict Dawn Guide that enables different parts of the game to communicate without direct dependencies on each other. It implements a publish-subscribe (pub-sub) pattern, allowing game systems and UI components to broadcast events and register listeners for specific events.

The Event Bus serves as the backbone of the game's event-driven architecture, decoupling the various systems and ensuring that components can respond to game state changes without tightly coupled dependencies.

Key responsibilities include:
- Broadcasting events to registered listeners
- Managing event subscriptions
- Throttling state updates to prevent performance issues
- Ensuring proper React state updates through deep cloning

## Architecture

The Event Bus implements a classic observer pattern with a focus on performance optimization for React integration.

### Core Classes and Interfaces

```typescript
// The core callback type for event listeners
type EventCallback = (data: any) => void;

// The main EventBus class
export class EventBus {
    private listeners: Map<string, EventCallback[]>;
    private lastStateUpdateTime: number = 0;
    
    constructor() {
        this.listeners = new Map();
    }
    
    // Methods: emit, on
}
```

### Data Flow

The Event Bus manages data flow in the following way:

1. Components/systems register interest in specific events via the `on()` method
2. When an event occurs, the source calls `emit()` with event name and optional data
3. The EventBus notifies all registered listeners for that event
4. For state updates specifically:
   - Throttling is applied to prevent excessive updates
   - State data is deep-cloned to ensure React detects changes 
   - All registered listeners are called with the cloned state

## Key Components

### Event Registration

The `on()` method allows components to subscribe to specific events:

```typescript
on(event: string, callback: EventCallback) {
    // Log with appropriate context based on event type
    let context = LogContext.NONE;
    
    if (event === 'stateUpdated') {
        context = LogContext.UI_RENDER;
    }
    
    Logger.debug(LogCategory.EVENT_BUS, `Registering listener for event: "${event}"`, context);
    
    // Initialize listener array if it doesn't exist
    if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
    }
    
    // Add the callback to the listeners
    this.listeners.get(event)?.push(callback);
    
    const currentCount = this.listeners.get(event)?.length || 0;
    Logger.debug(LogCategory.EVENT_BUS, `Now have ${currentCount} listeners for event: "${event}"`, context);

    // Return a function to unsubscribe
    return () => {
        Logger.debug(LogCategory.EVENT_BUS, `Removing listener for event: "${event}"`, context);
        
        const callbacks = this.listeners.get(event) || [];
        this.listeners.set(
            event,
            callbacks.filter(cb => cb !== callback)
        );
        
        const newCount = this.listeners.get(event)?.length || 0;
        Logger.debug(LogCategory.EVENT_BUS, `Now have ${newCount} listeners for event: "${event}"`, context);
    };
}
```

This method:
1. Registers a callback for a specific event
2. Creates the event in the listeners map if it doesn't exist
3. Returns an unsubscribe function for cleanup
4. Logs detailed information about subscription activity

### Event Emission

The `emit()` method broadcasts events to all registered listeners:

```typescript
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
    
    // Determine context based on event type
    let context = LogContext.NONE;
    
    // Detect specific workflows based on event and data
    if (event === 'stateUpdated') {
        // Keep NONE context for general state updates
        context = LogContext.NONE;
    } else if (event === 'DISPATCH_ACTION' && data?.type) {
        // Set context based on action type
        if (data.type === 'CLICK_RESOURCE' && data.payload?.category === 'reactor') {
            context = LogContext.REACTOR_LIFECYCLE;
        } else if (data.type === 'CLICK_RESOURCE' && data.payload?.category === 'processor') {
            context = LogContext.PROCESSOR_LIFECYCLE;
        } else if (data.type === 'PURCHASE_UPGRADE') {
            context = LogContext.UPGRADE_PURCHASE;
        }
    }
    
    Logger.debug(LogCategory.EVENT_BUS, `Emitting event: "${event}"`, context);
    
    // Get all listeners for this event (or empty array if none)
    const callbacks = this.listeners.get(event) || [];
    
    if (callbacks.length === 0) {
        Logger.warn(LogCategory.EVENT_BUS, `No listeners registered for event: "${event}"`, context);
    } else {
        Logger.debug(LogCategory.EVENT_BUS, `Found ${callbacks.length} listeners for event: "${event}"`, context);
    }
    
    // When emitting state updates, clone the data to ensure React detects changes
    let dataToEmit = data;
    if (event === 'stateUpdated') {
        Logger.trace(LogCategory.EVENT_BUS, 'Deep copying state data before emitting', context);
        dataToEmit = JSON.parse(JSON.stringify(data));
    }
    
    // Call each listener with the event data
    callbacks.forEach(callback => callback(dataToEmit));
}
```

This method includes several key optimizations:
1. **Throttling**: State updates are limited to at most one every 50ms
2. **Context-Aware Logging**: Uses appropriate logging contexts based on event type
3. **Deep Cloning**: State updates are deep-cloned to ensure React detects changes
4. **Robust Handling**: Gracefully handles cases with no registered listeners

## Integration Points

The Event Bus is a central integration point for the entire application, touching almost every system.

### Events Emitted

The Event Bus itself doesn't originate events but facilitates their transmission. Key events in the system include:

| Event Name | Data | Purpose |
|------------|------|---------|
| `stateUpdated` | `GameState` | Broadcast when game state changes |
| `DISPATCH_ACTION` | `GameAction` | Signals player actions to be processed |
| Various system-specific events | Varies | Communication between systems |

### Events Consumed

While the Event Bus itself doesn't consume events, here are the primary consumers:

| Component | Events Consumed | Purpose |
|-----------|----------------|---------|
| GameProvider | `stateUpdated` | Updates React state with game changes |
| Game Systems | Various | Respond to game events |
| UI Components | Various | Update display based on game changes |

## UI Components (if applicable)

The Event Bus doesn't have direct UI components but plays a critical role in updating the UI:

- **GameProvider**: Subscribes to state updates to refresh the React context
- **All UI Components**: Benefit from state updates propagated through context

## Configuration

The Event Bus has minimal configuration but includes these key settings:

| Configuration | Default | Purpose |
|---------------|---------|---------|
| State update throttling | 50ms | Prevents excessive React re-renders |

## Examples

### Basic Event Subscription

```typescript
// In a React component's useEffect
useEffect(() => {
  // Subscribe to state updates
  const unsubscribe = gameEngine.eventBus.on('stateUpdated', (newState) => {
    setState(newState);
  });
  
  // Clean up subscription when component unmounts
  return () => {
    unsubscribe();
  };
}, []);
```

### Event Emission

```typescript
// In a game system
processPlayerAction(action) {
  // Process the action...
  
  // Notify other systems that state has changed
  this.eventBus.emit('stateUpdated', this.gameState);
  
  // Emit a specific event
  this.eventBus.emit('resourceCollected', {
    type: 'energy',
    amount: 10
  });
}
```

## Future Considerations

1. **Type Safety**: The current implementation uses `any` for event data. A future improvement could implement generic types for better type safety:

```typescript
type EventCallback<T> = (data: T) => void;
```

2. **Event Registry**: Creating an enumeration or registry of valid events could prevent errors from typos in event names.

3. **Advanced Throttling**: Different events might benefit from different throttling strategies. A more sophisticated approach could apply event-specific throttling.

4. **Performance Monitoring**: Adding instrumentation to measure event processing times and detect slow handlers.

5. **Selective Updates**: For state updates, implementing a diffing mechanism to only notify about relevant changes rather than broadcasting the entire state.

6. **Middleware Support**: Adding middleware capabilities to allow for cross-cutting concerns like logging, analytics, or debugging to be inserted into the event flow. 