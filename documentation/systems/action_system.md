# Action System

## Overview

The Action System is responsible for processing all user actions and updating the game state accordingly in Derelict Dawn Guide. It functions as the central command center that receives action requests from the UI, routes them to appropriate handlers, and coordinates with other systems to execute those actions.

Think of the Action System as the customer service department that handles all player requests within the game. It ensures that when a player clicks a button or makes a selection, the correct behavior is triggered and the state is updated appropriately.

Key responsibilities include:
- Processing user interactions (clicks, selections, decisions)
- Routing actions to the appropriate handler methods
- Coordinating with other game systems (Resource, Upgrade, Combat, Encounter, etc.)
- Directly mutating game state based on action results
- Managing action validation and error handling

## Architecture

The Action System implements a routing pattern with type-based action dispatching. It serves as a mediator that routes actions to specialized handlers, delegating to other systems when needed.

### Core Classes and Interfaces

```typescript
export class ActionSystem {
  // Reference to other systems
  private manager: GameSystemManager | null = null;
  
  // System initialization
  setManager(manager: GameSystemManager): void
  
  // Main action processing method - entry point for all actions
  processAction(state: GameState, action: GameAction): GameState
  
  // Resource click handlers
  private handleResourceClick(state: GameState, action: GameAction): GameState
  private handleReactorClick(state: GameState): GameState
  private handleProcessorClick(state: GameState): GameState
  private handleManufacturingClick(state: GameState): GameState
  private handleCrewQuartersClick(state: GameState): GameState
  
  // Other action handlers
  private handleUpgradePurchase(state: GameState, category: GameCategory, upgradeType: string): GameState
  private handleMarkLogRead(state: GameState, logId: string): GameState
  private handleMarkAllLogsRead(state: GameState): GameState
  private handleInitiateJump(state: GameState): GameState
  private handleCompleteEncounter(state: GameState, action: any): GameState
  private handleSelectRegion(state: GameState, region: RegionType): GameState
  private handleStoryChoice(state: GameState, action: MakeStoryChoiceAction): GameState
  private handleCombatAction(state: GameState, action: any): GameState
  private handleRetreatFromBattle(state: GameState): GameState
}
```

The Action System processes the following action types:

```typescript
type GameActions = 
  | ClickResourceAction        // Resource generation clicks
  | PurchaseUpgradeAction      // Buying upgrades
  | MarkLogReadAction          // Marking logs as read
  | MarkAllLogsReadAction      // Marking all logs as read
  | InitiateJumpAction         // Starting an encounter
  | CompleteEncounterAction    // Finishing an encounter
  | SelectRegionAction         // Navigating to a region
  | MakeStoryChoiceAction      // Making narrative choices
  | CombatAction               // Combat-related actions
  | RetreatFromBattleAction    // Retreat from combat
```

### Data Flow

The Action System processes actions in the following sequence:

1. Action initiation:
   - The UI dispatches an action with a specific type and payload
   - The action is received by the `processAction` method

2. Action routing:
   - Based on the action type, the system routes to a specialized handler
   - The handler validates the action payload and prerequisites

3. State mutation:
   - The handler directly modifies the game state based on the action
   - For complex operations, the handler delegates to other systems

4. Response:
   - The modified state is returned
   - The UI re-renders based on the updated state

## Key Components

### Main Action Router

The central `processAction` method routes actions to their appropriate handlers:

```typescript
processAction(state: GameState, action: GameAction): GameState {
  // Process the action based on its type - directly mutate the state
  switch (action.type) {
    case 'CLICK_RESOURCE':
      this.handleResourceClick(state, action);
      break;
    case 'PURCHASE_UPGRADE':
      this.handleUpgradePurchase(
        state, 
        action.payload.category, 
        action.payload.upgradeType
      );
      break;
    // Additional case statements for other action types...
    default:
      Logger.warn(LogCategory.ACTIONS, `Unknown action type: ${action.type}`, LogContext.NONE);
  }
  
  return state;
}
```

