import { GameEventMap } from 'core/events';
import { EventBus } from 'core/EventBus';
import { GameState, RegionType } from '@/app/game/types';
import { CombatSystem } from '@/app/game/systems/CombatSystem';

export class CombatEncounterManager {
  constructor(private bus: EventBus<GameEventMap>, private combatSystem: CombatSystem) {
    this.bus.on('combatEncounterTriggered', this.onEncounter.bind(this));
  }

  private onEncounter(data: { state: GameState; enemyId: string; regionId: RegionType; subRegionId?: string }) {
    const { state, enemyId, regionId, subRegionId } = data;
    if (!enemyId || !regionId) return;
    this.combatSystem.startCombatEncounter(state, enemyId, regionId, subRegionId);
  }
} 