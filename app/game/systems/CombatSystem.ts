import { GameState, RegionType, BattleLogEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  ActionResult, 
  CombatActionDefinition,
  EnemyActionCondition,
  EnemyActionDefinition,
  EnemyDefinition,
  RegionDefinition,
  ResourceCost,
  StatusEffectInstance
} from '../types/combat';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { ENEMY_ACTIONS, PLAYER_ACTIONS } from '@/app/game/content/combatActions';
import { ENEMY_DEFINITIONS } from '@/app/game/content/enemies';
import { REGION_DEFINITIONS } from '@/app/game/content/regions';
import { EventBus } from '../core/EventBus';

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
  private eventBus: EventBus;

  /**
   * Constructor now takes EventBus instead of using setResourceSystem
   */
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for combat-related events
   */
  private setupEventListeners() {
    // Listen for combatEncounterTriggered events from EncounterSystem
    this.eventBus.on('combatEncounterTriggered', (data: { 
      state: GameState, 
      enemyId: string, 
      regionId: RegionType 
    }) => {
      this.startCombatEncounter(data.state, data.enemyId, data.regionId);
    });

    // Add more event listeners as needed
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
          shield: 50,
          maxShield: 50,
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
        }
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
    
    // Keep player stats as they are (they persist between encounters)
    // But reset status effects
    state.combat.playerStats.statusEffects = [];
    
    // Add all available player actions
    state.combat.availableActions = Object.keys(PLAYER_ACTIONS);
    
    // Reset cooldowns
    state.combat.cooldowns = {};
    
    // Add initial battle log entry
    this.addBattleLog(state, {
      id: uuidv4(),
      timestamp: Date.now(),
      text: `Encounter with ${enemy.name} initiated.`,
      type: 'SYSTEM'
    });
    
    this.addBattleLog(state, {
      id: uuidv4(),
      timestamp: Date.now(),
      text: `${enemy.description}`,
      type: 'ANALYSIS'
    });
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

    this.addBattleLog(state, {
      id: uuidv4(),
      timestamp: Date.now(),
      text: message,
      type: 'SYSTEM'
    });
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
      const resourceCategory = this.getResourceCategory(reward.type);
      if (resourceCategory) {
        // Handle each resource type explicitly
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
      
      // Add log entry
      this.addBattleLog(state, {
        id: uuidv4(),
        timestamp: Date.now(),
        text: `Recovered ${reward.amount} ${reward.type} from the encounter.`,
        type: 'SYSTEM'
      });
    });
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
    if (action.cost) {
      // Check resources directly from state using the correct structure
      if (action.cost.type === 'energy' && state.categories.reactor.resources.energy < action.cost.amount) {
        return {
          success: false,
          message: `Insufficient resources: ${action.cost.amount} ${action.cost.type}.`
        };
      } else if (action.cost.type === 'insight' && state.categories.processor.resources.insight < action.cost.amount) {
        return {
          success: false,
          message: `Insufficient resources: ${action.cost.amount} ${action.cost.type}.`
        };
      } else if (action.cost.type === 'crew' && state.categories.crewQuarters.resources.crew < action.cost.amount) {
        return {
          success: false,
          message: `Insufficient resources: ${action.cost.amount} ${action.cost.type}.`
        };
      } else if (action.cost.type === 'scrap' && state.categories.manufacturing.resources.scrap < action.cost.amount) {
        return {
          success: false,
          message: `Insufficient resources: ${action.cost.amount} ${action.cost.type}.`
        };
      }
    }

    // Apply resource costs by emitting an event
    if (action.cost) {
      this.eventBus.emit('resourceChange', {
        state,
        resourceType: action.cost.type,
        amount: -action.cost.amount,
        source: 'combat-action'
      });
    }

    // Set cooldown if applicable
    if (action.cooldown) {
      state.combat.cooldowns[actionId] = action.cooldown;
    }

    // Process action effects
    const result = this.applyActionEffects(state, action);
    
    // Add battle log entry
    this.addBattleLog(state, {
      id: uuidv4(),
      timestamp: Date.now(),
      text: result.message,
      type: 'PLAYER'
    });

    // Store last action result
    state.combat.lastActionResult = result;

    // Check if enemy is defeated
    if (state.combat.enemyStats.health <= 0) {
      this.endCombatEncounter(state, 'victory');
      return result;
    }

    // If not, let enemy counter-attack
    this.performEnemyAction(state);

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

    return result;
  }

  /**
   * Let enemy perform an action
   */
  private performEnemyAction(state: GameState): void {
    if (!state.combat.currentEnemy) return;
    
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy);
    if (!enemy) return;
    
    // Get enemy action definitions
    const availableActions = enemy.actions
      .map(actionId => ENEMY_ACTIONS[actionId])
      .filter(action => !!action);
    
    if (availableActions.length === 0) return;
    
    // Select action based on enemy health/shield conditions
    const action = this.selectEnemyAction(state, availableActions);
    
    // Apply action effects
    let message = '';
    
    // Apply damage to player
    if (action.damage) {
      if (state.combat.playerStats.shield > 0) {
        // Damage goes to shield first
        const shieldDamage = Math.min(state.combat.playerStats.shield, action.damage);
        state.combat.playerStats.shield -= shieldDamage;
        
        // Remaining damage goes to health
        const remainingDamage = action.damage - shieldDamage;
        if (remainingDamage > 0) {
          state.combat.playerStats.health -= remainingDamage;
          message = `${enemy.name} used ${action.name}, damaging shields for ${shieldDamage} and hull for ${remainingDamage}`;
        } else {
          message = `${enemy.name} used ${action.name}, damaging shields for ${shieldDamage}`;
        }
      } else {
        // All damage goes to health
        state.combat.playerStats.health -= action.damage;
        message = `${enemy.name} used ${action.name}, damaging hull for ${action.damage}`;
      }
    }
    
    // Apply shield damage specifically
    if (action.shieldDamage && state.combat.playerStats.shield > 0) {
      const actualDamage = Math.min(state.combat.playerStats.shield, action.shieldDamage);
      state.combat.playerStats.shield -= actualDamage;
      message = `${enemy.name} used ${action.name}, damaging shields for ${actualDamage}`;
    }
    
    // Apply status effects
    if (action.statusEffect) {
      state.combat.playerStats.statusEffects.push({
        ...action.statusEffect,
        remainingTurns: action.statusEffect.duration
      });
      
      message = message || `${enemy.name} used ${action.name}`;
      message += `, applying ${action.statusEffect.type} effect`;
    }
    
    // If no specific effects, provide generic message
    if (!message) {
      message = `${enemy.name} used ${action.name}`;
    }
    
    // Add to battle log
    this.addBattleLog(state, {
      id: uuidv4(),
      timestamp: Date.now(),
      text: message,
      type: 'ENEMY'
    });
  }

  /**
   * Select an enemy action based on current combat state
   */
  private selectEnemyAction(state: GameState, availableActions: EnemyActionDefinition[]): EnemyActionDefinition {
    // Filter actions by condition
    const validActions = availableActions.filter(action => {
      return this.checkEnemyActionCondition(state, action.useCondition);
    });
    
    // If no valid actions, pick randomly from all
    if (validActions.length === 0) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }
    
    // Pick randomly from valid actions
    const randomIndex = Math.floor(Math.random() * validActions.length);
    return validActions[randomIndex];
  }

  /**
   * Check if enemy action condition is met
   */
  private checkEnemyActionCondition(state: GameState, condition: EnemyActionCondition): boolean {
    const enemyStats = state.combat.enemyStats;
    
    switch (condition.type) {
      case 'HEALTH_THRESHOLD':
        // Use action if health is below threshold (percentage)
        if (!condition.threshold) return false;
        const healthPercentage = enemyStats.health / enemyStats.maxHealth;
        return healthPercentage <= condition.threshold;
        
      case 'SHIELD_THRESHOLD':
        // Use action if shield is below threshold (percentage)
        if (!condition.threshold) return false;
        if (enemyStats.maxShield === 0) return false;
        const shieldPercentage = enemyStats.shield / enemyStats.maxShield;
        return shieldPercentage <= condition.threshold;
        
      case 'ALWAYS':
        // Always use this action if available
        return true;
        
      case 'RANDOM':
        // Use action based on random probability
        if (!condition.probability) return false;
        return Math.random() <= condition.probability;
        
      default:
        return false;
    }
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
      
      if (state.combat.enemyStats.shield > 0) {
        // Damage goes to shield first
        const shieldDamage = Math.min(state.combat.enemyStats.shield, actualDamage);
        state.combat.enemyStats.shield -= shieldDamage;
        
        // Remaining damage goes to health
        const remainingDamage = actualDamage - shieldDamage;
        if (remainingDamage > 0) {
          state.combat.enemyStats.health -= remainingDamage;
          result.message = `${action.name} damaged enemy shields for ${shieldDamage} and hull for ${remainingDamage}`;
        } else {
          result.message = `${action.name} damaged enemy shields for ${shieldDamage}`;
        }
        
        result.shieldDamage = shieldDamage;
        result.damageDealt = remainingDamage > 0 ? remainingDamage : 0;
      } else {
        // All damage goes to health
        state.combat.enemyStats.health -= actualDamage;
        result.message = `${action.name} damaged enemy hull for ${actualDamage}`;
        result.damageDealt = actualDamage;
      }
    }
    
    // Apply shields
    if (action.shieldRepair) {
      const repairAmount = Math.min(
        action.shieldRepair,
        state.combat.playerStats.maxShield - state.combat.playerStats.shield
      );
      
      state.combat.playerStats.shield += repairAmount;
      result.message = `${action.name} restored ${repairAmount} shields`;
      result.shieldRepaired = repairAmount;
    }
    
    // Apply hull repair
    if (action.hullRepair) {
      const repairAmount = Math.min(
        action.hullRepair,
        state.combat.playerStats.maxHealth - state.combat.playerStats.health
      );
      
      state.combat.playerStats.health += repairAmount;
      result.message = `${action.name} repaired ${repairAmount} hull integrity`;
      result.healthRepaired = repairAmount;
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
    // Process player status effects
    state.combat.playerStats.statusEffects = state.combat.playerStats.statusEffects
      .map(effect => {
        return {
          ...effect,
          remainingTurns: effect.remainingTurns - 1
        };
      })
      .filter(effect => effect.remainingTurns > 0);
    
    // Process enemy status effects
    state.combat.enemyStats.statusEffects = state.combat.enemyStats.statusEffects
      .map(effect => {
        return {
          ...effect,
          remainingTurns: effect.remainingTurns - 1
        };
      })
      .filter(effect => effect.remainingTurns > 0);
  }

  /**
   * Add entry to battle log
   */
  private addBattleLog(state: GameState, entry: BattleLogEntry): void {
    state.combat.battleLog.push(entry);
    
    // Keep log size manageable (max 50 entries)
    if (state.combat.battleLog.length > 50) {
      state.combat.battleLog = state.combat.battleLog.slice(-50);
    }
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
    this.addBattleLog(state, {
      id: uuidv4(),
      timestamp: Date.now(),
      text: `Retreat initiated. Preparing emergency jump.`,
      type: 'PLAYER'
    });
    
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
} 