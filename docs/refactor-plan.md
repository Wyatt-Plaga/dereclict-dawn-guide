# Project Assessment and Refactoring Plan

## Assessment

The **Derelict Dawn Guide** project is a complex React/Next.js application with a custom game engine embedded. While the core architecture is sound (separation of engine and UI), there are several areas where "disjointed" development has led to technical debt, performance risks, and maintenance challenges.

### Strengths
1.  **Architecture**: The `GameEngine` is separated from the React UI, using an `EventBus` for communication. This is a solid pattern for games in React.
2.  **TypeScript**: The project uses TypeScript extensively, providing good type safety.
3.  **Systems**: Logic is divided into systems (`CombatSystem`, `ResourceSystem`), preventing a single "God Class" (mostly).

### Weaknesses & Risks
1.  **Performance (Critical)**:
    *   **State Serialization**: The game loop (`tick`) and the React Context (`GameProvider`) both rely on `JSON.parse(JSON.stringify(state))` for immutability and change detection. This is extremely expensive and will cause frame drops as the game state grows.
    *   **Re-renders**: The current `GameContext` triggers re-renders for *any* state change, even if a component only cares about a small part of the state.

2.  **Modularity**:
    *   **CombatSystem**: This file is over 1100 lines long. It handles UI logging, resource math, probability logic, and enemy AI. It violates the Single Responsibility Principle.
    *   **Type Bloat**: `src/game-engine/types/index.ts` is becoming a dumping ground for all types.

3.  **Data Management**:
    *   **Mixed Formats**: Data is split between JSON files (`enemies.json`) and TypeScript files (`combatActions.ts`).
    *   **Hardcoding**: Magic numbers (e.g., `250`ms autosave, `0.25` retreat penalty) are scattered throughout the code.

## Refactoring Plan

This plan is designed to be executed in phases to maintain a working build at all times.

### Phase 1: Performance & State Management (High Priority)
*Goal: Fix the performance bottlenecks and ensure the game scales.*

1.  **Install `immer`**: Use `immer` for immutable state updates. This allows us to remove the expensive `JSON.parse/stringify` calls.
2.  **Refactor `GameEngine` Loop**:
    *   Replace deep cloning with `produce` from `immer`.
    *   Implement a dirty-checking mechanism so we only emit events when state *actually* changes.
3.  **Optimize `GameProvider`**:
    *   Remove the deep clone in the React state update.
    *   (Optional) Split the context into `GameStateContext` and `GameDispatchContext` to prevent unnecessary re-renders for components that only dispatch actions.

### Phase 2: Code Organization & Types (Medium Priority)
*Goal: Make the codebase easier to navigate and less error-prone.*

1.  **Split Type Definitions**:
    *   Create `src/game-engine/types/resources.ts`, `combat.ts`, `navigation.ts`.
    *   Keep `index.ts` only for re-exports.
2.  **Standardize Data**:
    *   Convert all JSON data files to TypeScript files (e.g., `enemies.ts`). This enforces type safety on game data and makes imports consistent.
3.  **Centralize Constants**:
    *   Move all magic numbers to `src/game-engine/config/gameConstants.ts`.

### Phase 3: System Refactoring (Medium Priority)
*Goal: Break down the massive CombatSystem.*

1.  **Decompose `CombatSystem`**:
    *   **`CombatCalculator`**: Pure functions for damage, shield, and resource math.
    *   **`EnemyAI`**: Logic for enemy decision making.
    *   **`CombatLog`**: Handling battle log entries.
    *   **`CombatSystem`**: The orchestrator that ties them together.

### Phase 4: Testing & Quality (Ongoing)
*Goal: Ensure reliability.*

1.  **Unit Tests**: Add unit tests for the new `CombatCalculator` and `EnemyAI` modules.
2.  **Linter Rules**: Ensure `eslint` is actually running and catching issues (e.g., unused variables, `any` types).

## Next Steps
Confirm with the user to begin **Phase 1**.
