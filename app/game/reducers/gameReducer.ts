import { GameState, GameAction } from '../types/state';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { REGIONS } from '../content/regions';

// Add combat action handling to the reducer
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  // Log the action for debugging
  Logger.debug(
    LogCategory.GAME_STATE,
    `Reducer processing action: ${action.type}`,
    LogContext.REDUCER
  );

  // Process the action based on its type
  switch (action.type) {
    // ... existing cases ...

    // Combat-related actions
    case 'START_COMBAT': {
      const { enemyId, regionId } = action.payload;
      const success = state.systems.combat.startCombat(enemyId, regionId);
      
      if (!success) {
        Logger.warn(
          LogCategory.COMBAT,
          `Failed to start combat with ${enemyId} in ${regionId}`,
          LogContext.COMBAT
        );
        return state;
      }
      
      return {
        ...state,
        combat: state.systems.combat.getState()
      };
    }
    
    case 'PERFORM_COMBAT_ACTION': {
      const { actionId } = action.payload;
      const success = state.systems.combat.performAction(actionId);
      
      if (!success) {
        Logger.warn(
          LogCategory.COMBAT,
          `Failed to perform combat action ${actionId}`,
          LogContext.COMBAT_ACTION
        );
        return state;
      }
      
      return {
        ...state,
        combat: state.systems.combat.getState()
      };
    }
    
    case 'RETREAT_FROM_COMBAT': {
      const success = state.systems.combat.retreat();
      
      if (!success) {
        Logger.warn(
          LogCategory.COMBAT,
          `Failed to retreat from combat`,
          LogContext.COMBAT
        );
        return state;
      }
      
      return {
        ...state,
        combat: state.systems.combat.getState()
      };
    }
    
    case 'END_COMBAT': {
      // This is typically called internally by the combat system
      // but we include it for completeness
      return {
        ...state,
        combat: state.systems.combat.getState()
      };
    }
    
    case 'INITIATE_JUMP': {
      const { targetRegion } = action.payload;
      
      // Update the current region
      state.currentRegion = targetRegion;
      
      // Determine if a combat encounter should occur
      const regionDef = REGIONS.find(r => r.id === targetRegion);
      if (!regionDef) {
        Logger.error(
          LogCategory.NAVIGATION,
          `Invalid region ID: ${targetRegion}`,
          LogContext.NAVIGATION
        );
        return state;
      }
      
      // Check for random encounter based on region's encounter chance
      const encounterRoll = Math.random() * 100;
      const encounterChance = regionDef.encounterChance || 50; // Default 50% if not specified
      
      if (encounterRoll < encounterChance) {
        // Select an enemy from the region's possible enemies
        const possibleEnemies = regionDef.enemyProbabilities || [];
        if (possibleEnemies.length === 0) {
          Logger.warn(
            LogCategory.COMBAT,
            `No enemies defined for region ${targetRegion}`,
            LogContext.COMBAT
          );
          return {
            ...state,
            currentRegion: targetRegion
          };
        }
        
        // Select an enemy based on probabilities
        let totalWeight = 0;
        possibleEnemies.forEach(enemy => {
          totalWeight += enemy.weight;
        });
        
        let randomValue = Math.random() * totalWeight;
        let selectedEnemy = possibleEnemies[0].enemyId;
        
        for (const enemy of possibleEnemies) {
          randomValue -= enemy.weight;
          if (randomValue <= 0) {
            selectedEnemy = enemy.enemyId;
            break;
          }
        }
        
        // Start combat with the selected enemy
        const success = state.systems.combat.startCombat(selectedEnemy, targetRegion);
        
        if (!success) {
          Logger.warn(
            LogCategory.COMBAT,
            `Failed to start combat with ${selectedEnemy} in ${targetRegion}`,
            LogContext.COMBAT
          );
          return {
            ...state,
            currentRegion: targetRegion
          };
        }
        
        return {
          ...state,
          currentRegion: targetRegion,
          combat: state.systems.combat.getState()
        };
      }
      
      // No encounter, just update the region
      return {
        ...state,
        currentRegion: targetRegion
      };
    }

    default:
      return state;
  }
}; 