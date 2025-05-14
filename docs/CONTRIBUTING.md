# Contributing to Derelict Dawn

Welcome, space-faring developer!  This project follows an event-driven, feature-oriented architecture.  Please read these quick rules **before submitting a PR.**

## 1 General Workflow 

## 2 Event-Driven Boundaries

Cross-feature calls **must** go through the global `EventBus` (defined in `core/EventBus.ts`).

• Never mutate another feature's state directly.  Emit a typed event instead and let the owning system/manager react.

• Use the strongly-typed map in `core/events.ts` for compile-time safety.

• When adding a new event:
  1. Extend `GameEventMap`.
  2. Emit via `eventBus.emit('<eventName>', payload)`.
  3. Listen with `eventBus.on('<eventName>', handler)` and remember to unsubscribe where relevant.

PRs that introduce cross-feature reach-through will be rejected. 