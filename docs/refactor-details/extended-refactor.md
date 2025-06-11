Below is a **soup-to-nuts execution plan** to finish the Phase 3–5 refactor, eliminate the last legacy paths, and polish performance/clarity.
Use it as a checklist for Cursor PRs; every bullet names the files/functions that must change, the order, and the regression tests to run.

---

## 0. Naming Inconsistency Hot-Fix (blocks manual clicks)

| Step                                                                                                                                                  | Change                                                                                                                                                                | Touch Files                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 0-1                                                                                                                                                   | Pick **one canonical resource-click action name** (`RESOURCE_CLICK` or `CLICK_RESOURCE`).<br>*Recommendation*: **`RESOURCE_CLICK`** (verb last to match other types). | —                                  |
| 0-2                                                                                                                                                   | **UI Dispatch** – update all `dispatch({ type: 'CLICK_RESOURCE' … })` to `RESOURCE_CLICK`.<br>Files:                                                                  |                                    |
| `app/reactor/page.tsx`, `app/processor/page.tsx`, `app/manufacturing/page.tsx`, `app/crew-quarters/page.tsx`, any hook that dispatches manual clicks. | 4+ UI pages and their hooks                                                                                                                                           |                                    |
| 0-3                                                                                                                                                   | **ActionSystem** – ensure the `case 'RESOURCE_CLICK':` branch exists; delete the duplicate/old case.                                                                  | `app/game/systems/ActionSystem.ts` |
| 0-4                                                                                                                                                   | Run game, click reactor → verify energy increments.                                                                                                                   | browser test                       |

> **Commit**: `fix: align resource click action name`

---

## 1. Delete Legacy Event Layer & Central Switch

### 1-A  Flatten GameEngine → System map

| Step  | Detail                                                                 |                                   |
| ----- | ---------------------------------------------------------------------- | --------------------------------- |
| 1-A-1 | Remove `EventBus.on('DISPATCH_ACTION')` handler in **GameEngine**.     | `GameEngine.setupEventHandlers()` |
| 1-A-2 | Delete `GameEngine.processAction()` entirely.                          | `GameEngine.ts`                   |
| 1-A-3 | Delete `GameSystemManager.processAction()` & its `actionSystem` field. | `GameSystemManager.ts`            |

> *After this, UI dispatch will break until step 1-B is in.*

### 1-B  Distribute Action Handling into Systems

| Action Type                            | Move To                                      | What to implement                                       |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| `RESOURCE_CLICK`                       | **ResourceSystem**                           | `handleResourceClick(entityId)` – re-use existing code. |
| `PURCHASE_UPGRADE`                     | **UpgradeSystem**                            | `handlePurchase(entityId, upgradeId)` – already exists. |
| `MARK_LOG_READ`, `MARK_ALL_LOGS_READ`  | **LogSystem**                                | rename private helpers, expose handler.                 |
| `MAKE_STORY_CHOICE`                    | **EncounterSystem**                          | `handleChoice(encounterId, choiceId)`                   |
| `COMBAT_ACTION`, `RETREAT_FROM_BATTLE` | **CombatSystem**                             | `handleMove`, `handleRetreat`                           |
| `ADJUST_AUTOMATION`                    | **ResourceSystem** (or new AutomationSystem) | if you still need it.                                   |

*Implementation pattern*:

```ts
export function registerActionHandlers(bus: EventBus, world: World) {
  bus.subscribe("RESOURCE_CLICK", ({ entityId }) =>
    this.handleResourceClick(entityId));
  …
}
```

*Each System* adds a `registerActionHandlers` call in its constructor.

### 1-C  Replace UI Dispatch Helper

```ts
// useGame.ts
const dispatch = (action: GameAction) =>
  eventBus.publish(action.type, action);
```

*Delete* the `"DISPATCH_ACTION"` constant everywhere.

### 1-D  Remove ActionSystem

1. Delete `ActionSystem.ts`
2. Remove import lines in `GameSystemManager`.
3. `npm run lint` – fix dangling refs.

### 1-E  Regression tests

