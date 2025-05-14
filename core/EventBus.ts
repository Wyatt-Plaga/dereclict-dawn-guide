/**
 * EventBus: Communication system for the game (moved to `core/` during Phase 1).
 */

import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import type { GameEventMap } from 'core/events';

export class EventBus<Events extends Record<string, any> = GameEventMap> {
  private listeners: { [K in keyof Events]?: Array<(data: Events[K]) => void> } = {};
  private lastStateUpdateTime = 0;

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    // Throttle stateUpdated spam
    if (event === 'stateUpdated') {
      const now = Date.now();
      if (now - this.lastStateUpdateTime < 50) return;
      this.lastStateUpdateTime = now;
    }

    // Logging context heuristics
    let context = LogContext.NONE;
    if (event === 'stateUpdated') context = LogContext.NONE;
    else if (event === 'DISPATCH_ACTION' && data?.type) {
      if (data.type === 'CLICK_RESOURCE' && data.payload?.category === 'reactor') context = LogContext.REACTOR_LIFECYCLE;
      else if (data.type === 'CLICK_RESOURCE' && data.payload?.category === 'processor') context = LogContext.PROCESSOR_LIFECYCLE;
      else if (data.type === 'PURCHASE_UPGRADE') context = LogContext.UPGRADE_PURCHASE;
    }

    Logger.debug(LogCategory.EVENT_BUS, `Emitting event: "${String(event)}"`, context);

    const callbacks = (this.listeners[event] || []) as Array<(d: Events[K]) => void>;
    if (callbacks.length === 0) {
      Logger.warn(LogCategory.EVENT_BUS, `No listeners registered for event: "${String(event)}"`, context);
    }

    const payload = event === 'stateUpdated' ? (JSON.parse(JSON.stringify(data)) as Events[K]) : data;
    callbacks.forEach((cb) => cb(payload));
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