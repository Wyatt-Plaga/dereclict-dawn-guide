import { World } from './World';
import { Entity } from './Entity';
import type { ComponentKey, Component, Tag } from '@/app/game/components/interfaces';

/**
 * Returns the first entity with a Tag matching the given category.
 */
export function getCategoryEntity(world: World, category: string): Entity | undefined {
  return world.query(e => {
    const tag = e.get('Tag') as Tag | undefined;
    return !!(tag && tag.tags && tag.tags.has(category));
  })[0];
}

/**
 * Type-safe component getter for an entity.
 */
export function getComponent<T extends Component>(entity: Entity, key: ComponentKey): T | undefined {
  return entity.get(key) as T | undefined;
} 