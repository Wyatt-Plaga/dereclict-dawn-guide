# Project Architecture Overview

> **Last updated:** 2025-05-14

This document explains the high-level folder structure adopted during **Phase 1** of the refactor roadmap.

## Folder Map

| Folder | Purpose |
| ------ | ------- |
| `core/` | Engine-level utilities, event bus, save system, object pools, shared types. |
| `game/` | Feature-agnostic game logic: ECS components, systems, config data, factories. |
| `ui/`   | React (Next.js) presentation layer – pages, components, hooks. |
| `assets/` | Static images, audio, localisation bundles, JSON data shipped to the client. |
| `docs/` | Project documentation, architecture notes, decision records, migration logs. |

Legacy code still lives in `app/`, `components/`, etc.  We'll migrate code into the new structure gradually.  During the transition, **temporary path aliases** in `tsconfig.json` let us import from the new namespaces while existing imports continue to work.

## Transition Plan
1. All *new* files must go into the appropriate new folder.
2. When you touch an old file, consider moving it and updating imports instead of editing in place.
3. The legacy aliases will be removed in **Phase 2** once the migration is complete.

---

_For details on the phased migration, see `docs/refactor-plan.md`._ 