This method:
1. Takes the current game state and an action
2. Routes to a specialized handler based on the action type
3. Returns the modified state

### Resource Click Handlers

The Action System includes specialized handlers for each resource type:

```typescript
private handleResourceClick(state: GameState, action: GameAction): GameState {
  const category = action.payload?.category;
  
  switch (category) {
    case 'reactor':
      return this.handleReactorClick(state);
    case 'processor':
      return this.handleProcessorClick(state);
    case 'manufacturing':
      return this.handleManufacturingClick(state);
    case 'crewQuarters':
      return this.handleCrewQuartersClick(state);
    default:
      // Handle error case
  }
}
```

Each resource-specific handler includes:
1. Logic for incrementing the resource value
2. Capacity checks to prevent exceeding limits
3. Debug logging for troubleshooting
4. Direct mutation of the game state

### System Integration Handlers

Many action handlers delegate to other systems for specialized processing:

```typescript
private handleUpgradePurchase(
  state: GameState, 
  category: GameCategory, 
  upgradeType: string
): GameState {
  // Use the UpgradeSystem from the manager
  let upgradeSystem = this.manager?.upgrade || new UpgradeSystem();
  
  // Attempt to purchase the upgrade
  const success = upgradeSystem.purchaseUpgrade(state, category, upgradeType);
  
  // Log result and return state
  return state;
}
```

These handlers:
1. Validate action parameters
2. Delegate to specialized systems via the manager
3. Process the results and update state if needed
4. Handle error conditions and logging

### Encounter and Combat Handlers

The Action System also manages game progression through encounters and combat:

```typescript
private handleInitiateJump(state: GameState): GameState {
  // Generate an encounter based on the current region
  const encounter = this.manager.encounter.generateEncounter(state);
  
  // Update the game state directly
  state.encounters.active = true;
  state.encounters.encounter = encounter;
  
  return state;
}
```

```typescript
private handleCombatAction(state: GameState, action: any): GameState {
  // Perform the combat action
  const result = this.manager.combat.performCombatAction(state, action.payload?.actionId);
  
  // Update the combat state with the result
  if (result.success) {
    state.combat.lastActionResult = result;
    
    // Add a log entry if provided
    if (result.message) {
      state.combat.battleLog.push({
        id: uuidv4(),
        text: result.message,
        type: 'PLAYER',
        timestamp: Date.now()
      });
    }
  }
  
  return state;
}
```

These handlers coordinate complex game mechanics by:
1. Delegating core logic to specialized systems
2. Updating multiple aspects of the game state
3. Managing state transitions between different game modes
4. Recording actions in logs for player feedback

## Action Types and Handlers

| Action Type | Handler Method | Purpose |
|-------------|----------------|---------|
| `CLICK_RESOURCE` | `handleResourceClick` | Process manual resource generation |
| `PURCHASE_UPGRADE` | `handleUpgradePurchase` | Buy upgrades to improve capabilities |
| `MARK_LOG_READ` | `handleMarkLogRead` | Mark individual logs as read |
| `MARK_ALL_LOGS_READ` | `handleMarkAllLogsRead` | Mark all logs as read |
| `SELECT_REGION` | `handleSelectRegion` | Navigate to a different region |
| `INITIATE_JUMP` | `handleInitiateJump` | Start an encounter |
| `COMPLETE_ENCOUNTER` | `handleCompleteEncounter` | Finish an encounter |
| `MAKE_STORY_CHOICE` | `handleStoryChoice` | Make a narrative decision |
| `COMBAT_ACTION` | `handleCombatAction` | Perform a combat action |
| `RETREAT_FROM_BATTLE` | `handleRetreatFromBattle` | Retreat from combat |

## Integration Points

The Action System integrates with all other systems in the game.

### Dependencies

The Action System requires access to:

```typescript
// In constructor or setManager method
this.manager = manager;  // GameSystemManager reference
```

This provides access to:
- Resource System (for resource operations)
- Upgrade System (for upgrade purchases)
- Log System (for log management)
- Encounter System (for encounter generation and resolution)
- Combat System (for combat actions)

