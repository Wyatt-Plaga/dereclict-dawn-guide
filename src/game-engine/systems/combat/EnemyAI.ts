import { GameState, EnemyDefinition, EnemyActionDefinition, EnemyActionCondition } from '../../types';
import { ENEMY_ACTIONS } from '../../content/combatActions';

/**
 * EnemyAI
 * 
 * Logic for enemy decision making.
 */
export class EnemyAI {
  
  /**
   * Select an action for the enemy to perform
   * 
   * @param state - Current game state
   * @param enemy - Enemy definition
   * @returns Selected action definition or null if no valid actions
   */
  static selectAction(state: GameState, enemy: EnemyDefinition): EnemyActionDefinition | null {
    // Get available action definitions
    const availableActions = enemy.actions
      .map(actionId => ENEMY_ACTIONS[actionId])
      .filter(action => !!action);
    
    if (availableActions.length === 0) return null;
    
    // Filter actions by condition
    const validActions = availableActions.filter(action => {
      return this.checkCondition(state, action.useCondition);
    });
    
    // If no valid actions, pick randomly from all (fallback)
    // Or maybe return null? The original code fell back to random.
    if (validActions.length === 0) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }
    
    // Pick randomly from valid actions
    const randomIndex = Math.floor(Math.random() * validActions.length);
    return validActions[randomIndex];
  }

  /**
   * Check if an enemy action condition is met
   */
  private static checkCondition(state: GameState, condition: EnemyActionCondition): boolean {
    const enemyStats = state.combat.enemyStats;
    
    switch (condition.type) {
      case 'HEALTH_THRESHOLD':
        // Use action if health is below threshold (percentage)
        if (condition.threshold === undefined) return false;
        const healthPercentage = enemyStats.health / enemyStats.maxHealth;
        return healthPercentage <= condition.threshold;
        
      case 'SHIELD_THRESHOLD':
        // Use action if shield is below threshold (percentage)
        if (condition.threshold === undefined) return false;
        if (enemyStats.maxShield === 0) return false;
        const shieldPercentage = enemyStats.shield / enemyStats.maxShield;
        return shieldPercentage <= condition.threshold;
        
      case 'ALWAYS':
        // Always use this action if available
        return true;
        
      case 'RANDOM':
        // Use action based on random probability
        if (condition.probability === undefined) return false;
        return Math.random() <= condition.probability;
        
      default:
        return false;
    }
  }
}

