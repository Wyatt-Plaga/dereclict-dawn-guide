# Testing Guide for Migrated Components

This document outlines the testing strategy for the domain-driven game engine architecture.

## Component Testing

### 1. Game Engine Core

#### Test Setup
```tsx
import { Game } from '../../core/game/Game';

describe('Game Engine Core', () => {
  let game: Game;
  
  beforeEach(() => {
    game = new Game();
  });
  
  // Tests go here
});
```

#### Test Cases
- Initialization: Verify core systems are initialized
- Event emitter: Test event subscription and emission
- Command execution: Test command validation and execution
- State saving/loading: Test saving and loading game state

### 2. Resource System

#### Test Cases
- Resource creation: Test creating different types of resources
- Resource updates: Test adding/subtracting from resources
- Resource serialization: Test saving/loading resource state
- Resource rate calculation: Test production rate calculation
- Resource capacity: Test reaching capacity limits

### 3. Upgrade System

#### Test Cases
- Upgrade availability: Test conditions for upgrade visibility and availability
- Upgrade purchase: Test purchasing upgrades (including resource costs)
- Upgrade effects: Test that upgrade effects are correctly applied
- Upgrade serialization: Test saving/loading upgrade state

### 4. Command System

#### Test Cases
- Command validation: Test command validation logic
- Resource commands: Test resource updating commands
- Upgrade commands: Test upgrade purchase commands
- Command history: Test command history tracking
- Command undoing: Test command undo functionality (where supported)

### 5. Log System

#### Test Cases
- Log creation: Test creating logs at different levels
- Log filtering: Test filtering logs by category, level, etc.
- Log serialization: Test saving/loading log state

## Integration Testing

### 1. Game Loop Integration

Test the core game loop by simulating time passing:

```typescript
it('should update resources based on time passing', () => {
  // Setup test resources
  const energy = game.getResources().createResource({
    id: 'energy',
    type: 'energy',
    name: 'Energy',
    amount: 10,
    capacity: 100,
    rate: 1 // 1 per second
  });
  
  // Simulate 10 seconds passing
  for (let i = 0; i < 10; i++) {
    game.updateResources(1); // 1 second
  }
  
  // Check that resources were updated
  expect(energy.getAmount()).toBeCloseTo(20);
});
```

### 2. Upgrade and Resource Integration

Test that upgrades correctly affect resources:

```typescript
it('should increase resource production rate when upgrade purchased', () => {
  // Setup test resources and upgrades
  const energy = game.getResources().createResource({
    id: 'energy',
    type: 'energy',
    name: 'Energy',
    amount: 100,
    capacity: 100,
    rate: 1
  });
  
  // Purchase an upgrade that affects production rate
  const command = new PurchaseUpgradeCommand(
    'test_purchase',
    'energy_production_boost',
    game.getResources()
  );
  
  game.executeCommand(command);
  
  // Check that energy production rate has increased
  expect(energy.getRate()).toBeGreaterThan(1);
});
```

## UI Component Testing

### 1. Resource Display Component

```tsx
it('should display the correct resource information', () => {
  // Mock game engine
  const mockGame = {
    getResources: () => ({
      getResource: () => ({
        getId: () => 'energy',
        getType: () => 'energy',
        getAmount: () => 50,
        getCapacity: () => 100,
        getRate: () => 1,
        properties: { name: 'Energy' }
      })
    })
  };
  
  // Render with mocked hook
  const { getByText } = render(
    <ResourceDisplay resourceId="energy" />
  );
  
  // Check that resource info is displayed correctly
  expect(getByText('Energy')).toBeInTheDocument();
  expect(getByText('50.0 / 100.0')).toBeInTheDocument();
  expect(getByText('Rate: 1.00/sec')).toBeInTheDocument();
});
```

### 2. Upgrade Card Component

Test that upgrade information is displayed correctly and purchase functionality works.

### 3. Log Display Component

Test that logs are displayed correctly and filtering works.

## End-to-End Testing

1. **Game Initialization Test**: Verify the game initializes with default resources, upgrades, and logs.

2. **Resource Flow Test**: Test the complete flow of resource production, consumption, and upgrades.

3. **Save/Load Test**: Verify game state can be saved and loaded correctly.

4. **Offline Progress Test**: Test that offline progress calculation works correctly.

## Manual Testing Checklist

- [ ] Start a new game and verify initial resources are correct
- [ ] Check that resources increase over time
- [ ] Purchase available upgrades and verify effects
- [ ] Verify that upgrades become available/visible as requirements are met
- [ ] Check log display for game events
- [ ] Test save/load functionality
- [ ] Test offline progress calculation
- [ ] Verify UI updates correctly as game state changes 