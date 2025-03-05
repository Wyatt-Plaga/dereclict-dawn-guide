# Combat System Documentation

## Overview

The Combat System in Derelict Dawn Guide manages all battle-related mechanics, providing an engaging real-time combat experience for players. It serves as the primary challenge mechanism, allowing players to engage with enemies encountered during exploration. The system features region-specific enemies, resource-based actions, status effects, and a turn-based structure with both player and enemy actions.

## Architecture

The Combat System is built around the `CombatSystem` class that follows an event-driven architecture with state management. The key architectural components include:

1. **Event-driven Communication**: Uses the EventBus for system integration, particularly with the Encounter System for initiating combat.
2. **Direct State Manipulation**: Modifies the game state directly during combat, including player stats, enemy conditions, and battle logs.
3. **Turn-based Mechanics**: Implements alternating player and enemy actions with cooldown management.
4. **Resource-based Action Costs**: Integrates with the Resource System by consuming resources for combat actions.
5. **AI Decision Making**: Implements conditional enemy action selection based on combat conditions.

## Core Classes and Interfaces

### Primary Class
- **CombatSystem**: The main class responsible for managing all combat-related functionality
  - Constructor: Initializes with an EventBus instance for event communication
  - Key methods:
    - `startCombatEncounter(state, enemyId, regionId)`: Initializes a new combat encounter
    - `performCombatAction(state, actionId)`: Processes player combat actions
    - `endCombatEncounter(state, outcome)`: Finalizes combat and applies rewards or penalties
    - `performEnemyAction(state)`: Handles enemy AI decision-making and actions
    - `applyActionEffects(state, action)`: Applies the effects of combat actions

### Key Combat-Related Types
- **CombatActionDefinition**: Defines player combat actions with costs, effects, and cooldowns
- **EnemyDefinition**: Specifies enemy properties, stats, available actions, and rewards
- **StatusEffect**: Represents combat effects that modify stats or behavior
- **ActionResult**: Returns the outcome of combat actions including damage, healing, and messages
- **BattleLogEntry**: Records combat events for player feedback

## Data Flow

1. **Combat Initialization**:
   - Combat is typically triggered by an Encounter System event
   - The CombatSystem receives enemyId and regionId parameters
   - Player and enemy stats are initialized, along with available actions
   - Initial battle log entries are created

2. **Action Processing**:
   - Player selects an action from the UI
   - Action is validated (resource cost, cooldowns)
   - Action effects are applied to the enemy
   - Enemy AI selects and performs a counter-action
   - Status effects are processed and cooldowns are reduced

3. **Combat Resolution**:
   - Combat ends when player or enemy health reaches zero
   - Victory: Rewards are calculated and applied
   - Defeat: Penalties are applied to the player
   - Retreat: Partial penalties are applied for abandoning combat

## Key Components

### Combat Initialization
```typescript
startCombatEncounter(state: GameState, enemyId: string, regionId: RegionType): void {
  // Get enemy definition
  const enemy = this.getEnemyDefinition(enemyId);
  
  // Initialize combat state
  state.combat.active = true;
  state.combat.currentEnemy = enemyId;
  state.combat.currentRegion = regionId;
  state.combat.turn = 1;
  state.combat.encounterCompleted = false;
  
  // Set up enemy stats
  state.combat.enemyStats = {
    health: enemy.health,
    maxHealth: enemy.maxHealth,
    shield: enemy.shield,
    maxShield: enemy.maxShield,
    statusEffects: []
  };
  
  // Reset player status effects but maintain health/shield
  state.combat.playerStats.statusEffects = [];
  
  // Reset cooldowns and available actions
  state.combat.availableActions = Object.keys(PLAYER_ACTIONS);
  state.combat.cooldowns = {};
  
  // Initialize battle log
  this.addBattleLog(state, {
    id: uuidv4(),
    timestamp: Date.now(),
    text: `Encounter with ${enemy.name} initiated.`,
    type: 'SYSTEM'
  });
}
```

### Player Action Processing
```typescript
performCombatAction(state: GameState, actionId: string): ActionResult {
  // Check action validity
  const action = PLAYER_ACTIONS[actionId];
  
  // Check cooldowns
  if (state.combat.cooldowns[actionId] && state.combat.cooldowns[actionId] > 0) {
    return {
      success: false,
      message: `Action is on cooldown for ${state.combat.cooldowns[actionId]} more turns.`
    };
  }
  
  // Check resource cost
  if (!this.hasEnoughResources(state, action.cost)) {
    return {
      success: false,
      message: `Not enough ${action.cost.type} to perform this action.`
    };
  }
  
  // Consume resources
  this.consumeResources(state, action.cost);
  
  // Set cooldown
  state.combat.cooldowns[actionId] = action.cooldown;
  
  // Apply action effects
  const result = this.applyActionEffects(state, action);
  
  // Process enemy counter-action
  this.performEnemyAction(state);
  
  return result;
}
```

### Enemy AI Decision Making
```typescript
private selectEnemyAction(state: GameState, availableActions: EnemyActionDefinition[]): EnemyActionDefinition {
  // Filter actions based on conditions
  const validActions = availableActions.filter(action => 
    this.checkEnemyActionCondition(state, action.useCondition)
  );
  
  // If no valid actions, select fallback
  if (validActions.length === 0) {
    return availableActions.find(a => a.useCondition.type === 'ALWAYS') || availableActions[0];
  }
  
  // Select random action from valid options
  return validActions[Math.floor(Math.random() * validActions.length)];
}
```

