# Combat System Implementation

## Overview

The Combat System is a real-time battle mechanic for Derelict Dawn that allows players to engage with enemies encountered during their journey. The system features cooldown-based player actions, resource costs, region-specific enemies, and rewards/penalties that integrate with the game's existing resource management via the Event Bus.

## Architecture

The combat system consists of several key components that work together:

1. **`CombatSystem` Class**: The core class responsible for combat mechanics, loading enemies, processing actions, and handling outcomes.
2. **Combat-related Types**: Located in `app/game/types/combat.ts`, defining structures like `CombatState`, `EnemyDefinition`, `RegionEnemyAction`, `CombatActionDefinition`, etc.
3. **Enemy Definitions**: Located in `app/game/content/enemies/`, organized by region (e.g., `voidEnemies.ts`). Each file exports arrays of `EnemyDefinition` objects, which include inline definitions of their actions (`RegionEnemyAction`).
4. **Enemy Registry**: `app/game/content/enemies/index.ts` imports all regional enemy arrays and creates `ALL_ENEMIES_MAP`, a central lookup map used by `CombatSystem` to load enemy data efficiently.
5. **Player Actions**: Defined centrally in `app/game/content/combatActions.ts` as `PLAYER_ACTIONS`.
6. **Action System Integration**: Handles the `COMBAT_ACTION` and `RETREAT_FROM_BATTLE` action types.
7. **Event Bus Integration**: `CombatSystem` listens for `combatEncounterTriggered` events and emits `resourceChange` events for costs, rewards, and penalties.
8. **UI Integration**: Combat UI components (e.g., `app/battle/page.tsx`) interact with the system by dispatching actions.

## Key Components

### 1. CombatSystem Class (`app/game/systems/CombatSystem.ts`)

Manages all combat-related functionality:

- **Enemy Loading**: Uses `ALL_ENEMIES_MAP` via `getEnemyDefinition` to retrieve enemy data.
- **Combat Flow**: Manages turn-based combat logic, player/enemy actions, cooldowns, and status effects.
- **Resource Handling**: Uses `hasSufficientResources` helper for cost checks. Emits `resourceChange` events for action costs, victory rewards (`processVictoryRewards`), and retreat penalties (`retreatFromCombat`).
- **Enemy AI**: Processes enemy turns (`performEnemyAction`) and selects actions (`selectEnemyAction`) based on probabilities defined in the enemy's `actions` array.
- **Combat Resolution**: Handles victory, defeat, and retreat outcomes (`endCombatEncounter`).

Key methods include:
- `startCombatEncounter`: Initializes the combat state based on an incoming event.
- `performCombatAction`: Handles player actions, checks costs/cooldowns, applies effects, and triggers the enemy turn.
- `performEnemyAction`: Selects and applies an enemy action based on its definition.
- `endCombatEncounter`: Finalizes combat, applies rewards/penalties via events.
- `retreatFromCombat`: Handles the retreat action and applies resource penalties via events.

### 2. Combat State Integration (`app/game/types/index.ts`)

The `CombatState` interface within the main `GameState`:

```typescript
// Located in app/game/types/index.ts
export interface CombatState {
  active: boolean;
  currentEnemy: string | null; // ID of the current enemy
  currentRegion: RegionType | null; // Use RegionType enum
  currentSubRegion?: string | null; 
  turn: number;
  encounterCompleted: boolean;
  outcome?: 'victory' | 'defeat' | 'retreat';
  playerStats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    statusEffects: StatusEffectInstance[]; // Use specific type
  };
  enemyStats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    statusEffects: StatusEffectInstance[]; // Use specific type
  };
  battleLog: BattleLogEntry[];
  availableActions: string[]; // IDs of player actions
  cooldowns: Record<string, number>; // Action ID -> turns remaining
  lastActionResult?: ActionResult; // Use specific type
  rewards?: { // Perhaps remove if rewards handled solely by events?
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
  };
  enemyIntentions: any | null; // Consider defining a type
}
```
*(Note: The documented interface reflects the actual structure in `index.ts`, which might differ slightly from the older version shown previously in this file).*

### 3. Enemies and Actions (`app/game/types/combat.ts`, `app/game/content/enemies/`)

Enemies (`EnemyDefinition`) are defined in regional files (e.g., `voidEnemies.ts`) and loaded via `ALL_ENEMIES_MAP`. Enemy actions are defined *inline* within each `EnemyDefinition`:

