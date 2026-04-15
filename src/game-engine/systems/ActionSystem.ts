import { GameState, RegionType, WingCategory } from '../types';
import {
  GameAction, GameCategory,
  ClickResourceAction, PurchaseUpgradeAction, PurchaseResearchAction,
  CompleteEncounterAction, SelectRegionAction, StoryChoiceAction,
  CombatActionAction, EquipAbilityAction, UnequipAbilityAction,
  CraftAmmoAction, UpgradeAmmoCapacityAction,
  AssignWorkerAction, UnassignWorkerAction,
  BuyCapacityUpgradeAction, BuyEfficiencyUpgradeAction,
  BuyMaxWorkersUpgradeAction,
  HireWorkerAction, BuyWorkerCapUpgradeAction,
  EnableAutomationAction, DisableAutomationAction,
  AssignBridgeFuelWorkerAction, UnassignBridgeFuelWorkerAction, SetBridgeFuelAutomationAction,
  UnlockTierAction,
} from '../types/actions';
import { ALL_PLAYER_ABILITIES } from '@/game-engine/content/playerAbilities';
import { AMMO_TYPES, getAmmoMax, getAmmoUpgradeRelicCost, AmmoTypeId } from '@/game-engine/content/ammoTypes';
import { WING_DEFS, WING_ORDER, SLOT_ORDER, SLOT_CONSUMES, WingId } from '@/game-engine/content/wingResources';
import { FUEL_PUMP_MAX_LEVEL, fuelPumpUpgradeCost } from '@/game-engine/content/bridgeFuel';
import { RESEARCH_BY_ID, canResearch } from '@/game-engine/content/research';
import { ResourceSystem } from './ResourceSystem';
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
      case 'BUY_MAX_WORKERS_UPGRADE':
        return this.handleBuyMaxWorkersUpgrade(state, action);
      case 'HIRE_WORKER':
        return this.handleHireWorker(state, action);
      case 'BUY_WORKER_CAP_UPGRADE':
        return this.handleBuyWorkerCapUpgrade(state, action);
      case 'ENABLE_AUTOMATION':
        return this.handleEnableAutomation(state, action);
      case 'DISABLE_AUTOMATION':
        return this.handleDisableAutomation(state, action);
      case 'ASSIGN_BRIDGE_FUEL_WORKER':
        return this.handleAssignBridgeFuelWorker(state);
      case 'UNASSIGN_BRIDGE_FUEL_WORKER':
        return this.handleUnassignBridgeFuelWorker(state);
      case 'SET_BRIDGE_FUEL_AUTOMATION':
        return this.handleSetBridgeFuelAutomation(state, action);
      case 'BUY_FUEL_PUMP_UPGRADE':
        return this.handleBuyFuelPumpUpgrade(state);
      case 'UNLOCK_TIER':
        return this.handleUnlockTier(state, action);
      case 'PURCHASE_RESEARCH':
        return this.handlePurchaseResearch(state, action);
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
      case 'END_TURN':
        return this.handleEndTurn(state);
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
      for (const slot of SLOT_ORDER) {
        total += w.workers[slot];
      }
    }
    total += state.bridge?.fuelWorkers ?? 0;
    return total;
  }

  private handleAssignWorker(state: GameState, action: AssignWorkerAction): GameState {
    if (!state.laboratory.workerHiring) return state;
    const { wing: wingId, slot } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;

    // Per-slot worker cap
    const slotMax = ResourceSystem.getMaxWorkersForSlot(wing, slot);
    if (wing.workers[slot] >= slotMax) return state;

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
    if (!state.laboratory.efficiencyUpgrades) return state;
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: action.payload.wing,
        upgradeType: `__eff__${action.payload.slot}`
      });
    }
    return state;
  }

  private handleBuyMaxWorkersUpgrade(state: GameState, action: BuyMaxWorkersUpgradeAction): GameState {
    if (!state.laboratory.maxWorkersUpgrades) return state;
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: action.payload.wing,
        upgradeType: `__maxWorkers__${action.payload.slot}`
      });
    }
    return state;
  }

  private handleHireWorker(state: GameState, action: HireWorkerAction): GameState {
    if (!state.laboratory.workerHiring) return state;
    if (this.eventBus) {
      this.eventBus.emit('PURCHASE_UPGRADE', {
        state,
        category: 'reactor',
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
    if (slot === 'quaternary' && !wing.quaternaryUnlocked) return state;

    const capKey = `${slot}Capacity` as keyof typeof wing.stats;
    const cap = wing.stats[capKey] as number;
    if (wing.resources[slot] >= cap) return state;

    const slotDef = def.resources[slot];
    const amount = def.clickAmounts[slot];

    // Non-primary slots consume the prior-tier resource per click, mirroring
    // what one worker-second of production would cost.
    const inputSlot = SLOT_CONSUMES[slot];
    if (inputSlot) {
      const cost = slotDef.consumeRate * (amount / slotDef.baseRate);
      if (wing.resources[inputSlot] < cost) return state;
      wing.resources[inputSlot] -= cost;
    }

    wing.resources[slot] = Math.min(wing.resources[slot] + amount, cap);
    return state;
  }

  private handleEnableAutomation(state: GameState, action: EnableAutomationAction): GameState {
    const { wing: wingId, slot } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;
    if (wing.automated[slot]) return state;

    // Automation is gated behind the Workforce Systems research. Once unlocked,
    // any slot that's been made visible on the wing can be automated freely.
    if (!state.laboratory.workerHiring) return state;
    if (slot === 'secondary' && !wing.secondaryUnlocked) return state;
    if (slot === 'tertiary' && !wing.tertiaryUnlocked) return state;
    if (slot === 'quaternary' && !wing.quaternaryUnlocked) return state;

    wing.automated[slot] = true;
    return state;
  }

  private handleDisableAutomation(state: GameState, action: DisableAutomationAction): GameState {
    const { wing: wingId, slot } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;
    if (!wing.automated[slot]) return state;

    // Return any assigned workers to the free pool, then flip the flag off.
    wing.workers[slot] = 0;
    wing.automated[slot] = false;
    return state;
  }

  /* ====================================================================== */
  /* Bridge fuel worker management                                          */
  /* ====================================================================== */

  private handleAssignBridgeFuelWorker(state: GameState): GameState {
    if (!state.laboratory.workerHiring) return state;
    if (!state.bridge) return state;
    if (state.bridge.fuelWorkers >= 1) return state;
    const assigned = this.getGlobalAssigned(state);
    if (assigned >= state.workers.total) return state;
    state.bridge.fuelWorkers += 1;
    return state;
  }

  private handleUnassignBridgeFuelWorker(state: GameState): GameState {
    if (!state.bridge) return state;
    if (state.bridge.fuelWorkers <= 0) return state;
    state.bridge.fuelWorkers -= 1;
    return state;
  }

  private handleBuyFuelPumpUpgrade(state: GameState): GameState {
    if (!state.bridge) return state;
    const level = state.bridge.fuelPumpLevel ?? 0;
    if (level >= FUEL_PUMP_MAX_LEVEL) return state;
    const cost = fuelPumpUpgradeCost(level);
    const reactor = state.categories.reactor;
    if (reactor.resources.primary < cost) return state;
    reactor.resources.primary -= cost;
    state.bridge.fuelPumpLevel = level + 1;
    return state;
  }

  private handleSetBridgeFuelAutomation(state: GameState, action: SetBridgeFuelAutomationAction): GameState {
    if (!state.bridge) return state;
    if (action.payload.enabled && !state.laboratory.workerHiring) return state;
    state.bridge.fuelAutomated = action.payload.enabled;
    // When disabling automation, release any assigned workers back to the pool.
    if (!action.payload.enabled) {
      state.bridge.fuelWorkers = 0;
    }
    return state;
  }

  private handleUnlockTier(state: GameState, action: UnlockTierAction): GameState {
    const { wing: wingId, tier } = action.payload;
    const wing = state.categories[wingId] as WingCategory;
    if (!wing.unlocked) return state;

    const thresholds = WING_DEFS[wingId].unlockThresholds;

    // All tiers gate on the wing's primary resource (single progression ladder)
    const primary = wing.resources.primary;
    if (tier === 'secondary') {
      if (wing.secondaryUnlocked) return state;
      if (primary < thresholds.secondary) return state;
      wing.secondaryUnlocked = true;
    } else if (tier === 'tertiary') {
      if (wing.tertiaryUnlocked) return state;
      if (!wing.secondaryUnlocked) return state;
      if (primary < thresholds.tertiary) return state;
      wing.tertiaryUnlocked = true;
    } else {
      if (wing.quaternaryUnlocked) return state;
      if (!wing.tertiaryUnlocked) return state;
      if (primary < thresholds.quaternary) return state;
      wing.quaternaryUnlocked = true;
    }

    return state;
  }

  /* ====================================================================== */
  /* Laboratory research                                                     */
  /* ====================================================================== */

  private handlePurchaseResearch(state: GameState, action: PurchaseResearchAction): GameState {
    const { researchId } = action.payload;
    const def = RESEARCH_BY_ID[researchId];
    if (!def) return state;

    // Already researched or prerequisites not met
    if (!canResearch(researchId, state.laboratory.researched)) return state;

    // Pay the cost
    const accessor = getResourceAccessor(state, def.costResource);
    if (!accessor || accessor.obj[accessor.key] < def.costAmount) return state;
    accessor.obj[accessor.key] -= def.costAmount;

    // Mark as researched and set the feature flag
    state.laboratory.researched.push(researchId);
    if (def.unlocks in state.laboratory) {
      (state.laboratory as unknown as Record<string, unknown>)[def.unlocks] = true;
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

  private handleEndTurn(state: GameState): GameState {
    if (this.eventBus) {
      this.eventBus.emit('END_TURN', { state });
      return state;
    }
    Logger.error(LogCategory.ACTIONS, 'EventBus unavailable for END_TURN', LogContext.COMBAT_ACTION);
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
