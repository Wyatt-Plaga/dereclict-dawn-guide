import { EventBus } from './EventBus';
import { initialGameState } from '@/app/game/types';

const bus = new EventBus();

// @ts-expect-error: This event key does not exist in GameEventMap
bus.publish('notARealEvent', {});

// @ts-expect-error: This payload is not valid for resourceChange
bus.publish('resourceChange', { foo: 123 });

// This should succeed (no error)
bus.publish('resourceChange', {
  state: initialGameState,
  resourceType: 'energy',
  amount: 1,
  source: 'test',
}); 