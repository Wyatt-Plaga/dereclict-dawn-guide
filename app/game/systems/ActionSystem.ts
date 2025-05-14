import { GameState, RegionType } from '../types';
import { GameAction, GameActions, GameCategory, MakeStoryChoiceAction, ToggleProductionAction, SelectRegionAction, CombatAction, RetreatFromBattleAction, AdjustAutomationAction } from '../types/actions';
import { GameSystemManager } from './index';
import { UpgradeSystem } from './UpgradeSystem';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EncounterSystem } from './EncounterSystem';
import { v4 as uuidv4 } from 'uuid';
import { ReactorConstants, ProcessorConstants, CrewQuartersConstants, ManufacturingConstants, AutomationConstants } from '../config/gameConstants';
import { ResourceSystem } from './ResourceSystem';
import { EventBus } from 'core/EventBus';
import { GameEventMap } from 'core/events';

/**
 * ActionSystem
 * 
 * Processes user actions and updates the game state accordingly.
 * Think of this as the customer service department that handles requests.
 */
export class ActionSystem {
  /**
   * Reference to the GameSystemManager
   * This will be set when the ActionSystem is created by the GameSystemManager
   */
  private manager: GameSystemManager | null = null;

  constructor(private bus: EventBus<GameEventMap>) {}

  /**
   * Set the GameSystemManager reference
   */
  setManager(manager: GameSystemManager): void {
    this.manager = manager;
    Logger.debug(LogCategory.ACTIONS, "ActionSystem manager set", LogContext.STARTUP);
  }

