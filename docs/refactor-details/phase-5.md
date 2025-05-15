Below is the **Phase 5 – Modular Action Handling** playbook. Follow it in order and the dreaded `ActionSystem.ts` will be nothing but a fossil in the commit history.

---

## 0. Core Principles

1. **Each system owns its own actions** – no “omniscient” switch.
2. **Event names = action names** – typed, namespaced, one handler per concern.
3. **UI never touches a system class** – it fires events; that’s it.
4. **Exactly one “stateUpdated” emission per game-tick** – avoid render storms.

---

## 1. Canonical Action Event Map

Create `app/game/actions/index.ts`:

```ts
export type ActionMap = {
  "action:resource_click":   { entityId: string; amount?: number };
  "action:purchase_upgrade": { entityId: string; upgradeId: string };
  "action:mark_log_read":    { logId: string };
  "action:mark_all_logs":    {};
  "action:story_choice":     { encounterId: string; choiceId: string };
  "action:combat_move":      { moveId: string };
  "action:retreat":          {};
  /* add more as features grow */
};
export type ActionKey = keyof ActionMap;
```

> **Rule:** every dispatchable UI intent **must** appear here.

---

## 2. Extend EventBus for Actions

```ts
eventBus.publish<ActionKey>("action:resource_click", payload);
eventBus.subscribe<ActionKey>("action:resource_click", handler);
```

Add a *compile-time* guarantee that only `ActionKey` values compile.

---

## 3. Build System-Local Action Handlers

### 3.1 ResourceSystem

```ts
constructor(bus: EventBus, world: World) {
  bus.subscribe("action:resource_click", ({ entityId, amount = 1 }) => {
    const e   = world.entities.get(entityId);
    const stor= e?.get<ResourceStorage>("ResourceStorage");
    if (!stor) return;
    stor.current = Math.min(stor.current + amount, stor.capacity);
  });
}
```

### 3.2 UpgradeSystem

Subscribe to `"action:purchase_upgrade"`; lookup costs, mutate `Upgradable`, then:

```ts
bus.publish("upgrade:purchased", { entityId, upgradeId, newLevel });
```

*(Use the Phase 3 event spec.)*

### 3.3 LogSystem

Handle `"action:mark_log_read"` & `"action:mark_all_logs"`.

### 3.4 Encounter / Combat / Story

Each system registers for its own action keys – no cross-system calls.

---

## 4. UI Dispatch Rewrite

### 4.1 `useGame()` Hook

```ts
const dispatch = <K extends ActionKey>(type: K, payload: ActionMap[K]) =>
  engine.eventBus.publish(type, payload);
```

UI components now call, e.g.:

```ts
dispatch("action:resource_click", { entityId: "reactor" });
dispatch("action:purchase_upgrade", { entityId: "reactor", upgradeId: "reactor_exp_1" });
```

### 4.2 Delete `engine.dispatch()` and `'DISPATCH_ACTION'` event.

---

## 5. Strangle the Old ActionSystem

### 5.1 Transitional “Forwarder” (optional)

Create `LegacyActionForwarder` that **only** listens to `"DISPATCH_ACTION"` and re-emits the new namespaced events.  Keep it around for one sprint so existing UI doesn’t break while you migrate calls.

### 5.2 Rip-and-Replace

1. Migrate all UI dispatches.
2. Kill `LegacyActionForwarder`.
3. Delete `ActionSystem.ts` and `GameSystemManager.action`.
4. Remove any `switch(action.type)` code anywhere else.

---

## 6. State Update Emission

After **all** action handlers run (and after each tick), the GameEngine should still:

```ts
eventBus.publish("state:updated", snapshotWorld(world));
```

(Keep payload shallow – diffing is React’s job.)

---

## 7. Tests & Safeguards

| Test  | Purpose                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| 5.7.1 | Dispatch `"action:resource_click"` ➜ assert targeted entity’s `current` increases.                               |
| 5.7.2 | Dispatch `"action:purchase_upgrade"` ➜ assert level increments **AND** `"upgrade:purchased"` fires (spy on bus). |
| 5.7.3 | Verify **no event** of type `"DISPATCH_ACTION"` is ever published in prod build (jest + mock).                   |
| 5.7.4 | ESLint rule banning `switch(action.type)` outside UI folder.                                                     |

---

## 8. Cleanup Checklist

* [ ] `ActionSystem.ts` file deleted.
* [ ] All systems’ constructors accept `(bus, world)` only – no manager pointer.
* [ ] `GameEngine.dispatch` removed; UI dispatch uses EventBus directly.
* [ ] Docs: update Architecture & Event Cookbook to show new pattern.
* [ ] Search repo: **zero** `DISPATCH_ACTION` strings, **zero** imports from removed ActionSystem.

---

## 9. Exit Criteria

* ✅ Every action event in **ActionMap** has **≥1** subscriber.
* ✅ No direct calls from one system into another.
* ✅ CI test suite covers at least one happy-path per action key.
* ✅ Hot-reload works (handlers unsubscribe properly).
* ✅ JS bundle no larger (dead code removed offsets new boilerplate).

Finish this list and Phase 5 is history—leaving you with a clean, event-driven, easily-extensible action architecture. On to polishing combat, content, and (finally) Phase 6.
