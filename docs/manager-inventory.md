# Phase 2.1 – God-Object Responsibility Inventory

> **Target class:** `GameSystemManager` (`app/game/systems/index.ts`)

## High-Level Role
Central orchestrator that instantiates every game subsystem, wires cross-system listeners, exposes `update()` and `processAction()` entry points, and pipes global events via `EventBus`.

## Concrete Responsibilities (as of 2025-05-14)
1. **Subsystem lifetime management**
   • Creates `ResourceSystem`, `UpgradeSystem`, `LogSystem`, `EncounterSystem`, `CombatSystem`, and `ActionSystem` in its constructor.  
   • Holds them as public fields for outside mutation.
2. **Action dispatch**  
   • `processAction(state, action)` delegates every user action to `ActionSystem.processAction`.
3. **Per-tick updates**  
   • `update(state, delta, automationHasPower)` forwards to `ResourceSystem`, `LogSystem`, and conditionally `CombatSystem`.
4. **Event wiring**  
   • Listens for `'resourceChange'` events to mutate `state.categories.*` directly.  
   • Listens for `'combatEncounterTriggered'` to call `CombatSystem.startCombatEncounter`.
5. **Subsystem cross-references**  
   • After instantiation, calls `action.setManager(this)` so `ActionSystem` can reach other systems.
6. **Dependency scaffolding placeholders**  
   • Methods `setupSystemDependencies()` and `setupEventListeners()` exist but largely act inside the constructor.

## Pain Points / Candidates for Extraction
| Responsibility | Extraction Target | Notes |
| -------------- | ----------------- | ----- |
| Resource mutation on `'resourceChange'` event | `ResourceSystem` should own all resource adjustment logic | Will remove direct state mutation here. |
| Combat encounter routing | `CombatSystem` (or an `EncounterRouter`) | Keep GSM agnostic of concrete combat rules. |
| Action delegation | Replace with EventBus per-system listeners | Plan for Phase 5. |
| Update orchestration | Keep minimal orchestrator but move any logic into individual systems | Acceptable for GSM to iterate `systems[]`. |

## Quick Metrics
* File length: ~170 LOC.  
* Public surface: `resource`, `action`, `upgrade`, `log`, `encounter`, `combat`, `update`, `processAction`.
* Direct imports: `ActionSystem`, all System classes, `EventBus`, types, logger.

---

_Phase 2.2 will create dedicated managers (ScoreManager, SpawnManager, etc.) and migrate above responsibilities out of `GameSystemManager`._ 