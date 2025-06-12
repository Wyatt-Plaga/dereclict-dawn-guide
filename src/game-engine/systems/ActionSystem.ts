import { GameState, RegionType } from '../types';
import { GameAction, GameActions, GameCategory } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";
import { CrewQuartersConstants } from '../config/gameConstants';

/**
 * ActionSystem
 * 
 * Processes user actions and updates the game state accordingly.
 * Think of this as the customer service department that handles requests.
 */
export class ActionSystem {
  private eventBus?: EventBus<EventMap>;

  private actionHandlers: Record<string, (state: GameState, action: GameAction) => GameState>;

  constructor(eventBus?: EventBus<EventMap>) {
    this.eventBus = eventBus;

    // Initialise handler map
    this.actionHandlers = {
      RESOURCE_CLICK: (s, a) => this.handleResourceClick(s, a),
      CLICK_RESOURCE: (s, a) => this.handleResourceClick(s, a),
      PURCHASE_UPGRADE: (s, a) =>
        this.handleUpgradePurchase(s, a.payload.category, a.payload.upgradeType),
      MARK_LOG_READ: (s, a) => this.handleMarkLogRead(s, a.payload.logId),
      MARK_ALL_LOGS_READ: (s) => this.handleMarkAllLogsRead(s),
      SELECT_REGION: (s, a) => this.handleSelectRegion(s, a.payload.regionId),
      INITIATE_JUMP: (s) => this.handleInitiateJump(s),
      COMPLETE_ENCOUNTER: (s, a) => this.handleCompleteEncounter(s, a),
      STORY_CHOICE: (s, a) => this.handleStoryChoice(s, a),
      COMBAT_ACTION: (s, a) => this.handleCombatAction(s, a),
      RETREAT_FROM_BATTLE: (s) => this.handleRetreatFromBattle(s),
      ENEMY_ACTION_RESOLVE: (s) => this.handleEnemyActionResolve(s)
    };
  }

  /**
   * Process an action and update the game state
   */
  processAction(state: GameState, action: GameAction): GameState {
    Logger.trace(
      LogCategory.ACTIONS,
      `Processing action: ${action.type}`,
      LogContext.NONE
    );

    const handler = this.actionHandlers[action.type];

    if (!handler) {
      Logger.warn(
        LogCategory.ACTIONS,
        `Unknown action type: ${action.type}`,
        LogContext.NONE
      );
      return state;
    }

    // Work on a shallow copy of state for safety
    const newState = { ...state };
    return handler(newState, action);
  }
  
  /**
   * Handle resource click actions
   */
  private handleResourceClick(state: GameState, action: GameAction): GameState {
    const category = action.payload?.category;
    
    if (!category) {
      Logger.warn(
        LogCategory.ACTIONS,
        'No category specified for resource click',
        LogContext.NONE
      );
      return state;
    }
    
    Logger.debug(
      LogCategory.ACTIONS,
      `Processing resource click for ${category}`,
      LogContext.NONE
    );
    
    // Create a shallow copy of the state to modify
    const newState = { ...state };

    // Map category keys to their respective handlers
    const categoryHandlers: Record<string, (s: GameState) => GameState> = {
      reactor: (s) => this.handleReactorClick(s),
      processor: (s) => this.handleProcessorClick(s),
      manufacturing: (s) => this.handleManufacturingClick(s),
      crewQuarters: (s) => this.handleCrewQuartersClick(s)
    };

    const handler = categoryHandlers[category];

    if (!handler) {
      Logger.warn(
        LogCategory.ACTIONS,
        `Unknown resource category: ${category}`,
        LogContext.NONE
      );
      return state;
    }

    return handler(newState);
  }
  
