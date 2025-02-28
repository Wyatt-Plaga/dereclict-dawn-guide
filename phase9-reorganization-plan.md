# Phase 9: Code Reorganization & Testing - Reorganization Plan

## Current Structure Analysis

The current codebase is organized around a partially domain-driven approach, with directories for major functionalities like `engine`, `resources`, `time`, etc. However, we can improve this by adopting a more comprehensive domain-driven design (DDD) approach that better reflects the game's bounded contexts and aggregates.

## Reorganization Goals

1. **Improve Domain Separation**: Organize code around domain concepts rather than technical concerns
2. **Enhance Discoverability**: Make it easier to locate code related to specific game features
3. **Support Maintainability**: Ensure new team members can understand the system organization quickly
4. **Enable Modularity**: Make it possible to extend or replace subsystems with minimal impact on others
5. **Facilitate Testing**: Support easier testing of domain components in isolation

## New Directory Structure

```
/src
  /core                      # Core domain logic and shared components
    /game                    # Main game engine and state management
      Game.ts                # Main game class (entry point)
      GameState.ts           # Game state definitions
      interfaces.ts          # Core game interfaces
    /events                  # Event system
      EventEmitter.ts        # Event emitter implementation
      GameEvents.ts          # Game event definitions
      
  /domain                    # Domain-specific modules
    /resources               # Resource management domain
      /models                # Resource models
        Resource.ts          # Resource interface
        BaseResource.ts      # Base resource implementation
        EnergyResource.ts    # Energy resource implementation
      /services              # Resource-related services
        ResourceManager.ts   # Resource management service
        ResourceFactory.ts   # Resource creation service
      /commands              # Resource-related commands
        AddResourceCommand.ts # Command to add resources
        ConsumeResourceCommand.ts # Command to consume resources
      index.ts               # Public exports for resources domain

    /time                    # Time management domain
      /models                # Time-related models
        TimeEffect.ts        # Time effect model
        Timestamp.ts         # Timestamp model
      /services              # Time-related services
        GameTime.ts          # Game time service
        TimeManager.ts       # Time management service
        ProgressCalculator.ts # Progress calculation service
        OfflineManager.ts    # Offline progress management
      index.ts               # Public exports for time domain

    /upgrades                # Upgrade management domain
      /models                # Upgrade models
        Upgrade.ts           # Upgrade interface
        BaseUpgrade.ts       # Base upgrade implementation
        ResourceUpgrade.ts   # Resource-specific upgrade
      /services              # Upgrade-related services
        UpgradeManager.ts    # Upgrade management service
        UpgradeFactory.ts    # Upgrade creation service
      index.ts               # Public exports for upgrades domain

    /logs                    # Logging domain
      /models                # Log models
        Log.ts               # Log model
        LogCategory.ts       # Log categories
        LogLevel.ts          # Log levels
      /services              # Log-related services
        LogManager.ts        # Log management service
      index.ts               # Public exports for logs domain

    /commands                # Command processing domain
      /models                # Command models
        Command.ts           # Command interface
        CommandResult.ts     # Command result interface
      /services              # Command-related services
        CommandProcessor.ts  # Command processing service
      index.ts               # Public exports for commands domain

    /milestones              # Milestone management domain
      /models                # Milestone models
        Milestone.ts         # Milestone interface
        MilestoneCondition.ts # Milestone condition
      /services              # Milestone-related services
        MilestoneManager.ts  # Milestone management service
      index.ts               # Public exports for milestones domain

  /infrastructure            # Infrastructure concerns
    /persistence             # Persistence layer
      GameSaveManager.ts     # Game saving/loading
      LocalStorageAdapter.ts # LocalStorage implementation
    /serialization           # Serialization utilities
      GameStateSerializer.ts # Game state serialization

  /ui                        # UI components (React)
    /components              # React components
      /resources             # Resource-related components
      /upgrades              # Upgrade-related components
      /logs                  # Log-related components
    /hooks                   # Custom React hooks
      useGame.ts             # Hook for accessing game state
      useResources.ts        # Hook for resource operations
      useUpgrades.ts         # Hook for upgrade operations

  /utils                     # Utility functions
    time.ts                  # Time utilities
    random.ts                # Random generation utilities
    format.ts                # Formatting utilities

  /tests                     # Tests directory
    /unit                    # Unit tests
    /integration             # Integration tests
    /e2e                     # End-to-end tests
    /mocks                   # Test mocks and fixtures
```

## Migration Approach

To minimize disruption, we'll follow a phased approach to reorganization:

1. **Create the new structure** alongside the existing code
2. **Move and adapt files** one domain at a time, starting with the most independent domains
3. **Update imports** in each file as it's moved
4. **Create index.ts files** to simplify imports from other domains
5. **Run tests** after each domain is migrated to ensure functionality is preserved
6. **Remove old files/directories** once the migration is complete and tested

## Implementation Plan

### Phase 1: Core Structure Setup
- Create the new directory structure
- Establish domain boundaries and interfaces
- Set up index.ts files for clean imports

### Phase 2: Resources Domain Migration
- Move resource-related files to the new structure
- Update imports and references
- Test resource functionality

### Phase 3: Time Domain Migration
- Move time-related files
- Update imports and references
- Test time and offline progress functionality

### Phase 4: Commands Domain Migration
- Move command-related files
- Update imports and references
- Test command processing

### Phase 5: Logs and Events Migration
- Move logging and event-related files
- Update imports and references
- Test logging and event functionality

### Phase 6: Upgrades and Milestones Migration
- Move upgrade and milestone related files
- Update imports and references
- Test upgrade and milestone functionality

### Phase 7: Game Class Refactoring
- Refactor the main Game class to use the new structure
- Ensure all domain interactions are properly managed
- Implement cleaner interfaces between domains

### Phase 8: UI Connection
- Update UI components to use the new structure
- Create new hooks as needed
- Ensure all functionality is preserved

## Testing Strategy

Each migration step will include:
1. **Unit tests** for the migrated components
2. **Integration tests** to ensure domains work together correctly
3. **End-to-end tests** to validate complete game functionality

## Expected Benefits

1. **Improved code organization** with clear domain boundaries
2. **Better separation of concerns** between different game systems
3. **More maintainable codebase** with reduced coupling between components
4. **Easier onboarding** for new developers with clearer code organization
5. **Enhanced testability** through better isolation of components
6. **More sustainable growth** of the codebase as new features are added 