### Status Effect Processing
```typescript
private processStatusEffects(state: GameState): void {
  // Process player status effects
  state.combat.playerStats.statusEffects.forEach((effect, index) => {
    effect.remainingTurns--;
    if (effect.remainingTurns <= 0) {
      state.combat.playerStats.statusEffects.splice(index, 1);
    }
  });
  
  // Process enemy status effects
  state.combat.enemyStats.statusEffects.forEach((effect, index) => {
    effect.remainingTurns--;
    if (effect.remainingTurns <= 0) {
      state.combat.enemyStats.statusEffects.splice(index, 1);
    }
  });
}
```

## Integration Points

The Combat System interacts with several other systems:

1. **Event Bus**: Primary communication channel
   - Listens for 'combatEncounterTriggered' events from the Encounter System
   - Emits 'resourceChange' events for resource consumption and rewards

2. **Resource System**: For resource checks and consumption
   - Consuming resources when using combat actions
   - Rewarding resources upon successful combat completion

3. **Encounter System**: For initiating combat
   - Receives combat triggers from encounter outcomes
   - Updates encounter history with combat results

4. **Game State**: For state management
   - Maintains detailed combat state including player/enemy stats
   - Tracks cooldowns, available actions, and turn information
   - Records battle history through log entries

## UI Components

The Combat System is presented through several UI components:

1. **Battle Page**: Main combat interface with:
   - Health/shield display for player and enemy
   - Action selection categories (weapons, shields, repairs, sabotage)
   - Resource indicators showing available resources for actions
   - Battle log display for combat event history

2. **Visual Elements**:
   - Region-based styling for different encounter locations
   - Status effect indicators for both player and enemy
   - Cooldown timers for actions
   - Resource cost indicators for actions

3. **Feedback Mechanisms**:
   - Battle log entries with color-coding by source
   - Animated damage effects
   - Status effect visualization
   - Outcome messaging for victory or defeat

## Configuration

The Combat System is configured through several content definition files:

1. **PLAYER_ACTIONS**: Defines all player combat actions
   ```typescript
   {
     'plasma-cannon': {
       id: 'plasma-cannon',
       name: 'Plasma Cannon',
       description: 'Direct energy attack on enemy systems',
       category: CombatActionCategory.WEAPON,
       cost: { type: 'scrap', amount: 15 },
       damage: 20,
       cooldown: 1
     },
     // Additional actions...
   }
   ```

2. **ENEMY_ACTIONS**: Defines enemy combat actions
   ```typescript
   {
     'laser-fire': {
       id: 'laser-fire',
       name: 'Laser Fire',
       description: 'Basic laser attack that deals moderate damage',
       damage: 10,
       useCondition: { type: 'ALWAYS' }
     },
     // Additional actions...
   }
   ```

3. **ENEMY_DEFINITIONS**: Specifies different enemy types
   ```typescript
   {
     'scavenger': {
       id: 'scavenger',
       name: 'Scavenger Vessel',
       description: '...',
       type: EnemyType.VESSEL,
       health: 60,
       maxHealth: 60,
       shield: 20,
       maxShield: 20,
       actions: ['laser-fire', 'cannon-volley'],
       loot: [
         { type: 'scrap', amount: 15 },
         { type: 'insight', amount: 5, probability: 0.5 }
       ],
       regions: [RegionType.VOID, RegionType.ASTEROID_FIELD],
       difficultyTier: 1
     },
     // Additional enemy definitions...
   }
   ```

4. **REGION_DEFINITIONS**: Defines region-specific combat parameters
   ```typescript
   {
     'void': {
       encounterChance: 0.3,
       enemyProbabilities: [
         { enemyId: 'scavenger', weight: 60 },
         { enemyId: 'patrol-drone', weight: 40 }
       ]
     },
     // Additional regions...
   }
   ```

## Examples

### Starting a Combat Encounter

```typescript
// Typically triggered by the Encounter System
this.eventBus.emit('combatEncounterTriggered', {
  state: gameState,
  enemyId: 'nebula-lurker',
  regionId: 'nebula'
});

// Then handled by the Combat System's event listener
startCombatEncounter(state, enemyId, regionId);
```

### Performing a Combat Action

```typescript
// From a UI component
dispatch({
  type: 'COMBAT_ACTION',
  payload: {
    actionId: 'plasma-cannon'
  }
});

// In the Action System which delegates to Combat System
const result = this.manager.combat.performCombatAction(state, actionId);

// Result contains damage dealt, resources consumed, and success message
// { success: true, message: 'Plasma Cannon damaged enemy hull for 20', damageDealt: 20 }
```

### Retreating from Combat

```typescript
// From a UI component
dispatch({
  type: 'RETREAT_FROM_BATTLE'
});

// In the Action System which delegates to Combat System
this.manager.combat.retreat(state);

// Combat state is cleared and player returns to navigation
```

## Future Considerations

1. **Enhanced Enemy AI**: Implement more sophisticated decision-making for enemy actions based on patterns and player behavior.

2. **Combat Progression**: Add experience or skill progression to unlock more powerful combat actions through gameplay.

3. **Region-specific Combat Effects**: Implement environmental effects that influence combat based on the region.

4. **Ship Systems Damage**: Add subsystem damage that affects combat capabilities until repaired.

5. **Combat Difficulty Scaling**: Adjust enemy difficulty based on player progression and previous combat encounters.

6. **Energy Management**: Implement an energy allocation system for different combat systems.

7. **Multi-enemy Encounters**: Support encounters with multiple enemies simultaneously.

8. **Tactical Positioning**: Add positioning elements that affect combat effectiveness.

9. **Visual Combat Effects**: Enhance the UI with more detailed visualizations of combat actions and their effects. 