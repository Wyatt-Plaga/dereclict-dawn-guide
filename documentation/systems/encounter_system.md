# Encounter System Documentation

## Overview

The Encounter System is a core gameplay mechanism in Derelict Dawn Guide that generates and manages various player encounters throughout the game. It serves as the central event generator for narrative progression, resource acquisition, and combat initiation. The system dynamically creates region-specific encounters that align with the game's setting and current player location.

## Architecture

The Encounter System follows a modular design centered around the `EncounterSystem` class. The architecture includes:

1. **Event-driven Communication**: The system relies on the EventBus for communication with other systems, particularly when triggering combat or resource changes.
2. **Region-based Content Generation**: Encounters are tailored to the player's current region, with region-specific probabilities, descriptions, and rewards.
3. **Type-based Encounter Handling**: The system handles three primary encounter types (empty, story, and combat), each with specific generation logic and outcomes.
4. **State Management**: The system manages encounter state through the global GameState object, tracking active encounters and maintaining encounter history.

## Core Classes and Interfaces

The Encounter System consists of several key components:

### Primary Class
- **EncounterSystem**: The main class responsible for generating and managing encounters
  - Constructor: Initializes with an EventBus instance for inter-system communication
  - Key methods:
    - `generateEncounter(state: GameState)`: Creates a new encounter based on current region
    - `generateEmptyEncounter(region: RegionType)`: Generates empty encounters with region-specific content
    - `generateStoryEncounter(region: RegionType)`: Creates narrative encounters with player choices
    - `generateCombatEncounter(region: string)`: Builds combat encounters with region-specific enemies
    - `applyRewards(state: GameState, rewards: ResourceReward[])`: Grants resources from encounters
    - `completeEncounter(state: GameState, choiceId?: string)`: Finalizes encounters and applies outcomes

### Key Interfaces
- `BaseEncounter`: Core interface containing shared encounter properties
- `EmptyEncounter`: Simple encounters with resource rewards and flavor text
- `StoryEncounter`: Narrative encounters with player choices and outcomes
- `EncounterChoice`: Available options within story encounters
- `ResourceReward`: Resources gained from encounter completion

## Data Flow

1. **Encounter Generation**:
   - The process begins when a new encounter is requested (typically from the Navigation system)
   - The current region determines encounter type probabilities
   - Based on a random roll, an appropriate encounter type is generated
   - Region-specific content is injected into the encounter template

2. **Encounter Processing**:
   - The player interacts with the encounter through the UI
   - For story encounters, the player selects a choice
   - For empty encounters, rewards are automatically applied
   - For combat encounters, the combat system is initialized

3. **Encounter Resolution**:
   - Rewards are applied through the EventBus (avoiding direct state mutation)
   - Encounter history is updated
   - The encounter is marked as inactive
   - For combat encounters, combat state is activated

## Key Components

### Region-based Encounter Generation
```typescript
generateEncounter(state: GameState): BaseEncounter {
    const region = state.navigation.currentRegion;
    const encounterChances = REGION_ENCOUNTER_CHANCES[region] || 
        { combat: 0.3, empty: 0.5, narrative: 0.2 };
    
    const randomValue = Math.random();
    
    if (randomValue < encounterChances.combat) {
        return this.generateCombatEncounter(region);
    } else if (randomValue < encounterChances.combat + encounterChances.empty) {
        return this.generateEmptyEncounter(region);
    } else {
        return this.generateStoryEncounter(region);
    }
}
```

### Story Encounter Choices
```typescript
private generateStoryEncounter(region: RegionType): StoryEncounter {
    const regionEncounters = STORY_ENCOUNTERS[region];
    
    if (!regionEncounters || regionEncounters.length === 0) {
        return getGenericStoryEncounter(region);
    }
    
    const randomIndex = Math.floor(Math.random() * regionEncounters.length);
    return JSON.parse(JSON.stringify(regionEncounters[randomIndex]));
}
```

### Resource Reward Application
```typescript
applyRewards(state: GameState, rewards: ResourceReward[]): GameState {
    rewards.forEach(reward => {
        const { type, amount } = reward;
        
        this.eventBus.emit('resourceChange', {
            state: state,
            resourceType: type,
            amount: amount,
            source: 'encounter'
        });
        
        // Logging logic...
    });
    
    return state;
}
```

