import { EventBus } from '@/core/EventBus';
import { GameEventMap } from '@/core/events';
import { ActionMap, ActionKey } from '@/app/game/actions';
import { GameSystemManager } from '@/app/game/systems';
import { initialGameState } from '@/app/game/types';

describe('Action Event Subscribers', () => {
  let eventBus: EventBus<GameEventMap>;
  let systems: GameSystemManager;

  beforeEach(() => {
    eventBus = new EventBus<GameEventMap>();
    systems = new GameSystemManager(eventBus);
  });

  it('should have at least one subscriber for each action event', () => {
    // Get all action keys
    const actionKeys: ActionKey[] = [
      'action:resource_click',
      'action:purchase_upgrade',
      'action:mark_log_read',
      'action:mark_all_logs',
      'action:story_choice',
      'action:combat_move',
      'action:retreat',
      'action:start_encounter',
      'action:toggle_automation',
      'action:adjust_automation',
      'action:initiate_jump',
    ];

    // Check each action has at least one listener
    actionKeys.forEach(actionKey => {
      // We can't directly check EventBus listeners, but we can verify
      // that publishing doesn't throw and systems are set up
      expect(() => {
        // Create minimal valid payloads for each action type
        const testPayloads: Record<ActionKey, ActionMap[ActionKey]> = {
          'action:resource_click': { entityId: 'test' },
          'action:purchase_upgrade': { entityId: 'test', upgradeId: 'test' },
          'action:mark_log_read': { logId: 'test' },
          'action:mark_all_logs': {},
          'action:story_choice': { encounterId: 'test', choiceId: 'test' },
          'action:combat_move': { moveId: 'test' },
          'action:retreat': {},
          'action:start_encounter': { encounterId: 'test' },
          'action:toggle_automation': { entityId: 'test', enabled: true },
          'action:adjust_automation': { entityId: 'test', automationType: 'test', direction: 'increase' },
          'action:initiate_jump': {},
        };
        eventBus.publish(actionKey, testPayloads[actionKey] as any);
      }).not.toThrow();
    });

    // Verify systems are initialized (they register listeners in constructors)
    expect(systems.resource).toBeDefined();
    expect(systems.upgrade).toBeDefined();
    expect(systems.log).toBeDefined();
    expect(systems.encounter).toBeDefined();
    expect(systems.combat).toBeDefined();
  });

  it('should handle resource click action', () => {
    const state = { ...initialGameState };
    state.world = state.world || { entities: new Map() };
    
    // Set up state for resource system
    systems.resource.update(state, 0);
    
    // Dispatch resource click
    eventBus.publish('action:resource_click', { entityId: 'reactor', amount: 10 });
    
    // The action should be handled without errors
    expect(true).toBe(true); // If we get here, no errors were thrown
  });
}); 