# Encounter System Implementation Plan

## Overview

This document outlines the implementation plan for Derelict Dawn Guide's encounter system. The system will integrate combat and narrative encounters into the existing game architecture while maintaining proper separation of concerns.

## Core Principles

- **Separation of Concerns**: Maintain clear boundaries between game state, UI, and game logic
- **DRY (Don't Repeat Yourself)**: Reuse components and logic where appropriate
- **Progressive Enhancement**: Build the system in phases for iterative testing
- **Region-Based Content**: Encounters should vary based on the region the player is in

## Technical Design

### 1. State Management

#### 1.1 Game State Extension

```typescript
interface GameState {
  // Existing properties
  
  // Navigation state
  navigation: {
    currentRegion: string;
    unlockedRegions: string[];
    regionsData: Record<string, RegionData>;
  };
  
  // Encounter state
  encounters: {
    active: boolean;
    encounter?: CombatEncounter | StoryEncounter;
    emptyJumpResult?: {
      message: string;
      resources?: ResourceReward[];
    };
    history: EncounterHistory[];
  };
  
  // Metrics for balancing
  metrics: {
    encountersCompleted: number;
    combatsWon: number;
    combatsLost: number;
    storiesCompleted: Record<string, number>;
    resourcesGained: Record<string, number>;
  };
}
```

#### 1.2 Encounter Types

```typescript
interface BaseEncounter {
  id: string;
  type: 'combat' | 'story';
  title: string;
  description: string;
  region: string; // 'void', 'nebula', etc.
}

interface CombatEncounter extends BaseEncounter {
  type: 'combat';
  enemy: Enemy;
  combatState: CombatState;
}

interface StoryEncounter extends BaseEncounter {
  type: 'story';
  choices: EncounterChoice[];
}

interface EncounterChoice {
  id: string;
  text: string;
  outcomes: {
    resources?: ResourceReward[];
    upgrades?: UpgradeReward[];
    text: string;
    unlocksRegion?: string;
  };
}

interface CombatState {
  playerHealth: number;
  playerMaxHealth: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  playerShields: number;
  turn: number;
  log: CombatLogEntry[];
}

interface CombatLogEntry {
  turn: number;
  text: string;
  type: 'player' | 'enemy' | 'system';
}

interface EncounterHistory {
  type: 'combat' | 'story' | 'empty';
  id: string;
  result: 'victory' | 'defeat' | 'retreat' | string; // choice ID for stories
  date: number; // timestamp
  region: string;
}
```

### 2. System Implementation

#### 2.1 EncounterSystem

This new system will be responsible for generating and managing encounters:

```typescript
class EncounterSystem {
  // Generate encounters based on region
  generateEncounter(region: string): CombatEncounter | StoryEncounter {
    // Implementation details
  }
  
  // Generate a combat encounter
  generateCombatEncounter(region: string): CombatEncounter {
    // Implementation details
  }
  
  // Generate a story encounter
  generateStoryEncounter(region: string): StoryEncounter {
    // Implementation details
  }
  
  // Process combat actions
  processCombatAction(state: GameState, action: string): void {
    // Implementation details
  }
  
  // Process story choices
  processStoryChoice(state: GameState, choiceId: string): void {
    // Implementation details
  }
  
  // Check if combat has ended
  checkCombatEnd(state: GameState): boolean {
    // Implementation details
  }
  
  // Apply rewards from encounters
  applyRewards(state: GameState, rewards: ResourceReward[]): void {
    // Implementation details
  }
}
```

#### 2.2 Integration with ActionSystem

```typescript
class ActionSystem {
  constructor(
    private encounterSystem: EncounterSystem,
    private upgradeSystem: UpgradeSystem
  ) {}
  
  // Process actions
  processAction(state: GameState, action: GameAction): void {
    switch(action.type) {
      case 'INITIATE_JUMP':
        this.handleJumpAction(state);
        break;
      case 'COMBAT_ACTION':
        this.handleCombatAction(state, action.payload);
        break;
      case 'STORY_CHOICE':
        this.handleStoryChoice(state, action.payload);
        break;
      case 'DISMISS_EMPTY_JUMP':
        this.handleDismissEmptyJump(state);
        break;
      // Existing action handlers
    }
  }
  
  // Handle jump initiation
  private handleJumpAction(state: GameState): void {
    const region = state.navigation.currentRegion;
    const { encounterChance, combatRatio } = REGION_ENCOUNTER_CHANCES[region];
    
    // Determine if encounter occurs
    if (Math.random() < encounterChance) {
      // Determine encounter type
      const isCombat = Math.random() < combatRatio;
      
      let encounter;
      if (isCombat) {
        encounter = this.encounterSystem.generateCombatEncounter(region);
      } else {
        encounter = this.encounterSystem.generateStoryEncounter(region);
      }
      
      // Update state
      state.encounters.active = true;
      state.encounters.encounter = encounter;
      state.encounters.emptyJumpResult = undefined;
      
      // Log the encounter
      Logger.info(
        LogCategory.ACTIONS, 
        `Encounter triggered: ${encounter.title}`, 
        LogContext.NONE
      );
    } else {
      // No encounter - generate "empty jump" result
      state.encounters.active = false;
      state.encounters.encounter = undefined;
      
      // Generate a minor resource reward
      const resources: ResourceReward[] = [
        { type: 'energy', amount: 5 + Math.random() * 10 },
        { type: 'scrap', amount: 2 + Math.random() * 5 }
      ];
      
      // Apply the rewards
      this.encounterSystem.applyRewards(state, resources);
      
      // Create empty jump result
      state.encounters.emptyJumpResult = {
        message: getRandomEmptyJumpMessage(region),
        resources
      };
      
      // Record in history
      state.encounters.history.push({
        type: 'empty',
        id: 'empty_jump',
        result: 'resources',
        date: Date.now(),
        region
      });
      
      Logger.info(LogCategory.ACTIONS, 'Jump completed without incident', LogContext.NONE);
    }
  }
  
  // Other action handlers (combat, story choice, etc.)
}
```

### 3. UI Components

#### 3.1 Navigation Page Enhancement

```jsx
export default function NavigationPage() {
  const { state, dispatch } = useGame();
  const { shouldFlicker } = useSystemStatus();
  
  // Extract state
  const { encounters, navigation } = state;
  const inEncounter = encounters.active;
  const hasEmptyJumpResult = !!encounters.emptyJumpResult;
  
  // Handle jump initiation
  const initiateJump = () => {
    Logger.info(LogCategory.ACTIONS, 'Initiating jump sequence', LogContext.NONE);
    dispatch({ type: 'INITIATE_JUMP' });
  };
  
  // Handle returning to navigation after empty jump
  const dismissEmptyJump = () => {
    dispatch({ type: 'DISMISS_EMPTY_JUMP' });
  };
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          {inEncounter ? (
            // Show encounter UI based on type
            encounters.encounter?.type === 'combat' ? (
              <CombatPanel encounter={encounters.encounter} dispatch={dispatch} />
            ) : (
              <StoryPanel encounter={encounters.encounter} dispatch={dispatch} />
            )
          ) : hasEmptyJumpResult ? (
            // Show empty jump result
            <EmptyJumpPanel 
              result={encounters.emptyJumpResult} 
              onDismiss={dismissEmptyJump} 
            />
          ) : (
            // Show navigation panel
            <NavigationPanel 
              currentRegion={navigation.currentRegion}
              unlockedRegions={navigation.unlockedRegions}
              onJump={initiateJump}
            />
          )}
        </div>
      </main>
    </GameLoader>
  );
}
```

#### 3.2 Encounter Components

**Combat Panel Component**
```jsx
function CombatPanel({ encounter, dispatch }) {
  const { enemy, combatState } = encounter;
  
  // Action handlers
  const useShield = () => {
    dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'shield' } });
  };
  
  const useWeapon = () => {
    dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'weapon' } });
  };
  
  // Other action handlers
  
  return (
    <div className="system-panel p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">
        Combat: {enemy.name}
      </h1>
      
      {/* Enemy display */}
      <div className="mb-8">
        {/* Enemy image and stats */}
      </div>
      
      {/* Combat controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Combat buttons */}
      </div>
      
      {/* Combat log */}
      <div className="system-panel p-4 h-64 overflow-y-auto">
        {/* Combat log entries */}
      </div>
    </div>
  );
}
```

**Story Panel Component**
```jsx
function StoryPanel({ encounter, dispatch }) {
  const { title, description, choices } = encounter;
  
  // Handle choice selection
  const selectChoice = (choiceId) => {
    dispatch({ type: 'STORY_CHOICE', payload: { choiceId } });
  };
  
  return (
    <div className="system-panel p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">{title}</h1>
      <p className="mb-8">{description}</p>
      
      <div className="grid gap-4">
        {choices.map(choice => (
          <button 
            key={choice.id}
            className="system-panel p-4 hover:bg-accent/10"
            onClick={() => selectChoice(choice.id)}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Empty Jump Panel Component**
```jsx
function EmptyJumpPanel({ result, onDismiss }) {
  const { message, resources } = result;
  
  return (
    <div className="system-panel p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Jump Complete</h1>
      <p className="mb-6">{message}</p>
      
      {resources && resources.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Resources Found:</h2>
          <ul className="space-y-2">
            {resources.map((resource, index) => (
              <li key={index} className="flex items-center">
                <span className="font-medium">{resource.type}:</span>
                <span className="ml-2">+{resource.amount.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        className="system-panel p-4 w-full hover:bg-accent/10"
        onClick={onDismiss}
      >
        Return to Navigation
      </button>
    </div>
  );
}
```

## Content Development

### 1. Region-Specific Content

Define content tables for each region:

```typescript
const REGION_ENCOUNTER_CHANCES = {
  void: { encounterChance: 0.6, combatRatio: 0.7 },
  nebula: { encounterChance: 0.75, combatRatio: 0.8 },
  blackhole: { encounterChance: 0.85, combatRatio: 0.9 },
  supernova: { encounterChance: 0.8, combatRatio: 0.85 },
  habitable: { encounterChance: 0.7, combatRatio: 0.6 },
};

const REGION_ENEMIES = {
  void: [
    { 
      id: 'void_scout', 
      name: 'Void Scout', 
      description: 'A small autonomous probe that patrols the emptiness of space.',
      health: 30, 
      damage: 5, 
      weakness: 'shield', 
      image: '/enemy-void.png' 
    },
    // More enemies
  ],
  // Other regions
};

const REGION_STORIES = {
  void: [
    {
      id: 'void_distress',
      title: 'Distress Signal',
      description: 'You detect a faint distress signal from a nearby derelict vessel...',
      choices: [
        { 
          id: 'investigate', 
          text: 'Investigate signal', 
          outcomes: { 
            resources: [{ type: 'scrap', amount: 15 }],
            text: 'You find valuable scrap materials among the wreckage.' 
          } 
        },
        { 
          id: 'ignore', 
          text: 'Ignore and continue', 
          outcomes: { 
            text: 'You continue on your journey, leaving the signal behind.' 
          } 
        }
      ]
    },
    // More stories
  ],
  // Other regions
};

const EMPTY_JUMP_MESSAGES = {
  void: [
    "You navigate through the emptiness of space, finding nothing of note.",
    "The sensors detect only distant stars and cosmic background radiation.",
    "The ship passes through a region of particularly empty space."
  ],
  // Other regions
};
```

## Implementation Phases

### Phase 1: Core State & Types (Week 1)
- Extend GameState with encounter fields
- Define encounter interfaces
- Create skeleton of EncounterSystem

### Phase 2: Basic Encounter Generation (Week 1-2)
- Implement encounter generation logic
- Create initial content for void region
- Integrate with ActionSystem

### Phase 3: UI Components (Week 2)
- Modify Navigation page to handle encounters
- Create CombatPanel component
- Create StoryPanel component
- Create EmptyJumpPanel component

### Phase 4: Combat Mechanics (Week 3)
- Implement combat actions
- Add combat resolution logic
- Create combat rewards system

### Phase 5: Story Mechanics (Week 3)
- Implement story choice handling
- Create outcome application logic
- Link stories to region progression

### Phase 6: Region Content Development (Week 4)
- Develop content for other regions
- Balance encounters based on region difficulty
- Add region unlocking mechanics

### Phase 7: Testing & Balance (Week 4-5)
- Playtest encounter frequency
- Balance combat difficulty
- Adjust resource rewards
- Polish UI interactions

## Technical Considerations

1. **State Management:**
   - Use deep copying for state updates to ensure React detects changes
   - Keep encounter state normalized for easier updates

2. **Performance:**
   - Pre-generate possible encounters to avoid computation during gameplay
   - Use memoization for encounter generation functions

3. **UI Design:**
   - Use consistent styling with the rest of the game
   - Add animations for combat actions
   - Provide clear feedback for player actions

4. **Metrics & Analytics:**
   - Track encounter outcomes for balancing
   - Measure player resource gains for economic balance
   - Monitor time spent in different encounter types 