```typescript
// Enemy Definition (in types/combat.ts)
export interface EnemyDefinition {
  id: string;
  // ... other properties (name, health, shield, loot, etc.)
  actions: RegionEnemyAction[]; // Array of action objects
  // ...
}

// Inline Enemy Action (in types/combat.ts)
export interface RegionEnemyAction {
  name: string;
  description: string;
  damage: number;
  target: 'health' | 'shield';
  probability: number;
}
```

### 4. Player Combat Actions (`app/game/content/combatActions.ts`)

Player actions (`CombatActionDefinition`) are defined centrally in `PLAYER_ACTIONS` with:
- Resource costs (`ResourceCost`)
- Cooldown periods (turns)
- Effects (damage, shield/hull repair, status effects)

*(The table showing specific actions might be outdated, refer to the `PLAYER_ACTIONS` object in the code for current details).*

### 5. Logging Integration (`app/utils/logger.ts`)

The combat system uses `LogCategory.COMBAT` and `LogContext.COMBAT` / `LogContext.COMBAT_ACTION` for relevant logging statements.

### 6. Action System Integration

The `ActionSystem` processes `COMBAT_ACTION` (payload: `{ actionId: string }`) and `RETREAT_FROM_BATTLE` actions, delegating them to the `CombatSystem`.

### 7. Encounter System Integration

The `EncounterSystem` can generate `combat` type encounters or trigger combat via `StoryEncounter` choices. It emits a `combatEncounterTriggered` event with `{ state, enemyId, regionId, subRegionId }` payload, which the `CombatSystem` listens for to initiate battles via `startCombatEncounter`.

## Combat Flow

1. **Encounter Trigger**: `EncounterSystem` emits `combatEncounterTriggered` event.
2. **Combat Initialization**: `CombatSystem` listener calls `startCombatEncounter`, setting up `CombatState` using data from `ALL_ENEMIES_MAP`.
3. **Player Turn**:
    - Player selects action via UI.
    - `ActionSystem` dispatches `COMBAT_ACTION`.
    - `CombatSystem.performCombatAction` is called:
        - Checks cooldowns.
        - Checks resources using `hasSufficientResources`.
        - Emits `resourceChange` event for cost.
        - Applies action effects (`applyActionEffects`).
        - Logs result to `battleLog`.
        - Checks for enemy defeat.
        - Calls `performEnemyAction`.
        - Checks for player defeat.
        - Increments turn, reduces cooldowns, processes status effects.
4. **Enemy Turn** (`performEnemyAction`):
    - Selects action from enemy's `actions` array based on probability (`selectEnemyAction`).
    - Applies damage/effects to player.
    - Logs result to `battleLog`.
    - Checks for player defeat.
5. **Combat Resolution** (`endCombatEncounter`):
    - Triggered by player/enemy health reaching 0 or retreat action.
    - Sets outcome (`victory`, `defeat`, `retreat`).
    - **Victory**: Calls `processVictoryRewards` which emits `resourceChange` events for loot.
    - **Defeat**: (Currently no specific penalty applied via events in `endCombatEncounter`).
    - **Retreat**: Handled by `retreatFromCombat`, which emits `resourceChange` events for penalties before calling `endCombatEncounter`.
    - Sets `combat.active` to false.

## Integration with Game Systems

The combat system is integrated with:

1. **GameSystemManager**: (Assumed) Instantiates `CombatSystem` and likely passes the `EventBus`.
2. **EncounterSystem**: Triggers combat via the `combatEncounterTriggered` event.
3. **ActionSystem**: Processes player combat/retreat actions.
4. **Resource System**: (Indirectly via Event Bus) Handles `resourceChange` events emitted by `CombatSystem` for costs, rewards, and penalties.
5. **Logging System**: Uses specific categories/contexts.

## Future Enhancements

Possible enhancements to the combat system could include:

1. **Upgrade Integration**: Linking combat abilities with the UpgradeSystem
2. **Status Effects**: Adding temporary buffs/debuffs during combat
3. **Multiple Enemies**: Expanding combat to handle multiple enemies at once
4. **Special Abilities**: Adding special abilities that unlock as the game progresses
5. **Combat Strategy**: Implementing more complex enemy AI and tactics
6. **Difficulty Scaling**: Increasing enemy difficulty based on game progression 