  /**
   * Handle reactor energy click
   */
  private handleReactorClick(state: GameState): GameState {
    const reactor = state.categories.reactor;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Reactor click - Before: ${reactor.resources.energy}/${reactor.stats.energyCapacity}`,
      LogContext.REACTOR_LIFECYCLE
    );
    
    // Add 1 energy (up to capacity)
    if (reactor.resources.energy < reactor.stats.energyCapacity) {
      reactor.resources.energy = Math.min(
        reactor.resources.energy + 1,
        reactor.stats.energyCapacity
      );
      Logger.debug(
        LogCategory.RESOURCES, 
        `Reactor click - After update: ${reactor.resources.energy}`,
        LogContext.REACTOR_LIFECYCLE
      );
      Logger.trace(
        LogCategory.STATE, 
        `State modified directly: energy=${state.categories.reactor.resources.energy}`,
        LogContext.REACTOR_LIFECYCLE
      );
    } else {
      Logger.info(
        LogCategory.RESOURCES, 
        `Reactor already at capacity (${reactor.stats.energyCapacity})`,
        LogContext.REACTOR_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle processor insight click
   */
  private handleProcessorClick(state: GameState): GameState {
    const processor = state.categories.processor;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Processor click - Before: ${processor.resources.insight}/${processor.stats.insightCapacity}`,
      LogContext.PROCESSOR_LIFECYCLE
    );
    
