import { GameState, EnemyDefinition, EnemyActionDefinition, EnemyActionCondition } from '../../types';
import { ENEMY_ACTIONS } from '../../content/combatActions';

/**
 * EnemyAI
 *
 * Legacy helper — real-time combat now handles enemy actions directly in CombatSystem.update().
 * Kept for potential utility use.
 */
export class EnemyAI {

  static selectAction(state: GameState, enemy: EnemyDefinition): EnemyActionDefinition | null {
    const availableActions = enemy.actions
      .map(actionId => ENEMY_ACTIONS[actionId])
      .filter(action => !!action);

    if (availableActions.length === 0) return null;

    const validActions = availableActions.filter(action => {
      return this.checkCondition(state, action.useCondition);
    });

    if (validActions.length === 0) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * validActions.length);
    return validActions[randomIndex];
  }

  static checkCondition(state: GameState, condition: EnemyActionCondition): boolean {
    const playerStats = state.combat.playerStats;

    switch (condition.type) {
      case 'ALWAYS':
        return true;

      case 'PLAYER_HEALTH_BELOW':
        if (condition.threshold === undefined) return false;
        const healthPct = playerStats.health / playerStats.maxHealth;
        return healthPct < condition.threshold;

      case 'PLAYER_HAS_SHIELDS':
        return playerStats.shield > 0;

      case 'PLAYER_NO_SHIELDS':
        return playerStats.shield <= 0;

      default:
        return false;
    }
  }
}
