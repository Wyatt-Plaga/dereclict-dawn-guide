import { GameState, RegionType, BattleLogEntry, RegionDefinition } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  ActionResult, 
  CombatActionDefinition,
  EnemyActionDefinition,
  EnemyDefinition
} from '../types/combat';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { ENEMY_ACTIONS, PLAYER_ACTIONS } from '@/game-engine/content/combatActions';
import { ENEMY_DEFINITIONS } from '@/game-engine/content/enemies';
import { REGION_DEFINITIONS } from '@/game-engine/content/regions';
import { ResourceSystem } from './ResourceSystem';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";

// Import new modules
import { CombatCalculator } from './combat/CombatCalculator';
import { CombatLogger } from './combat/CombatLogger';
import { EnemyAI } from './combat/EnemyAI';

/**
 * Combat System
 * 
 * Handles all combat-related game logic including:
 * - Starting and ending combat encounters
 * - Processing combat actions
 * - Enemy AI decisions
 * - Combat rewards
 */
export class CombatSystem {
  private resourceSystem: ResourceSystem | null = null;
  private eventBus?: EventBus<EventMap>;

  constructor(eventBus?: EventBus<EventMap>) {
    this.eventBus = eventBus;

    if (this.eventBus) {
      this.eventBus.on('START_COMBAT', (data: any) => {
        const { state, enemyId, regionId } = data as { state: GameState; enemyId: string; regionId: string };
        this.startCombatEncounter(state, enemyId, regionId as any);
      });

      this.eventBus.on('COMBAT_ACTION', (data: any) => {
        const { state, actionId } = data as { state: GameState; actionId: string };
        this.performCombatAction(state, actionId);
      });

      this.eventBus.on('RETREAT_FROM_BATTLE', (data: any) => {
        const { state } = data as { state: GameState };
        this.retreat(state);
      });

      this.eventBus.on('ENEMY_ACTION_RESOLVE', (data: any) => {
        const { state } = data as { state: GameState };
        this.resolveEnemyAction(state);
      });
    }
  }

  /**
   * Set the resource system reference for resource checks
   */
  setResourceSystem(resourceSystem: ResourceSystem) {
    this.resourceSystem = resourceSystem;
  }

  /**
   * Check if an encounter should be generated when jumping
   */
  checkForEncounter(state: GameState, toRegion: RegionType): boolean {
    Logger.debug(
      LogCategory.COMBAT,
      `Checking for encounter in region: ${toRegion}`,
      LogContext.COMBAT
    );
    
    // Ensure navigation state exists
    if (!state.navigation) {
      Logger.warn(
        LogCategory.COMBAT,
        `Navigation state was undefined in checkForEncounter - initializing with default values`,
        LogContext.COMBAT
      );
      
      state.navigation = {
        currentRegion: toRegion,
        completedRegions: []
      };
    }
    
    const region = this.getRegionDefinition(toRegion);
    if (!region) {
      Logger.debug(
        LogCategory.COMBAT,
        `Region not found: ${toRegion}`,
        LogContext.COMBAT
      );
      return false;
    }

    Logger.debug(
      LogCategory.COMBAT,
      `Region: ${region.name}, Encounter chance: ${region.encounterChance}`,
      LogContext.COMBAT
    );
    
    // Random chance based on region's encounter probability
    const randomValue = Math.random();
    const encounterGenerated = randomValue < region.encounterChance;
    
    Logger.debug(
      LogCategory.COMBAT,
      `Random value: ${randomValue}, Encounter generated: ${encounterGenerated}`,
      LogContext.COMBAT
    );
    
    return encounterGenerated;
  }

