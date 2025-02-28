# Implementation Checklist: Architectural Improvements

## Phase 1: State Management Overhaul (Zustand Implementation)

### 1. Setup Basic State Management
- [ ] Install Zustand and related packages: `npm install zustand immer zustand-middleware-immer`
- [ ] Create a new directory structure for state management:
  ```
  /store
    /slices
      resourcesSlice.ts
      upgradesSlice.ts
      logsSlice.ts
      timeSlice.ts
    rootStore.ts
    types.ts
  ```
- [ ] Create basic store types that mirror current game state structure

### 2. Implement Core Store
- [ ] Create the root store with combined slices
- [ ] Implement resource slice with basic CRUD operations
- [ ] Implement upgrades slice with activation/deactivation logic
- [ ] Implement logs slice for managing unlocked logs
- [ ] Add selectors for frequently accessed state

### 3. Add Persistence Layer to Store
- [ ] Add persistence middleware to Zustand
- [ ] Implement a versioning mechanism for state structure
- [ ] Create migration functions for any future state structure changes
- [ ] Add validation before persisting state

### 4. Refactor One Component to Use New Store
- [ ] Choose a simple component (e.g., resource display)
- [ ] Refactor to use the Zustand store instead of context
- [ ] Test thoroughly before continuing

### 5. Gradually Migrate Components
- [ ] Refactor resource-related components
- [ ] Refactor upgrade-related components
- [ ] Refactor log-related components
- [ ] Update main page components

## Phase 2: Context Splitting & Database Layer

### 1. Create Foundational Contexts
- [ ] Create AuthContext focused only on authentication
- [ ] Create DatabaseContext for raw database operations
- [ ] Create GameSyncContext for syncing between local and remote state

### 2. Implement Repository Pattern
- [ ] Create `repositories` directory structure:
  ```
  /repositories
    BaseRepository.ts
    GameRepository.ts
    interfaces.ts
    mappers.ts
  ```
- [ ] Implement BaseRepository with CRUD operations
- [ ] Create GameRepository with specific game data operations
- [ ] Implement mapper functions to transform between domain and database models

### 3. Setup Save Queue System
- [ ] Create SaveQueue class to manage pending saves
- [ ] Implement retry logic for failed saves
- [ ] Add conflict resolution for concurrent saves
- [ ] Setup periodic background save mechanism

### 4. Create IndexedDB Backup System
- [ ] Setup IndexedDB storage for game state backups
- [ ] Implement versioned backup storage
- [ ] Create backup recovery mechanisms
- [ ] Add backup rotation to limit storage usage

### 5. Replace SupabaseContext Usage
- [ ] Update main components to use the new contexts
- [ ] Replace direct Supabase calls with repository methods
- [ ] Add hooks to sync store with repository
- [ ] Test online/offline scenarios

## Phase 3: Game Engine & Resource System

### 1. Create Core Game Engine
- [ ] Create `engine` directory structure:
  ```
  /engine
    Game.ts
    CommandProcessor.ts
    commands/
    events/
    interfaces.ts
  ```
- [ ] Implement basic Game class to manage state
- [ ] Create CommandProcessor for action handling
- [ ] Define core command interfaces

### 2. Implement Resource System
- [ ] Create base Resource class
- [ ] Implement specific resource subclasses:
  ```typescript
  class Resource<T extends ResourceProperties> {
    /* Common resource functionality */
  }
  
  class EnergyResource extends Resource<EnergyProperties> {
    /* Energy-specific functionality */
  }
  ```
- [ ] Create ResourceRegistry to manage all resources
- [ ] Implement ResourceFactory for creating resources

### 3. Add Resource Commands
- [ ] Create resource-related commands (Add, Consume, etc.)
- [ ] Implement validation in commands
- [ ] Add command history tracking
- [ ] Connect commands to store updates

### 4. Migrate Resource Calculations
- [ ] Move resource calculations from components to Game Engine
- [ ] Refactor ResourceManager class into new architecture
- [ ] Move helper functions into appropriate resource classes
- [ ] Update UI components to use new resource system

## Phase 4: Upgrade & Progression Systems

### 1. Create Upgrade System
- [ ] Define upgrade interfaces and base classes
- [ ] Implement various upgrade types:
  ```
  /engine/upgrades
    BaseUpgrade.ts
    ResourceUpgrade.ts
    UnlockUpgrade.ts
    EffectUpgrade.ts
  ```
- [ ] Create UpgradeRegistry for managing available upgrades
- [ ] Implement UpgradeManager for handling activation

### 2. Refactor Milestone System
- [ ] Create data-driven milestone definitions
- [ ] Implement MilestoneRegistry for tracking all milestones
- [ ] Create compound milestone conditions
- [ ] Connect milestones to game events

### 3. Connect Upgrades to Game Systems
- [ ] Link upgrades to resource production/capacity
- [ ] Connect upgrades to game progression
- [ ] Implement upgrade requirements and dependencies
- [ ] Add upgrade effects system

## Phase 5: Event & Logging Systems

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

## Phase 6: Offline Progress Overhaul

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

## Phase 7: Code Reorganization & Testing

### 1. Restructure Application
- [ ] Implement domain-driven directory structure:
  ```
  /src
    /core
      /domain
      /application
      /infrastructure
    /features
      /resources
      /upgrades
      /logs
      /progression
    /ui
      /components
      /hooks
      /pages
  ```
- [ ] Move components to feature-specific directories
- [ ] Create interface boundaries between layers
- [ ] Reduce coupling between modules

### 2. Add Testing Infrastructure
- [ ] Setup Jest/Testing Library configuration
- [ ] Create test utilities for game state
- [ ] Implement snapshot testing for state changes
- [ ] Add unit tests for core game logic

### 3. Finalize Documentation
- [ ] Create architecture documentation
- [ ] Document state management patterns
- [ ] Add comments for complex logic
- [ ] Create diagrams for system interactions

## Implementation Order & Dependencies

1. **Start with Zustand implementation** (Phase 1) as it provides immediate benefits
2. **Refactor Repository Pattern** (Phase 2) to separate data concerns
3. **Build Game Engine** (Phase 3) to centralize game logic
4. **Enhance Resource System** (Phase 3) for better type safety
5. **Implement Event System** (Phase 5) as foundation for other systems
6. **Upgrade Progress Systems** (Phase 4) to leverage events
7. **Refactor Offline Progress** (Phase 6) using the new architecture
8. **Reorganize Codebase** (Phase 7) to solidify architecture 