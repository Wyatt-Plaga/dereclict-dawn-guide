# Game Progress Saving Implementation Plan

This document outlines a step-by-step plan for implementing robust game progress saving in our idle game. Each step is designed to be small and independently testable, so we can verify that each component works before moving to the next.

## Phase 1: Local State Management and Basic Saving

### Step 1: Create Game State Context
- [ ] Implement a React context for global game state management
- [ ] Define TypeScript interfaces for resource types and game progress
- [ ] Add basic state initialization and update functions
- [ ] Implement a provider component to wrap the application

**Test:** Verify that state updates in one component reflect in another component.

### Step 2: Implement Periodic Auto-Save (Client-Side)
- [ ] Create a debounced save function that triggers after state changes
- [ ] Add a timer to auto-save at regular intervals (e.g., every 30 seconds)
- [ ] Implement localStorage backup for offline fallback
- [ ] Add manual save button for testing

**Test:** Verify that game state is saved to localStorage after changes and on intervals.

### Step 3: Implement Save/Load from Supabase
- [ ] Create Supabase table schema for game progress
- [ ] Implement basic save function to Supabase
- [ ] Implement load function from Supabase
- [ ] Add error handling and retry mechanisms

**Test:** Verify that game progress can be saved to and loaded from Supabase.

## Phase 2: Offline Progress Calculation

### Step 4: Basic Offline Progress Calculation
- [ ] Store last online timestamp with each save
- [ ] Implement function to calculate time passed since last online
- [ ] Calculate basic resource generation based on elapsed time
- [ ] Apply offline progress on game load

**Test:** Verify that resources increase appropriately when returning after being offline.

### Step 5: Advanced Offline Progress Features
- [ ] Implement resource caps for offline generation
- [ ] Add offline progress summary modal
- [ ] Calculate multi-resource offline gains
- [ ] Account for upgrades in offline calculations

**Test:** Verify that complex resource interactions are correctly calculated during offline periods.

## Phase 3: Optimization and Edge Cases

### Step 6: Performance Optimization
- [ ] Implement throttling for frequent state changes
- [ ] Add batching for multiple resource updates
- [ ] Optimize JSON size by only storing necessary data
- [ ] Add compression for large save states if needed

**Test:** Verify that saving doesn't cause UI lag, even with rapid state changes.

### Step 7: Handle Edge Cases
- [ ] Implement handling for failed saves (network errors)
- [ ] Add data migration support for schema changes
- [ ] Implement conflict resolution when multiple devices save
- [ ] Add data validation before saving

**Test:** Verify that the game gracefully handles errors and edge cases.

## Phase 4: User Experience Enhancements

### Step 8: Save Indicators and Feedback
- [ ] Add visual indicators for save status (saving, saved, error)
- [ ] Implement toast notifications for save events
- [ ] Add loading indicators during initial load
- [ ] Provide feedback on offline progress

**Test:** Verify that users receive appropriate feedback about save operations.

### Step 9: Multi-Device Synchronization
- [ ] Implement timestamp comparison for conflict detection
- [ ] Add server-side conflict resolution logic
- [ ] Implement data merging when conflicts occur
- [ ] Add real-time updates with Supabase realtime

**Test:** Verify that progress synchronizes correctly across multiple devices.

## Implementation Details

### Game Progress Data Structure
```typescript
interface GameProgress {
  resources: {
    energy: { amount: number, capacity: number, autoGeneration: number },
    insight: { amount: number, capacity: number, autoGeneration: number },
    crew: { amount: number, capacity: number, workerCrews: number },
    scrap: { amount: number, capacity: number, manufacturingBays: number }
  },
  upgrades: Record<string, boolean>,
  unlockedLogs: number[],
  lastOnline: string // ISO timestamp
}
```

### Auto-Save Implementation
We'll use a combination of techniques:
1. Debounced saves after state changes (wait 2 seconds after last change)
2. Interval saves every 30 seconds regardless of changes
3. Page unload saves when user navigates away
4. Manual save option for important changes

### Offline Progress Calculation
For each resource with auto-generation:
1. Calculate elapsed time since last online
2. Apply generation rates for that time period
3. Respect capacity limits
4. Display summary to user on return

## Phase 5: Testing and Monitoring

### Step 10: Implement Comprehensive Testing
- [ ] Add unit tests for offline calculation
- [ ] Add integration tests for save/load cycle
- [ ] Test with simulated network conditions
- [ ] Test with various data sizes and schema versions

**Test:** Run test suite and verify all components work together.

### Step 11: Add Monitoring and Diagnostics
- [ ] Add error logging for failed saves
- [ ] Implement analytics for save frequency and sizes
- [ ] Add debug mode for inspecting save data
- [ ] Create admin tools for helping users with corrupted saves

**Test:** Verify that errors are properly captured and reported.

## Next Steps After Implementation

Once the basic saving functionality is implemented, we can consider advanced features:
- Cloud saves across devices
- Save slots/multiple profiles
- Export/import save data
- Achievement tracking based on progress history 