  /**
   * Start a combat encounter
   */
  startCombatEncounter(state: GameState, enemyId: string, regionId: RegionType): void {
    Logger.info(
      LogCategory.COMBAT,
      `Starting combat with enemy ${enemyId} in region ${regionId}`,
      LogContext.COMBAT
    );

    const enemy = this.getEnemyDefinition(enemyId);
    if (!enemy) {
      Logger.error(
        LogCategory.COMBAT,
        `Failed to start combat: Enemy ${enemyId} not found`,
        LogContext.COMBAT
      );
      return;
    }

    // Check if combat state is undefined and initialize it
    if (!state.combat) {
      Logger.warn(
        LogCategory.COMBAT,
        `Combat state was undefined in startCombatEncounter - initializing with default values`,
        LogContext.COMBAT
      );
      
      // Initialize with default combat values
      state.combat = {
        active: false,
        battleLog: [],
        turn: 0,
        playerStats: {
          health: 100,
          maxHealth: 100,
          shield: 0,
          maxShield: 0,
          statusEffects: []
        },
        enemyStats: {
          health: 0,
          maxHealth: 0,
          shield: 0,
          maxShield: 0,
          statusEffects: []
        },
        availableActions: [],
        cooldowns: {},
        encounterCompleted: false,
        currentEnemy: null,
        currentRegion: null,
        enemyIntentions: null,
        rewards: {
          energy: 0,
          insight: 0,
          crew: 0,
          scrap: 0
        },
        lastEnemyActionId: null
      };
    }

    // Initialize combat state
    state.combat.active = true;
    state.combat.currentEnemy = enemyId;
    state.combat.currentRegion = regionId;
    state.combat.turn = 1;
    state.combat.encounterCompleted = false;
    state.combat.outcome = undefined;
    
    // Reset stats
    state.combat.enemyStats = {
      health: enemy.health,
      maxHealth: enemy.maxHealth,
      shield: enemy.shield,
      maxShield: enemy.maxShield,
      statusEffects: []
    };
    
    // Restore the Dawn to full strength at the start of every encounter
    state.combat.playerStats.health = state.combat.playerStats.maxHealth;
    state.combat.playerStats.shield = state.combat.playerStats.maxShield;

    // Clear any lingering status effects from previous battles
    state.combat.playerStats.statusEffects = [];
    
    // Add all available player actions
    state.combat.availableActions = Object.keys(PLAYER_ACTIONS);
    
    // Reset cooldowns
    state.combat.cooldowns = {};
    
    // Clear previous battle log
    state.combat.battleLog = [];
    
    // Add initial battle log entry
    CombatLogger.log(state, `Encounter with ${enemy.name} initiated.`, 'SYSTEM');
    CombatLogger.log(state, `${enemy.description}`, 'ANALYSIS');

    // Enemy will act only after the player's first move; no telegraph yet
  }

  /**
   * End a combat encounter
   */
  endCombatEncounter(state: GameState, outcome: 'victory' | 'defeat' | 'retreat'): void {
    // Check if combat state exists
    if (!state.combat) {
      Logger.error(
        LogCategory.COMBAT,
        `Combat state is undefined in endCombatEncounter`,
        LogContext.COMBAT
      );
      return;
    }
    
    Logger.info(
      LogCategory.COMBAT,
      `Ending combat with outcome: ${outcome}`,
      LogContext.COMBAT
    );

    state.combat.active = false;
    state.combat.encounterCompleted = true;
    state.combat.outcome = outcome;

    // Add battle log entry for the outcome
    let message = '';
    switch (outcome) {
      case 'victory':
        message = `Victory! The enemy has been defeated.`;
        this.processVictoryRewards(state);
        break;
      case 'defeat':
        message = `Defeat! The Dawn has sustained critical damage.`;
        break;
      case 'retreat':
        message = `Tactical retreat successful. The Dawn has disengaged.`;
        break;
    }

    CombatLogger.log(state, message, 'SYSTEM');
  }

  /**
   * Process victory rewards
   */
  private processVictoryRewards(state: GameState): void {
    if (!state.combat.currentEnemy) return;
    
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy);
    if (!enemy) return;
    
    // Process rewards
    enemy.loot.forEach(reward => {
      // Check probability
      if (reward.probability && Math.random() > reward.probability) {
        return;
      }
      
      // Add reward to resources
      if (reward.type === 'relics') {
        state.relics += reward.amount;
      } else {
        const resourceCategory = this.getResourceCategory(reward.type);
        if (resourceCategory) {
          switch (reward.type) {
            case 'energy':
              state.categories.reactor.resources.energy += reward.amount;
              break;
            case 'insight':
              state.categories.processor.resources.insight += reward.amount;
              break;
            case 'crew':
              state.categories.crewQuarters.resources.crew += reward.amount;
              break;
            case 'scrap':
              state.categories.manufacturing.resources.scrap += reward.amount;
              break;
          }
        }
      }
      
      // Add log entry
      CombatLogger.log(state, `Recovered ${reward.amount} ${reward.type} from the encounter.`, 'SYSTEM');
    });

