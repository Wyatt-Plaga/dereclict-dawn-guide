# Log System Documentation

## Overview

The Log System in Derelict Dawn Guide manages the game's narrative progression through discoverable logs. It serves as the primary storytelling mechanism, providing players with background information, plot details, and game lore. The system handles log discovery based on game progression, tracks read/unread status, and organizes logs by categories to create an immersive story experience.

## Architecture

The Log System follows a condition-based progression architecture with the following key architectural concepts:

1. **Conditional Discovery**: Logs unlock when specific game conditions are met, creating a progression-based narrative.
2. **Category Organization**: Logs are organized by categories (Ship Systems, Crew Records, Mission Data, etc.) for thematic clarity.
3. **Direct State Manipulation**: Modifies the game state directly when marking logs as read/unread.
4. **Read Status Tracking**: Maintains lists of read/unread logs for UI notification purposes.
5. **Content Separation**: Log definitions are stored separately from the system logic for easy content updates.

## Core Classes and Interfaces

### Primary Class
- **LogSystem**: The main class responsible for managing all log-related functionality
  - Constructor: Initializes with LOG_DEFINITIONS content
  - Key methods:
    - `update(state: GameState, delta: number)`: Checks for unlockable logs based on current game state
    - `markLogRead(state: GameState, logId: string)`: Marks a specific log as read
    - `markAllLogsRead(state: GameState)`: Marks all discovered logs as read
    - `checkForUnlockableLogs(state: GameState)`: Private method that evaluates log unlock conditions
    - `unlockLog(state: GameState, logId: string)`: Private method that adds a newly discovered log to the state

### Key Types
- **LogEntry**: Represents a discovered log in the game state
  ```typescript
  interface LogEntry {
      id: string;
      title: string;
      content: string;
      timestamp: number; // When it was discovered
      category: LogCategory;
      isRead: boolean;
  }
  ```

- **LogDefinition**: Defines a log that can be discovered
  ```typescript
  interface LogDefinition {
      title: string;
      content: string;
      category: LogCategory;
      unlockConditions: LogUnlockCondition[];
  }
  ```

- **LogUnlockCondition**: Defines conditions for log discovery
  ```typescript
  type LogUnlockCondition = 
      | ResourceThresholdCondition
      | UpgradePurchasedCondition
      | MultiCondition;
  ```

- **LogCategory**: Enum defining different log categories
  ```typescript
  enum LogCategory {
      SHIP_SYSTEMS = "Ship Systems",
      CREW_RECORDS = "Crew Records",
      MISSION_DATA = "Mission Data",
      PERSONAL_LOGS = "Personal Logs",
      UNKNOWN = "Unknown"
  }
  ```

## Data Flow

1. **Log Discovery Process**:
   - The `update` method is called regularly by the Game Engine
   - For each undiscovered log, unlock conditions are evaluated against the current game state
   - When conditions are met, the log is added to the discovered logs and marked as unread

2. **Log Reading Process**:
   - Player accesses the Logs page in the UI
   - When a log is clicked, the UI dispatches a `MARK_LOG_READ` action
   - The Action System routes this to the Log System's `markLogRead` method
   - The log is marked as read and removed from the unread list
   - UI updates to reflect the read status

3. **Batch Processing**:
   - When "Mark all as read" is clicked, the UI dispatches a `MARK_ALL_LOGS_READ` action
   - The Action System routes this to the Log System's `markAllLogsRead` method
   - All logs are marked as read and the unread list is cleared

## Key Components

### Log Unlock Condition Checking
```typescript
private checkUnlockConditions(state: GameState, conditions: LogUnlockCondition[]): boolean {
    return conditions.every(condition => this.checkSingleCondition(state, condition));
}

private checkSingleCondition(state: GameState, condition: LogUnlockCondition): boolean {
    switch (condition.type) {
        case 'RESOURCE_THRESHOLD':
            return this.checkResourceThreshold(state, condition as ResourceThresholdCondition);
        case 'UPGRADE_PURCHASED':
            return this.checkUpgradePurchased(state, condition as UpgradePurchasedCondition);
        case 'MULTI_CONDITION':
            const multiCondition = condition as any; // TypeScript workaround
            return multiCondition.operator === 'AND' 
                ? multiCondition.conditions.every((c: LogUnlockCondition) => this.checkSingleCondition(state, c))
                : multiCondition.conditions.some((c: LogUnlockCondition) => this.checkSingleCondition(state, c));
        default:
            return false;
    }
}
```

### Log Discovery Implementation
```typescript
private checkForUnlockableLogs(state: GameState) {
    // Make sure logs structure exists
    if (!state.logs) {
        state.logs = { discovered: {}, unread: [] };
    } else if (!state.logs.discovered) {
        state.logs.discovered = {};
        state.logs.unread = state.logs.unread || [];
    }
    
    Object.entries(this.logDefinitions).forEach(([logId, logDef]) => {
        // Skip already discovered logs
        if (state.logs.discovered[logId]) return;
        
        // Check if conditions are met
        if (this.checkUnlockConditions(state, logDef.unlockConditions)) {
            this.unlockLog(state, logId);
        }
    });
}

private unlockLog(state: GameState, logId: string) {
    const logDef = this.logDefinitions[logId];
    state.logs.discovered[logId] = {
        id: logId,
        title: logDef.title,
        content: logDef.content,
        timestamp: Date.now(),
        category: logDef.category,
        isRead: false
    };
    state.logs.unread.push(logId);
}
```

