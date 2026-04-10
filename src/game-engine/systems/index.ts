import { GameState } from '../types';
import { GameAction } from '../types/actions';
import { ResourceSystem } from './ResourceSystem';
import { ActionSystem } from './ActionSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { LogSystem } from './LogSystem';
import { EncounterSystem } from './EncounterSystem';
import { CombatSystem } from './CombatSystem';

/**
 * Coordinates all game systems and provides a central access point.
 */
export class GameSystemManager {
  public resource: ResourceSystem;
  public action: ActionSystem;
  public upgrade: UpgradeSystem;
  public log: LogSystem;
  public encounter: EncounterSystem;
  public combat: CombatSystem;

  constructor(eventBus?: import('../core/EventBus').EventBus<import('../types/events').EventMap>) {
    this.resource = new ResourceSystem();
    this.upgrade = new UpgradeSystem(eventBus);
    this.log = new LogSystem(eventBus);
    this.encounter = new EncounterSystem(eventBus);
    this.combat = new CombatSystem(eventBus);
    this.action = new ActionSystem(eventBus);
    this.combat.setResourceSystem(this.resource);
  }

  update(state: GameState, delta: number) {
    this.resource.update(state, delta);
    this.log.update(state, delta);

    if (state.combat && state.combat.active) {
      this.combat.update(state, delta);
    }
  }

  processAction(state: GameState, action: GameAction): GameState {
    return this.action.processAction(state, action);
  }
}
