# UI Components Documentation

## Overview

Derelict Dawn Guide uses a robust set of UI components that interface with the game systems through the Game Provider. These components are responsible for visualizing the game state, capturing user interactions, and providing feedback to the player. The UI layer is built with React and follows a component-based architecture that emphasizes reusability, region-based styling, and responsive design.

## Architecture

The UI component architecture follows these key principles:

1. **Game State Integration**: Components consume game state through the `useGame` hook, ensuring consistent access to the latest state.
2. **Region-Based Styling**: UI elements adapt their visual styling based on the current game region, providing contextual visual cues.
3. **Responsive Layout**: Components are designed to work across different device sizes using Tailwind CSS's responsive utilities.
4. **Component Composition**: Complex interfaces are built from smaller, reusable components to maintain maintainability.
5. **Conditional Rendering**: Components intelligently render different UI states based on game conditions.

## Core Components

### Navigation Components
- **NavBar**: Main navigation interface for moving between ship systems
  ```tsx
  function NavBar() {
    const { state } = useGame();
    // ... implementation
  }
  ```

- **SystemNavigation**: Sub-navigation within specific ship systems
  ```tsx
  interface SystemNavigationProps {
    category: GameCategory;
    items: { label: string; href: string; icon: LucideIcon }[];
  }

  function SystemNavigation({ category, items }: SystemNavigationProps) {
    // ... implementation
  }
  ```

### Game Status Components
- **ResourceDisplay**: Shows current resource levels and production rates
  ```tsx
  interface ResourceDisplayProps {
    resource: Resource;
    production: number;
    capacity: number;
  }

  function ResourceDisplay({ resource, production, capacity }: ResourceDisplayProps) {
    // ... implementation
  }
  ```

- **SystemStatus**: Displays the status of ship systems including alerts
  ```tsx
  function useSystemStatus() {
    const { state } = useGame();
    // ... implementation to calculate system status
    return { 
      systemHealth,
      shouldFlicker,
      alertLevel 
    };
  }
  ```

### Encounter Components
- **CombatEncounterContent**: Displays combat encounter information with region-specific styling
  ```tsx
  interface CombatEncounterContentProps {
    encounter: BaseEncounter;
  }

  const CombatEncounterContent: React.FC<CombatEncounterContentProps> = ({ encounter }) => {
    return (
      <div className={`mb-8 system-panel p-6 transition-all duration-300 hover:shadow-md ${
        encounter.region === 'void' ? 'hover:shadow-slate-800/30' :
        encounter.region === 'nebula' ? 'hover:shadow-indigo-800/30' :
        encounter.region === 'asteroid' ? 'hover:shadow-amber-800/30' :
        encounter.region === 'deepspace' ? 'hover:shadow-blue-800/30' :
        encounter.region === 'blackhole' ? 'hover:shadow-zinc-800/30' : 'hover:shadow-slate-800/30'
      }`}>
        <p className={`text-xl mb-4 leading-relaxed ${
          encounter.region === 'void' ? 'text-slate-200' :
          encounter.region === 'nebula' ? 'text-indigo-200' :
          encounter.region === 'asteroid' ? 'text-amber-100' :
          encounter.region === 'deepspace' ? 'text-blue-200' :
          encounter.region === 'blackhole' ? 'text-zinc-200' : 'text-slate-200'
        }`}>{encounter.description}</p>
        
        {/* Special message for combat encounters */}
        <div className="mt-6 border-t border-accent/30 pt-4">
          <p className="text-lg text-red-400 flex items-center gap-2 font-semibold">
            <Sword className="h-5 w-5" />
            <span>Hostile entity detected - prepare for combat!</span>
          </p>
        </div>
      </div>
    );
  };
  ```

- **EncounterDisplay**: Renders different encounter types with appropriate UI
  ```tsx
  interface EncounterDisplayProps {
    encounter: BaseEncounter;
  }

  function EncounterDisplay({ encounter }: EncounterDisplayProps) {
    // Render different components based on encounter type
    switch (encounter.type) {
      case 'combat':
        return <CombatEncounterContent encounter={encounter} />;
      case 'story':
        return <StoryEncounterContent encounter={encounter} />;
      case 'resource':
        return <ResourceEncounterContent encounter={encounter} />;
      default:
        return <GenericEncounterContent encounter={encounter} />;
    }
  }
  ```

