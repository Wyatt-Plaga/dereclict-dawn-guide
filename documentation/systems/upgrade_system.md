# Upgrade System

## Overview

The Upgrade System is responsible for managing all upgrade-related operations in Derelict Dawn Guide. It handles purchasing upgrades, calculating costs, and updating game stats based on upgrade levels. Think of it as the R&D department that improves your capabilities throughout the game.

Key responsibilities include:
- Processing upgrade purchases 
- Validating resource availability for upgrades
- Calculating upgrade costs based on current state
- Updating game stats based on upgrade levels
- Enforcing upgrade limits and prerequisites

Each of the four game categories (reactor, processor, crew quarters, manufacturing) has its own set of upgrades, with each upgrade affecting different aspects of gameplay.

## Architecture

The Upgrade System implements a direct state mutation approach with category-specific upgrade handlers.

### Core Classes and Interfaces

```typescript
export class UpgradeSystem {
  // Main purchase method
  purchaseUpgrade(state: GameState, category: GameCategory, upgradeType: string): boolean
  
  // Category-specific purchase methods
  private purchaseReactorUpgrade(state: GameState, upgradeType: string): boolean
  private purchaseProcessorUpgrade(state: GameState, upgradeType: string): boolean
  private purchaseCrewQuartersUpgrade(state: GameState, upgradeType: string): boolean
  private purchaseManufacturingUpgrade(state: GameState, upgradeType: string): boolean
  
  // Stats update methods
  updateAllStats(state: GameState): void
  private updateReactorStats(state: GameState): void
  private updateProcessorStats(state: GameState): void
  private updateCrewQuartersStats(state: GameState): void
  private updateManufacturingStats(state: GameState): void
  
  // Cost calculation methods
  calculateReactorExpansionCost(energyCapacity: number): number
  calculateEnergyConverterCost(currentConverters: number): number
  calculateMainframeExpansionCost(insightCapacity: number): number
  // ... and other cost calculation methods
}
```

### Data Flow

The Upgrade System manages data flow in the following way:

1. Purchase initiation:
   - A user action triggers the main `purchaseUpgrade` method
   - The method routes to category-specific handlers based on the upgrade type

2. Purchase validation and execution:
   - The category-specific handler calculates the cost of the upgrade
   - It checks if enough resources are available
   - If resources are sufficient, it deducts the cost and increments the upgrade level
   - It then updates all affected stats based on the new upgrade level

3. Stats updates:
   - Each category's stats are updated through dedicated update methods
   - These update methods recalculate all derived stats based on current upgrade levels
   - The updates affect resource capacities and production rates

## Key Components

### Main Purchase Handler

The central `purchaseUpgrade` method routes upgrade requests:

```typescript
purchaseUpgrade(state: GameState, category: GameCategory, upgradeType: string): boolean {
  switch (category) {
    case 'reactor':
      return this.purchaseReactorUpgrade(state, upgradeType);
    case 'processor':
      return this.purchaseProcessorUpgrade(state, upgradeType);
    case 'crewQuarters':
      return this.purchaseCrewQuartersUpgrade(state, upgradeType);
    case 'manufacturing':
      return this.purchaseManufacturingUpgrade(state, upgradeType);
    default:
      Logger.warn(LogCategory.UPGRADES, `Unknown category: ${category}`, LogContext.UPGRADE_PURCHASE);
      return false;
  }
}
```

This method:
1. Takes the game state, category, and upgrade type
2. Routes to the category-specific purchase handler
3. Returns whether the purchase was successful

### Category-Specific Purchase Handlers

Each category has its own purchase handler with upgrade-specific logic:

#### Reactor Upgrades

