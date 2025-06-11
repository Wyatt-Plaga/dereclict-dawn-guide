import { GameState } from '../types';
import { World } from '@/core/ecs/World';
import { ResourceStorage, Generator, Tag } from '../components/interfaces';

/**
 * createWorldFromGameState
 * -----------------------
 * Temporary bridge that snapshots the legacy GameState structure and produces a
 * World populated with ECS-style entities/components.  During the migration we
 * keep the original state intact while systems are ported incrementally.
 */
export function createWorldFromGameState(state: GameState): World {
  const world = new World();

  // `categories` still exist on the legacy initialGameState even though the
  // GameState type no longer declares it.  Cast to any for the one-time
  // migration.
  const legacy = (state as any).categories;

  if (!legacy) {
    // Nothing to migrate – return empty world for fresh games.
    return world;
  }

  // Reactor entity ---------------------------------------------------------
  world.createEntity({
    ResourceStorage: {
      current: legacy.reactor.resources.energy,
      capacity: legacy.reactor.stats.energyCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: legacy.reactor.stats.energyPerSecond,
    } as Generator,
    Tag: { tags: new Set(['reactor']) } as Tag,
  });

  // Processor entity -------------------------------------------------------
  world.createEntity({
    ResourceStorage: {
      current: legacy.processor.resources.insight,
      capacity: legacy.processor.stats.insightCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: legacy.processor.stats.insightPerSecond,
    } as Generator,
    Tag: { tags: new Set(['processor']) } as Tag,
  });

  // Crew Quarters entity ----------------------------------------------------
  world.createEntity({
    ResourceStorage: {
      current: legacy.crewQuarters.resources.crew,
      capacity: legacy.crewQuarters.stats.crewCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: legacy.crewQuarters.stats.crewPerSecond,
    } as Generator,
    Tag: { tags: new Set(['crewQuarters']) } as Tag,
  });

  // Manufacturing entity ----------------------------------------------------
  world.createEntity({
    ResourceStorage: {
      current: legacy.manufacturing.resources.scrap,
      capacity: legacy.manufacturing.stats.scrapCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: legacy.manufacturing.stats.scrapPerSecond,
    } as Generator,
    Tag: { tags: new Set(['manufacturing']) } as Tag,
  });

  return world;
} 
