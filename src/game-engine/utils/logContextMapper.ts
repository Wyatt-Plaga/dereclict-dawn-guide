import { GameAction } from '../types/actions';
import { LogContext } from '@/app/utils/logger';

/**
 * Determine the appropriate LogContext tag for a given action.
 * This centralises all ad-hoc switch/if blocks so every subsystem
 * derives context the same way.
 */
export function getLogContextForAction(action: GameAction): LogContext {
  switch (action.type) {
    case 'CLICK_RESOURCE':
    case 'RESOURCE_CLICK': {
      const cat = action.payload?.category;
      switch (cat) {
        case 'reactor':
          return LogContext.REACTOR_LIFECYCLE;
        case 'processor':
          return LogContext.PROCESSOR_LIFECYCLE;
        case 'crewQuarters':
          return LogContext.CREW_LIFECYCLE;
        case 'manufacturing':
          return LogContext.MANUFACTURING_LIFECYCLE;
        default:
          return LogContext.NONE;
      }
    }
    case 'PURCHASE_UPGRADE':
      return LogContext.UPGRADE_PURCHASE;
    case 'COMBAT_ACTION':
    case 'RETREAT_FROM_BATTLE':
      return LogContext.COMBAT_ACTION;
    default:
      return LogContext.NONE;
  }
}

export function getLogContextForEvent(event: string, data?: any): LogContext {
  switch (event) {
    case 'stateUpdated':
      return LogContext.NONE;
    case 'DISPATCH_ACTION':
      if (data && typeof data === 'object' && 'type' in data) {
        return getLogContextForAction(data as any);
      }
      return LogContext.NONE;
    case 'PURCHASE_UPGRADE':
      return LogContext.UPGRADE_PURCHASE;
    case 'CLICK_RESOURCE':
    case 'RESOURCE_CLICK':
      if (data && typeof data === 'object' && 'category' in data) {
        switch (data.category) {
          case 'reactor':
            return LogContext.REACTOR_LIFECYCLE;
          case 'processor':
            return LogContext.PROCESSOR_LIFECYCLE;
          case 'crewQuarters':
            return LogContext.CREW_LIFECYCLE;
          case 'manufacturing':
            return LogContext.MANUFACTURING_LIFECYCLE;
        }
      }
      return LogContext.NONE;
    case 'COMBAT_ACTION':
    case 'RETREAT_FROM_BATTLE':
      return LogContext.COMBAT_ACTION;
    default:
      return LogContext.NONE;
  }
} 
