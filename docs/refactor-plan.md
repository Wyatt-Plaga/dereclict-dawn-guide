# Derelict Dawn – Architecture & Codebase Refactor Roadmap

> **Status:** _Draft for review – **no implementation should begin until this document is approved.**_

## Purpose
This roadmap converts the research findings and checklist items into an incremental, pull-request-friendly sequence of tasks.  Each phase is scoped to keep PRs small, reviewable, and shippable while ensuring the game remains playable after every merge.

## Guiding Principles
1. **One responsibility per PR** – keep changesets narrow.
2. **Green at every commit** – unit & play-mode tests must pass; game must still boot.
3. **Feature flags where needed** – large re-writes are hidden behind off-by-default toggles until stable.
4. **Docs before code** – each phase adds or updates documentation so new devs can follow along.

---

## Phase 0 – Baseline & Safety Nets
| # | Task | Deliverable |
|---|------|-------------|
|0.1| Snapshot current main branch build | ZIP artefact attached to release tag `pre-refactor-baseline` |
|0.2| Stand-up CI pipeline (if absent) | GitHub Actions / similar running `npm test`, `eslint`, `prettier --check` |
|0.3| Add minimal unit test harness | Jest/Vitest configured; a trivial test (`1+1=2`) green |
|0.4| Enable Prettier & ESLint on commit hooks | Husky + lint-staged configured |
|0.5| Upload zipped production build artefact per commit | CI artefact via `actions/upload-artifact` |
|0.6| Fast-path lint on touched files only | Lint job uses `lint-staged` / affected-only |

_Why?_ Establishes a safety net so later structural changes don't silently break the game.

---

## Phase 1 – Folder & Namespace Re-org (Checklist §1)
| # | Task | PR Checklist |
|---|------|--------------|
|1.1| ~~Create feature-oriented root folders (`core/`, `game/`, `ui/`, `assets/`, `docs/`)~~ | Folders committed |
|1.2| Move existing files into new structure (no code edits) | Imports adjusted; game compiles |
|1.3| Add `ARCHITECTURE.md` with updated folder map | Document merged |
|1.4| Configure temporary legacy path aliases in `tsconfig.paths` | Legacy imports compile; marked for removal in Phase 2 |

_Risk:_ Broken import paths. _Mitigation:_ CI tests + TypeScript compiler catch issues.

_Dependency:_ Phase 1 complete so files can land in correct folders.

**DONE criteria:** New managers depend only on interfaces (no concrete class imports); enforced via `import/no-cycle`.

---

## Phase 2 – Break Up God Objects (Checklist §2)
| # | Task | Outcome |
|---|------|---------|
|2.1| ~~Inventory responsibilities of `GameSystemManager` & similar "god" classes~~ | Responsibility list in `docs/manager-inventory.md` |
|2.2| ~~Extract dedicated managers (e.g., `SpawnManager`, `ScoreManager`)~~ | `ResourceManager` & `CombatEncounterManager` created |
|2.3| ~~Refactor original class to ≤200 LOC orchestration shell~~ | Placeholder methods removed; GSM now ~120 LOC |

_Dependency:_ Phase 1 complete so files can land in correct folders.

---

## Phase 3 – Event / Message System (Checklist §3 & Research Step 3)
| # | Task | Details |
|---|------|---------|
|3.1| ~~Implement lightweight `EventBus` singleton (pub/sub)~~ | `core/EventBus` + typed `GameEventMap` |
|3.2| ~~Refactor at least three direct cross-calls to events~~ | Resource gen, encounter rewards & automation drain now emit `resourceChange` |
|3.3| ~~Codify rule in `CONTRIBUTING.md`~~ | Event-boundary policy committed |

**Additional notes:** Events must be strongly typed (`publish<UpgradePurchasedEvent>()`) and support `AbortController`-based unsubscribe to avoid memory leaks.

---

