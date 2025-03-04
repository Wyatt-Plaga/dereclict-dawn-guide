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
    completedRegions: string[];
    regionsData: Record<string, RegionData>;
  };
  
  // Encounter state
  encounters: {
    active: boolean;
    encounter?: CombatEncounter | StoryEncounter | EmptyEncounter;
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
  type: 'combat' | 'story' | 'empty';
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

interface EmptyEncounter extends BaseEncounter {
  type: 'empty';
  resources?: ResourceReward[];
  message: string;
}

interface EncounterChoice {
  id: string;
  text: string;
  outcomes: {
    resources?: ResourceReward[];
    upgrades?: UpgradeReward[];
    text: string;
    completesRegion?: boolean;
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
  generateEncounter(region: string): CombatEncounter | StoryEncounter | EmptyEncounter {
    const { encounterChance, combatRatio } = REGION_ENCOUNTER_CHANCES[region];
    
    // First determine if an interesting encounter happens at all
    if (Math.random() >= encounterChance) {
      // Generate empty encounter
      return this.generateEmptyEncounter(region);
    }
    
    // Then determine if it's combat or story
    const isCombat = Math.random() < combatRatio;
    
    if (isCombat) {
      return this.generateCombatEncounter(region);
    } else {
      return this.generateStoryEncounter(region);
    }
  }
  
  // Generate a combat encounter
  generateCombatEncounter(region: string): CombatEncounter {
    // Implementation details
  }
  
  // Generate a story encounter
  generateStoryEncounter(region: string): StoryEncounter {
    // Implementation details
  }
  
  // Generate an empty encounter
  generateEmptyEncounter(region: string): EmptyEncounter {
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
  
  // Process empty encounter completion
  processEmptyEncounterCompletion(state: GameState): void {
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
  
  // Handle region completion
  completeRegion(state: GameState, region: string): void {
    // If not already completed, add to completed regions
    if (!state.navigation.completedRegions.includes(region)) {
      state.navigation.completedRegions.push(region);
      
      // Check if all main regions are complete to unlock anomaly
      const mainRegions = ['void', 'nebula', 'blackhole', 'supernova', 'habitable'];
      const completedMainRegions = mainRegions.filter(r => 
        state.navigation.completedRegions.includes(r)
      );
      
      if (completedMainRegions.length === mainRegions.length) {
        // Unlock anomaly region logic
      }
    }
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
      case 'COMPLETE_ENCOUNTER':
        this.handleCompleteEncounter(state);
        break;
      case 'SELECT_REGION':
        this.handleSelectRegion(state, action.payload);
        break;
      // Existing action handlers
    }
  }
  
  // Handle jump initiation
  private handleJumpAction(state: GameState): void {
    const region = state.navigation.currentRegion;
    
    // Generate encounter
    const encounter = this.encounterSystem.generateEncounter(region);
    
    // Update state
    state.encounters.active = true;
    state.encounters.encounter = encounter;
    
    // Log the encounter
    Logger.info(
      LogCategory.ACTIONS, 
      `Encounter triggered: ${encounter.title}`, 
      LogContext.NONE
    );
  }
  
  // Handle region selection
  private handleSelectRegion(state: GameState, payload: { region: string }): void {
    const { region } = payload;
    
    // Ensure only available regions can be selected
    const availableRegions = this.getAvailableRegions(state);
    if (availableRegions.includes(region)) {
      state.navigation.currentRegion = region;
      
      Logger.info(
        LogCategory.ACTIONS,
        `Selected region: ${region}`,
        LogContext.NONE
      );
    }
  }
  
  // Get regions available for selection
  private getAvailableRegions(state: GameState): string[] {
    const { currentRegion, completedRegions } = state.navigation;
    
    // If in void and it's not completed, only void is available
    if (currentRegion === 'void' && !completedRegions.includes('void')) {
      return ['void'];
    }
    
    // If void is completed, all main regions except completed ones are available
    const mainRegions = ['nebula', 'blackhole', 'supernova', 'habitable'];
    const availableRegions = mainRegions.filter(r => !completedRegions.includes(r));
    
    // If all main regions completed, anomaly is available
    if (availableRegions.length === 0 && !completedRegions.includes('anomaly')) {
      return ['anomaly'];
    }
    
    return availableRegions;
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
  
  // Handle jump initiation
  const initiateJump = () => {
    Logger.info(LogCategory.ACTIONS, 'Initiating jump sequence', LogContext.NONE);
    dispatch({ type: 'INITIATE_JUMP' });
  };
  
  // Handle region selection
  const selectRegion = (region) => {
    dispatch({ type: 'SELECT_REGION', payload: { region } });
  };
  
  // Get available regions for selection
  const availableRegions = getAvailableRegions(navigation);
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          {inEncounter ? (
            // Show encounter UI based on type
            getEncounterPanel(encounters.encounter, dispatch)
          ) : (
            // Show navigation panel
            <NavigationPanel 
              currentRegion={navigation.currentRegion}
              availableRegions={availableRegions}
              onJump={initiateJump}
              onSelectRegion={selectRegion}
            />
          )}
        </div>
      </main>
    </GameLoader>
  );
}

// Helper function to get appropriate encounter panel
function getEncounterPanel(encounter, dispatch) {
  switch(encounter?.type) {
    case 'combat':
      return <CombatPanel encounter={encounter} dispatch={dispatch} />;
    case 'story':
      return <StoryPanel encounter={encounter} dispatch={dispatch} />;
    case 'empty':
      return <EmptyPanel encounter={encounter} dispatch={dispatch} />;
    default:
      return null;
  }
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

**Empty Panel Component**
```jsx
function EmptyPanel({ encounter, dispatch }) {
  const { title, description, message, resources } = encounter;
  
  const completeEncounter = () => {
    dispatch({ type: 'COMPLETE_ENCOUNTER' });
  };
  
  return (
    <div className="system-panel p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">{title}</h1>
      <p className="mb-6">{description}</p>
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
        onClick={completeEncounter}
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
  anomaly: { encounterChance: 1.0, combatRatio: 0.5 },
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

const EMPTY_ENCOUNTER_MESSAGES = {
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
- **Start with Empty encounters only**

### Phase 2: Basic Region & Encounter Management (Week 1-2)
- Implement region selection logic
- Create initial empty encounter content for all regions
- Integrate with ActionSystem

### Phase 3: UI Components (Week 2)
- Modify Navigation page to handle encounters
- Create EmptyPanel component
- Enhance navigation to display region selection

### Phase 4: Story Encounters (Week 3)
- Implement story encounter generation
- Create StoryPanel component
- Add story choice handling
- Link stories to region progression

### Phase 5: Combat System (Week 3-4)
- Implement combat encounter generation
- Create CombatPanel component
- Add combat mechanics
- Create combat rewards system

### Phase 6: Region Content Development (Week 4)
- Develop content for all regions
- Balance encounters based on region difficulty
- Implement the anomaly region

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
   - Add animations for transitions between encounters
   - Provide clear feedback for player actions

4. **Metrics & Analytics:**
   - Track encounter outcomes for balancing
   - Measure player resource gains for economic balance
   - Monitor time spent in different encounter types 