```typescript
private purchaseReactorUpgrade(state: GameState, upgradeType: string): boolean {
  const reactor = state.categories.reactor;
  
  switch (upgradeType) {
    case 'reactorExpansions':
      // Calculate cost using the utility method
      const expansionCost = this.calculateReactorExpansionCost(reactor.stats.energyCapacity);
      
      if (reactor.resources.energy >= expansionCost) {
        // Deduct cost
        reactor.resources.energy -= expansionCost;
        
        // Increment upgrade
        reactor.upgrades.reactorExpansions += 1;
        
        // Update stats
        this.updateReactorStats(state);
        
        return true;
      }
      return false;
      
    case 'energyConverters':
      // Similar logic for energy converters
      // ...
  }
}
```

All purchase handlers follow a similar pattern:
1. Calculate the cost of the upgrade
2. Check if enough resources are available
3. If resources are sufficient, deduct the cost and apply the upgrade
4. Update stats based on the new upgrade level
5. Return success or failure

### Stats Update Methods

The stats update methods recalculate derived values based on upgrade levels:

```typescript
private updateReactorStats(state: GameState): void {
  const reactor = state.categories.reactor;
  
  // Calculate energy capacity based on expansions
  // Base capacity = 100, each expansion adds 50% more
  reactor.stats.energyCapacity = ReactorConstants.BASE_ENERGY_CAPACITY * 
    Math.pow(ReactorConstants.ENERGY_CAPACITY_MULTIPLIER, reactor.upgrades.reactorExpansions);
  
  // Calculate energy production based on converters
  // Each converter adds 1 energy per second
  reactor.stats.energyPerSecond = reactor.upgrades.energyConverters * ReactorConstants.ENERGY_PER_CONVERTER;
}
```

Each update method:
1. Accesses the category from the game state
2. Recalculates capacity values based on storage upgrades
3. Recalculates production rates based on production upgrades
4. Uses constants from game configuration for base values and multipliers

### Cost Calculation Methods

The system provides utility methods to calculate costs for each upgrade type:

```typescript
calculateReactorExpansionCost(energyCapacity: number): number {
  return energyCapacity * ReactorConstants.EXPANSION_COST_MULTIPLIER;
}

calculateEnergyConverterCost(currentConverters: number): number {
  return (currentConverters + 1) * ReactorConstants.CONVERTER_COST_BASE;
}
```

These methods:
1. Take current levels or capacities as input
2. Apply formulas based on game constants
3. Return the calculated cost for the upgrade

## Upgrade Categories and Types

### Reactor Upgrades

| Upgrade | Effect | Cost Calculation |
|---------|--------|------------------|
| Reactor Expansions | Increases energy capacity by 50% per level | `energyCapacity * EXPANSION_COST_MULTIPLIER` |
| Energy Converters | Adds +1 energy/sec per level | `(currentConverters + 1) * CONVERTER_COST_BASE` |

### Processor Upgrades

| Upgrade | Effect | Cost Calculation |
|---------|--------|------------------|
| Mainframe Expansions | Increases insight capacity by 50% per level | `insightCapacity * EXPANSION_COST_MULTIPLIER` |
| Processing Threads | Adds +0.2 insight/sec per level | `(currentThreads + 1) * THREAD_COST_BASE` |

### Crew Quarters Upgrades

| Upgrade | Effect | Cost Calculation |
|---------|--------|------------------|
| Additional Quarters | Adds +3 crew capacity per level | `crewCapacity * QUARTERS_COST_MULTIPLIER` |
| Worker Crews | Adds +1.0 awakening progress/sec per level (max 5) | `(currentWorkerCrews + 1) * WORKER_CREW_COST_BASE` |

### Manufacturing Upgrades

| Upgrade | Effect | Cost Calculation |
|---------|--------|------------------|
| Cargo Hold Expansions | Increases scrap capacity by 50% per level | `scrapCapacity * EXPANSION_COST_MULTIPLIER` |
| Manufacturing Bays | Adds +0.5 scrap/sec per level | `(currentBays + 1) * BAY_COST_BASE` |

## Integration Points

The Upgrade System integrates with several other systems in the game.

### Methods Exposed

