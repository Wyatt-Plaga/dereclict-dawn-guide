import { CombatState, CombatAction_Union } from './combat';
import { GameSystemManager } from '../systems';

// Update GameState to include combat state
export interface GameState {
  // ... existing properties ...
  
  // Game systems manager
  systems: GameSystemManager;
  
  // Current region
  currentRegion: string;
  
  // Combat state
  combat: CombatState;
}

// Update GameAction to include combat actions
export type GameAction = 
  // ... existing action types ...
  | CombatAction_Union; 