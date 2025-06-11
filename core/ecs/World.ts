import { Entity } from './Entity';
import type { Component } from '@/app/game/components/interfaces';

export class World {
  public entities = new Map<string, Entity>();

  /**
   * Create a new entity, optionally with initial components.
   * Returns the created Entity.
   */
  createEntity(components?: Record<string, unknown>): Entity {
    const entity = new Entity();
    if (components) {
      for (const [key, value] of Object.entries(components)) {
        entity.add(value as Component, key);
      }
    }
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Query entities by predicate (e.g., has component, tag, etc.)
   */
  query(predicate: (e: Entity) => boolean): Entity[] {
    return Array.from(this.entities.values()).filter(predicate);
  }

  /** Convert world to plain JSON array for save files */
  toJSON() {
    return {
      entities: Array.from(this.entities.values()).map((e) => e.toJSON()),
    };
  }

  /** Static helper to rebuild a world instance from plain data */
  static fromJSON(data: { entities: Array<{ id: string; components: Record<string, unknown> }> }): World {
    const w = new World();
    for (const entData of data.entities) {
      const entity = Entity.fromJSON(entData as any);
      w.entities.set(entity.id, entity);
    }
    return w;
  }
} 
