import { GameState, BattleLogEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  ActionResult, 
  CombatActionDefinition,
  EnemyDefinition,
  EnemyType,
  RegionDefinition,
  RegionEnemyAction,
  ResourceCost,
  StatusEffectInstance,
  RegionType
} from '../types/combat';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { PLAYER_ACTIONS } from '@/app/game/content/combatActions';
import { REGION_DEFINITIONS } from '@/app/game/content/regions';

// Try multiple import strategies for ALL_ENEMIES_MAP
// First attempt: direct import from the specific file
import { ALL_ENEMIES_MAP as ENEMIES_MAP } from '../content/enemies/index'; // Use the map directly

// Create a fallback map in case the import fails - Removed fallback, relying on direct import
const ALL_ENEMIES_MAP: Record<string, EnemyDefinition> = ENEMIES_MAP;

// Log for debugging
console.log('ALL_ENEMIES_MAP loaded status:', ALL_ENEMIES_MAP ? 'Defined' : 'Undefined', 
            'Keys:', ALL_ENEMIES_MAP ? Object.keys(ALL_ENEMIES_MAP).length : 'N/A');

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
      regionId: RegionType,
      subRegionId?: string  // Add optional subRegion parameter
    }) => {
      this.startCombatEncounter(data.state, data.enemyId, data.regionId, data.subRegionId);
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
        completedRegions: [],
        regionProgress: {} // Added missing property
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
  startCombatEncounter(state: GameState, enemyId: string, regionId: RegionType, subRegionId?: string): void {
    Logger.info(
      LogCategory.COMBAT,
      `Starting combat with enemy ${enemyId} in region ${regionId}${subRegionId ? `, subregion ${subRegionId}` : ''}`,
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

    // If enemy has a subregion but none was provided in the call, use the enemy's subregion
    if (enemy.subRegion && !subRegionId) {
      subRegionId = enemy.subRegion;
      Logger.info(
        LogCategory.COMBAT,
        `No subregion provided, using enemy's subregion: ${subRegionId}`,
        LogContext.COMBAT
      );
    }
    
    // Log if enemy has a subregion and it matches the current combat subregion
    if (enemy.subRegion && subRegionId) {
      if (enemy.subRegion === subRegionId) {
        Logger.info(
          LogCategory.COMBAT,
          `Enemy ${enemy.name} (${enemyId}) is from the appropriate subregion: ${enemy.subRegion}`,
          LogContext.COMBAT
        );
      } else {
        Logger.warn(
          LogCategory.COMBAT,
          `Enemy ${enemy.name} (${enemyId}) is from subregion ${enemy.subRegion} but combat is in subregion ${subRegionId}`,
          LogContext.COMBAT
        );
      }
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
        currentSubRegion: null,
        enemyIntentions: null,
        rewards: {
          energy: 0,
          insight: 0,
          crew: 0,
          scrap: 0
        }
      };
    }

    // Set up combat with the selected enemy
    state.combat.active = true;
    state.combat.encounterCompleted = false;
    state.combat.turn = 1;
    state.combat.currentEnemy = enemyId;
    state.combat.currentRegion = regionId;
    state.combat.currentSubRegion = subRegionId || null; // Store the subregion
    
    // Add initial battle log entry with region and subregion information
    this.addBattleLog(state, {
      id: uuidv4(),
      text: `Combat initiated with ${enemy.name} in ${regionId}${subRegionId ? `, subregion ${subRegionId}` : ''}`,
      type: 'SYSTEM',
      timestamp: Date.now()
    });
    
    // If enemy is a boss, add a special log entry
    if (enemy.isBoss) {
      this.addBattleLog(state, {
        id: uuidv4(),
        text: `Warning: ${enemy.name} is a powerful boss enemy! Prepare for a challenging battle.`,
        type: 'SYSTEM',
        timestamp: Date.now()
      });
    }
    
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
   * Helper method to check if sufficient resources are available for a cost
   */
  private hasSufficientResources(state: GameState, cost: ResourceCost): boolean {
    let currentAmount: number | undefined;
    
    // Use switch to help TypeScript narrow types
    switch (cost.type) {
        case 'energy':
            currentAmount = state.categories.reactor?.resources?.energy;
            break;
        case 'insight':
            currentAmount = state.categories.processor?.resources?.insight;
            break;
        case 'crew':
            currentAmount = state.categories.crewQuarters?.resources?.crew;
            break;
        case 'scrap':
            currentAmount = state.categories.manufacturing?.resources?.scrap;
            break;
        default:
            Logger.warn(LogCategory.COMBAT, `Unknown resource type in cost check: ${cost.type}`, LogContext.COMBAT_ACTION);
            return false; // Cannot afford if resource type is unknown
    }
    
    if (currentAmount === undefined) {
         Logger.warn(LogCategory.COMBAT, `Resource ${cost.type} not found in state for cost check`, LogContext.COMBAT_ACTION);
        return false; // Cannot afford if resource doesn't exist in state
    }

    const hasEnough = currentAmount >= cost.amount;
    if (!hasEnough) {
        Logger.debug(LogCategory.COMBAT, `Insufficient ${cost.type}: Has ${currentAmount}, needs ${cost.amount}`, LogContext.COMBAT_ACTION);
    }
    return hasEnough;
  }

  /**
   * Process victory rewards
   */
  private processVictoryRewards(state: GameState): void {
    if (!state.combat.currentEnemy) return;
    
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy);
    if (!enemy || !enemy.loot) return;
    
    // Process rewards
    enemy.loot.forEach((reward: { type: string; amount: number; probability?: number }) => {
      // Check probability
      if (reward.probability && Math.random() > reward.probability) {
        return;
      }

      // Handle new global resources directly
      if (reward.type === 'combatComponents') {
        state.combatComponents += reward.amount;
        this.addBattleLog(state, {
          id: uuidv4(),
          timestamp: Date.now(),
          text: `Recovered ${reward.amount} Combat Components.`,
          type: 'SYSTEM'
        });
      } else if (reward.type === 'bossMatrix') {
        state.bossMatrix += reward.amount;
        this.addBattleLog(state, {
          id: uuidv4(),
          timestamp: Date.now(),
          text: `Recovered ${reward.amount} Boss Matrix!`,
          type: 'SYSTEM'
        });
      } else {
        // Handle existing resources via event bus (or potentially ResourceSystem.addResource if we refactor)
        this.eventBus.emit('resourceChange', {
            state: state, // Keep passing state if handler needs it
            resourceType: reward.type,
            amount: reward.amount, // Positive amount for reward
            source: 'combat-victory' 
        });
        
        // Add log entry (ensure consistency with event emission)
        this.addBattleLog(state, {
          id: uuidv4(),
          timestamp: Date.now(),
          text: `Recovered ${reward.amount} ${reward.type} from the encounter.`, // Log what was intended
          type: 'SYSTEM'
        });
      }
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

    // Check resource costs using helper function
    if (action.cost) {
      if (!this.hasSufficientResources(state, action.cost)) {
          // Message generation might need adjustment if currentAmount is needed
          // We could return the currentAmount from hasSufficientResources if required
          return {
              success: false,
              message: `Insufficient ${action.cost.type}: Requires ${action.cost.amount}.` // Simplified message
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
    
    // Get enemy definition using the new region-based system
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy);
    if (!enemy) return;
    
    // Get enemy actions directly from the enemy definition
    // The type should now be correct: RegionEnemyAction[]
    const availableActions = enemy.actions || [];
    
    if (availableActions.length === 0) return;
    
    // Select action based on probabilities
    const action = this.selectEnemyAction(state, availableActions);
    
    // Apply action effects
    let message = '';
    
    // Apply damage to player based on the target
    if (action.damage) {
      if (action.target === 'shield' && state.combat.playerStats.shield > 0) {
        // Damage goes to shield if target is shield and shield is available
        const shieldDamage = Math.min(state.combat.playerStats.shield, action.damage);
        state.combat.playerStats.shield -= shieldDamage;
        
        message = `${enemy.name} used ${action.name} dealing ${shieldDamage} damage to your shields!`;
      } else {
        // Damage goes to health
        let healthDamage = action.damage;
        
        // If target is shield but no shield available, or target is health directly
        if (state.combat.playerStats.shield > 0 && action.target !== 'health') {
          // Some shield available and not directly targeting health
          // Apply reduced damage to health
          healthDamage = Math.floor(healthDamage * 0.5); // 50% damage reduction
        }
        
        state.combat.playerStats.health -= healthDamage;
        
        message = `${enemy.name} used ${action.name} dealing ${healthDamage} damage to your hull!`;
      }
    }
    
    // Add to battle log
    this.addBattleLog(state, {
      id: uuidv4(),
      text: message,
      type: 'ENEMY',
      timestamp: Date.now()
    });
    
    // Check if player is defeated
    if (state.combat.playerStats.health <= 0) {
      this.endCombatEncounter(state, 'defeat');
    }
  }

  /**
   * Select an enemy action based on probabilities
   */
  private selectEnemyAction(state: GameState, availableActions: RegionEnemyAction[]): RegionEnemyAction {
    // If there's only one action, simply return it
    if (availableActions.length === 1) {
      return availableActions[0];
    }

    // Create a weighted probability array
    const totalProbability = availableActions.reduce((total, action) => 
      total + (action.probability || 0.5), 0);
    
    // Get a random number between 0 and totalProbability
    let random = Math.random() * totalProbability;
    
    // Select an action based on its weighted probability
    for (const action of availableActions) {
      random -= (action.probability || 0.5);
      if (random <= 0) {
        return action;
      }
    }
    
    // Default return the first action if something went wrong
    return availableActions[0];
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
    // Add the entry to the battle log
    state.combat.battleLog.push(entry);
    
    // We no longer need this since we're adding region/subregion info directly in startCombatEncounter
    // This removes the redundant subregion log entry
    
    // Limit battle log size to prevent it from growing too large
    if (state.combat.battleLog.length > 50) {
      state.combat.battleLog = state.combat.battleLog.slice(-50);
    }
  }

  /**
   * Get enemy definition by ID using the central map
   */
  private getEnemyDefinition(enemyId: string): EnemyDefinition | undefined {
    // Log for debugging
    console.log('Getting enemy definition for:', enemyId);
    console.log('ALL_ENEMIES_MAP status:', ALL_ENEMIES_MAP ? 'Defined' : 'Undefined', 
                'Keys:', ALL_ENEMIES_MAP ? Object.keys(ALL_ENEMIES_MAP).length : 'N/A');
    
    // Attempt using the imported map directly
    if (ALL_ENEMIES_MAP && ALL_ENEMIES_MAP[enemyId]) {
      return ALL_ENEMIES_MAP[enemyId];
    }
    
    // Fallback: Check if the ID exists as a key in the map anyway (might handle dynamic loading issues)
    if (ALL_ENEMIES_MAP && Object.keys(ALL_ENEMIES_MAP).includes(enemyId)) {
        console.warn(`Enemy ID ${enemyId} found in keys but not directly accessible, returning map entry.`);
        return ALL_ENEMIES_MAP[enemyId];
    }

    // Log the failure
    Logger.warn(
        LogCategory.COMBAT,
        `Enemy definition not found for ID: ${enemyId}. Available keys in map: ${ALL_ENEMIES_MAP ? Object.keys(ALL_ENEMIES_MAP).join(', ') : 'none'}`,
        LogContext.COMBAT
    );
    
    return undefined;
  }

  /**
   * Get region definition by ID
   */
  private getRegionDefinition(regionId: RegionType): RegionDefinition | undefined {
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
    const totalWeight = possibleEnemies.reduce((sum: number, entry: { weight: number }) => sum + entry.weight, 0);
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
    if (!state.combat) {
      Logger.error(LogCategory.COMBAT, `Combat state is undefined in retreatFromCombat`, LogContext.COMBAT);
      return state;
    }
    if (!state.combat.active) {
      Logger.warn(LogCategory.COMBAT, `Attempted to retreat from inactive combat`, LogContext.COMBAT);
      return state;
    }
    
    Logger.info(LogCategory.COMBAT, `Player retreating from combat with ${state.combat.currentEnemy}`, LogContext.COMBAT);
    
    const retreatPenalty = 0.25;
    const resourcesToPenalize = ['energy', 'insight', 'crew', 'scrap'];

    resourcesToPenalize.forEach(resourceType => {
        let currentAmount: number | undefined;
        let penaltyAmount = 0;

        // Use switch for type safety
        switch (resourceType) {
            case 'energy':
                currentAmount = state.categories.reactor?.resources?.energy;
                if (currentAmount !== undefined) {
                    penaltyAmount = Math.floor(currentAmount * retreatPenalty);
                }
                break;
            case 'insight':
                currentAmount = state.categories.processor?.resources?.insight;
                 if (currentAmount !== undefined) {
                    penaltyAmount = Math.floor(currentAmount * retreatPenalty);
                }
                break;
            case 'crew':
                currentAmount = state.categories.crewQuarters?.resources?.crew;
                 if (currentAmount !== undefined) {
                    penaltyAmount = Math.floor(currentAmount * retreatPenalty);
                }
                break;
            case 'scrap':
                currentAmount = state.categories.manufacturing?.resources?.scrap;
                 if (currentAmount !== undefined) {
                    penaltyAmount = Math.floor(currentAmount * retreatPenalty);
                }
                break;
            default:
                // Should not happen with defined array, but good practice
                Logger.warn(LogCategory.COMBAT, `Unknown resource type in retreat penalty: ${resourceType}`, LogContext.COMBAT);
                return; // Use return instead of continue
        }

        if (currentAmount === undefined) {
            Logger.warn(LogCategory.COMBAT, `Resource ${resourceType} not found in state for retreat penalty`, LogContext.COMBAT);
            return; // Use return instead of continue
        }
            
        if (penaltyAmount > 0) {
            // Emit event with negative amount for penalty
            this.eventBus.emit('resourceChange', {
                state: state, 
                resourceType: resourceType,
                amount: -penaltyAmount,
                source: 'combat-retreat'
            });
            Logger.debug(LogCategory.RESOURCES, `Applied retreat penalty to ${resourceType}: -${penaltyAmount}`, LogContext.COMBAT);
        }
    });
    
    // Update the combat state to reflect the retreat
    state.combat.active = false;
    state.combat.encounterCompleted = true;
    state.combat.outcome = 'retreat';
    
    this.addBattleLog(state, {
      id: uuidv4(),
      text: 'You retreated from combat, losing 25% of your resources in the hasty escape.',
      type: 'SYSTEM',
      timestamp: Date.now()
    });
    
    // If there's an active encounter, mark it as completed (This logic might belong elsewhere, e.g., in ActionSystem)
    if (state.encounters.active && state.encounters.encounter) {
      // ... add to encounter history ...
      // Clear the active encounter
      state.encounters.active = false;
      state.encounters.encounter = undefined;
    }
    
    return state;
  }
} 