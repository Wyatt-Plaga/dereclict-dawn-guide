# Implementation Checklist

## Phase 1: State Management Overhaul with Zustand ✅

- [x] Set up basic state management with Zustand
  - [x] Define slices for resources, upgrades, logs
  - [x] Implement core state management
  - [x] Update actions for resources, upgrades, logs
  - [x] Add computed selectors

- [x] Add persistence layer
  - [x] Set up middleware for local storage
  - [x] Implement versioning for migrations
  - [x] Add hydration utilities

- [x] Create a testing framework
  - [x] Set up devtools integration
  - [x] Create a debug panel component

- [x] Refactor components to use new store
  - [x] Add selectors to optimize renders
  - [x] Improve types for better type safety

- [x] Gradually migrate components
  - [x] Refactor resource-related components
    - [x] Create hook for accessing resources (useGameResources.ts)
    - [x] Migrate resource page component (resource-page-with-store.tsx)
    - [x] Migrate offline progress component (resource-offline-progress-wrapper-with-store.tsx)
  - [x] Refactor upgrade-related components
    - [x] Create hook for accessing upgrades (useGameUpgrades.ts)
    - [x] Implement upgrade panel component (upgrade-panel-with-store.tsx)
    - [x] Create example upgrade panel page
  - [x] Refactor log-related components
    - [x] Create hook for accessing logs (useGameLogs.ts)
    - [x] Implement logs display component (log-display-with-store.tsx)
    - [x] Create example logs display page
  - [x] Update main page components
    - [x] Create dashboard component with store integration (dashboard-with-store.tsx)
    - [x] Build example dashboard page with all migrated components
    - [x] Add offline progress handling to main components

## Phase 2: Context Splitting and Database Layer ✅

- [x] Create foundational contexts
  - [x] Auth context for authentication only
  - [x] Database context for raw database operations
  - [x] User profile context for profile management
  - [x] Game progress context for save/load operations
  - [x] Create combined provider component

- [x] Implement repository pattern
  - [x] Create base repository interface
  - [x] Implement Supabase repository
  - [x] Implement domain-specific repositories
  - [x] Create RepositoryProvider context
  - [x] Add repository hooks

- [x] Connect store with repositories
  - [x] Set up sync store for tracking sync state
  - [x] Implement debounced syncing
  - [x] Add online/offline handling

## Phase 3: Enhanced Logging System

- [x] Implement structured logging
  - [x] Set up log categories and levels
  - [x] Add trace IDs for related log events
  - [x] Create filtered log views

- [ ] Create log visualization components
  - [ ] Build timeline view for logs
  - [ ] Add detail expansion for log entries
  - [ ] Implement contextual actions based on log type

- [ ] Add achievements system
  - [ ] Define achievement triggers based on logs
  - [ ] Create achievement unlock notifications
  - [ ] Build achievements dashboard

## Phase 4: Performance Optimizations

- [ ] Audit and optimize component renders
  - [ ] Add memoization where beneficial
  - [ ] Implement virtualized lists for large datasets
  - [ ] Optimize animations and transitions

- [ ] Improve data loading patterns
  - [ ] Implement pagination for large datasets
  - [ ] Add skeleton loaders for improved UX
  - [ ] Optimize API call batching

- [ ] Enhance offline capability
  - [ ] Improve sync mechanisms
  - [ ] Add conflict resolution
  - [ ] Implement background processing for heavy calculations

## Phase 5: Game Engine & Resource System ✅

### 1. Create Core Game Engine ✅
- [x] Create `engine` directory structure:
  ```
  /engine
    Game.ts
    CommandProcessor.ts
    commands/
    events/
    interfaces.ts
  ```
- [x] Implement basic Game class to manage state
- [x] Create CommandProcessor for action handling
- [x] Define core command interfaces

### 2. Implement Resource System ✅
- [x] Create base Resource class
- [x] Implement specific resource subclasses:
  ```typescript
  class Resource<T extends ResourceProperties> {
    /* Common resource functionality */
  }
  
  class EnergyResource extends Resource<EnergyProperties> {
    /* Energy-specific functionality */
  }
  ```
- [x] Create ResourceRegistry to manage all resources
- [x] Implement ResourceFactory for creating resources

### 3. Add Resource Commands ✅
- [x] Create resource-related commands (Add, Consume, etc.)
- [x] Implement validation in commands
- [x] Add command history tracking
- [x] Connect commands to store updates

### 4. Migrate Resource Calculations ✅
- [x] Move resource calculations from components to Game Engine
- [x] Refactor ResourceManager class into new architecture
- [x] Move helper functions into appropriate resource classes
- [x] Update UI components to use new resource system

### 5. Notes on State Update Strategy ℹ️
- For continuous resource updates common in idle games, we've implemented a polling-based approach using intervals instead of event listeners for every resource change
- Event system is reserved for significant game events rather than routine resource updates
- This approach improves performance by reducing the overhead of frequent event emissions

## Phase 6: Upgrade & Progression Systems ✅

### 1. Create Upgrade System ✅
- [x] Define upgrade interfaces and base classes
- [x] Implement various upgrade types:
  ```
  /engine/upgrades
    BaseUpgrade.ts
    ResourceUpgrade.ts
    UnlockUpgrade.ts
    EffectUpgrade.ts
  ```
- [x] Create UpgradeRegistry for managing available upgrades
- [x] Implement UpgradeManager for handling activation

### 2. Refactor Milestone System ✅
- [x] Create data-driven milestone definitions
- [x] Implement MilestoneRegistry for tracking all milestones
- [x] Create compound milestone conditions
- [x] Connect milestones to game events

### 3. Connect Upgrades to Game Systems ✅
- [x] Link upgrades to resource production/capacity
- [x] Connect upgrades to game progression
- [x] Implement upgrade requirements and dependencies
- [x] Add upgrade effects system

## Phase 7: Event & Logging Systems

### 1. Create Event System
- [ ] Implement EventEmitter class
- [ ] Define core game events
- [ ] Create subscription system for components
- [ ] Add event history for debugging

### 2. Enhance Logging System
- [ ] Create Log class with metadata
- [ ] Implement log categories and filters
- [ ] Connect logs to game events
- [ ] Create progressive log content system

### 3. Connect Events to Game Systems
- [ ] Update resource systems to emit events
- [ ] Connect milestone system to events
- [ ] Make logs reactive to game events
- [ ] Implement event-based UI updates

## Phase 8: Offline Progress Overhaul

### 1. Create Time-Related Services
- [ ] Implement GameTime service
- [ ] Create timestamp management system
- [ ] Add time scaling capabilities
- [ ] Implement time-based effects

### 2. Refactor Progress Calculator
- [ ] Create unified ProgressCalculator class
- [ ] Implement resource-specific calculation strategies
- [ ] Add timestamp priority rules
- [ ] Connect to upgrade effects

### 3. Enhance Offline Mechanics
- [ ] Implement offline progress caps
- [ ] Add offline bonuses system
- [ ] Create special offline events
- [ ] Improve offline notification system

## Phase 9: Code Reorganization & Testing

### 1. Restructure Application
- [ ] Implement domain-driven directory structure:
  ```