## Phase 4 – Component-Based Data Model & Generic Systems (Research Steps 1 & 2)
| # | Task | Deliverable |
|---|------|------------|
|4.1| ~~Introduce component interfaces (`ResourceStorage`, `Generator`, `Upgradable`, ...) in `game/components/`~~ | `interfaces.ts` defines 16 starter components |
|4.2| ~~Migrate `GameState` to entity-component structure~~ | `world` snapshot via `createWorldFromGameState()` |
|4.3| ~~Generalize `ResourceSystem.update()` to loop over entities~~ | Uses ECS path when `state.world` exists |
|4.4| ~~Register systems array in `GameSystemManager`~~ | Generic `systemsList` + `IGameSystem` interface |
|4.5| Smoke test: add dummy resource entity via JSON, verify UI renders | Proves scalability |
|4.6| Implement save-game migration or auto-wipe with warning banner | Data versioned & backward-compatible |

---

## Phase 5 – Modular Action Handling (Research Step 3)
| # | Task | Details |
|---|------|---------|
|5.1| Replace central `ActionSystem` switch with domain handlers | Each system registers its own action listeners |
|5.2| Move resource-click logic into `ResourceSystem` | No cross-system reach-through |
|5.3| Update React dispatch helper to emit namespaced events (`ACTION_RESOURCE_CLICK`, ...) | UI unchanged otherwise |
|5.4| Delete `ActionSystem` once all call-sites are removed | Dead code eliminated |

---

## Phase 6 – Data-Driven Upgrades & Content (Research Step 4)
| # | Task | Outcome |
|---|------|---------|
|6.1| Define `game/config/upgrades.ts` describing cost, growth, effect | JSON or TS object schema |
|6.2| Refactor `UpgradeSystem.purchase()` to be config-driven | Removes switch-case statements |
|6.3| Add one new upgrade via config only (no code) to validate flow | PR demonstrating ease of extension |
|6.4| Validate upgrade config against `zod` schema in CI | Prevents runtime typos |
|6.5| Auto-generate upgrade reference docs (`docs/generated/upgrades.md`) | GDD stays current |

---

## Phase 7 – Performance Pass & Offline Progress (Research Step 6)
| # | Task | Deliverable |
|---|------|-------------|
|7.1| Replace per-tick `JSON.stringify` diff with Immer or dirty-flag pattern | Benchmark before/after |
|7.2| Add offline-progress accumulator handling large deltas | Unit test simulating 8-hour gap |
|7.3| Record before/after performance metrics in `PERF.md` | Evidence of improvement |
|7.4| Switch React state update to dirty-flag/Immer diff | Eliminate full-state JSON diffing |

---

## Phase 8 – Testing, Docs & Final Clean-Up (Checklist §§4–10)
| # | Task | Notes |
|---|------|------|
|8.1| Flesh out interface & component documentation | Type & UML diagrams in `/docs/` |
|8.2| Maintain ≥90 % coverage on critical systems; overall target ≥60 % | Critical path: Resource, Upgrade, Save/Load |
|8.3| Implement generic `ObjectPool<T>` under `core/utils/` and apply to bullets/logs | Demonstrate ≤1 ms frame-time saving |
|8.4| Draft `Architecture Quick-Start` and update README badges | New contributors on-board fast |

---

## Cross-Cutting & Documentation

* **Feature flags:** Use build-time env vars (`NEXT_PUBLIC_FEATURE_*`) plus runtime config toggles for experimental work.
* **Living docs:**
  * `DECISIONS.md` – chronological record of architecture choices.
  * `MIGRATIONS.md` – log data migrations or save-wipe events.


---

## Review Checklist for Each PR
1. All unit & integration tests pass.
2. No ESLint / Prettier violations.
3. Documentation updated (where applicable).
4. No TODOs or commented-out legacy blocks left behind.
5. Game runs from splash screen to main loop without fatal errors.

---

## Next Steps
*Review this roadmap and leave comments inline or in a follow-up issue. Once approved, Phase 0 will kick off with CI setup and baseline snapshot.* 