### Methods Exposed

| Method | Purpose |
|--------|---------|
| `processAction(state, action)` | Main entry point for processing all game actions |
| `setManager(manager)` | Initialize the ActionSystem with dependencies |

### Systems Using Action System

| System | Integration Point | Purpose |
|--------|-------------------|---------|
| Game Provider | Dispatches actions | Sends player actions to the Action System |
| UI Components | Action creators | Create action objects for user interactions |
| Game Engine | processAction method | Core game loop processes actions |

## UI Components

The Action System directly impacts all interactive UI components, with each UI interaction creating an action that flows through the Action System.

Key UI integrations include:

- **Resource Panels**: Click handlers that dispatch `CLICK_RESOURCE` actions
- **Upgrade Buttons**: Click handlers that dispatch `PURCHASE_UPGRADE` actions
- **Navigation Controls**: Buttons that dispatch `SELECT_REGION` and `INITIATE_JUMP` actions
- **Encounter UI**: Interface elements that dispatch `COMPLETE_ENCOUNTER` and `MAKE_STORY_CHOICE` actions
- **Combat UI**: Buttons that dispatch `COMBAT_ACTION` and `RETREAT_FROM_BATTLE` actions
- **Log Panel**: Controls that dispatch `MARK_LOG_READ` and `MARK_ALL_LOGS_READ` actions

## Configuration

The Action System itself has minimal configuration as it primarily serves as a router. Most of its behavior is determined by:

1. The action types it supports (defined in `GameActions` type)
2. The specialized systems it delegates to
3. The structure of the game state it modifies

## Examples

### Processing a Resource Click

```typescript
// In a UI component
const handleEnergyClick = () => {
  dispatch({
    type: 'CLICK_RESOURCE',
    payload: {
      category: 'reactor'
    }
  });
};

// In ActionSystem
private handleReactorClick(state: GameState): GameState {
  const reactor = state.categories.reactor;
  
  // Add 1 energy (up to capacity)
  if (reactor.resources.energy < reactor.stats.energyCapacity) {
    reactor.resources.energy = Math.min(
      reactor.resources.energy + 1,
      reactor.stats.energyCapacity
    );
  }
  return state;
}
```

### Purchasing an Upgrade

```typescript
// In a UI component
const handleUpgradeClick = (category, upgradeType) => {
  dispatch({
    type: 'PURCHASE_UPGRADE',
    payload: {
      category,
      upgradeType
    }
  });
};

// In ActionSystem
private handleUpgradePurchase(
  state: GameState, 
  category: GameCategory, 
  upgradeType: string
): GameState {
  // Attempt to purchase the upgrade
  const success = this.manager.upgrade.purchaseUpgrade(state, category, upgradeType);
  return state;
}
```

### Initiating an Encounter

```typescript
// In a UI component
const handleJumpClick = () => {
  dispatch({
    type: 'INITIATE_JUMP'
  });
};

// In ActionSystem
private handleInitiateJump(state: GameState): GameState {
  // Generate an encounter and update state
  const encounter = this.manager.encounter.generateEncounter(state);
  state.encounters.active = true;
  state.encounters.encounter = encounter;
  return state;
}
```

## Future Considerations

1. **Action Queuing**: Implement a queue system for actions that should be processed sequentially rather than immediately.

2. **Undo/Redo Support**: Add infrastructure for reversible actions and action history tracking.

3. **Action Validation Middleware**: Create a validation layer that checks action prerequisites before routing to handlers.

4. **Asynchronous Actions**: Support actions that require async processing (like animations or delayed effects).

5. **Action Batching**: Allow multiple actions to be batched together and processed as a unit for efficiency.

6. **Action Logging and Replay**: Enhance logging to support game state replay for debugging or demonstrations.

7. **Action Throttling**: Implement rate limiting for actions that could be spammed by rapid clicking.

8. **Conditional Actions**: Support actions that only execute when certain game conditions are met.

9. **Action Analytics**: Track statistics on action usage for game balance and player behavior analysis. 