import { GameState, BattleLogEntry } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * CombatLogger
 * 
 * Handles battle log entries.
 */
export class CombatLogger {
  
  /**
   * Add an entry to the battle log
   * 
   * @param state - Game state to modify
   * @param text - Log message text
   * @param type - Type of log entry
   */
  static log(state: GameState, text: string, type: BattleLogEntry['type']): void {
    if (!state.combat) return;
    
    const entry: BattleLogEntry = {
      id: uuidv4(),
      text,
      type,
      timestamp: Date.now()
    };
    
    state.combat.battleLog.push(entry);
    
    // Keep log size manageable (max 50 entries)
    if (state.combat.battleLog.length > 50) {
      state.combat.battleLog = state.combat.battleLog.slice(-50);
    }
  }
}

