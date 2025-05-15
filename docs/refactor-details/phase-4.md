Below is the **step-by-step hit list** to wrap up **Phase 4 – Component-Based Data Model (ECS)**.  Knock these out in order and the codebase will finally behave like a real ECS rather than a hard-coded bundle of structs.

---

## 0. Guiding Constraints

1. **Pure-data Components** – no methods, just typed state.
2. **Systems Own Logic** – loops live in systems, never in components.
3. **Flat Entity IDs** – everything in the game world has a unique `id: string`; no nested look-ups.
4. **Serialization-Friendly** – state must stringify/parse without custom classes (for save/load).

---

## 1. Core ECS Primitives

| Task  | Detail                                                                                                           |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| 4.1.1 | **`Entity` class** with: `id`, `components: Map<ComponentKey, unknown>` and helpers `add`, `get`, `has`.         |
| 4.1.2 | **`World` container**: `entities = new Map<string, Entity>()`; sugar `query(predicate)` returns filtered arrays. |
| 4.1.3 | Add hook `world.createEntity(components?: PartialRecord<ComponentKey, unknown>)` to bootstrap initial state.     |

---

## 2. Define Canonical Components (v1)

Create `app/game/components/`:

| File                  | Shape                                                   | Used By                                    |
| --------------------- | ------------------------------------------------------- | ------------------------------------------ |
| `ResourceStorage.ts`  | `{ current: number; capacity: number }`                 | ResourceSystem, UI                         |
| `Generator.ts`        | `{ ratePerSecond: number }`                             | ResourceSystem                             |
| `Upgradable.ts`       | `{ level: number; maxLevel?: number; costRef: string }` | UpgradeSystem                              |
| `ManualCollector.ts`  | `{ clickYield: number; cooldownMs: number }`            | ResourceSystem (manual taps)               |
| `Tag.ts` (*optional*) | `{ tags: Set<string> }`                                 | quick filtering (`resource`, `crew`, etc.) |

*(Add Health, CombatStats later in Phase 6 when combat refactor happens.)*

Export a union type:

```ts
export type ComponentKey =
  | "ResourceStorage"
  | "Generator"
  | "Upgradable"
  | "ManualCollector"
  | "Tag";

export interface ComponentMap {
  ResourceStorage: ResourceStorage;
  Generator: Generator;
  Upgradable: Upgradable;
  ManualCollector: ManualCollector;
  Tag: Tag;
}
```

---

## 3. Migrate Static Category Data → Entities

| Step  | Detail                                                  |
| ----- | ------------------------------------------------------- |
| 4.3.1 | Write **migration script** `buildInitialWorld.ts` that: |

* loops over legacy `initialGameState.categories`
* for each category (`reactor`, `processor`, etc.) calls `world.createEntity()` with components mapped 1-for-1 (e.g., `.add<ResourceStorage>({ current: …, capacity: … })`, `.add<Generator>({ ratePerSecond: … })`, `.add<Upgradable>({ level: … })`).|
  |4.3.2| Remove old `categories` field from `GameState`; instead keep `world: World` inside `GameState`.|
  |4.3.3| Provide selector helpers (`getCategoryEntity("reactor")`) so UI remains readable.|

---

## 4. Refactor Systems to Generic Loops

### 4.1 ResourceSystem

```ts
update(delta: number) {
  for (const e of world.query(has<Generator>("Generator"))) {
    const gen = e.get<Generator>("Generator");
    const store = e.get<ResourceStorage>("ResourceStorage");
    store.current = clamp(
      store.current + gen.ratePerSecond * delta,
      0,
      store.capacity
    );
    if (gen.clickDelta) { … }
  }
}
```

Delete `updateReactor`, `updateProcessor`, etc.

### 4.2 UpgradeSystem

* `purchaseUpgrade(entityId, upgradeKey)` finds entity, gets its Upgradable, validates cost from `upgrades.ts`, increments level, then **publishes** `"upgrade:purchased"` for ResourceSystem/StatsSystem to react.

### 4.3 Encounter / Combat / Log

* Keep legacy for now; migrate in later phases once core ECS stable.

---

## 5. Save / Load Layer

| Task  | Detail                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------- |
| 4.5.1 | **Serialize**: `JSON.stringify(world.entities)` (Map → array of `[id, components]`)             |
| 4.5.2 | **Deserialize**: revive entities and re-add to `World`; write helper `world.fromJSON(json)`.    |
| 4.5.3 | Maintain data-version number; on first run convert old save to new format (one-time migration). |

---

## 6. UI Glue

| Task  | Detail                                                                               |
| ----- | ------------------------------------------------------------------------------------ |
| 4.6.1 | Replace usages of `state.categories.reactor.resources.energy` with selector helpers: |

````ts
const reactor = useEntity("reactor");
const energy = reactor.get<ResourceStorage>("ResourceStorage");
```|
|4.6.2| Memoize selectors so React render diff is minimal (e.g. `useMemo` or Zustand selector).|
|4.6.3| Keep `stateUpdated` event but carry `worldSnapshot` not the old GameState.|

---

## 7. Tests

| Task | Detail |
|------|--------|
|4.7.1| Unit test: create entity with Generator+ResourceStorage → tick 1 sec → current increases correctly, capped at capacity.|
|4.7.2| Unit test: upgrade purchase raises level and emits `"upgrade:purchased"` event.|
|4.7.3| Save/Load round-trip retains identical entity/component data.|

---

## 8. Dead-Code & Clean-up

| Task | Detail |
|------|--------|
|4.8.1| Delete category-specific update helpers (`updateReactor`, etc.).|
|4.8.2| Remove any remaining `state.categories.*` references in engine code.|
|4.8.3| Trim `GameSystemManager` to just hold `world` and `systems[]`; no category knowledge.|

---

## 9. Exit Criteria

- **World contains only `Entity` objects with component maps.**  
- **ResourceSystem & UpgradeSystem** iterate via `world.query` – no category names in logic.  
- **Zero legacy `categories` references** outside temporary migration script.  
- **Save file** is an array/object of entities + components and loads back losslessly.  
- **Unit tests** for generator ticks, upgrade purchase, save/load all green.

Finish this checklist and Phase 4 is in the bag.  After that, Phase 5’s action-handler breakup will be much easier because every system will already be operating on generic entities rather than bespoke structs.
````