    // Add 0.5 insight (up to capacity)
    if (processor.resources.insight < processor.stats.insightCapacity) {
      processor.resources.insight = Math.min(
        processor.resources.insight + processor.stats.insightPerClick,
        processor.stats.insightCapacity
      );
      
      Logger.debug(
        LogCategory.RESOURCES, 
        `Processor click - After update: ${processor.resources.insight}`,
        LogContext.PROCESSOR_LIFECYCLE
      );
    } else {
      Logger.info(
        LogCategory.RESOURCES, 
        `Processor already at capacity (${processor.stats.insightCapacity})`,
        LogContext.PROCESSOR_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle manufacturing scrap click
   */
  private handleManufacturingClick(state: GameState): GameState {
    const manufacturing = state.categories.manufacturing;
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Manufacturing click - Before: ${manufacturing.resources.scrap}/${manufacturing.stats.scrapCapacity}`,
      LogContext.MANUFACTURING_LIFECYCLE
    );
    
    // Add 1 scrap (up to capacity)
    if (manufacturing.resources.scrap < manufacturing.stats.scrapCapacity) {
      manufacturing.resources.scrap = Math.min(
        manufacturing.resources.scrap + 1,
        manufacturing.stats.scrapCapacity
      );
      
      Logger.debug(
        LogCategory.RESOURCES, 
        `Manufacturing click - After update: ${manufacturing.resources.scrap}`,
        LogContext.MANUFACTURING_LIFECYCLE
      );
    } else {
      Logger.info(
        LogCategory.RESOURCES, 
        `Manufacturing already at capacity (${manufacturing.stats.scrapCapacity})`,
        LogContext.MANUFACTURING_LIFECYCLE
      );
    }
    return state;
  }
  
  /**
   * Handle upgrade purchases
   * Uses the UpgradeSystem to process the purchase
   */
  private handleUpgradePurchase(
    state: GameState, 
    category: GameCategory, 
    upgradeType: string
  ): GameState {
    Logger.debug(
      LogCategory.UPGRADES, 
      `Attempting purchase: ${category} - ${upgradeType}`,
      LogContext.UPGRADE_PURCHASE
    );
    
    // Prefer event-driven flow
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', { state, category, upgradeType });
      return state; // state will be mutated by UpgradeSystem listener
    }

    Logger.error(
      LogCategory.ACTIONS,
      'EventBus unavailable for PURCHASE_UPGRADE; action ignored',
      LogContext.UPGRADE_PURCHASE
    );
    return state;
  }

  /**
   * Mark a log as read
   */
  private handleMarkLogRead(state: GameState, logId: string): GameState {
    if (this.eventBus) {
      this.eventBus.emit('MARK_LOG_READ', { state, logId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for MARK_LOG_READ', LogContext.LOG_INTERACTION);
    return state;
  }

  /**
   * Mark all logs as read
   */
  private handleMarkAllLogsRead(state: GameState): GameState {
    if (this.eventBus) {
      this.eventBus.emit('MARK_ALL_LOGS_READ', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for MARK_ALL_LOGS_READ', LogContext.LOG_INTERACTION);
    return state;
  }

  /**
   * Handle initiating a jump to start an encounter
   */
  private handleInitiateJump(state: GameState): GameState {
    Logger.info(LogCategory.ACTIONS, 'Initiating jump sequence', LogContext.NONE);
    if (this.eventBus) {
      this.eventBus.emit('INITIATE_JUMP', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for INITIATE_JUMP', LogContext.NONE);
    return state;
  }
  
  /**
   * Handle completing an encounter
   */
  private handleCompleteEncounter(state: GameState, action: any): GameState {
    Logger.info(LogCategory.ACTIONS, 'Completing encounter', LogContext.NONE);
    if (this.eventBus) {
      this.eventBus.emit('COMPLETE_ENCOUNTER', { state, choiceId: action.payload?.choiceId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for COMPLETE_ENCOUNTER', LogContext.NONE);
    return state;
  }
  
  /**
   * Handle selecting a region to navigate to
   */
  private handleSelectRegion(state: GameState, region: RegionType): GameState {
    Logger.info(
      LogCategory.ACTIONS,
      `Navigating to ${region} region`,
      LogContext.NONE
    );
    
    return {
      ...state,
      navigation: {
        ...state.navigation,
        currentRegion: region
      }
    };
  }

  /**
   * Handle a player's choice in a story encounter
   */
  private handleStoryChoice(state: GameState, action: any): GameState {
    Logger.debug(
      LogCategory.ACTIONS,
      `Making story choice: ${action.payload?.choiceId}`,
      LogContext.NONE
    );
    
    if (!action.payload?.choiceId) {
      Logger.error(
        LogCategory.ACTIONS,
        'No choice ID provided for story choice action',
        LogContext.NONE
      );
      return state;
    }
    
    if (this.eventBus) {
      this.eventBus.emit('COMPLETE_ENCOUNTER', { state, choiceId: action.payload.choiceId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for STORY_CHOICE', LogContext.NONE);
    return state;
  }

  /**
   * Handle combat actions
   */
  private handleCombatAction(state: GameState, action: any): GameState {
    if (this.eventBus) {
      const actionId = action.payload?.actionId;
      if (!actionId) {
        Logger.error(LogCategory.COMBAT, 'No action ID for COMBAT_ACTION', LogContext.COMBAT_ACTION);
        return state;
      }
      this.eventBus.emit('COMBAT_ACTION', { state, actionId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for COMBAT_ACTION', LogContext.COMBAT_ACTION);
    return state;
  }

  /**
   * Handle retreat from battle
   */
  private handleRetreatFromBattle(state: GameState): GameState {
    if (this.eventBus) {
      Logger.info(LogCategory.COMBAT, 'Retreating from battle', LogContext.NONE);
      this.eventBus.emit('RETREAT_FROM_BATTLE', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for RETREAT_FROM_BATTLE', LogContext.NONE);
    return state;
  }

  /**
   * Resolve the enemy's charged action after UI delay
   */
  private handleEnemyActionResolve(state: GameState): GameState {
    if (this.eventBus) {
      Logger.info(LogCategory.ACTIONS, 'Dispatching ENEMY_ACTION_RESOLVE to EventBus', LogContext.COMBAT_ACTION);
      this.eventBus.emit('ENEMY_ACTION_RESOLVE', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for ENEMY_ACTION_RESOLVE', LogContext.NONE);
    return state;
  }

  /**
   * Handle crew quarters click (awakening progress)
   */
  private handleCrewQuartersClick(state: GameState): GameState {
    const crewQuarters = state.categories.crewQuarters;

    Logger.debug(
      LogCategory.RESOURCES,
      `Crew quarters click - Awakening progress before: ${crewQuarters.stats.awakeningProgress}`,
      LogContext.CREW_LIFECYCLE
    );

    // Increment awakening progress
    crewQuarters.stats.awakeningProgress += CrewQuartersConstants.CREW_PER_CLICK;

    // When threshold reached, awaken a crew member
    if (
      crewQuarters.stats.awakeningProgress >= CrewQuartersConstants.AWAKENING_THRESHOLD &&
      crewQuarters.resources.crew < crewQuarters.stats.crewCapacity
    ) {
      crewQuarters.resources.crew += 1;
      crewQuarters.stats.awakeningProgress -= CrewQuartersConstants.AWAKENING_THRESHOLD;

      Logger.info(
        LogCategory.RESOURCES,
        `Crew member awakened! Current crew: ${crewQuarters.resources.crew}`,
        LogContext.CREW_LIFECYCLE
      );
    }

    // Cap progress at threshold value
    crewQuarters.stats.awakeningProgress = Math.min(
      crewQuarters.stats.awakeningProgress,
      CrewQuartersConstants.AWAKENING_THRESHOLD
    );

    return state;
  }
} 
