# Derelict Dawn Guide - Improvement Recommendations

This document outlines key recommendations for improving the Derelict Dawn Guide codebase based on insights gathered during the documentation process. Each recommendation includes implementation details and expected benefits.

## Priority Recommendations

1. [Standardized System Interfaces](#1-standardized-system-interfaces) - **High Priority**
2. [Mediator Pattern Enhancement](#2-mediator-pattern-enhancement) - **High Priority** 
3. [Context Splitting](#3-context-splitting) - **Medium Priority**
4. [Custom Hooks Library](#4-custom-hooks-library) - **Medium Priority**
5. [Centralized Configuration](#5-centralized-configuration) - **Medium Priority**

Additional recommendations include [Performance Optimizations](#performance-optimizations), [Testing Infrastructure](#testing-infrastructure), [Code Structure Improvements](#code-structure-improvements), and [Accessibility Enhancements](#accessibility-enhancements).

---

## 1. Standardized System Interfaces

### Problem
Game systems (ResourceSystem, CombatSystem, etc.) follow similar patterns but lack a formal shared interface, creating inconsistencies in how systems are initialized, updated, and integrated.

### Solution
Implement a formal `IGameSystem` interface that all systems implement:

```typescript
export interface IGameSystem {
  // Identity and dependencies
  readonly id: string;
  readonly dependencies: string[];
  
  // Lifecycle methods
  initialize(state: GameState): Promise<void>;
  update(deltaTime: number, state: GameState): void;
  cleanup(): void;
  
  // State and event handling
  handleAction(action: GameAction, state: GameState): boolean;
  registerEventHandlers(eventBus: EventBus): void;
  
  // State access for UI components
  getPublicState<T>(state: GameState): T;
}
```

Create a `BaseSystem` abstract class:

```typescript
abstract class BaseSystem implements IGameSystem {
  protected eventBus: EventBus;
  readonly id: string;
  readonly dependencies: string[] = [];
  
  constructor(id: string, eventBus: EventBus) {
    this.id = id;
    this.eventBus = eventBus;
  }
  
  // Default implementations with hooks for subclasses
  // ...
}
```

### Implementation Steps
1. Define the interface and base class in `app/game/core/BaseSystem.ts`
2. Refactor one system (e.g., ResourceSystem) to implement the interface
3. Adapt the GameEngine to support the new pattern
4. Progressively refactor remaining systems

### Benefits
- Consistent API across all systems
- Clear dependency management
- Simplified engine implementation
- Improved testability
- Better documentation and type safety

---

## 2. Mediator Pattern Enhancement

### Problem
The Action System acts as an informal mediator, but action routing uses conditional checks rather than a formal registration mechanism.

### Solution
Enhance the Action System to become a formal mediator with a registration system:

```typescript
export class ActionSystem extends BaseSystem {
  private actionHandlers: Map<string, Set<{
    handler: (action: GameAction, state: GameState) => boolean,
    systemId: string
  }>> = new Map();
  
  // Register a handler for a specific action type
  registerHandler<T extends GameAction>(
    actionType: string, 
    handler: (action: T, state: GameState) => boolean,
    systemId: string
  ): void {
    if (!this.actionHandlers.has(actionType)) {
      this.actionHandlers.set(actionType, new Set());
    }
    
    this.actionHandlers.get(actionType)?.add({
      handler: handler as any,
      systemId
    });
  }
  
  // Process an action by delegating to registered handlers
  handleAction(action: GameAction, state: GameState): boolean {
    const handlers = this.actionHandlers.get(action.type);
    
    if (!handlers || handlers.size === 0) {
      return false;
    }
    
    let handled = false;
    for (const { handler, systemId } of handlers) {
      try {
        const result = handler(action, state);
        handled = result || handled;
      } catch (error) {
        console.error(`Error in handler for ${action.type} in ${systemId}:`, error);
      }
    }
    
    return handled;
  }
}
```

### Implementation Steps
1. Enhance the ActionSystem with the registration mechanism
2. Update one system to use the new registration pattern
3. Create strongly typed action interfaces
4. Refactor remaining systems

### Benefits
- Clear separation of concerns
- Formal registration mechanism
- Type safety for action handlers
- Improved discoverability of available actions
- Better error handling

---

## 3. Context Splitting

### Problem
The GameProvider creates a single React context containing the entire game state, causing unnecessary re-renders when unrelated parts of the state change.

### Solution
Split the monolithic context into smaller, more focused contexts:

```typescript
// Core contexts
const GameEngineContext = createContext<GameEngine | null>(null);
const GameDispatchContext = createContext<((action: GameAction) => void) | null>(null);

// Domain-specific contexts
const ResourceContext = createContext<ResourceState | null>(null);
const CombatContext = createContext<CombatState | null>(null);
const LogContext = createContext<LogState | null>(null);
const PlayerContext = createContext<PlayerState | null>(null);
const UpgradeContext = createContext<UpgradeState | null>(null);
```

Create a nested provider structure:

```tsx
export function GameProviders({ children }: { children: ReactNode }) {
  // Initialize engine and core state
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(() => getCachedState() || engine.getState());
  
  // Create a stable dispatch function
  const dispatch = useCallback((action: GameAction) => {
    engine.dispatch(action);
  }, [engine]);
  
  // Extract domain-specific state with memoization
  const resourceState = useMemo(() => ({
    categories: state.categories,
    resources: extractResourceData(state)
  }), [state.categories]);
  
  const combatState = useMemo(() => state.combat, [state.combat]);
  const logState = useMemo(() => state.logs, [state.logs]);
  // Other state slices...
  
  return (
    <GameEngineContext.Provider value={engine}>
      <GameDispatchContext.Provider value={dispatch}>
        <ResourceContext.Provider value={resourceState}>
          <CombatContext.Provider value={combatState}>
            <LogContext.Provider value={logState}>
              {/* Other providers... */}
              {children}
            </LogContext.Provider>
          </CombatContext.Provider>
        </ResourceContext.Provider>
      </GameDispatchContext.Provider>
    </GameEngineContext.Provider>
  );
}
```

Create custom hooks for each context:

```typescript
export function useResources() {
  const context = useContext(ResourceContext);
  if (!context) throw new Error('useResources must be used within GameProviders');
  return context;
}

// Maintain backward compatibility
export function useGame() {
  // Reconstruct the original state shape from separate contexts
  // ...
}
```

### Implementation Steps
1. Define context slices and create contexts
2. Implement the nested provider structure
3. Create specialized hooks for each context
4. Maintain the original useGame hook for backward compatibility
5. Update components to use the specific hooks they need

### Benefits
- Components only re-render when relevant data changes
- More explicit state dependencies
- Better type safety
- Improved performance for complex UIs
- Maintained backward compatibility

---

## 4. Custom Hooks Library

### Problem
Components often implement similar state access and action dispatch patterns, leading to code duplication and inconsistencies.

### Solution
Create a standardized library of custom hooks for common patterns:

#### Resource Hooks
```typescript
export function useResourceValue(category: string, resource: string) {
  const { categories } = useResources();
  return categories[category].resources[resource];
}

export function useResourceProduction(category: string, resource: string) {
  const { categories } = useResources();
  return categories[category].stats[`${resource}PerSecond`];
}
```

#### UI Effect Hooks
```typescript
export function useFlickerEffect(shouldFlicker: boolean, interval = 500) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (!shouldFlicker) {
      setVisible(true);
      return;
    }
    
    const timer = setInterval(() => {
      setVisible(v => !v);
    }, interval);
    
    return () => clearInterval(timer);
  }, [shouldFlicker, interval]);
  
  return visible;
}
```

#### Region Styling Hooks
```typescript
export function useRegionStyles(region: string) {
  return useMemo(() => {
    switch (region) {
      case 'void':
        return {
          background: 'bg-slate-900',
          text: 'text-slate-200',
          shadow: 'shadow-slate-800/30'
        };
      case 'nebula':
        return {
          background: 'bg-indigo-950',
          text: 'text-indigo-200',
          shadow: 'shadow-indigo-800/30'
        };
      // Other regions...
    }
  }, [region]);
}
```

#### Action Hooks
```typescript
export function useResourceAction(category: string) {
  const dispatch = useGameDispatch();
  
  return useCallback(() => {
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: { category }
    });
  }, [dispatch, category]);
}

export function useUpgradeAction(category: string, upgradeType: string) {
  const dispatch = useGameDispatch();
  
  return useCallback(() => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { category, upgradeType }
    });
  }, [dispatch, category, upgradeType]);
}
```

#### Combat Hooks
```typescript
export function useCombatActions(category: string) {
  const combat = useCombat();
  const dispatch = useGameDispatch();
  
  const actions = useMemo(() => 
    combat.availableActions.filter(a => a.category === category),
    [combat.availableActions, category]
  );
  
  const performAction = useCallback((actionId: string) => {
    dispatch({
      type: 'PERFORM_COMBAT_ACTION',
      payload: { actionId }
    });
  }, [dispatch]);
  
  return { actions, performAction };
}
```

### Implementation Steps
1. Create a hooks directory structure by domain
2. Implement and document core hooks
3. Create tests for hooks
4. Gradually refactor components to use hooks

### Benefits
- Reduced code duplication
- Consistent patterns
- Better separation of concerns
- Improved testability
- Simplified component implementation

---

## 5. Centralized Configuration

### Problem
Configuration values are scattered throughout the codebase as hardcoded values, making it difficult to balance the game and maintain consistency.

### Solution
Create a centralized configuration system with domain-specific configurations:

```typescript
// Main configuration structure
export interface GameConfig {
  // Core game settings
  core: {
    tickRate: number;
    savePeriod: number;
  };
  
  // Resource-related configuration
  resources: {
    baseProduction: Record<GameCategory, Record<string, number>>;
    baseCapacities: Record<GameCategory, Record<string, number>>;
    clickValues: Record<GameCategory, Record<string, number>>;
  };
  
  // Combat settings
  combat: {
    playerBaseStats: {
      health: number;
      shield: number;
    };
    actionCooldowns: Record<string, number>;
    enemyScalingFactors: {
      healthPerDifficulty: number;
      damagePerDifficulty: number;
    };
  };
  
  // Encounter settings
  encounters: {
    regionProbabilities: Record<Region, RegionProbabilities>;
    encounterFrequency: number;
  };
  
  // UI settings
  ui: {
    animationDurations: Record<string, number>;
    regionStyles: Record<Region, RegionStyle>;
  };
}
```

Create configuration files for different domains:

```typescript
// config/resources.ts
export const resourceConfig: ResourceConfig = {
  baseProduction: {
    reactor: {
      energy: 0.5,
      materials: 0.2
    },
    processor: {
      data: 0.3
    },
    // Other categories...
  },
  baseCapacities: {
    reactor: {
      energy: 100,
      materials: 50
    },
    // Other capacities...
  },
  // Other resource settings...
};
```

Make configuration available through the Game Engine:

```typescript
export class GameEngine {
  private config: GameConfig;
  
  constructor(customConfig?: Partial<GameConfig>) {
    // Load configuration
    this.config = {
      ...defaultConfig,
      ...customConfig
    };
  }
  
  getConfig(): GameConfig {
    return this.config;
  }
  
  // Rest of implementation...
}
```

Use configuration in systems:

```typescript
export class ResourceSystem extends BaseSystem {
  initialize(state: GameState): Promise<void> {
    const config = this.engine.getConfig().resources;
    
    // Initialize resources from config
    Object.entries(config.baseProduction).forEach(([category, resources]) => {
      Object.entries(resources).forEach(([resource, rate]) => {
        state.categories[category].stats[`${resource}PerSecond`] = rate;
      });
    });
    
    // Similar for capacities and other settings...
    
    return Promise.resolve();
  }
}
```

### Implementation Steps
1. Define configuration interfaces
2. Create configuration files for each domain
3. Integrate configuration with the Game Engine
4. Update systems to use configuration values
5. Add environment-specific configurations

### Benefits
- Single source of truth for game parameters
- Easier game balancing
- Support for different configurations in different environments
- Clear separation of configuration from code
- Simplified testing with configuration overrides

---

## Performance Optimizations

### Memoized Selectors
Implement memoized selectors for derived state using `useMemo` or a library like Reselect:

```typescript
export function useResourceStats() {
  const resources = useResources();
  
  return useMemo(() => {
    const stats = {
      totalEnergyProduction: 0,
      totalMaterialsProduction: 0,
      // Other derived stats...
    };
    
    // Calculate derived stats
    stats.totalEnergyProduction = 
      resources.categories.reactor.stats.energyPerSecond + 
      resources.categories.processor.stats.energyPerSecond;
    
    // More calculations...
    
    return stats;
  }, [resources]);
}
```

### React.memo for Components
Apply `React.memo` to components that render frequently but rarely change:

```typescript
const ResourceDisplay = React.memo(function ResourceDisplay({ 
  resource, 
  production, 
  capacity 
}: ResourceDisplayProps) {
  // Component implementation...
});
```

### Virtualized Lists
Use virtualization for long lists like logs or inventory items:

```tsx
import { FixedSizeList } from 'react-window';

function LogList({ logs }) {
  return (
    <FixedSizeList
      height={400}
      width="100%"
      itemCount={logs.length}
      itemSize={60}
    >
      {({ index, style }) => (
        <LogEntry 
          log={logs[index]} 
          style={style} 
        />
      )}
    </FixedSizeList>
  );
}
```

---

## Testing Infrastructure

### Unit Testing Core Systems
```typescript
// __tests__/systems/ResourceSystem.test.ts
describe('ResourceSystem', () => {
  let system: ResourceSystem;
  let mockState: GameState;
  let mockEventBus: EventBus;
  
  beforeEach(() => {
    mockEventBus = new EventBus();
    system = new ResourceSystem(mockEventBus);
    mockState = createMockGameState();
  });
  
  test('should initialize resources correctly', async () => {
    await system.initialize(mockState);
    
    expect(mockState.categories.reactor.resources.energy.amount).toBe(0);
    expect(mockState.categories.reactor.stats.energyCapacity).toBe(100);
  });
  
  test('should handle CLICK_RESOURCE action', () => {
    const action: ClickResourceAction = {
      type: 'CLICK_RESOURCE',
      payload: { category: 'reactor' }
    };
    
    const handled = system.handleAction(action, mockState);
    
    expect(handled).toBe(true);
    expect(mockState.categories.reactor.resources.energy.amount).toBeGreaterThan(0);
  });
});
```

### Component Testing
```typescript
// __tests__/components/ResourceDisplay.test.tsx
import { render, screen } from '@testing-library/react';
import { ResourceDisplay } from '../../components/ResourceDisplay';
import { GameProviders } from '../../game/GameProviders';

describe('ResourceDisplay', () => {
  test('renders resource information correctly', () => {
    const mockResource = {
      amount: 50,
      capacity: 100
    };
    
    render(
      <GameProviders>
        <ResourceDisplay 
          resource={mockResource} 
          production={5} 
          capacity={100} 
          name="Energy" 
        />
      </GameProviders>
    );
    
    expect(screen.getByText(/50\/100/)).toBeInTheDocument();
    expect(screen.getByText(/\+5\/s/)).toBeInTheDocument();
  });
});
```

---

## Code Structure Improvements

### Feature-Based Organization
Reorganize code around features rather than technical concerns:

```
app/
  features/
    resources/
      components/
      hooks/
      actions.ts
      types.ts
    combat/
      components/
      hooks/
      actions.ts
      types.ts
    logs/
      components/
      hooks/
      actions.ts
      types.ts
  core/
    engine/
    systems/
    events/
  ui/
    common/
    layout/
    theme/
```

### Component Abstraction
Extract common patterns into reusable components:

```tsx
function RegionPanel({ region, children, className = '' }) {
  const styles = useRegionStyles(region);
  
  return (
    <div className={`panel ${styles.background} ${styles.text} ${className}`}>
      {children}
    </div>
  );
}

// Usage
function EncounterDisplay({ encounter }) {
  return (
    <RegionPanel region={encounter.region} className="p-4 mb-4">
      <h3>{encounter.name}</h3>
      <p>{encounter.description}</p>
    </RegionPanel>
  );
}
```

---

## Accessibility Enhancements

### Keyboard Navigation
```tsx
function ActionButton({ action, onSelect }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelect(action.id);
      e.preventDefault();
    }
  };
  
  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={() => onSelect(action.id)}
      onKeyDown={handleKeyDown}
      className="action-button"
      aria-label={`Perform action: ${action.name}`}
    >
      <span>{action.name}</span>
      <span>{action.cost} energy</span>
    </div>
  );
}
```

### Screen Reader Support
```tsx
function ResourceStatus({ resource, capacity, production }) {
  const percentage = Math.round((resource / capacity) * 100);
  
  return (
    <div className="resource-status">
      <div 
        role="progressbar"
        aria-valuenow={resource}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={`${resource} of ${capacity} energy, ${percentage}% full`}
      >
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="resource-info">
        <span>{resource}/{capacity}</span>
        <span aria-label={`Producing ${production} per second`}>
          +{production}/s
        </span>
      </div>
    </div>
  );
}
```

---

## Implementation Plan

### Phase 1: Foundation (1-2 weeks)
- Implement Standardized System Interfaces
- Create Centralized Configuration

### Phase 2: Performance (2-3 weeks)
- Implement Context Splitting
- Create Custom Hooks Library

### Phase 3: Architecture (2-3 weeks)
- Enhance Mediator Pattern
- Improve Code Structure

### Phase 4: Quality & Accessibility (Ongoing)
- Add Testing Infrastructure
- Implement Accessibility Enhancements
- Add Performance Optimizations

## Success Metrics

- **Reduced Bundle Size**: Measure the impact of code restructuring on bundle size
- **Improved Performance**: Track component render counts and render times
- **Developer Experience**: Survey developers on code clarity and maintainability
- **Accessibility Compliance**: Test against WCAG 2.1 AA standards
- **Test Coverage**: Increase test coverage to at least 80% 