  /**
   * Process an action and update the game state
   */
  processAction(state: GameState, action: GameActions): GameState {
    // Log action arrival
    console.log(`[ActionSystem] Received action: ${action.type}`, action.payload);

    Logger.trace(
      LogCategory.ACTIONS, 
      `Processing action: ${action.type}`,
      LogContext.NONE
    );
    
    // Process the action based on its type - directly mutate the state
    switch (action.type) {
      case 'CLICK_RESOURCE':
        this.bus.emit('resourceClick', { state, category: (action as GameAction).payload?.category });
        break;

      case 'PURCHASE_UPGRADE':
        this.handleUpgradePurchase(
          state, 
          action.payload.category, 
          action.payload.upgradeType
        );
        break;

      case 'MARK_LOG_READ':
        this.handleMarkLogRead(state, action.payload.logId);
        break;

      case 'MARK_ALL_LOGS_READ':
        this.handleMarkAllLogsRead(state);
        break;

      case 'SELECT_REGION': 
        this.handleSelectRegion(state, action as SelectRegionAction);
        break;
        
      case 'INITIATE_JUMP':
        this.handleInitiateJump(state);
        break;
        
      case 'COMPLETE_ENCOUNTER':
        this.handleCompleteEncounter(state, action);
        break;
        
      case 'MAKE_STORY_CHOICE':
        this.handleStoryChoice(state, action as MakeStoryChoiceAction);
        break;
        
      case 'COMBAT_ACTION':
        this.handleCombatAction(state, action as CombatAction);
        break;
        
      case 'RETREAT_FROM_BATTLE':
        this.handleRetreatFromBattle(state);
        break;

      case 'ADJUST_AUTOMATION':
        this.handleAdjustAutomation(state, action as AdjustAutomationAction);
        break;
        
      default:
        // This check helps ensure all action types are handled
        const _exhaustiveCheck: never = action;
        Logger.warn(LogCategory.ACTIONS, `Unhandled action type: ${(_exhaustiveCheck as GameAction).type}`, LogContext.NONE);
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
    
    // Use the UpgradeSystem from the manager if available
    let upgradeSystem: UpgradeSystem;
    
    if (this.manager) {
      upgradeSystem = this.manager.upgrade;
    } else {
      // Fallback to a new instance if manager is not set
      Logger.warn(
        LogCategory.ACTIONS, 
        'GameSystemManager not set in ActionSystem, creating temporary UpgradeSystem',
        LogContext.UPGRADE_PURCHASE
      );
      upgradeSystem = new UpgradeSystem();
    }
    
    // Attempt to purchase the upgrade
    const success = upgradeSystem.purchaseUpgrade(state, category, upgradeType);
    
    if (success) {
      Logger.info(
        LogCategory.UPGRADES, 
        `Successfully purchased ${upgradeType} for ${category}`,
        LogContext.UPGRADE_PURCHASE
      );
    } else {
      // Log the fallback case
      if (!this.manager) {
        console.error("[ActionSystem] FATAL: Manager was null during upgrade purchase! Using temporary UpgradeSystem.");
      }
      Logger.warn(
        LogCategory.UPGRADES, 
        `Failed to purchase ${upgradeType} for ${category} - insufficient resources`,
        LogContext.UPGRADE_PURCHASE
      );
    }

    // Trigger stats update after changing active level
    // Log the manager status BEFORE the check
    console.log(`[ActionSystem] Checking manager before updateAllStats:`, this.manager ? 'Manager exists' : 'Manager is NULL');
    if (this.manager) {
        this.manager.upgrade.updateAllStats(state);
    } else {
        console.error("[ActionSystem] FATAL: Manager was null during automation adjustment! Cannot call updateAllStats.");
    }

    return state;
  }

  /**
   * Mark a log as read
   */
  private handleMarkLogRead(state: GameState, logId: string): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot mark log read: ActionSystem manager not set",
        LogContext.LOG_INTERACTION
      );
      return state;
    }

    // Use the log system to mark the log as read
    return this.manager.log.markLogRead(state, logId);
  }

  /**
   * Mark all logs as read
   */
  private handleMarkAllLogsRead(state: GameState): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot mark all logs read: ActionSystem manager not set",
        LogContext.LOG_INTERACTION
      );
      return state;
    }

    // Use the log system to mark all logs as read
    return this.manager.log.markAllLogsRead(state);
  }

  /**
   * Handle initiating a jump to start an encounter
   */
  private handleInitiateJump(state: GameState): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        "Cannot initiate jump: ActionSystem manager not set",
        LogContext.NONE
      );
      return state;
    }

    Logger.info(
      LogCategory.ACTIONS,
      'Initiating jump sequence',
      LogContext.NONE
    );
    
    // Generate an encounter based on the current region
    const encounter = this.manager.encounter.generateEncounter(state);
    
    // Update the game state directly
    state.encounters.active = true;
    state.encounters.encounter = encounter;
    
    return state;
  }
  
  /**
   * Handle completing an encounter
   */
  private handleCompleteEncounter(state: GameState, action: any): GameState {
    if (!this.manager) {
      Logger.error(
        LogCategory.ACTIONS,
        'Game system manager not set',
        LogContext.NONE
      );
      return state;
    }

    Logger.info(
      LogCategory.ACTIONS,
      'Completing encounter',
      LogContext.NONE
    );
    
    // Use the encounter system to process the encounter
    const encounterSystem = this.manager.encounter;
    return encounterSystem.completeEncounter(state, action.payload?.choiceId);
  }
  
  /**
   * Handle region selection
   */
  private handleSelectRegion(state: GameState, action: SelectRegionAction): void {
    // Ensure payload and region exist
    if (!action.payload || !action.payload.region) {
      Logger.warn(LogCategory.ACTIONS, `Invalid payload for SELECT_REGION action`, LogContext.NONE);
      return;
    }
    
    const selectedRegionId = action.payload.region; // Use action.payload.region

    // Validate region ID (this assumes RegionType includes all valid IDs)
    const validRegions = Object.values(RegionType) as string[];
    if (!validRegions.includes(selectedRegionId)) {
      Logger.warn(LogCategory.ACTIONS, `Invalid region selected: ${selectedRegionId}`, LogContext.NONE);
      return;
    }

    // Ensure navigation state exists
    if (!state.navigation) {
      state.navigation = {
        currentRegion: selectedRegionId as RegionType,
        completedRegions: [],
        regionProgress: {}
      };
    } else {
      // Update the current region
      state.navigation.currentRegion = selectedRegionId as RegionType;
    }
    
    // Reset subregion when changing main regions
    state.navigation.currentSubRegion = undefined;

    Logger.info(LogCategory.ACTIONS, `Selected region set to ${selectedRegionId}`, LogContext.NONE);
  }

  // -------------------------------------------------------------------------
  // Temporary no-op stubs – these actions will migrate to dedicated systems
  // -------------------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleStoryChoice(state: GameState, action: MakeStoryChoiceAction) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleCombatAction(state: GameState, action: CombatAction) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleRetreatFromBattle(state: GameState) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleAdjustAutomation(state: GameState, action: AdjustAutomationAction) {}
}