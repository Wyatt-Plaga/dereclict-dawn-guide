import { useGame } from './useGame';
import { GameEventMap } from 'core/events';
import { EventBus } from 'core/EventBus';

export function useGameBus(): EventBus<GameEventMap> {
  const { engine } = useGame();
  return engine.eventBus;
} 