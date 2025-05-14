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

## Entity-Component System (ECS)
_Phase 4 introduced a lightweight ECS layer that co-exists with the legacy `GameState` during migration._

### Key types
* **Component** – a plain data object that implements the marker interface `Component` found in `game/components/interfaces.ts`.
* **Entity** – a container (`core/ecs/Entity.ts`) that owns an ID and a bag of components. It offers `add / get / has / remove` helpers.
* **ComponentRegistry** – a singleton map that allows runtime lookup/creation of components by string key. It's optional but handy for JSON-driven content.
* **System** – a service class (e.g. `ResourceSystem`) that iterates over entities possessing the component set it cares about.

### Runtime flow (current example)
1. At load time the **SaveSystem** lazily builds `state.world` via `createWorldFromGameState()` if it's missing.
2. Each tick the **ResourceSystem** calls `updateWorld()` which:
   1. Finds every `Generator` component.
   2. Locates a matching `ResourceStorage` on the same entity.
   3. Emits `resourceChange` events for the produced amount.
3. Other systems (Upgrade, Combat, etc.) are being refactored to follow the same pattern.

### UML
```mermaid
classDiagram
    class Entity{
      +id : string
      +add(c)
      +get(type)
      +has(type)
      +all()
    }
    class Component <interface>
    class ComponentRegistry{
      +register(key,ctor)
      +resolve(key)
      +create(key,...)
    }
    class ResourceStorage{
      resourceType : string
      amount : number
      capacity : number
    }
    class Generator{
      outputType : string
      ratePerSecond : number
      active : boolean
    }
    Entity "1" *-- "*" Component
    ComponentRegistry ..> Component : creates
    ResourceStorage --|> Component
    Generator --|> Component
```

### Migration strategy
The world snapshot is _additive_ – legacy category data remains for now so UI code keeps working.  Once all systems rely exclusively on ECS data we'll strip the old fields and replace the factory with forward-only saves.

--- 