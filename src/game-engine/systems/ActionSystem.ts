import { GameState, RegionType, WingCategory } from '../types';
import {
  GameAction, GameCategory,
  ClickResourceAction, PurchaseUpgradeAction,
  CompleteEncounterAction, SelectRegionAction, StoryChoiceAction,
  CombatActionAction, EquipAbilityAction, UnequipAbilityAction,
  CraftAmmoAction, UpgradeAmmoCapacityAction,
  AssignWorkerAction, UnassignWorkerAction,
  BuyCapacityUpgradeAction, BuyEfficiencyUpgradeAction,
  HireWorkerAction, BuyWorkerCapUpgradeAction,
  EnableAutomationAction, UnlockTierAction,
} from '../types/actions';
import { ALL_PLAYER_ABILITIES } from '@/game-engine/content/playerAbilities';
import { AMMO_TYPES, getAmmoMax, getAmmoUpgradeRelicCost, AmmoTypeId } from '@/game-engine/content/ammoTypes';
import { WING_DEFS, WING_ORDER, SLOT_ORDER, WingId } from '@/game-engine/content/wingResources';
import { getResourceAccessor } from '../utils/resourceAccessor';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";

export class ActionSystem {
  private eventBus?: EventBus<EventMap>;

  constructor(eventBus?: EventBus<EventMap>) {
    this.eventBus = eventBus;
  }

