Hey Wyatt, here's a **no-BS punch-list** to get Phase 3 (Event / Message System) *fully* across the finish line.

---

## 0. Ground Rules (set these first)

1. **Single Source of Truth:** Every cross-system interaction must flow through `EventBus`, *not* direct method calls.
2. **Typed Payloads:** Each event name maps to a TypeScript interface so nobody passes "any".
3. **No Orphan Events:** Publishing code must *never* fire an event with zero listeners in production—CI should fail on that.

---

## 1. Harden the EventBus API

| Task  | Detail                                                                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| 3.1.1 | **Add generic typing**: `publish<E extends EventKey>(event:E, payload: EventMap[E])` and `subscribe<E extends EventKey>(…)`. |
| 3.1.2 | **Return an unsubscribe fn** so systems can detach on teardown / hot reload.                                                 |
| 3.1.3 | **Add dev-only "no listener" warning** that fires *after* a micro-task, so you can catch orphan events during local testing. |

---

## 2. Define the Canonical Event Registry

| Task  | Detail                           |
| ----- | -------------------------------- |
| 3.2.1 | Create `events/index.ts` export: |

```ts
export type EventMap = {
  "resource:changed": { category: CategoryId; delta: number };
  "upgrade:purchased": { category: CategoryId; upgrade: UpgradeId; newLevel: number };
  "encounter:completed": { encounterId: string; result: "success"|"fail" };
  "combat:started": { enemyId: string };
  "combat:ended": { victory: boolean };
  /* keep adding as needed */
};
export type EventKey = keyof EventMap;
```|
|3.2.2| **Enforce event-name format** `feature:verb` (lower-case, colon separator).|

---

## 3. Refactor Cross-System Calls → Events

| System Pair | Old Direct Call | New Publisher | New Subscriber(s) |
|-------------|-----------------|---------------|--------------------|
|**Upgrade → Resource / Stats**| `manager.resource.updateAllStats()` | `publish("upgrade:purchased", …)` inside `UpgradeSystem.purchase()` | `ResourceSystem`, `StatsSystem` listen and recalc capacities/rates |
|**Encounter → Combat / Log**| `manager.combat.startBattle()` | `publish("encounter:completed", …)` inside `EncounterSystem.completeEncounter()` | `CombatSystem` (if success triggers battle), `LogSystem` (log entry) |
|**Combat → Encounter**| `manager.encounter.finishBattle()` | `publish("combat:ended", …)` inside `CombatSystem.finish()` | `EncounterSystem` picks up result, awards loot |
|**Resource tick → UI**| direct setState | still keep `stateUpdated`, but emit `publish("resource:changed", …)` for fine-grained UI components (optional) |

*Do **one** pair at a time, PR per pair; delete the old call immediately.*

---

## 4. Remove Manager Dependencies

| Task | Detail |
|------|--------|
|3.4.1| ~~Delete `GameSystemManager` references from systems once they're event-driven. Pass only `eventBus` and `getState` into constructor.~~|
|3.4.2| ~~After the last direct call is gone, downgrade `GameSystemManager` to a dumb array holder (or drop it entirely).~~|

---

## 5. Document & Enforce the Rule

| Task | Detail |
|------|--------|
|3.5.1| **Update `CONTRIBUTING.md`**: "If you need data from another system, subscribe to an event or emit a new one. Direct imports of another system are forbidden."|
|3.5.2| Add an ESLint custom rule (simple regex) that bans `import { .*System } from "../systems"` *inside another system* folder.|
|3.5.3| Add a short **"Event Cookbook"** doc with examples of creating, subscribing, and testing events.|

---

## 6. Regression Tests

| Task | Detail |
|------|--------|
|3.6.1| For each event, add a Jest test: publish event → assert subscriber ran and state mutated.|
|3.6.2| Add test that publishing an undefined event key fails compile (TypeScript) – guarantees your EventMap is the gatekeeper.|

---

## 7. Cleanup & Dead-Code Removal

| Task | Detail |
|------|--------|
|3.7.1| After all systems are event-driven, nuke any helper methods in ActionSystem or GameSystemManager that only existed for cross-calls.|
|3.7.2| Yank now-unused manager references from constructor signatures.|

---

## Canonical Event Registry and EventBus Hardening (Phase 3)

### Canonical Event Registry
A new `core/eventsRegistry.ts` file defines the canonical event keys for all cross-system communication. Keys use a `feature:verb` kebab-case pattern, e.g. `resource:changed`, `upgrade:purchased`, `encounter:completed`, `combat:started`, `combat:ended`.

### EventBus API
- `publish(event, payload)` and `subscribe(event, handler)` are the preferred methods for new code. They wrap the legacy `emit`/`on` for clarity and future flexibility.
- The EventBus now warns (in dev) if an event is published with no listeners.

### Compatibility Bridge
- When a legacy camelCase event is emitted, the EventBus immediately re-publishes the equivalent canonical event (if defined). This allows new systems to subscribe to the canonical event keys while legacy code continues to function.
- All major game systems now emit both the legacy and canonical event for their domain actions.

### Example
```ts
bus.publish('resource:changed', { category: 'energy', delta: 10, state });
// ...
bus.subscribe('resource:changed', (payload) => { /* ... */ });
```

---

### Sanity Check Exit Criteria

- **Zero `manager.XYZ` calls remain in system code.**
- **`EventBus` shows ≥ 5 distinct event types with ≥ 1 subscriber each.**
- **Unit tests cover every event round-trip.**
- A dev can add a new system without touching an existing file outside `systems/NEW/`.

Nail these and Phase 3 is locked. Onward to full ECS & the ActionSystem death-spiral.
```