### Battle Components
- **BattlePage**: Main component for combat interactions
  ```tsx
  function BattlePage() {
    const { state, dispatch } = useGame();
    const { shouldFlicker } = useSystemStatus();
    
    // Local state for battle UI
    const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
    const [playerHealth, setPlayerHealth] = useState(100);
    const [playerShield, setPlayerShield] = useState(50);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    
    // ... rest of implementation
  }
  ```

- **CombatActions**: Displays available combat actions for the player
  ```tsx
  interface CombatActionsProps {
    onSelectAction: (actionId: string) => void;
    availableActions: CombatAction[];
    category: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
  }

  function CombatActions({ 
    onSelectAction, 
    availableActions, 
    category, 
    isExpanded, 
    onToggleExpand 
  }: CombatActionsProps) {
    // ... implementation
  }
  ```

### Log Components
- **LogEntry**: Renders a single log entry with appropriate styling
  ```tsx
  interface LogEntryProps {
    log: LogEntry;
    isSelected: boolean;
    onSelect: () => void;
  }

  function LogEntry({ log, isSelected, onSelect }: LogEntryProps) {
    // ... implementation
  }
  ```

- **LogDetail**: Displays the full content of a selected log
  ```tsx
  interface LogDetailProps {
    log: LogEntry | null;
    onMarkAsRead: () => void;
  }

  function LogDetail({ log, onMarkAsRead }: LogDetailProps) {
    // ... implementation
  }
  ```

## UI Patterns

### Region-Based Styling

The UI adapts its styling based on the current game region, as demonstrated in the `CombatEncounterContent` component:

```tsx
// Example of region-based styling pattern
<div className={`system-panel ${
  encounter.region === 'void' ? 'bg-slate-900 text-slate-200' :
  encounter.region === 'nebula' ? 'bg-indigo-950 text-indigo-200' :
  encounter.region === 'asteroid' ? 'bg-amber-950 text-amber-100' :
  encounter.region === 'deepspace' ? 'bg-blue-950 text-blue-200' :
  encounter.region === 'blackhole' ? 'bg-zinc-950 text-zinc-200' : 
  'bg-slate-900 text-slate-200'
}`}>
  {/* Component content */}
</div>
```

This pattern is repeated across many UI components to create a cohesive visual experience that changes as the player traverses different regions of space.

### State Reactivity

Components react to game state changes in a consistent pattern:

```tsx
function ResourceDisplay({ resourceType }) {
  const { state } = useGame();
  const resource = state.categories.reactor.resources[resourceType];
  
  // Derive additional data from state
  const percentFull = Math.round((resource.amount / resource.capacity) * 100);
  const isLow = percentFull < 20;
  
  // UI renders differently based on derived state
  return (
    <div className={`resource-display ${isLow ? 'alert-low' : ''}`}>
      <ProgressBar value={percentFull} />
      <div className="resource-info">
        <span>{resource.amount}/{resource.capacity}</span>
        <span className="production-rate">+{resource.productionRate}/sec</span>
      </div>
    </div>
  );
}
```

### Action Dispatching

UI components dispatch actions to modify game state following this pattern:

```tsx
function ResourceButton({ resourceType }) {
  const { dispatch } = useGame();
  
  const handleClick = () => {
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: { resourceType }
    });
  };
  
  return (
    <button 
      onClick={handleClick}
      className="resource-button"
    >
      Generate {resourceType}
    </button>
  );
}
```

## Integration with Game Systems

### Resource System Integration

UI components integrate with the Resource System to display and modify resource levels:

```tsx
function ResourceOverview() {
  const { state } = useGame();
  const { energy, materials } = state.categories.reactor.resources;
  
  return (
    <div className="resource-overview">
      <ResourceDisplay 
        resource={energy}
        icon={Lightning}
        label="Energy"
      />
      <ResourceDisplay 
        resource={materials}
        icon={Box}
        label="Materials"
      />
    </div>
  );
}
```

### Combat System Integration

Battle components integrate with the Combat System to manage combat encounters:

