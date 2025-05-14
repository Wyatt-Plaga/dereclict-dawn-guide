import { GameState } from '@/app/game/types';
import { GameEventMap } from 'core/events';
import { EventBus } from 'core/EventBus';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

export class ResourceManager {
  constructor(private bus: EventBus<GameEventMap>) {
    this.bus.on('resourceChange', this.handleResourceChange.bind(this));
  }

  private handleResourceChange(data: { state: GameState; resourceType: string; amount: number; source: string }) {
    const { state, resourceType, amount } = data;
    switch (resourceType) {
      case 'energy':
        state.categories.reactor.resources.energy = Math.min(
          state.categories.reactor.resources.energy + amount,
          state.categories.reactor.stats.energyCapacity
        );
        break;
      case 'insight':
        state.categories.processor.resources.insight = Math.min(
          state.categories.processor.resources.insight + amount,
          state.categories.processor.stats.insightCapacity
        );
        break;
      case 'crew':
        if (amount >= 1 || amount < 0) {
          state.categories.crewQuarters.resources.crew = Math.min(
            state.categories.crewQuarters.resources.crew + (amount >= 1 ? Math.floor(amount) : amount),
            state.categories.crewQuarters.stats.crewCapacity
          );
        }
        break;
      case 'scrap':
        state.categories.manufacturing.resources.scrap = Math.min(
          state.categories.manufacturing.resources.scrap + amount,
          state.categories.manufacturing.stats.scrapCapacity
        );
        break;
      default:
        Logger.warn(LogCategory.RESOURCES, `Unknown resource type: ${resourceType}`, LogContext.NONE);
    }
  }
} 