| Test                                         | Expectation                   |
| -------------------------------------------- | ----------------------------- |
| Click resource -> state increments           | `energy.current` increases    |
| Purchase upgrade -> level++, resources–      | Upgrade lvl +1, cost deducted |
| Mark log read -> unread count–               | Log state changes             |
| Story choice & combat -> no console warnings | No default-case logs          |

> **Commit**: `refactor: split monolithic ActionSystem into system-local handlers`

---

## 2. Purge `state.categories` Usage

### 2-A  Introduce World Selectors

```ts
export function getCategoryEntity(world: World, id: CategoryId) { … }
export function getResource(world, id: CategoryId) { return getComponent<ResourceStorage>(…); }
```

### 2-B  Refactor Remaining Systems

Files still using `state.categories.*`:

* `CombatSystem.ts`
* `LogSystem.ts`
* `EncounterSystem.ts`
* `GameEngine.ts` (logging)
* `GameState` types
* UI pages

Change each to selectors.

### 2-C  Refactor React Pages

1. Add `useEntity(id)` and `useComponent(id, key)` hooks.
2. Replace `state.categories.reactor.resources.energy` with:

```ts
const energy = useComponent("reactor", "ResourceStorage");
```

3. Memoise hooks with `useSyncExternalStore` or `useMemo`.

### 2-D  Remove `categories` from types

1. Delete the `categories` field from `GameState`.
2. Update `initialGameState` builder to create entities only.
3. Fix any red TypeScript errors.

> **Commit**: `feat: migrate state from categories tree to ECS selectors`

---

## 3. World Save / Load

### 3-A  Serialiser

```ts
export interface SaveFile {
  v: 2;
  ts: number;
  entities: [string, Partial<ComponentMap>][];
}
```

`World.toJSON()` → compress Map to array.

### 3-B  Deserializer

`World.fromJSON(save)` → rebuild entities & components.

### 3-C  Offline catch-up

In `GameEngine.start()`, compute `deltaOffline = now - save.ts` and call `systems.update(deltaOffline)` once.

> **Commit**: `feat: implement World save/load + offline tick`

---

## 4. EventBus & Performance Polish

| Step | Task                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 4-1  | Remove deep `JSON.stringify` in `EventBus.emit('state:updated')`; instead clone only mutated slices (immer or shallow copy of world snapshot). |
| 4-2  | Throttle `'state:updated'` to one per animation frame (if multiple actions in same tick).                                                      |
| 4-3  | Add production guard: `publish(event)` -> if `listeners.length === 0 && prod` log once.                                                        |
| 4-4  | Add TypeScript **discriminated union** for `GameAction` so mismatched types won’t compile.                                                     |

> **Commit**: `perf: shallow snapshot + typed GameAction`

---

## 5. Unit / Integration Tests

### 5-A  Resource Tick

*World with Generator & Storage → tick 1 s → current += rate*

### 5-B  Upgrade Purchase Flow

*dispatch purchase → resources deducted, level++, upgrade\:purchased emitted.*

### 5-C  Save / Load Round-trip

*Serialize world → parse → deepEqual(worldSnapshot)*

> **Commit**: `test: cover core systems & save-load`

---

## 6. CI & Code-Guard Add-ons

1. **grep guard**: fail if `state.categories` string re-enters.
2. **eslint custom rule**: forbid `import { .*System }` inside another system folder.
3. **jest --ci** in GitHub Actions.

---

## 7. Final Cleanup & Docs

| Task                                                                                          | Deliverable      |
| --------------------------------------------------------------------------------------------- | ---------------- |
| Remove dead helpers (`updateReactorStats`, etc.)                                              | search & delete  |
| Update `ARCHITECTURE.md` and `events/index.ts`                                                | reflect new flow |
| Add `DECISIONS.md` entry “May 2025 – Removed ActionSystem, adopted namespaced action events.” | docs             |

> **Commit**: `chore: final cleanup & docs`

---

### **Completion Definition**

* **No `ActionSystem.ts`, no `.categories` references, no `'DISPATCH_ACTION'` string.**
* **EventBus events = {all action keys} ∪ {state\:updated}.**
* **Systems compile with `(bus, world)` only, no cross-imports.**
* **UI renders via `useComponent` hooks.**
* **CI green, tests ≥ 80 % line coverage on core systems.**

Finish the eight commits above and the Phase 3-5 architecture is *done, done.*
