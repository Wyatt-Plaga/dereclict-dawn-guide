import { GameState } from '@/app/game/types';
import { GameEventMap } from '@/core/events';
import { EventBus } from '@/core/EventBus';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { getCategoryEntity } from '@/core/ecs/selectors';
import { ResourceStorage } from '@/app/game/components/interfaces';

export class ResourceManager {
  constructor(private bus: EventBus<GameEventMap>) {
    this.bus.on('resourceChange', this.handleResourceChange.bind(this));
  }

  private handleResourceChange(data: { state: GameState; resourceType: string; amount: number; source: string }) {
    const { state, resourceType, amount } = data;
    const entity = getCategoryEntity(state.world, this.categoryForResource(resourceType));
    if (['energy', 'insight', 'crew', 'scrap'].includes(resourceType)) {
      if (!entity) return;
      const storage = entity.get<ResourceStorage>('ResourceStorage');
      if (!storage) return;

      // Clamp between 0 and capacity
      storage.current = Math.min(Math.max(0, storage.current + amount), storage.capacity);
      return;
    }

    switch (resourceType) {
      case 'combatComponents':
        state.combatComponents = Math.max(0, state.combatComponents + amount);
        break;
      case 'bossMatrix':
        state.bossMatrix = Math.max(0, state.bossMatrix + amount);
        break;
      default:
        Logger.warn(LogCategory.RESOURCES, `Unknown resource type: ${resourceType}`, LogContext.NONE);
    }
  }

  private categoryForResource(type: string): string {
    switch (type) {
      case 'energy':
        return 'reactor';
      case 'insight':
        return 'processor';
      case 'crew':
        return 'crewQuarters';
      case 'scrap':
        return 'manufacturing';
      default:
        return '';
    }
  }
} 
