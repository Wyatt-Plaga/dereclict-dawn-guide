# Memory Cache System

## Overview

The Memory Cache is a lightweight state persistence system designed to maintain game state during in-app navigation in Derelict Dawn Guide. This system provides immediate state availability when navigating between different views or pages of the application, preventing UI flicker and data loss during navigation.

Unlike the more robust SaveSystem which handles persistent storage, the Memory Cache focuses exclusively on maintaining state in memory for the current browser session, providing a fast and efficient way to preserve state during page transitions.

Key responsibilities include:
- Storing game state in memory during page navigation
- Providing immediate access to game state when returning to a page
- Preventing data loss during route changes
- Enhancing user experience by eliminating loading screens during navigation

## Architecture

The Memory Cache uses a simple module-level variable approach with window-level backup for improved resilience.

### Core Classes and Interfaces

```typescript
// No classes, uses module-level functions and variables
let cachedGameState: GameState | null = null;

export function getCachedState(): GameState | null {
  return cachedGameState;
}

export function cacheState(state: GameState): void {
  // Implementation
}
```

### Data Flow

The Memory Cache manages data flow in the following way:

1. When game state changes:
   - The Game Engine calls `cacheState()` to store a deep copy of the current state
   - The state is stored in both a module-level variable and the window object

2. When the application initializes:
   - The Game Engine calls `getCachedState()` to check for cached state
   - If available, the cached state is used to initialize the game
   - If not available, the game falls back to persistent storage or initial state

3. During in-app navigation:
   - The game state is preserved in memory
   - When returning to a game view, the cached state is immediately available
   - This prevents loading screens and maintains game continuity

## Key Components

### State Storage

The Memory Cache stores state in two locations for improved resilience:

```typescript
// In-memory store that persists between route changes
let cachedGameState: GameState | null = null;

// Window-level cache for improved resilience during development
if (typeof window !== 'undefined') {
  // @ts-ignore - Using a non-standard property
  if (window.__GAME_STATE_CACHE__) {
    // @ts-ignore
    cachedGameState = window.__GAME_STATE_CACHE__;
  }
}
```

This dual-storage approach provides:
1. Module-level caching for standard navigation scenarios
2. Window-level backup for more resilience during development and edge cases

### State Retrieval

The `getCachedState()` function provides access to the cached state:

```typescript
/**
 * Get the cached game state, if available
 */
export function getCachedState(): GameState | null {
  return cachedGameState;
}
```

This function is used by the Game Engine during initialization to check if a cached state is available before attempting to load from persistent storage.

### State Caching

The `cacheState()` function handles storing state in the memory cache:

```typescript
/**
 * Cache the current game state for quick access
 */
export function cacheState(state: GameState): void {
  // Store in module-level variable for in-app navigation
  cachedGameState = JSON.parse(JSON.stringify(state));
  
  // Also store in window object for more resilience
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__GAME_STATE_CACHE__ = JSON.parse(JSON.stringify(state));
  }
}
```

This function:
1. Creates a deep copy of the state to prevent reference issues
2. Stores the copy in the module-level variable
3. Also stores it in the window object for additional resilience

## Integration Points

The Memory Cache integrates primarily with the Game Engine but affects the entire application flow.

### Functions Exported

| Function | Parameters | Return | Purpose |
|----------|------------|--------|---------|
| `getCachedState` | None | `GameState \| null` | Retrieves cached state if available |
| `cacheState` | `state: GameState` | `void` | Stores state in memory cache |

### Components Using the Memory Cache

| Component | Function Used | Purpose |
|-----------|--------------|---------|
| Game Engine | `getCachedState` | Check for cached state during initialization |
| Game Engine | `cacheState` | Cache state during updates and navigation |
| Save System | `getCachedState` | Fallback for when persistent storage is unavailable |

## UI Components (if applicable)

The Memory Cache doesn't have direct UI components but significantly impacts the user experience:

- **Loading Screens**: Eliminates the need for loading screens during in-app navigation
- **Game Continuity**: Maintains game state during page transitions
- **UI Responsiveness**: Provides immediate state access for UI rendering

## Configuration

The Memory Cache has minimal configuration as it's designed to be simple and lightweight.

| Configuration | Default | Purpose |
|---------------|---------|---------|
| Deep Cloning | Always enabled | Prevents reference issues with cached state |

## Examples

### Checking for Cached State

```typescript
// In GameEngine constructor
constructor() {
  // Check for cached state from in-app navigation
  const cachedState = getCachedState();
  if (cachedState) {
    Logger.info(
      LogCategory.ENGINE, 
      "Using cached state from in-app navigation", 
      LogContext.STARTUP
    );
    this.state = JSON.parse(JSON.stringify(cachedState));
  } else {
    // Start with a fresh game state if no cached state
    this.state = JSON.parse(JSON.stringify(initialGameState));
  }
  
  // Rest of initialization...
}
```

### Caching State During Updates

```typescript
private tick(delta: number) {
  // Update game state...
  
  // Only emit state updates if something actually changed
  const currentState = JSON.stringify(this.state);
  if (currentState !== prevState) {
    // Cache the state whenever it changes
    cacheState(this.state);
    
    this.eventBus.emit('stateUpdated', this.state);
  }
}
```

## Future Considerations

1. **Size Limitations**: As the game state grows, consider implementing selective caching to reduce memory footprint.

2. **Expiration Mechanism**: Add a time-based expiration for cached state to prevent using extremely stale data.

3. **Compression**: For larger states, consider compressing the cached data to reduce memory usage.

4. **Session Storage Integration**: Consider using the browser's sessionStorage as an additional layer between memory and persistent storage.

5. **State Versioning**: Add version checking to ensure cached state is compatible with the current application version.

6. **Encrypted Cache**: For games with sensitive information, consider encrypting the cached state.

7. **Cache Invalidation**: Implement more sophisticated cache invalidation strategies for specific game events. 