```tsx
function CombatInterface() {
  const { state, dispatch } = useGame();
  const combat = state.combat;
  
  const performAction = (actionId) => {
    dispatch({
      type: 'PERFORM_COMBAT_ACTION',
      payload: { actionId }
    });
  };
  
  return (
    <div className="combat-interface">
      <EnemyDisplay enemy={combat.currentEnemy} />
      <PlayerStatus health={combat.playerHealth} shield={combat.playerShield} />
      <CombatActions 
        actions={combat.availableActions}
        onSelectAction={performAction}
      />
    </div>
  );
}
```

### Log System Integration

Log components integrate with the Log System to display narrative content:

```tsx
function LogViewer() {
  const { state, dispatch } = useGame();
  const { logs, unreadLogs } = state.logs;
  const [selectedLogId, setSelectedLogId] = useState(null);
  
  const selectedLog = logs.find(log => log.id === selectedLogId);
  
  const markAsRead = () => {
    if (selectedLog && !selectedLog.read) {
      dispatch({
        type: 'MARK_LOG_READ',
        payload: { logId: selectedLog.id }
      });
    }
  };
  
  return (
    <div className="log-viewer">
      <LogList 
        logs={logs}
        unreadCount={unreadLogs.length}
        selectedLogId={selectedLogId}
        onSelectLog={setSelectedLogId}
      />
      <LogDetail 
        log={selectedLog}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}
```

## UI Component Examples

### Encounter Component Example

```tsx
// Example implementation of an encounter component
function StoryEncounterComponent({ encounter }) {
  const { dispatch } = useGame();
  
  const makeChoice = (choiceId) => {
    dispatch({
      type: 'MAKE_STORY_CHOICE',
      payload: {
        encounterId: encounter.id,
        choiceId
      }
    });
  };
  
  return (
    <div className="story-encounter">
      <p className="encounter-description">{encounter.description}</p>
      
      <div className="choices-container">
        {encounter.choices.map(choice => (
          <button
            key={choice.id}
            onClick={() => makeChoice(choice.id)}
            className="choice-button"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Resource Management Component Example

```tsx
// Example implementation of a resource management component
function ResourceManagement() {
  const { state, dispatch } = useGame();
  const { energy, energyCapacity, energyRate } = state.resources;
  const upgrades = state.upgrades.filter(u => u.category === 'resource');
  
  const purchaseUpgrade = (upgradeId) => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { upgradeId }
    });
  };
  
  return (
    <div className="resource-management">
      <div className="resource-status">
        <h2>Energy Systems</h2>
        <div className="resource-bar">
          <div 
            className="resource-level" 
            style={{ width: `${(energy / energyCapacity) * 100}%` }}
          />
          <span className="resource-text">
            {energy}/{energyCapacity} (+{energyRate}/s)
          </span>
        </div>
      </div>
      
      <div className="upgrades-list">
        <h3>Available Upgrades</h3>
        {upgrades.map(upgrade => (
          <div key={upgrade.id} className="upgrade-item">
            <div className="upgrade-info">
              <h4>{upgrade.name}</h4>
              <p>{upgrade.description}</p>
            </div>
            <button
              onClick={() => purchaseUpgrade(upgrade.id)}
              disabled={state.resources.energy < upgrade.cost}
              className="upgrade-button"
            >
              Purchase ({upgrade.cost} energy)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Future Considerations

1. **Component Library**: Develop a formalized component library to ensure UI consistency and reduce duplication.

2. **Accessibility Improvements**: Enhance keyboard navigation, screen reader support, and focus management for better accessibility.

3. **Animation System**: Implement a consistent animation system for transitions, alerts, and feedback.

4. **Responsive Optimization**: Further optimize layouts and interactions for mobile devices.

5. **Theme System**: Enhance the region-based styling to support a more comprehensive theme system that could include player customization.

6. **Performance Optimization**: Implement React.memo, useMemo, and useCallback more extensively to prevent unnecessary re-renders.

7. **Internationalization**: Add support for multiple languages through a localization system.

8. **Asset Preloading**: Implement asset preloading to reduce visual pop-in when navigating between sections.

9. **Component Testing**: Develop a comprehensive testing strategy for UI components.

10. **State Management Refinement**: Consider using context slices for more granular UI updates to prevent unnecessary re-renders. 