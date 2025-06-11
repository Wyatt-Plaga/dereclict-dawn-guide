/**
 * EventBus: Communication system for the game (moved to `core/` during Phase 1).
 */

import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import type { GameEventMap } from '@/core/events';

export class EventBus<Events extends Record<string, any> = GameEventMap> {
  private listeners: { [K in keyof Events]?: Array<(data: Events[K]) => void> } = {};
  private lastStateUpdateTime = 0;

  /**
   * Wrapper alias for backwards-compat – preferred API going forward.
   */
  publish<K extends keyof Events>(event: K, data: Events[K]) {
    this.emit(event, data);
  }

  /**
   * Wrapper alias for backwards-compat – preferred API going forward.
   */
  subscribe<K extends keyof Events>(event: K, cb: (data: Events[K]) => void) {
    return this.on(event, cb);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    // Throttle high-frequency stateUpdated spam to ~1 animation frame (16 ms)
    if (event === 'stateUpdated') {
      const now = Date.now();
      if (now - this.lastStateUpdateTime < 16) return;
      this.lastStateUpdateTime = now;
    }

    // Logging context heuristics
    let context = LogContext.NONE;
    if (event === 'stateUpdated') context = LogContext.NONE;

    Logger.debug(LogCategory.EVENT_BUS, `Emitting event: "${String(event)}"`, context);

    const callbacks = (this.listeners[event] || []) as Array<(d: Events[K]) => void>;
    if (callbacks.length === 0) {
      Logger.warn(LogCategory.EVENT_BUS, `No listeners registered for event: "${String(event)}"`, context);
    }

    // Avoid expensive deep-clone; caller should clone if needed.
    const payload = data;
    callbacks.forEach((cb) => cb(payload));

    // Dev-only orphan check after micro-task to catch cases where listener registers after publish.
    if (process.env.NODE_ENV !== 'production') {
      if (callbacks.length === 0) {
        queueMicrotask(() => {
          // re-check after microtask – still zero?
          const post = (this.listeners[event] || []).length;
          if (post === 0) {
            // eslint-disable-next-line no-console
            console.warn(`[EventBus] Orphan event "${String(event)}" – no subscribers reacted.`);
          }
        });
      }
    }

    // -------------------------------------------------------------
    // Back-compat ⇢ canonical registry bridge
    // When an old camelCase event fires we immediately publish its
    // equivalent `feature:verb` key so early adopters can subscribe.
    // -------------------------------------------------------------
    const bridge = (
      evt: string,
      d: any,
    ): { key: string; payload: any } | null => {
      switch (evt) {
        case 'resourceChange':
          return {
            key: 'resource:changed',
            payload: { category: d.resourceType, delta: d.amount, state: d.state },
          };
        case 'upgradePurchased':
          return {
            key: 'upgrade:purchased',
            payload: { category: d.category, upgrade: d.upgradeType, state: d.state },
          };
        case 'combatEncounterTriggered':
          return {
            key: 'combat:started',
            payload: { enemyId: d.enemyId, region: d.regionId, state: d.state },
          };
        case 'combatEnded':
          return {
            key: 'combat:ended',
            payload: { victory: d.outcome === 'victory', enemyId: d.enemyId, state: d.state },
          };
        case 'encounterCompleted':
          return {
            key: 'encounter:completed',
            payload: { encounterId: d.encounterId, result: d.result, state: d.state },
          };
        default:
          return null;
      }
    };

    const mapped = bridge(String(event), data);
    if (mapped) {
      // We use any because canonical registry is separate type.
      (this as any).emit(mapped.key, mapped.payload);
    }
  }

  on<K extends keyof Events>(event: K, cb: (data: Events[K]) => void) {
    let context = LogContext.NONE;
    if (event === 'stateUpdated') context = LogContext.UI_RENDER;

    Logger.debug(LogCategory.EVENT_BUS, `Registering listener for event: "${String(event)}"`, context);

    (this.listeners[event] ||= []).push(cb as any);

    return () => {
      Logger.debug(LogCategory.EVENT_BUS, `Removing listener for event: "${String(event)}"`, context);
      this.listeners[event] = (this.listeners[event] || []).filter((c) => c !== cb);
    };
  }
} 
