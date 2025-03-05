# Resource System

## Overview

The Resource System is responsible for managing all resource-related operations in Derelict Dawn Guide. It handles the production, consumption, and limitation of the four primary resource types in the game: energy, insight, crew, and scrap. Think of it as the production department of the game that ensures resources are generated and consumed according to the game rules.

Key responsibilities include:
- Automatic resource production based on time elapsed
- Resource capacity enforcement
- Resource cost validation for upgrades and actions
- Resource consumption for various game actions

Each of the four game categories (reactor, processor, crew quarters, manufacturing) has its own resource type and production mechanics, which the Resource System manages in a consistent way while honoring their individual mechanics.

## Architecture

The Resource System implements a time-based production approach with direct state mutation.

### Core Classes and Interfaces

```typescript
export class ResourceSystem {
  // Core update method
  update(state: GameState, delta: number)
  
  // Resource validation and consumption
  hasResources(state: GameState, costs: { type: string, amount: number }[]): boolean
  consumeResources(state: GameState, costs: { type: string, amount: number }[]): boolean
  
  // Private update methods for each resource category
  private updateReactor(state: GameState, delta: number)
  private updateProcessor(state: GameState, delta: number)
  private updateCrewQuarters(state: GameState, delta: number)
  private updateManufacturing(state: GameState, delta: number)
}
```

### Data Flow

The Resource System manages data flow in the following way:

1. Production cycle:
   - For each game tick, the `update` method is called with the current state and time delta
   - Each category's resource is updated based on its production rate and the time passed
   - Resources are capped at their respective capacities

2. Resource consumption:
   - When actions require resources, the `hasResources` method validates resource availability
   - If resources are available, the `consumeResources` method deducts them from the state
   - Failed resource checks prevent actions from executing

3. Resource caps:
   - All resources have capacity limits determined by the corresponding category's stats
   - Production automatically enforces these limits
   - The UI reflects these limits to inform player decisions

## Key Components

### Main Update Loop

The central `update` method manages all resource production:

```typescript
update(state: GameState, delta: number) {
  this.updateReactor(state, delta);
  this.updateProcessor(state, delta);
  this.updateCrewQuarters(state, delta);
  this.updateManufacturing(state, delta);
}
```

This method:
1. Takes the current game state and time delta as parameters
2. Calls specialized update methods for each resource category
3. Ensures all resources are updated consistently for each game tick

### Category-Specific Production

Each resource category has its own update method with specialized production logic:

#### Reactor (Energy)

```typescript
private updateReactor(state: GameState, delta: number) {
  const reactor = state.categories.reactor;
  const energyProduced = reactor.stats.energyPerSecond * delta;
  
  // Only process if there's actual production
  if (energyProduced > 0) {
    // Add resources but don't exceed capacity
    reactor.resources.energy = Math.min(
      reactor.resources.energy + energyProduced,
      reactor.stats.energyCapacity
    );
  }
}
```

The reactor update:
1. Calculates energy production based on time delta
2. Adds the produced energy to the current amount
3. Caps energy at the reactor's capacity

#### Processor (Insight)

```typescript
private updateProcessor(state: GameState, delta: number) {
  const processor = state.categories.processor;
  const insightProduced = processor.stats.insightPerSecond * delta;
  
  if (insightProduced > 0) {
    processor.resources.insight = Math.min(
      processor.resources.insight + insightProduced,
      processor.stats.insightCapacity
    );
  }
}
```

The processor follows a similar pattern for insight production.

#### Crew Quarters (Crew)

```typescript
private updateCrewQuarters(state: GameState, delta: number) {
  const crewQuarters = state.categories.crewQuarters;
  const awakeningProgressPerSecond = crewQuarters.stats.crewPerSecond;
  const progressAdded = awakeningProgressPerSecond * delta;
  
  if (progressAdded > 0 && crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
    // Add progress
    crewQuarters.stats.awakeningProgress += progressAdded;
    
    // Check if we've reached the threshold to add crew
    while (crewQuarters.stats.awakeningProgress >= 10 && crewQuarters.resources.crew < crewQuarters.stats.crewCapacity) {
      // Add one crew member
      crewQuarters.resources.crew = Math.min(
        crewQuarters.resources.crew + 1,
        crewQuarters.stats.crewCapacity
      );
      
      // Subtract 10 from progress
      crewQuarters.stats.awakeningProgress -= 10;
    }
    
    // Cap awakening progress at 10
    crewQuarters.stats.awakeningProgress = Math.min(crewQuarters.stats.awakeningProgress, 10);
  }
}
```

Crew production is unique:
1. It accumulates "awakening progress" over time
2. When progress reaches 10, a new crew member is added
3. Multiple crew members can be awakened in a single update if enough progress accumulates

#### Manufacturing (Scrap)

```typescript
private updateManufacturing(state: GameState, delta: number) {
  const manufacturing = state.categories.manufacturing;
  const scrapProduced = manufacturing.stats.scrapPerSecond * delta;
  
  if (scrapProduced > 0) {
    manufacturing.resources.scrap = Math.min(
      manufacturing.resources.scrap + scrapProduced,
      manufacturing.stats.scrapCapacity
    );
  }
}
```

Manufacturing follows the standard production pattern for scrap resources.