| Method | Purpose |
|--------|---------|
| `purchaseUpgrade(state, category, upgradeType)` | Attempt to purchase an upgrade |
| `updateAllStats(state)` | Update all stats based on current upgrade levels |
| Cost calculation methods | Used by UI to display upgrade costs |

### Systems Using Upgrade System

| System | Methods Used | Purpose |
|--------|-------------|---------|
| Game Engine | `updateAllStats` | Initialize and update stats based on upgrades |
| UI/Game Controls | `purchaseUpgrade` | Process player upgrade purchases |
| Resource System | Indirect | Affected by stats updated by upgrades |

## UI Components

While the Upgrade System doesn't have direct UI components, it affects the following UI elements:

- **Upgrade Buttons**: Displays availability and costs of upgrades
- **Resource Capacity UI**: Shows capacities affected by upgrades
- **Production Rate UI**: Shows production rates affected by upgrades

## Configuration

The Upgrade System's behavior is determined by constants defined in configuration:

| Configuration | Location | Purpose |
|---------------|----------|---------|
| Base Capacities | `*Constants.BASE_*_CAPACITY` | Initial capacity values |
| Capacity Multipliers | `*Constants.*_CAPACITY_MULTIPLIER` | Growth rate of capacities |
| Production Rates | `*Constants.*_PER_*` | Production gain per upgrade level |
| Cost Bases | `*Constants.*_COST_BASE` | Base costs for upgrades |
| Cost Multipliers | `*Constants.*_COST_MULTIPLIER` | Cost scaling for upgrades |
| Max Upgrade Levels | e.g., `MAX_WORKER_CREWS` | Limits on specific upgrades |

## Examples

### Purchasing an Upgrade

```typescript
// In a UI event handler
onUpgradeButtonClick(category: GameCategory, upgradeType: string) {
  const success = upgradeSystem.purchaseUpgrade(gameState, category, upgradeType);
  
  if (success) {
    // Update UI, play sound, etc.
    showSuccessMessage(`Purchased ${upgradeType} in ${category}`);
  } else {
    // Show error message
    showErrorMessage(`Cannot purchase ${upgradeType}`);
  }
}
```

### Initializing Game Stats

```typescript
// In game initialization
initializeGame(state: GameState) {
  // Set up initial game state
  
  // Update all stats based on starting upgrade levels
  upgradeSystem.updateAllStats(state);
  
  // Now all derived stats (capacities, production rates) are correct
}
```

### Displaying Upgrade Costs

```typescript
// In UI rendering
renderUpgradeButton(category: string, upgradeType: string) {
  let cost = 0;
  
  // Calculate cost for display
  switch (upgradeType) {
    case 'reactorExpansions':
      cost = upgradeSystem.calculateReactorExpansionCost(
        gameState.categories.reactor.stats.energyCapacity
      );
      break;
    // Other cases...
  }
  
  return (
    <Button 
      disabled={!enoughResources(cost)} 
      onClick={() => purchaseUpgrade(category, upgradeType)}
    >
      Upgrade ({cost} resources)
    </Button>
  );
}
```

## Future Considerations

1. **Upgrade Prerequisites**: Consider implementing tech tree-style prerequisites between upgrades.

2. **Upgrade Downgrades**: Add functionality to allow downgrading certain upgrades for partial resource refunds.

3. **Upgrade Caps**: Consider adding category-specific caps on upgrade levels to improve game balance.

4. **Upgrade Side Effects**: Add upgrades that affect multiple stats or have both positive and negative effects.

5. **Special Upgrades**: Implement one-time special upgrades that unlock unique capabilities rather than just improving stats.

6. **Time-Based Upgrades**: Consider adding upgrades that take time to research/construct rather than being instantaneous.

7. **Synergy Bonuses**: Implement bonuses when certain combinations of upgrades are purchased.

8. **Upgrade Visualization**: Add methods to provide upgrade data for visualization in a tech tree or similar UI. 