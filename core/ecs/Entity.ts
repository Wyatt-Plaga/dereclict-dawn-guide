import { v4 as uuidv4 } from 'uuid';
import type { Component } from '@/app/game/components/interfaces';

/**
 * Minimal runtime component registry.
 * Allows lookup / dynamic instantiation of components by string key.
 */
export class ComponentRegistry {
  private static registry = new Map<string, new (...args: any[]) => Component>();

  /** Register a component constructor with a unique key */
  static register(key: string, ctor: new (...args: any[]) => Component) {
    if (this.registry.has(key)) {
      // eslint-disable-next-line no-console
      console.warn(`[ComponentRegistry] duplicate registration for key "${key}" – overriding.`);
    }
    this.registry.set(key, ctor);
  }

  /** Retrieve a constructor for later `new` */
  static resolve<T extends Component = Component>(key: string): (new (...args: any[]) => T) | undefined {
    return this.registry.get(key) as any;
  }

  /** Convenience factory – returns an already-constructed component if found */
  static create<T extends Component = Component>(key: string, ...args: any[]): T | undefined {
    const Ctor = this.resolve<T>(key);
    return Ctor ? new Ctor(...args) : undefined;
  }
}

/**
 * Simple mutable entity container.
 * Not framework-opinionated – systems can mutate or replace components freely.
 */
export class Entity {
  readonly id: string;
  private components: Map<string, Component>; // keyed by constructor.name (or override)

  constructor(id: string = uuidv4()) {
    this.id = id;
    this.components = new Map();
  }

  /** Add or replace a component. Uses the ctor name as key unless `overrideKey` supplied. */
  add<T extends Component>(component: T, overrideKey?: string): this {
    const key = overrideKey ?? (component as any).constructor.name;
    this.components.set(key, component);
    return this;
  }

  /** Retrieve a component by constructor or key string */
  get<T extends Component>(ctorOrKey: string | (new (...args: any[]) => T)): T | undefined {
    const key = typeof ctorOrKey === 'string' ? ctorOrKey : (ctorOrKey as any).name;
    return this.components.get(key) as T | undefined;
  }

  /** Remove a component */
  remove<T extends Component>(ctorOrKey: string | (new () => T)): boolean {
    const key = typeof ctorOrKey === 'string' ? ctorOrKey : (ctorOrKey as any).name;
    return this.components.delete(key);
  }

  /** Iterate over all components */
  all(): Component[] {
    return Array.from(this.components.values());
  }

  /** Check whether entity has component */
  has<T extends Component>(ctorOrKey: string | (new () => T)): boolean {
    const key = typeof ctorOrKey === 'string' ? ctorOrKey : (ctorOrKey as any).name;
    return this.components.has(key);
  }
}

// -----------------------------------------------------------------------------
// Helper types
// -----------------------------------------------------------------------------
export type ComponentKey<C extends Component> = string & { __componentKey?: C }; 