### Resource Threshold Condition Check
```typescript
private checkResourceThreshold(state: GameState, condition: ResourceThresholdCondition): boolean {
    const { category, resourceType, threshold } = condition;
    
    try {
        // Safety check: Make sure category exists
        if (!state.categories[category]) {
            return false;
        }
        
        // Get category resources with proper typing
        const categoryResources = state.categories[category].resources;
        
        // Safety check: Make sure resources object exists
        if (!categoryResources) {
            return false;
        }
        
        // Use type assertion to access the dynamic property
        const resourceValue = categoryResources[resourceType as keyof typeof categoryResources];
        
        // Return false if resource doesn't exist
        if (resourceValue === undefined) {
            return false;
        }
        
        // Handle different resource structures (object vs number)
        const amount = typeof resourceValue === 'object' 
            ? (resourceValue as any).amount || 0 
            : resourceValue as number;
        
        return amount >= threshold;
    } catch (error) {
        // Log error and return false if any exception occurs
        console.error('Error checking resource threshold:', error);
        return false;
    }
}
```

## Integration Points

The Log System interacts with several other systems:

1. **Game Engine**: 
   - The Game Engine calls the Log System's `update` method during each game loop iteration
   - This ensures logs are unlocked as game state changes

2. **Resource System**: 
   - Log unlocking conditions often depend on resource thresholds
   - `ResourceThresholdCondition` checks require analyzing resource amounts

3. **Upgrade System**: 
   - Log unlocking conditions can depend on purchased upgrades
   - `UpgradePurchasedCondition` checks require analyzing upgrade levels

4. **Action System**: 
   - Processes user actions related to logs like marking them as read/unread
   - Routes log-related actions to the Log System

5. **Game State**: 
   - Stores all discovered logs with their read/unread status
   - Maintains a list of unread logs for notification purposes

## UI Components

The Log System is presented through the Logs Page UI component:

1. **Logs Page** (`app/logs/page.tsx`):
   - Displays all discovered logs organized by category
   - Provides a sidebar list of all available logs
   - Shows unread status with visual indicators (red dot)
   - Offers a "Mark all as read" button for batch processing
   - Displays log content with proper formatting
   - Updates read status when logs are viewed

2. **Visual Elements**:
   - Category-based filtering of logs
   - Timestamp display for each log
   - Highlighting of the currently selected log
   - Unread count indicator
   - System panel styling for the log viewer

3. **Interaction Patterns**:
   - Clicking a log title selects it and marks it as read
   - Batch marking all logs as read
   - Filtering logs by category

## Configuration

The Log System is primarily configured through the `LOG_DEFINITIONS` in `app/game/content/logDefinitions.ts`:

```typescript
export const LOG_DEFINITIONS: Record<string, LogDefinition> = {
    "log_initial_awakening": {
        title: "Emergency Wake Protocol",
        content: "System log: Emergency wake protocol initiated. Ship AI detected critical system failure. One crew member revived from stasis to assess situation.\n\nStatus report: Life support at 18% capacity. Main reactor offline. Navigation systems offline. Communication systems offline.\n\nPriority: Restore power to essential systems.",
        category: LogCategory.SHIP_SYSTEMS,
        unlockConditions: [
            { 
                type: 'RESOURCE_THRESHOLD', 
                category: 'reactor', 
                resourceType: 'energy', 
                threshold: 5 
            }
        ]
    },
    // Additional log definitions...
}
```

Each log definition includes:
- A unique identifier
- Title and content text
- Log category for organization
- Unlock conditions that determine when the log becomes available

## Examples

### Checking for Unlockable Logs

```typescript
// Typically called by the Game Engine during the update loop
logSystem.update(gameState, deltaTime);

// Internally, the Log System checks each undiscovered log
Object.entries(this.logDefinitions).forEach(([logId, logDef]) => {
    // Skip already discovered logs
    if (state.logs.discovered[logId]) return;
    
    // Check if conditions are met
    if (this.checkUnlockConditions(state, logDef.unlockConditions)) {
        this.unlockLog(state, logId);
    }
});
```

### Marking a Log as Read

```typescript
// Typically triggered from the UI when a player views a log
dispatch({
  type: 'MARK_LOG_READ',
  payload: { logId: 'log_captain_final_entry' }
});

// In the Action System, which delegates to Log System
handleMarkLogRead(state, logId) {
  // Use the log system to mark the log as read
  return this.manager.log.markLogRead(state, logId);
}
```

### Creating a Multi-Condition Log

```typescript
// This log requires both a resource threshold AND an upgrade purchase
{
  "log_classified_mission_data": {
    title: "Classified Mission Parameters",
    content: "...",
    category: LogCategory.MISSION_DATA,
    unlockConditions: [
      { 
        type: 'MULTI_CONDITION',
        operator: 'AND',
        conditions: [
          { type: 'RESOURCE_THRESHOLD', category: 'processor', resourceType: 'insight', threshold: 50 },
          { type: 'UPGRADE_PURCHASED', category: 'processor', upgradeId: 'mainframeExpansions' }
        ]
      }
    ]
  }
}
```

## Future Considerations

1. **Advanced Condition Types**: Expand the condition system to include event-based, region-based, or time-based conditions.

2. **Interactive Logs**: Develop logs that include choices for the player, affecting game progression.

3. **Log Sequences**: Implement chain stories where one log unlocks others in sequence.

4. **Media Integration**: Add support for image or audio logs for more immersive storytelling.

5. **Search Functionality**: Add the ability to search through log content.

6. **Log Annotations**: Allow players to annotate logs for their own reference.

7. **Notification System**: Create more prominent notifications when important logs are discovered.

8. **Export Functionality**: Allow players to export the ship's log as a complete narrative.

9. **Codex Integration**: Connect logs to a broader codex system that provides additional context.

10. **Conditional Content**: Allow log content to change based on player choices or game state. 