### Combat Initialization
```typescript
// Within completeEncounter method
if (encounter.type === 'combat') {
    const combatEncounter = encounter as BaseEncounter;
    const regionId = combatEncounter.region;
    const enemyId = this.generateRandomEnemyForRegion(regionId);
    
    if (enemyId) {
        this.eventBus.emit('combatEncounterTriggered', {
            state: state,
            enemyId: enemyId,
            regionId: regionId
        });
        
        state.encounters.active = false;
        state.encounters.encounter = undefined;
        state.combat.active = true;
        
        // History management...
    }
}
```

## Integration Points

The Encounter System interacts with several other game systems:

1. **EventBus**: Primary communication channel with other systems
   - Emits: 'resourceChange', 'combatEncounterTriggered'
   - Listens: None directly (is called by other systems)

2. **Resource System**: Indirect integration via EventBus
   - Resource rewards are emitted as events for the Resource System to process

3. **Combat System**: Initiates combat encounters
   - Combat is triggered via the 'combatEncounterTriggered' event
   - Combat state is activated when appropriate

4. **Navigation System**: Provides the current region for encounter generation
   - Region type determines encounter probabilities and content

5. **Game State**: Central storage for encounter data
   - Stores active encounter and encounter history
   - Tracks encounter completion and outcomes

## UI Components

The Encounter System is presented to the player through several React components:

1. **EncounterDisplay**: Main container component that:
   - Determines encounter type and renders appropriate content
   - Handles encounter completion flow
   - Manages navigation between encounters and other game pages

2. **Type-specific Components**:
   - **EmptyEncounterContent**: Displays simple encounters with rewards
   - **StoryEncounterContent**: Presents narrative choices to the player
   - **CombatEncounterContent**: Prepares the player for combat encounters

3. **Visual Elements**:
   - Region-specific effects and styling
   - Resource reward animations
   - Region-based text colorization

## Configuration

The Encounter System is configured through several content definition files:

1. **REGION_ENCOUNTER_CHANCES**: Defines the probability of each encounter type per region
   ```typescript
   {
     'void': { combat: 0.5, empty: 0.05, narrative: 0.45 },
     'nebula': { combat: 0.3, empty: 0.5, narrative: 0.2 },
     // Additional regions...
   }
   ```

2. **STORY_ENCOUNTERS**: Pre-defined story encounters for each region
   - Each region has an array of encounters with choices and outcomes

3. **Region Definitions**: Enemy probabilities for combat encounters
   ```typescript
   {
     enemyProbabilities: [
       { enemyId: 'scout_drone', weight: 70 },
       { enemyId: 'hunter_vessel', weight: 30 }
     ]
   }
   ```

4. **Empty Encounter Content**: Region-specific flavor text and rewards
   - Titles, descriptions, messages, and reward probabilities are defined per region

## Examples

### Generating a New Encounter

```typescript
// Typically called when the player explores a new location
const newEncounter = encounterSystem.generateEncounter(gameState);
gameState.encounters.active = true;
gameState.encounters.encounter = newEncounter;
```

### Completing a Story Encounter

```typescript
// Called when a player selects a choice in a story encounter
dispatch({
  type: 'MAKE_STORY_CHOICE',
  payload: {
    choiceId: selectedChoice
  }
});

// This triggers the completeEncounter method in the EncounterSystem
```

### Initiating Combat

```typescript
// Within the EncounterSystem's completeEncounter method
this.eventBus.emit('combatEncounterTriggered', {
  state: state,
  enemyId: enemyId,
  regionId: regionId
});

state.encounters.active = false;
state.encounters.encounter = undefined;
state.combat.active = true;
```

## Future Considerations

1. **Encounter Persistence**: Implement mechanisms to save encounter state during game saves
2. **Encounter Chains**: Allow for sequential encounters that tell a larger story
3. **Player-influenced Probabilities**: Adjust encounter chances based on player choices or resource levels
4. **Dynamic Story Content**: Generate encounters procedurally based on game state
5. **Encounter Cooldowns**: Prevent repeated encounters of the same type
6. **Difficulty Scaling**: Adjust combat encounters based on player progression
7. **Special Encounter Types**: Add rare encounters with unique mechanics
8. **Reputation System**: Track player choices to influence future encounters
9. **Resource-triggered Encounters**: Special encounters based on resource thresholds 