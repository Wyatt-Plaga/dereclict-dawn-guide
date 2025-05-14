import { v4 as uuidv4 } from 'uuid';
import { GameState } from '../types';
import { Entity, ResourceStorage, Generator } from '../components/interfaces';

/**
 * createWorldFromGameState
 * -----------------------
 * Temporary bridge that snapshots the legacy GameState structure and produces a
 * list of ECS-style entities/components.  During the migration we keep the
 * original state intact while systems are ported incrementally.
 */
export function createWorldFromGameState(state: GameState): Entity[] {
  const world: Entity[] = [];

  /* Reactor entity (energy storage + generator) */
  const reactorId = uuidv4();
  const reactorStorage: ResourceStorage = {
    id: `${reactorId}-storage`,
    resourceType: 'energy',
    amount: state.categories.reactor.resources.energy,
    capacity: state.categories.reactor.stats.energyCapacity,
  };
  const reactorGenerator: Generator = {
    id: `${reactorId}-gen`,
    outputType: 'energy',
    ratePerSecond: state.categories.reactor.stats.energyPerSecond,
    active: true,
  };
  world.push({ id: reactorId, components: [reactorStorage, reactorGenerator] });

  /* Processor entity (insight storage + generator) */
  const processorId = uuidv4();
  world.push({
    id: processorId,
    components: [
      {
        id: `${processorId}-storage`,
        resourceType: 'insight',
        amount: state.categories.processor.resources.insight,
        capacity: state.categories.processor.stats.insightCapacity,
      } as ResourceStorage,
      {
        id: `${processorId}-gen`,
        outputType: 'insight',
        ratePerSecond: state.categories.processor.stats.insightPerSecond,
        active: true,
      } as Generator,
    ],
  });

  /* Crew Quarters entity (crew storage + generator for awakening) */
  const crewId = uuidv4();
  world.push({
    id: crewId,
    components: [
      {
        id: `${crewId}-storage`,
        resourceType: 'crew',
        amount: state.categories.crewQuarters.resources.crew,
        capacity: state.categories.crewQuarters.stats.crewCapacity,
      } as ResourceStorage,
      {
        id: `${crewId}-gen`,
        outputType: 'crew',
        ratePerSecond: state.categories.crewQuarters.stats.crewPerSecond,
        active: true,
      } as Generator,
    ],
  });

  /* Manufacturing entity (scrap storage + generator) */
  const manuId = uuidv4();
  world.push({
    id: manuId,
    components: [
      {
        id: `${manuId}-storage`,
        resourceType: 'scrap',
        amount: state.categories.manufacturing.resources.scrap,
        capacity: state.categories.manufacturing.stats.scrapCapacity,
      } as ResourceStorage,
      {
        id: `${manuId}-gen`,
        outputType: 'scrap',
        ratePerSecond: state.categories.manufacturing.stats.scrapPerSecond,
        active: true,
      } as Generator,
    ],
  });

  return world;
} 