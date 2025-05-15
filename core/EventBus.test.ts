import { EventBus } from './EventBus';
import { initialGameState } from '@/app/game/types';

describe('EventBus', () => {
  it('should call subscriber when resourceChange is published', (done) => {
    const bus = new EventBus();
    const payload = { state: initialGameState, resourceType: 'energy', amount: 42, source: 'test' };
    bus.subscribe('resourceChange', (data) => {
      expect(data).toMatchObject({ resourceType: 'energy', amount: 42 });
      done();
    });
    bus.publish('resourceChange', payload);
  });
}); 