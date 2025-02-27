# Code Improvement Recommendations

This document outlines anti-patterns, non-DRY code, and potential improvements identified in the codebase. Each issue can be tackled individually to improve the overall quality and maintainability of the project.

## Anti-Patterns and Improvements

### 1. Inconsistent Error Handling

The error handling is spread across different files with redundancy in the `error-handling.ts` and within components.

**Recommendations:**
- [x] Create a central error handling service that all components and utilities can use
- [x] Standardize error types and responses across the application
- [ ] Implement error boundaries at strategic points in the React component tree

### 2. Resource Management Duplication

There are multiple areas where resource manipulation logic is duplicated.

**Recommendations:**
- [x] Consolidate the resource update functions in `utils/game-helpers.ts`
- [x] Refactor the repetitive code in `utils/offline-progress.ts` for calculating different resource types
- [x] Implement a single resource manipulation function with type parameters

### 3. Hardcoded Resource Constants

Resource properties and their relationships to pages are hardcoded in multiple locations.

**Recommendations:**
- [x] Consolidate `resourcePageMap` (in `game-helpers.ts`) and `resourceToPageMap` (in `offline-progress.ts`) into a single constants file
- [x] Create a centralized location for all game constants

### 4. Incomplete Type Safety

Several areas use `any` types or type assertions that could be improved.

**Recommendations:**
- [x] Remove usage of `as any` for resource data in `offline-progress.ts`
- [x] Improve typing in `validateGameData` and other functions using generic `any` types
- [x] Create more specific interfaces for game data structures

### 5. Deep Copy Implementation

Using `JSON.parse(JSON.stringify())` for deep copying is inefficient.

**Recommendations:**
- [x] Replace with a proper deep clone utility like lodash's `cloneDeep` 
- [ ] Consider using immer for immutable state updates

### 6. Redundant Timestamp Management

The application manages timestamps in multiple ways across different files.

**Recommendations:**
- [ ] Unify the timestamp system with a clear hierarchy
- [ ] Create a dedicated timestamp service for managing all time-related operations

### 7. Magic Numbers in Game Logic

There are several magic numbers in the code that should be extracted to constants.

**Recommendations:**
- [x] Extract multipliers (0.2, 0.1, 0.5) for different resources to named constants
- [x] Make default values like `maxOfflineMinutes = 1440` (24 hours) configurable constants

### 8. Context Structure

The Supabase context is extremely large and handles multiple concerns.

**Recommendations:**
- [ ] Split the SupabaseContext into smaller, focused contexts
- [ ] Separate database concerns from game state management
- [ ] Create dedicated contexts for saving/loading and offline progress calculations

### 9. Debounce Implementation

The debounce logic could be improved for better performance.

**Recommendations:**
- [x] Use useCallback to memoize the debounced function properly
- [x] Extract debounce logic to a custom hook for reusability

### 10. Authentication Flow

The middleware authentication relies on cookies without clear error handling.

**Recommendations:**
- [ ] Implement a more robust auth verification process
- [ ] Add proper validation and error handling for authentication

### 11. Console Logging in Production

There are numerous console.log statements throughout the code.

**Recommendations:**
- [x] Implement a proper logging system with environment-based controls
- [ ] Use a logging library that can be toggled based on environment

### 12. State Management Strategy

The state management is split between React Context and local state without a clear pattern.

**Recommendations:**
- [ ] Adopt a more consistent state management strategy
- [ ] Consider Redux Toolkit or Zustand for a growing game with complex state

## Specific Refactoring Recommendations

1. **Create a Resources Constants File**:
   - [x] Extract all resource-related constants to a single file
   - [x] Define types and relationships in one place

2. **Implement a Resource Manager Class/Module**:
   - [x] Create a unified API for resource manipulation
   - [x] Encapsulate logic for updating, validating, and calculating resources

3. **Refactor Error Handling**:
   - [x] Create a centralized error service
   - [x] Implement consistent error reporting and handling

4. **Improve Type Safety**:
   - [x] Remove `any` types where possible
   - [x] Create more specific interfaces for game data structures

5. **Optimize State Management**:
   - [ ] Split the large SupabaseContext into smaller, focused contexts
   - [ ] Consider a state management library for complex game state

6. **Standardize Save/Load Operations**:
   - [ ] Create clear boundaries between UI and data persistence layers
   - [ ] Implement proper error recovery for save operations

7. **Clean Up Console Logs**:
   - [x] Replace with a proper logging system
   - [ ] Use environment variables to control log verbosity

8. **Extract Game Logic**:
   - [x] Move game-specific calculations to a dedicated game engine module
   - [ ] Separate UI concerns from game mechanics 

## Recently Completed Improvements

1. **Resource Management**:
   - Created a `ResourceManager` class that centralizes all resource operations
   - Added helper methods like `hasEnoughResource` and `getResourceProperty`
   - Implemented proper deep copying with lodash's `cloneDeep`

2. **Error Handling**:
   - Implemented a comprehensive error service with proper typing
   - Added centralized error reporting and management
   - Created standardized error display mechanisms

3. **Reusable Hooks**:
   - Created custom debounce hooks for better performance
   - Implemented type-safe useDebounce, useDebouncedValue, and useDebounceIndicator hooks

4. **UI Improvements**:
   - Fixed icon centering in the resource generation buttons
   - Improved component structure with proper memoization

## Next Steps

Priority items to tackle next:

1. Split the SupabaseContext into smaller, focused contexts
2. Create a dedicated timestamp service
3. Implement proper error boundaries in React components
4. Consider adopting a state management library for growing complexity 