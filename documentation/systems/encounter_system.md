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
    - `generateCombatEncounter(region: RegionType, state?: GameState)`: Builds combat encounters, using `generateEnemyForRegion` for enemy selection.
    - `generateEnemyForRegion(region: RegionType, subRegion?: string, isBoss?: boolean)`: Selects an appropriate enemy ID based on region, subregion, and boss status using weighted probabilities derived from `EnemyDefinition.spawnLocations` in `ALL_ENEMIES_LIST`.
    - `applyRewards(state: GameState, rewards: ResourceReward[])`: Grants resources from encounters via the EventBus.
    - `completeEncounter(state: GameState, choiceId?: string)`: Finalizes encounters, applies outcomes, and potentially triggers combat via the EventBus.

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
    // Use ENCOUNTER_TYPE_PROBABILITIES from encounterConfig.ts
    const regionTypeProbs = ENCOUNTER_TYPE_PROBABILITIES[region] || 
        { default: { combat: 0.3, empty: 0.5, narrative: 0.2 } }; // Fallback
    const encounterChances = regionTypeProbs.default;
    
    const randomValue = Math.random();
    
    if (randomValue < encounterChances.combat) {
        return this.generateCombatEncounter(region, state);
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
// Within completeEncounter method, when triggering combat
// (either from story choice or a direct combat encounter)

// 1. Determine enemyId using generateEnemyForRegion or pre-defined ID
const enemyId = /* ... logic to get enemyId ... */ ;
const regionId = /* ... logic to get regionId from encounter.validLocations ... */ ;
const subRegionId = /* ... logic to get subRegionId ... */ ;

// 2. Emit event to Combat System
if (enemyId) {
    this.eventBus.emit('combatEncounterTriggered', {
        state: state,
        enemyId: enemyId,
        regionId: regionId, 
        subRegionId: subRegionId
        // ... other relevant source info ...
    });
    
    // 3. Update game state (encounter inactive, combat active)
    state.encounters.active = false;
    state.encounters.encounter = undefined;
    state.combat.active = true;
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

1. **`app/game/content/encounterConfig.ts`**: Defines the probability of each encounter *type* (combat, narrative, empty) per region using `ENCOUNTER_TYPE_PROBABILITIES`. (Currently set to roughly equal probabilities for testing).

2. **`app/game/content/encounters/*.ts`**: Contains pre-defined `StoryEncounter` definitions for each region, including choices and outcomes.

3. **`app/game/content/enemies/*.ts`**: Defines individual `EnemyDefinition` objects. The `spawnLocations` array within each definition dictates where and how often (via `weight`) that enemy can appear in *random* combat encounters generated by `generateEnemyForRegion`.

4. **`app/game/content/encounters.ts`**: Provides region-specific flavor text (titles, descriptions, messages) and reward generation logic (`generateEmptyEncounterRewards`) for empty encounters.

## Examples

### Generating a New Encounter

```