    // NEW: Always award 1 relic for victories in the void region
    if (state.combat.currentRegion === 'void') {
      state.relics += 1;
      CombatLogger.log(state, `Recovered 1 relic from the drifting wreckage.`, 'SYSTEM');
    }
  }

  /**
   * Helper method to get the category for a resource type
   */
  private getResourceCategory(resourceType: string): keyof GameState['categories'] | null {
    switch (resourceType) {
      case 'energy':
        return 'reactor';
      case 'insight':
        return 'processor';
      case 'crew':
        return 'crewQuarters';
      case 'scrap':
        return 'manufacturing';
      case 'relics':
        return null;
      default:
        Logger.warn(
          LogCategory.COMBAT,
          `Unknown resource type: ${resourceType}`,
          LogContext.COMBAT
        );
        return null;
    }
  }

  /**
   * Process a player combat action
   */
  performCombatAction(state: GameState, actionId: string): ActionResult {
    // If the enemy is currently charging, the player must wait. Prevent action.
    if (state.combat.enemyIntentions) {
      return {
        success: false,
        message: 'Enemy action is executing – stand by!'
      };
    }

    // Check if combat state exists
    if (!state.combat) {
      Logger.error(
        LogCategory.COMBAT,
        `Combat state is undefined in performCombatAction`,
        LogContext.COMBAT_ACTION
      );
      return { 
        success: false, 
        message: 'Combat system error: state not initialized.' 
      };
    }
    
    if (!state.combat.active) {
      return { 
        success: false, 
        message: 'No active combat encounter.' 
      };
    }

    const action = PLAYER_ACTIONS[actionId];
    if (!action) {
      return { 
        success: false, 
        message: `Unknown action: ${actionId}` 
      };
    }

    // Initialize cooldowns if undefined
    if (!state.combat.cooldowns) {
      state.combat.cooldowns = {};
    }

    // Check cooldowns
    if (state.combat.cooldowns[actionId] && state.combat.cooldowns[actionId] > 0) {
      return {
        success: false,
        message: `Action is on cooldown for ${state.combat.cooldowns[actionId]} more turns.`
      };
    }

    // Check resource costs
    if (!this.resourceSystem?.hasResources(state, [action.cost])) {
      return {
        success: false,
        message: `Insufficient resources: ${action.cost.amount} ${action.cost.type}.`
      };
    }

    // Apply resource costs
    this.resourceSystem?.consumeResources(state, [action.cost]);

    // Set cooldown if applicable
    if (action.cooldown) {
      state.combat.cooldowns[actionId] = action.cooldown;
    }

    // Clear any previous enemy charging indicator since the player is acting now
    state.combat.lastEnemyActionId = null;

    // Process action effects
    const result = this.applyActionEffects(state, action);
    
    // Add battle log entry
    CombatLogger.log(state, result.message, 'PLAYER');

    // Store last action result
    state.combat.lastActionResult = result;

    // Check if enemy is defeated
    if (state.combat.enemyStats.health <= 0) {
      this.endCombatEncounter(state, 'victory');
      return result;
    }

    // 6. After the player's action completes, initiate the enemy turn (charge + attack after delay)
    this.startEnemyTurn(state);

    // Check if player is defeated
    if (state.combat.playerStats.health <= 0) {
      this.endCombatEncounter(state, 'defeat');
    }

    // Increment turn counter
    state.combat.turn++;

    // Reduce cooldowns
    this.reduceCooldowns(state);

    // Handle status effects
    this.processStatusEffects(state);

    // Notify listeners with a shallow-cloned state so React detects the change
    const clonedState: GameState = { ...state, combat: { ...state.combat } };
    this.eventBus?.emit('stateUpdated', clonedState);

    return result;
  }

  /**
   * Apply effects of a combat action
   */
  private applyActionEffects(state: GameState, action: CombatActionDefinition): ActionResult {
    const result: ActionResult = {
      success: true,
      message: `Used ${action.name}`
    };
    
    // Track resources consumed
    result.resourcesConsumed = [action.cost];
    
    // Apply damage to enemy
    if (action.damage) {
      let actualDamage = action.damage;
      
      // Check for status effects that modify damage
      const weakenEffect = state.combat.enemyStats.statusEffects
        .find(effect => effect.type === 'WEAKEN');
      
      if (weakenEffect) {
        actualDamage = Math.floor(actualDamage * (1 + weakenEffect.magnitude));
      }
      
      const damageResult = CombatCalculator.calculateDamage(
        state.combat.enemyStats.health,
        state.combat.enemyStats.shield,
        actualDamage
      );

      state.combat.enemyStats.health = damageResult.newHealth;
      state.combat.enemyStats.shield = damageResult.newShield;
      result.shieldDamage = damageResult.shieldDamage;
      result.damageDealt = damageResult.hullDamage;

      if (damageResult.shieldDamage > 0 && damageResult.hullDamage > 0) {
        result.message = `${action.name} damaged enemy shields for ${damageResult.shieldDamage} and hull for ${damageResult.hullDamage}`;
      } else if (damageResult.shieldDamage > 0) {
        result.message = `${action.name} damaged enemy shields for ${damageResult.shieldDamage}`;
      } else {
        result.message = `${action.name} damaged enemy hull for ${damageResult.hullDamage}`;
      }
    }
    
    // Apply shields
    if (action.shieldRepair) {
      const repairResult = CombatCalculator.calculateShieldRepair(
        state.combat.playerStats.shield,
        state.combat.playerStats.maxShield,
        action.shieldRepair
      );
      
      state.combat.playerStats.shield = repairResult.newShield;
      result.message = `${action.name} restored ${repairResult.repairedAmount} shields`;
      result.shieldRepaired = repairResult.repairedAmount;
    }
    
    // Apply hull repair
    if (action.hullRepair) {
      const repairResult = CombatCalculator.calculateHullRepair(
        state.combat.playerStats.health,
        state.combat.playerStats.maxHealth,
        action.hullRepair
      );
      
      state.combat.playerStats.health = repairResult.newHealth;
      result.message = `${action.name} repaired ${repairResult.repairedAmount} hull integrity`;
      result.healthRepaired = repairResult.repairedAmount;
    }
    
    // Apply status effects
    if (action.statusEffect) {
      state.combat.enemyStats.statusEffects.push({
        ...action.statusEffect,
        remainingTurns: action.statusEffect.duration
      });
      
      result.message = result.message || `Used ${action.name}`;
      result.message += `, applying ${action.statusEffect.type} effect`;
      result.statusEffectApplied = action.statusEffect;
    }
    
    return result;
  }

  /**
   * Reduce cooldowns at the end of player turn
   */
  private reduceCooldowns(state: GameState): void {
    // Initialize cooldowns if undefined
    if (!state.combat.cooldowns) {
      state.combat.cooldowns = {};
      return;
    }
    
    Object.keys(state.combat.cooldowns).forEach(actionId => {
      if (state.combat.cooldowns && state.combat.cooldowns[actionId] > 0) {
        state.combat.cooldowns[actionId]--;
      }
    });
  }

  /**
   * Process status effects at end of turn
   */
  private processStatusEffects(state: GameState): void {
    state.combat.playerStats.statusEffects = CombatCalculator.processStatusEffects(state.combat.playerStats.statusEffects);
    state.combat.enemyStats.statusEffects = CombatCalculator.processStatusEffects(state.combat.enemyStats.statusEffects);
  }

  /**
   * Get enemy definition by ID
   */
  private getEnemyDefinition(enemyId: string): EnemyDefinition | undefined {
    return ENEMY_DEFINITIONS[enemyId];
  }

  /**
   * Get region definition by ID
   */
  private getRegionDefinition(regionId: string): RegionDefinition | undefined {
    return REGION_DEFINITIONS[regionId];
  }

  /**
   * Process retreat action
   */
  retreat(state: GameState): void {
    CombatLogger.log(state, `Retreat initiated. Preparing emergency jump.`, 'PLAYER');
    this.endCombatEncounter(state, 'retreat');
  }

  /**
   * Update combat system (called on tick)
   */
  update(state: GameState, delta: number): void {
    // We don't need to do anything on regular updates for now
    // This could be used for timed effects or events in the future
  }

  /**
   * Generate a random encounter in the current region
   */
  generateRandomEncounter(state: GameState): string | null {
    Logger.debug(
      LogCategory.COMBAT,
      "Generating random encounter...",
      LogContext.COMBAT
    );
    
    // Ensure navigation state exists
    if (!state.navigation) {
      Logger.error(
        LogCategory.COMBAT,
        `Navigation state was undefined in generateRandomEncounter`,
        LogContext.COMBAT
      );
      return null;
    }
    
    const regionId = state.navigation.currentRegion;
    Logger.debug(
      LogCategory.COMBAT,
      `Current region: ${regionId}`,
      LogContext.COMBAT
    );
    
    const region = this.getRegionDefinition(regionId);
    
    if (!region) {
      Logger.debug(
        LogCategory.COMBAT,
        `Region not found: ${regionId}`,
        LogContext.COMBAT
      );
      return null;
    }
    
    Logger.debug(
      LogCategory.COMBAT,
      `Region: ${region.name}`,
      LogContext.COMBAT
    );
    
    // Get all enemies that can appear in this region
    const possibleEnemies = region.enemyProbabilities;
    Logger.debug(
      LogCategory.COMBAT,
      `Possible enemies: ${JSON.stringify(possibleEnemies)}`,
      LogContext.COMBAT
    );
    
    if (possibleEnemies.length === 0) {
      Logger.debug(
        LogCategory.COMBAT,
        "No enemies available for this region",
        LogContext.COMBAT
      );
      return null;
    }
    
    // Calculate total weight
    const totalWeight = possibleEnemies.reduce((sum, entry) => sum + entry.weight, 0);
    Logger.debug(
      LogCategory.COMBAT,
      `Total weight: ${totalWeight}`,
      LogContext.COMBAT
    );
    
    // Select random enemy based on weights
    let randomValue = Math.random() * totalWeight;
    Logger.debug(
      LogCategory.COMBAT,
      `Random value: ${randomValue}`,
      LogContext.COMBAT
    );
    let selectedEnemyId: string | null = null;
    
    for (const enemy of possibleEnemies) {
      randomValue -= enemy.weight;
      Logger.debug(
        LogCategory.COMBAT,
        `Checking enemy ${enemy.enemyId}, remaining weight: ${randomValue}`,
        LogContext.COMBAT
      );
      if (randomValue <= 0) {
        selectedEnemyId = enemy.enemyId;
        break;
      }
    }
    
    // If somehow we didn't select one, pick the first
    if (!selectedEnemyId && possibleEnemies.length > 0) {
      selectedEnemyId = possibleEnemies[0].enemyId;
      Logger.debug(
        LogCategory.COMBAT,
        `Fallback: selected first enemy ${selectedEnemyId}`,
        LogContext.COMBAT
      );
    }
    
    Logger.debug(
      LogCategory.COMBAT,
      `Selected enemy: ${selectedEnemyId}`,
      LogContext.COMBAT
    );
    return selectedEnemyId;
  }

  /**
   * Process a player's decision to retreat from combat
   * Applies resource penalty and ends combat
   */
  retreatFromCombat(state: GameState): GameState {
    // Check if combat state exists
    if (!state.combat) {
      Logger.error(
        LogCategory.COMBAT,
        `Combat state is undefined in retreatFromCombat`,
        LogContext.COMBAT
      );
      return state;
    }
    
    if (!state.combat.active) {
      Logger.warn(
        LogCategory.COMBAT,
        `Attempted to retreat from inactive combat`,
        LogContext.COMBAT
      );
      return state;
    }
    
    Logger.info(
      LogCategory.COMBAT,
      `Player retreating from combat with ${state.combat.currentEnemy}`,
      LogContext.COMBAT
    );
    
    // Create a copy of the state to modify
    const newState = { ...state };
    
    // Apply a resource penalty for retreating (e.g., lose 25% of resources)
    // This makes retreat a viable but costly option
    const retreatPenalty = 0.25; // 25% resource loss
    
    // Apply the penalty to all resource categories
    // Reactor - Energy
    if (newState.categories.reactor && newState.categories.reactor.resources) {
      const currentEnergy = newState.categories.reactor.resources.energy;
      const penaltyAmount = Math.floor(currentEnergy * retreatPenalty);
      newState.categories.reactor.resources.energy = Math.max(0, currentEnergy - penaltyAmount);
      
      Logger.debug(
        LogCategory.COMBAT,
        `Applied retreat penalty to energy: -${penaltyAmount}`,
        LogContext.COMBAT
      );
    }

    // Processor - Insight
    if (newState.categories.processor && newState.categories.processor.resources) {
      const currentInsight = newState.categories.processor.resources.insight;
      const penaltyAmount = Math.floor(currentInsight * retreatPenalty);
      newState.categories.processor.resources.insight = Math.max(0, currentInsight - penaltyAmount);
      
      Logger.debug(
        LogCategory.COMBAT,
        `Applied retreat penalty to insight: -${penaltyAmount}`,
        LogContext.COMBAT
      );
    }

    // Crew Quarters - Crew
    if (newState.categories.crewQuarters && newState.categories.crewQuarters.resources) {
      const currentCrew = newState.categories.crewQuarters.resources.crew;
      const penaltyAmount = Math.floor(currentCrew * retreatPenalty);
      newState.categories.crewQuarters.resources.crew = Math.max(0, currentCrew - penaltyAmount);
      
      Logger.debug(
        LogCategory.COMBAT,
        `Applied retreat penalty to crew: -${penaltyAmount}`,
        LogContext.COMBAT
      );
    }

    // Manufacturing - Scrap
    if (newState.categories.manufacturing && newState.categories.manufacturing.resources) {
      const currentScrap = newState.categories.manufacturing.resources.scrap;
      const penaltyAmount = Math.floor(currentScrap * retreatPenalty);
      newState.categories.manufacturing.resources.scrap = Math.max(0, currentScrap - penaltyAmount);
      
      Logger.debug(
        LogCategory.COMBAT,
        `Applied retreat penalty to scrap: -${penaltyAmount}`,
        LogContext.COMBAT
      );
    }
    
    // Update the combat state to reflect the retreat
    newState.combat = {
      ...newState.combat,
      active: false,
      encounterCompleted: true,
      outcome: 'retreat',
      battleLog: [
        ...newState.combat.battleLog,
        {
          id: uuidv4(),
          text: 'You retreated from combat, losing 25% of your resources in the hasty escape.',
          type: 'SYSTEM',
          timestamp: Date.now()
        }
      ]
    };
    
    // If there's an active encounter, mark it as completed
    if (newState.encounters.active && newState.encounters.encounter) {
      // Add to encounter history
      newState.encounters.history = Array.isArray(newState.encounters.history) 
        ? [
            ...newState.encounters.history,
            {
              id: newState.encounters.encounter.id,
              type: newState.encounters.encounter.type,
              result: 'retreat',
              date: Date.now(),
              region: newState.encounters.encounter.region
            }
          ]
        : [
            {
              id: newState.encounters.encounter.id,
              type: newState.encounters.encounter.type,
              result: 'retreat',
              date: Date.now(),
              region: newState.encounters.encounter.region
            }
          ];
      
      // Clear the active encounter
      newState.encounters.active = false;
      newState.encounters.encounter = undefined;
    }
    
    return newState;
  }

  /**
   * Apply the actual effects of an enemy action that has finished charging
   */
  private applyEnemyActionEffects(state: GameState, action: EnemyActionDefinition): void {
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy!);

    // (core of previous performEnemyAction implementation)
    let message = '';

    // Apply damage to player (identical to previous logic)
    if (action.damage) {
      const damageResult = CombatCalculator.calculateDamage(
        state.combat.playerStats.health,
        state.combat.playerStats.shield,
        action.damage
      );

      state.combat.playerStats.health = damageResult.newHealth;
      state.combat.playerStats.shield = damageResult.newShield;

      if (damageResult.shieldDamage > 0 && damageResult.hullDamage > 0) {
        message = `${enemy?.name ?? 'Enemy'} used ${action.name}, damaging shields for ${damageResult.shieldDamage} and hull for ${damageResult.hullDamage}`;
      } else if (damageResult.shieldDamage > 0) {
        message = `${enemy?.name ?? 'Enemy'} used ${action.name}, damaging shields for ${damageResult.shieldDamage}`;
      } else {
        message = `${enemy?.name ?? 'Enemy'} used ${action.name}, damaging hull for ${damageResult.hullDamage}`;
      }
    }

    if (action.shieldDamage) {
      // Shield specific damage
      // We can reuse calculateDamage but with specific parameters if needed, 
      // but calculateDamage assumes general damage. 
      // Let's just do direct calculation for this specific case to handle shield-only logic cleanly,
      // or expand CombatCalculator to support shield-only damage.
      // For now, manual calculation here is fine, or simple:
      const actualDamage = Math.min(state.combat.playerStats.shield, action.shieldDamage);
      state.combat.playerStats.shield -= actualDamage;
      message = `${enemy?.name ?? 'Enemy'} used ${action.name}, damaging shields for ${actualDamage}`;
    }

    if (action.statusEffect) {
      state.combat.playerStats.statusEffects.push({
        ...action.statusEffect,
        remainingTurns: action.statusEffect.duration
      });
      message = message || `${enemy?.name ?? 'Enemy'} used ${action.name}`;
      message += `, applying ${action.statusEffect.type} effect`;
    }

    if (!message) {
      message = `${enemy?.name ?? 'Enemy'} used ${action.name}`;
    }

    // Log the action
    CombatLogger.log(state, message, 'ENEMY');

    // Save last fired action ID (for potential UI flash)
    state.combat.lastEnemyActionId = action.id;
  }

  /**
   * Handle the complete enemy turn cycle:
   * 1. Choose a move.
   * 2. Telegraph it (charging) for 1 second.
   * 3. Apply the effects, then relinquish turn to the player.
   */
  private startEnemyTurn(state: GameState): void {
    Logger.debug(LogCategory.COMBAT, 'Enemy turn starting – selecting and telegraphing action', LogContext.COMBAT_ACTION);
    if (!state.combat.currentEnemy) return;
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy);
    if (!enemy) return;

    // Use EnemyAI to select action
    const action = EnemyAI.selectAction(state, enemy);

    if (!action) return;

    // Telegraph – enemy is now charging
    state.combat.enemyIntentions = { actionId: action.id };

    Logger.debug(LogCategory.COMBAT, `Telegraphing enemy action: ${action.id}`, LogContext.COMBAT_ACTION);

    CombatLogger.log(state, `${enemy.name} begins charging ${action.name}…`, 'ENEMY');

    // Notify listeners with a shallow-cloned state so React detects the change
    const clonedState: GameState = { ...state, combat: { ...state.combat } };
    this.eventBus?.emit('stateUpdated', clonedState);
  }

  /**
   * Called when UI dispatches ENEMY_ACTION_RESOLVE after delay
   */
  private resolveEnemyAction(state: GameState): void {
    Logger.debug(LogCategory.COMBAT, 'Resolving enemy charged action', LogContext.COMBAT_ACTION);
    const actionId = state.combat.enemyIntentions?.actionId;
    if (!actionId) {
      Logger.warn(LogCategory.COMBAT, 'No enemyIntentions to resolve', LogContext.COMBAT_ACTION);
      return;
    }

    const action = ENEMY_ACTIONS[actionId];
    if (!action) {
      Logger.error(LogCategory.COMBAT, `Enemy action definition not found for id ${actionId}`, LogContext.COMBAT_ACTION);
      // Clear just in case
      state.combat.enemyIntentions = null;
      return;
    }

    Logger.debug(LogCategory.COMBAT, `Applying enemy action: ${actionId}`, LogContext.COMBAT_ACTION);

    this.applyEnemyActionEffects(state, action);

    // Clear telegraph
    state.combat.enemyIntentions = null;

    // Emit cloned state to trigger React update
    const cloned: GameState = { ...state, combat: { ...state.combat } };
    this.eventBus?.emit('stateUpdated', cloned);
  }
} 
