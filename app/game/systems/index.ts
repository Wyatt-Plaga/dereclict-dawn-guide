/* eslint-disable no-restricted-imports, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { EncounterSystem } from './EncounterSystem';
import { ResourceSystem } from './ResourceSystem';
import { UpgradeSystem } from './UpgradeSystem';
import { LogSystem } from './LogSystem';
import { CombatSystem } from './CombatSystem';
import { EventBus } from 'core/EventBus';
import { GameState } from '../types';
import { ResourceManager } from 'core/managers/ResourceManager';
import { CombatEncounterManager } from 'core/managers/CombatEncounterManager';

// Minimal orchestrator: only instantiates and exposes systems, no cross-system logic or event wiring.
export class GameSystemManager {
  public resource: ResourceSystem;
  public upgrade: UpgradeSystem;
  public log: LogSystem;
  public encounter: EncounterSystem;
  public combat: CombatSystem;
  public resourceManager: ResourceManager;
  public combatEncounterManager: CombatEncounterManager;

  constructor(eventBus: EventBus) {
    this.resource = new ResourceSystem(eventBus);
    this.upgrade = new UpgradeSystem(eventBus, this.resource);
    this.log = new LogSystem(eventBus);
    this.encounter = new EncounterSystem(eventBus);
    this.combat = new CombatSystem(eventBus, this.resource);
    this.resourceManager = new ResourceManager(eventBus);
    this.combatEncounterManager = new CombatEncounterManager(eventBus, this.combat);
  }

  /**
   * Update all game systems each frame.
   * ResourceSystem needs the automationHasPower flag; other systems ignore it.
   */
  update(state: GameState, delta: number, automationHasPower: boolean = true) {
    // Share up-to-date state with systems that need it for action handlers
    this.upgrade.setState?.(state);

    this.resource.update(state, delta, automationHasPower);
    this.encounter.setState?.(state);
    this.combat.setState?.(state);
    (this.encounter as any).update?.(state, delta);
    (this.combat as any).update?.(state, delta);
    (this.log as any).update?.(state, delta);
    // UpgradeSystem currently does stat updates on-demand; skip here.
  }
} 