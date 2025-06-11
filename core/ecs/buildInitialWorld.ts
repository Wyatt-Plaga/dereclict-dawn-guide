import { World } from './World';
import { Entity } from './Entity';
import type { GameState } from '@/app/game/types';
import type { ResourceStorage, Generator, Tag } from '@/app/game/components/interfaces';

/**
 * Migrates legacy GameState.categories to ECS World/entities.
 */
export function buildInitialWorld(state: GameState): World {
  const world = new World();

  // Reactor entity
  world.createEntity({
    ResourceStorage: {
      current: (state as any).categories.reactor.resources.energy,
      capacity: (state as any).categories.reactor.stats.energyCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: (state as any).categories.reactor.stats.energyPerSecond,
      active: ((state as any).categories.reactor.stats.activeEnergyConverters ?? 0) > 0,
    } as Generator,
    Tag: { tags: new Set(['reactor']) },
  });

  // Processor entity
  world.createEntity({
    ResourceStorage: {
      current: (state as any).categories.processor.resources.insight,
      capacity: (state as any).categories.processor.stats.insightCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: (state as any).categories.processor.stats.insightPerSecond,
      active: ((state as any).categories.processor.stats.activeProcessingThreads ?? 0) > 0,
    } as Generator,
    Tag: { tags: new Set(['processor']) },
  });

  // Crew Quarters entity
  world.createEntity({
    ResourceStorage: {
      current: (state as any).categories.crewQuarters.resources.crew,
      capacity: (state as any).categories.crewQuarters.stats.crewCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: (state as any).categories.crewQuarters.stats.crewPerSecond,
      active: ((state as any).categories.crewQuarters.stats.activeWorkerCrews ?? 0) > 0,
    } as Generator,
    Tag: { tags: new Set(['crewQuarters']) },
  });

  // Manufacturing entity
  world.createEntity({
    ResourceStorage: {
      current: (state as any).categories.manufacturing.resources.scrap,
      capacity: (state as any).categories.manufacturing.stats.scrapCapacity,
    } as ResourceStorage,
    Generator: {
      ratePerSecond: (state as any).categories.manufacturing.stats.scrapPerSecond,
      active: ((state as any).categories.manufacturing.stats.activeManufacturingBays ?? 0) > 0,
    } as Generator,
    Tag: { tags: new Set(['manufacturing']) },
  });

  return world;
} 