  processAction(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'RESOURCE_CLICK':
      case 'CLICK_RESOURCE':
        return this.handleResourceClick(state, action);
      case 'PURCHASE_UPGRADE':
        return this.handleUpgradePurchase(state, action.payload.category, action.payload.upgradeType);
      case 'ASSIGN_WORKER':
        return this.handleAssignWorker(state, action);
      case 'UNASSIGN_WORKER':
        return this.handleUnassignWorker(state, action);
      case 'BUY_CAPACITY_UPGRADE':
        return this.handleBuyCapacityUpgrade(state, action);
      case 'BUY_EFFICIENCY_UPGRADE':
        return this.handleBuyEfficiencyUpgrade(state, action);
      case 'HIRE_WORKER':
        return this.handleHireWorker(state, action);
      case 'BUY_WORKER_CAP_UPGRADE':
        return this.handleBuyWorkerCapUpgrade(state, action);
      case 'ENABLE_AUTOMATION':
        return this.handleEnableAutomation(state, action);
      case 'UNLOCK_TIER':
        return this.handleUnlockTier(state, action);
      case 'MARK_LOG_READ':
        return this.handleMarkLogRead(state, action.payload.logId);
      case 'MARK_ALL_LOGS_READ':
        return this.handleMarkAllLogsRead(state);
      case 'SELECT_REGION':
        return this.handleSelectRegion(state, action.payload.region as RegionType, action.payload.tier);
      case 'INITIATE_JUMP':
        return this.handleInitiateJump(state);
      case 'COMPLETE_ENCOUNTER':
        return this.handleCompleteEncounter(state, action);
      case 'STORY_CHOICE':
        return this.handleStoryChoice(state, action);
      case 'COMBAT_ACTION':
        return this.handleCombatAction(state, action);
      case 'RETREAT_FROM_BATTLE':
        return this.handleRetreatFromBattle(state);
      case 'EQUIP_ABILITY':
        return this.handleEquipAbility(state, action);
      case 'UNEQUIP_ABILITY':
        return this.handleUnequipAbility(state, action);
      case 'CRAFT_AMMO':
        return this.handleCraftAmmo(state, action);
      case 'UPGRADE_AMMO_CAPACITY':
        return this.handleUpgradeAmmoCapacity(state, action);
      default:
        Logger.warn(LogCategory.ACTIONS, `Unknown action type: ${(action as any).type}`, LogContext.NONE);
        return state;
    }
  }

  /* ====================================================================== */
  /* Worker actions                                                          */
  /* ====================================================================== */

  /** Total workers currently assigned across all wings */
  private getGlobalAssigned(state: GameState): number {
    let total = 0;
    for (const wingId of WING_ORDER) {
      const w = state.categories[wingId] as WingCategory;
      total += w.workers.primary + w.workers.secondary + w.workers.tertiary;
    }
    return total;
  }

  private handleAssignWorker(state: GameState, action: AssignWorkerAction): GameState {
    const { wing: wingId, slot } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;

    // Draw from the shared pool — only assign if there's an unassigned worker free
    const assigned = this.getGlobalAssigned(state);
    if (assigned >= state.workers.total) return state;

    wing.workers[slot] += 1;
    return state;
  }

  private handleUnassignWorker(state: GameState, action: UnassignWorkerAction): GameState {
    const { wing: wingId, slot } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (wing.workers[slot] <= 0) return state;

    wing.workers[slot] -= 1;
    return state;
  }

  /* ====================================================================== */
  /* Wing upgrade actions                                                    */
  /* ====================================================================== */

  private handleBuyCapacityUpgrade(state: GameState, action: BuyCapacityUpgradeAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: action.payload.wing,
        upgradeType: `__cap__${action.payload.slot}`
      });
    }
    return state;
  }

  private handleBuyEfficiencyUpgrade(state: GameState, action: BuyEfficiencyUpgradeAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: action.payload.wing,
        upgradeType: `__eff__${action.payload.slot}`
      });
    }
    return state;
  }

  private handleHireWorker(state: GameState, action: HireWorkerAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: 'reactor', // unused for global upgrades; UpgradeSystem ignores it
        upgradeType: '__hireWorker__'
      });
    }
    return state;
  }

  private handleBuyWorkerCapUpgrade(state: GameState, action: BuyWorkerCapUpgradeAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: 'reactor', // unused for global upgrades
        upgradeType: '__workerCap__'
      });
    }
    return state;
  }

  /* ====================================================================== */
  /* Resource click                                                          */
  /* ====================================================================== */

  private handleResourceClick(state: GameState, action: ClickResourceAction): GameState {
    const category = action.payload.category as WingId;
    const wing = state.categories[category] as WingCategory;
    if (!wing.unlocked) return state;

    const def = WING_DEFS[category];
    const slot = action.payload.slot ?? 'primary';

    // No clicking if this slot is automated
    if (wing.automated[slot]) return state;

    // Check tier is unlocked
    if (slot === 'secondary' && !wing.secondaryUnlocked) return state;
    if (slot === 'tertiary' && !wing.tertiaryUnlocked) return state;

    const capKey = `${slot}Capacity` as keyof typeof wing.stats;
    const cap = wing.stats[capKey] as number;
    if (wing.resources[slot] >= cap) return state;

    const slotDef = def.resources[slot];
    const amount = def.clickAmounts[slot];

    // Consume input resources (same ratios as worker production)
    if (slot === 'primary' && category !== 'reactor') {
      // Non-reactor primary consumes energy
      const energyCost = def.energyCostPerPrimaryWorker * (amount / slotDef.baseRate);
      if (state.categories.reactor.resources.primary < energyCost) return state;
      state.categories.reactor.resources.primary -= energyCost;
    } else if (slot === 'secondary') {
      // Secondary consumes primary
      const cost = slotDef.consumeRate * (amount / slotDef.baseRate);
      if (wing.resources.primary < cost) return state;
      wing.resources.primary -= cost;
    } else if (slot === 'tertiary') {
      // Tertiary consumes secondary
      const cost = slotDef.consumeRate * (amount / slotDef.baseRate);
      if (wing.resources.secondary < cost) return state;
      wing.resources.secondary -= cost;
    }

    wing.resources[slot] = Math.min(wing.resources[slot] + amount, cap);
    return state;
  }

  private handleEnableAutomation(state: GameState, action: EnableAutomationAction): GameState {
    const { wing: wingId, slot } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;
    if (wing.automated[slot]) return state;

    // All automation thresholds are checked against tertiary resource
    const def = WING_DEFS[wingId];
    const thresholdKey = `automate${slot.charAt(0).toUpperCase()}${slot.slice(1)}` as keyof typeof def.unlockThresholds;
    const threshold = def.unlockThresholds[thresholdKey] as number;
    if (wing.resources.tertiary < threshold) return state;

    wing.automated[slot] = true;

    // Unlock the bridge when reactor primary is automated
    if (wingId === 'reactor' && slot === 'primary') {
      state.categories.reactor.specialUpgrades.bridgeUnlocked = 1;
    }
    return state;
  }

  private handleUnlockTier(state: GameState, action: UnlockTierAction): GameState {
    const { wing: wingId, tier } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;

    const thresholds = WING_DEFS[wingId].unlockThresholds;

    if (tier === 'secondary') {
      if (wing.secondaryUnlocked) return state;
      if (wing.resources.primary < thresholds.secondary) return state;
      wing.secondaryUnlocked = true;
    } else {
      if (wing.tertiaryUnlocked) return state;
      if (!wing.secondaryUnlocked) return state;
      if (wing.resources.secondary < thresholds.tertiary) return state;
      wing.tertiaryUnlocked = true;
    }

    return state;
  }

  /* ====================================================================== */
  /* Special upgrade purchase (catalog-based)                                */
  /* ====================================================================== */

  private handleUpgradePurchase(state: GameState, category: GameCategory, upgradeType: string): GameState {
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', { state, category, upgradeType });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for PURCHASE_UPGRADE', LogContext.UPGRADE_PURCHASE);
    return state;
  }

  /* ====================================================================== */
  /* Navigation / Encounters / Combat (unchanged)                            */
  /* ====================================================================== */

  private handleMarkLogRead(state: GameState, logId: string): GameState {
    if (this.eventBus) {
      this.eventBus.emit('MARK_LOG_READ', { state, logId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for MARK_LOG_READ', LogContext.LOG_INTERACTION);
    return state;
  }

  private handleMarkAllLogsRead(state: GameState): GameState {
    if (this.eventBus) {
      this.eventBus.emit('MARK_ALL_LOGS_READ', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for MARK_ALL_LOGS_READ', LogContext.LOG_INTERACTION);
    return state;
  }

  private handleInitiateJump(state: GameState): GameState {
    if (this.eventBus) {
      this.eventBus.emit('INITIATE_JUMP', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for INITIATE_JUMP', LogContext.NONE);
    return state;
  }

  private handleCompleteEncounter(state: GameState, action: CompleteEncounterAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('COMPLETE_ENCOUNTER', { state, choiceId: action.payload?.choiceId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for COMPLETE_ENCOUNTER', LogContext.NONE);
    return state;
  }

  private handleSelectRegion(state: GameState, region: RegionType, tier?: number): GameState {
    state.bridge.currentRegion = region;
    state.bridge.currentTier = tier ?? 1;
    return state;
  }

  private handleStoryChoice(state: GameState, action: StoryChoiceAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('COMPLETE_ENCOUNTER', { state, choiceId: action.payload.choiceId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for STORY_CHOICE', LogContext.NONE);
    return state;
  }

  private handleCombatAction(state: GameState, action: CombatActionAction): GameState {
    if (this.eventBus) {
      this.eventBus.emit('COMBAT_ACTION', { state, actionId: action.payload.actionId });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for COMBAT_ACTION', LogContext.COMBAT_ACTION);
    return state;
  }

  private handleRetreatFromBattle(state: GameState): GameState {
    if (this.eventBus) {
      this.eventBus.emit('RETREAT_FROM_BATTLE', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for RETREAT_FROM_BATTLE', LogContext.NONE);
    return state;
  }

  /* ====================================================================== */
  /* Equipment (unchanged)                                                   */
  /* ====================================================================== */

  private handleEquipAbility(state: GameState, action: EquipAbilityAction): GameState {
    const { abilityId } = action.payload;
    const ability = ALL_PLAYER_ABILITIES[abilityId];
    if (!ability) return state;
    if (!state.inventory.includes(abilityId)) return state;

    switch (ability.slot) {
      case 'shield': state.loadout.shield = abilityId; break;
      case 'weapon':
        if (!state.loadout.weapons.includes(abilityId)) state.loadout.weapons.push(abilityId);
        break;
      case 'utility':
        if (!state.loadout.utilities.includes(abilityId)) state.loadout.utilities.push(abilityId);
        break;
      case 'stance': state.loadout.stance = abilityId; break;
    }
    return state;
  }

  private handleUnequipAbility(state: GameState, action: UnequipAbilityAction): GameState {
    const { abilityId } = action.payload;
    const ability = ALL_PLAYER_ABILITIES[abilityId];
    if (!ability) return state;

    switch (ability.slot) {
      case 'shield':
        if (state.loadout.shield === abilityId) state.loadout.shield = null;
        break;
      case 'weapon':
        state.loadout.weapons = state.loadout.weapons.filter(id => id !== abilityId);
        break;
      case 'utility':
        state.loadout.utilities = state.loadout.utilities.filter(id => id !== abilityId);
        break;
      case 'stance':
        if (state.loadout.stance === abilityId) state.loadout.stance = null;
        break;
    }
    return state;
  }

  /* ====================================================================== */
  /* Ammo (unchanged)                                                        */
  /* ====================================================================== */

  private handleCraftAmmo(state: GameState, action: CraftAmmoAction): GameState {
    const ammoId = action.payload.ammoType as AmmoTypeId;
    const amount = action.payload.amount;
    const def = AMMO_TYPES[ammoId];
    if (!def) return state;

    const ammoState = state.ammo[ammoId];
    const max = getAmmoMax(ammoId, ammoState.tier);
    const space = max - ammoState.current;
    if (space <= 0) return state;

    const toCraft = Math.min(amount, space);
    const totalCost = toCraft * def.craftCost;

    const accessor = getResourceAccessor(state, def.sourceResource);
    if (!accessor || accessor.obj[accessor.key] < totalCost) return state;

    accessor.obj[accessor.key] -= totalCost;
    ammoState.current += toCraft;
    return state;
  }

  private handleUpgradeAmmoCapacity(state: GameState, action: UpgradeAmmoCapacityAction): GameState {
    const ammoId = action.payload.ammoType as AmmoTypeId;
    const def = AMMO_TYPES[ammoId];
    if (!def) return state;

    const ammoState = state.ammo[ammoId];
    if (ammoState.tier >= 3) return state;

    const relicCost = getAmmoUpgradeRelicCost(ammoState.tier);
    if (state.relics < relicCost) return state;

    state.relics -= relicCost;
    ammoState.tier += 1;
    return state;
  }
}
