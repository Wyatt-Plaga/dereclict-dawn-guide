# Combat System Implementation

## Overview

The Combat System is a real-time battle mechanic for Derelict Dawn that allows players to engage with enemies encountered during their journey. The system features cooldown-based actions, resource costs, region-specific enemies, and rewards/penalties that integrate with the game's existing resource management.

## Architecture

The combat system consists of several key components that work together:

1. **`CombatSystem` Class**: The core class responsible for combat mechanics
2. **Combat-related Types**: Added to the game state to track combat data
3. **Action System Integration**: Updates to handle combat actions
4. **Encounter System Integration**: Changes to generate combat encounters
5. **UI Integration**: Combat actions in the battle page component

## Key Components

### 1. CombatSystem Class

Located at `app/game/systems/CombatSystem.ts`, this class manages all combat-related functionality:

- **Encounter Generation**: Creates region-specific enemy encounters
- **Combat Flow**: Manages real-time combat with cooldowns
- **Enemy AI**: Processes enemy turns and action selection
- **Combat Resolution**: Handles victory, defeat, and retreat outcomes

Key methods include:
- `generateCombatEncounter`: Creates enemies based on the current region
- `initCombat`: Sets up the combat state when entering battle
- `processCombatAction`: Handles player actions during combat
- `endCombat`: Applies rewards or penalties when combat ends

### 2. Combat State Integration

The Combat System extends the game state with:

```typescript
// Combat State interface
export interface CombatState {
  inCombat: boolean;
  currentEnemy?: Enemy;
  shipHealth: number;
  maxShipHealth: number;
  shipShield: number;
  maxShipShield: number;
  battleLog: BattleLogEntry[];
  combatTurn: number;
  lastPlayerActionTime: number;
  cooldowns: Record<string, number>; // Action name -> timestamp when available
}
```

### 3. Enemies and Actions

Enemies are region-specific and have different attributes and action patterns:

```typescript
// Enemy interface
export interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  image: string;
  attackDelay: number; // Time in ms between enemy attacks
  lastAttackTime: number; // Last time the enemy attacked
  actions: EnemyAction[];
  region: RegionType;
}
```

Enemy actions are defined with:

```typescript
// Enemy Action interface
export interface EnemyAction {
  name: string;
  description: string;
  damage: number;
  target: 'health' | 'shield';
  probability: number;
}
```

### 4. Combat Actions

The system implements several combat actions, each with:
- Resource costs
- Cooldown periods
- Effects on the enemy or player ship

Main combat actions include:

| Action | Resource Cost | Cooldown | Effect |
|--------|---------------|----------|--------|
| Raise Shields | 10 Energy | 8s | +15 Ship Shield |
| Plasma Cannon | 15 Scrap | 5s | 20 Damage to Enemy |
| Missile Barrage | 25 Scrap | 10s | 30 Damage (bypasses shields) |
| Hull Repair | 2 Crew | 12s | +15 Ship Health |
| Shield Recharge | 3 Crew | 10s | +20 Ship Shield |
| System Bypass | 4 Crew | 20s | Reduces all cooldowns by 50% |
| Sabotage | 8 Insight | 15s | Enemy loses a turn |
| Scan | 5 Insight | 7s | Reveals enemy information |
| Find Weakness | 12 Insight | 18s | Deals 15 damage to enemy |
| Sensor Overload | 10 Insight | 20s | Disables enemy shields |

### 5. Logging Integration

The combat system integrates with the game's logging system by adding:

```typescript
// Added to LogCategory
COMBAT = 'combat'         // Combat system

// Added to LogContext
COMBAT = 'combat'         // Combat interactions
```

### 6. Action System Integration

The ActionSystem was updated to handle two new action types:

```typescript
// Combat Action
export interface CombatAction extends GameAction {
  type: 'COMBAT_ACTION';
  payload: {
    actionType: string;
  };
}

// Retreat From Battle Action
export interface RetreatFromBattleAction extends GameAction {
  type: 'RETREAT_FROM_BATTLE';
}
```

### 7. Encounter Generation

Combat encounters are generated based on region probabilities:

```typescript
// Region-specific encounter chances
export const REGION_ENCOUNTER_CHANCES: Record<RegionType, { combat: number, empty: number, narrative: number }> = {
  'void': { combat: 0.1, empty: 0.7, narrative: 0.2 },
  'nebula': { combat: 0.3, empty: 0.5, narrative: 0.2 },
  'asteroid': { combat: 0.5, empty: 0.3, narrative: 0.2 },
  'deepspace': { combat: 0.7, empty: 0.2, narrative: 0.1 },
  'blackhole': { combat: 0.9, empty: 0.05, narrative: 0.05 }
};
```

## Combat Flow

1. **Encounter Generation**:
   - Combat encounters are generated based on region probabilities
   - When a combat encounter is selected, the EncounterSystem calls CombatSystem.initCombat()

2. **Combat Initialization**:
   - Sets up the combat state with ship and enemy properties
   - Initializes the battle log with initial entries
   - Sets all action cooldowns to 0 (ready to use)

3. **Combat Actions**:
   - Player selects actions from the UI
   - Game dispatches 'COMBAT_ACTION' with actionType
   - CombatSystem checks resource cost and cooldown before applying
   - Action results are logged to the battle log

4. **Enemy Turn**:
   - Enemies attack after their attackDelay period
   - Actions are selected based on probability weights
   - Damage is applied to player shields or hull

5. **Combat Resolution**:
   - Victory: When enemy health reaches 0
     - Player receives resource rewards
     - Combat is added to encounter history
   - Defeat: When player ship health reaches 0
     - Player loses all resources 
     - Combat is added to encounter history
   - Retreat: When player chooses to retreat
     - Player loses 25% of all resources
     - Combat is added to encounter history

## Integration with Game Systems

The combat system is integrated with:

1. **GameSystemManager**: Added CombatSystem and set up proper initialization
2. **EncounterSystem**: Updated to generate and handle combat encounters
3. **ActionSystem**: Extended to process combat actions and retreat
4. **Resource System**: Combat actions consume and generate resources
5. **Logging System**: Added combat categories and contexts for logging

## Future Enhancements

Possible enhancements to the combat system could include:

1. **Upgrade Integration**: Linking combat abilities with the UpgradeSystem
2. **Status Effects**: Adding temporary buffs/debuffs during combat
3. **Multiple Enemies**: Expanding combat to handle multiple enemies at once
4. **Special Abilities**: Adding special abilities that unlock as the game progresses
5. **Combat Strategy**: Implementing more complex enemy AI and tactics
6. **Difficulty Scaling**: Increasing enemy difficulty based on game progression 