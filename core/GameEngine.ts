import { EventBus } from '@/core/EventBus';
import { GameState, initialGameState } from '@/app/game/types';
import { GameSystemManager } from '@/app/game/systems';
import { GameAction } from '@/app/game/types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { SaveSystem } from '@/core/SaveSystem';
import { getCachedState, cacheState } from '@/core/memoryCache';
import { AutomationConstants } from '@/app/game/config/gameConstants';

export { GameEngine } from '@/app/game/core/GameEngine'; 