### Resource Validation

The `hasResources` method checks if resources are available for costs:

```typescript
hasResources(state: GameState, costs: { type: string, amount: number }[]): boolean {
  for (const cost of costs) {
    const { type, amount } = cost;
    
    // Skip if no cost
    if (amount <= 0) continue;
    
    // Check resource type and amount
    switch (type) {
      case 'energy':
        if (state.categories.reactor.resources.energy < amount) {
          return false;
        }
        break;
      case 'insight':
        if (state.categories.processor.resources.insight < amount) {
          return false;
        }
        break;
      case 'crew':
        if (state.categories.crewQuarters.resources.crew < amount) {
          return false;
        }
        break;
      case 'scrap':
        if (state.categories.manufacturing.resources.scrap < amount) {
          return false;
        }
        break;
      default:
        return false;
    }
  }
  
  return true;
}
```

This method:
1. Takes an array of resource costs to check
2. Iterates through each cost and validates the corresponding resource
3. Returns false if any resource is insufficient
4. Returns true only if all resources are available

### Resource Consumption

The `consumeResources` method deducts costs from available resources:

```typescript
consumeResources(state: GameState, costs: { type: string, amount: number }[]): boolean {
  // First check if we have enough resources
  if (!this.hasResources(state, costs)) {
    return false;
  }
  
  // Then consume the resources
  for (const cost of costs) {
    const { type, amount } = cost;
    
    // Skip if no cost
    if (amount <= 0) continue;
    
    // Consume resource
    switch (type) {
      case 'energy':
        state.categories.reactor.resources.energy -= amount;
        break;
      case 'insight':
        state.categories.processor.resources.insight -= amount;
        break;
      case 'crew':
        state.categories.crewQuarters.resources.crew -= amount;
        break;
      case 'scrap':
        state.categories.manufacturing.resources.scrap -= amount;
        break;
      default:
        return false;
    }
  }
  
  return true;
}
```

This method:
1. First validates that all resources are available
2. Then iterates through costs and deducts each from the appropriate resource
3. Returns true if consumption was successful
4. Includes detailed logging for debugging resource consumption

## Integration Points

The Resource System integrates with several other systems in the game.

### Methods Exposed

| Method | Purpose |
|--------|---------|
| `update(state, delta)` | Updates all resources based on time passed |
| `hasResources(state, costs)` | Checks if resources are available for costs |
| `consumeResources(state, costs)` | Deducts costs from available resources |

### Systems Using Resource System

| System | Methods Used | Purpose |
|--------|-------------|---------|
| Game Engine | `update` | Resource production during game ticks |
| Upgrade System | `hasResources`, `consumeResources` | Resource costs for upgrades |
| Action System | `hasResources`, `consumeResources` | Resource costs for player actions |
| Combat System | `hasResources`, `consumeResources` | Resource costs for combat actions |

## UI Components (if applicable)

While the Resource System doesn't have direct UI components, it affects the following UI elements:

- **Resource Displays**: Shows current resource amounts and capacities
- **Upgrade Buttons**: Availability depends on resource checks
- **Action Buttons**: Enabled/disabled based on resource availability
- **Progress Bars**: Visualize resource amounts relative to capacity

## Configuration

The Resource System's behavior is determined by stats defined in the game state:

| Configuration | Location | Purpose |
|---------------|----------|---------|
| Production Rates | `category.stats.*PerSecond` | Controls resource generation speed |
| Resource Capacities | `category.stats.*Capacity` | Sets maximum storage for each resource |
| Crew Awakening Threshold | `10` (hardcoded) | Points needed to awaken one crew member |

## Examples

### Resource Production

```typescript
// In Game Engine tick method
update(state, delta) {
  // Update all resources based on production rates
  this.resourceSystem.update(state, delta);
  
  // This will automatically generate:
  // - Energy based on energyPerSecond
  // - Insight based on insightPerSecond
  // - Crew based on crewPerSecond (awakening progress)
  // - Scrap based on scrapPerSecond
}
```

### Resource Consumption

```typescript
// Attempting to purchase an upgrade
const upgradeCost = [
  { type: 'energy', amount: 50 },
  { type: 'insight', amount: 25 }
];

if (resourceSystem.hasResources(state, upgradeCost)) {
  // Resources are available, proceed with purchase
  if (resourceSystem.consumeResources(state, upgradeCost)) {
    // Resources consumed successfully, apply upgrade
    // ...
  }
}
```

## Future Considerations

1. **Resource Exchange**: Consider adding a system for converting between resource types with exchange rates.

2. **Resource Decay**: For balance, consider implementing resource decay for some categories to prevent unlimited stockpiling.

3. **Resource Visibility**: Add a configuration option to hide resources that aren't yet relevant to the player's progression.

4. **Fractional Resources**: The current implementation supports fractional resources internally but displays integers to players. Consider standardizing this approach.

5. **Resource Forecasting**: Add methods to predict future resource levels based on current production rates.

6. **Dynamic Resource Capacity**: Consider allowing temporary resource capacity boosts as special abilities or event outcomes.

7. **Specialized Resource Types**: The system could be extended to handle specialized resources for late-game content.

8. **Resource Events**: Implement random events that temporarily boost or reduce resource production rates. 