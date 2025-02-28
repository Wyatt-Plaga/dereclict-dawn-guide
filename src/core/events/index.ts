/**
 * Core Events Module
 * Export all public interfaces and implementations
 */

export type { GameEvent, EventListener } from './EventInterfaces';
// Export the interface as a different name to avoid collision
export type { EventEmitter as IEventEmitter } from './EventInterfaces';
// Export the implementation
export { EventEmitter } from './EventEmitter';