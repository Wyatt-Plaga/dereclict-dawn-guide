import type { WingId, ResourceSlot } from '../content/wingResources';

export type GameCategory = 'reactor' | 'processor' | 'crewQuarters' | 'manufacturing';

/* ========================================================================== */
/* Worker / Wing actions                                                      */
/* ========================================================================== */

export interface AssignWorkerAction {
  type: 'ASSIGN_WORKER';
  payload: {
    wing: WingId;
    slot: ResourceSlot;
  };
}

export interface UnassignWorkerAction {
  type: 'UNASSIGN_WORKER';
  payload: {
    wing: WingId;
    slot: ResourceSlot;
  };
}

/** Buy a capacity upgrade (costs secondary resource of the wing) */
export interface BuyCapacityUpgradeAction {
  type: 'BUY_CAPACITY_UPGRADE';
  payload: {
    wing: WingId;
    slot: ResourceSlot;   // which slot's capacity to upgrade
  };
}

/** Buy an efficiency upgrade (costs tertiary resource of the wing) */
export interface BuyEfficiencyUpgradeAction {
  type: 'BUY_EFFICIENCY_UPGRADE';
  payload: {
    wing: WingId;
    slot: ResourceSlot;   // which slot's efficiency to upgrade
  };
}

/** Buy a +1 max-workers upgrade for a slot (costs quaternary resource of the wing) */
export interface BuyMaxWorkersUpgradeAction {
  type: 'BUY_MAX_WORKERS_UPGRADE';
  payload: {
    wing: WingId;
    slot: ResourceSlot;   // which slot to raise the worker cap on
  };
}

/** Buy a generation-speed upgrade for a slot (costs the wing's primary resource).
 *  Speeds up manual hold-to-fill clicks AND multiplies worker auto-rate. */
export interface BuySpeedUpgradeAction {
  type: 'BUY_SPEED_UPGRADE';
  payload: {
    wing: WingId;
    slot: ResourceSlot;
  };
}

/** Hire a worker into the shared pool (costs energy) */
export interface HireWorkerAction {
  type: 'HIRE_WORKER';
}

/** Upgrade the shared worker maximum (costs relics, +5 per level) */
export interface BuyWorkerCapUpgradeAction {
  type: 'BUY_WORKER_CAP_UPGRADE';
}

/* ========================================================================== */
/* Existing actions (kept)                                                    */
/* ========================================================================== */

export interface ClickResourceAction {
  type: 'CLICK_RESOURCE' | 'RESOURCE_CLICK';
  payload: {
    category: GameCategory;
    slot?: ResourceSlot;  // defaults to 'primary'
  };
}

export interface EnableAutomationAction {
  type: 'ENABLE_AUTOMATION';
  payload: {
    wing: WingId;
    slot: ResourceSlot;
  };
}

export interface DisableAutomationAction {
  type: 'DISABLE_AUTOMATION';
  payload: {
    wing: WingId;
    slot: ResourceSlot;
  };
}

/** Assign a single drone from the free pool to the bridge fuel slot */
export interface AssignBridgeFuelWorkerAction {
  type: 'ASSIGN_BRIDGE_FUEL_WORKER';
}

/** Return a single drone from the bridge fuel slot to the free pool */
export interface UnassignBridgeFuelWorkerAction {
  type: 'UNASSIGN_BRIDGE_FUEL_WORKER';
}

/** Turn bridge fuel automation on or off */
export interface SetBridgeFuelAutomationAction {
  type: 'SET_BRIDGE_FUEL_AUTOMATION';
  payload: { enabled: boolean };
}

/** Buy the next fuel pump upgrade level (paid in reactor energy). */
export interface BuyFuelPumpUpgradeAction {
  type: 'BUY_FUEL_PUMP_UPGRADE';
}

/** Pre-drone manual fuel pump: a click pays energy and starts a single
 *  timed fill cycle. When the cycle completes, fuel is added and the player
 *  may click again. No-op while a cycle is running. */
export interface StartManualFuelCycleAction {
  type: 'START_MANUAL_FUEL_CYCLE';
}

/** Purchase a one-time research unlock in the Laboratory */
export interface PurchaseResearchAction {
  type: 'PURCHASE_RESEARCH';
  payload: {
    researchId: string;
  };
}

/** Unlock the next resource tier (secondary, tertiary, or quaternary) for a wing */
export interface UnlockTierAction {
  type: 'UNLOCK_TIER';
  payload: {
    wing: WingId;
    tier: 'secondary' | 'tertiary' | 'quaternary';
  };
}

/** Activate the bridge — costs energy, gates the bridge page + jumps. */
export interface UnlockBridgeAction {
  type: 'UNLOCK_BRIDGE';
}

export interface PurchaseUpgradeAction {
  type: 'PURCHASE_UPGRADE';
  payload: {
    category: GameCategory;
    upgradeType: string;
  };
}

export interface MarkLogReadAction {
  type: 'MARK_LOG_READ';
  payload: {
    logId: string;
  };
}

export interface MarkAllLogsReadAction {
  type: 'MARK_ALL_LOGS_READ';
}

export interface InitiateJumpAction {
  type: 'INITIATE_JUMP';
}

export interface CompleteEncounterAction {
  type: 'COMPLETE_ENCOUNTER';
  payload?: {
    choiceId?: string;
  };
}

export interface SelectRegionAction {
  type: 'SELECT_REGION';
  payload: {
    region: string;
    tier?: number;
  };
}

export interface StoryChoiceAction {
  type: 'STORY_CHOICE';
  payload: {
    choiceId: string;
  };
}

export interface CombatActionAction {
  type: 'COMBAT_ACTION';
  payload: {
    actionId: string;
  };
}

export interface RetreatFromBattleAction {
  type: 'RETREAT_FROM_BATTLE';
}

export interface DismissBattleIntroAction {
  type: 'DISMISS_BATTLE_INTRO';
}

export interface EndTurnAction {
  type: 'END_TURN';
}

export interface EquipAbilityAction {
  type: 'EQUIP_ABILITY';
  payload: {
    abilityId: string;
  };
}

export interface UnequipAbilityAction {
  type: 'UNEQUIP_ABILITY';
  payload: {
    abilityId: string;
  };
}

export interface CraftAmmoAction {
  type: 'CRAFT_AMMO';
  payload: {
    ammoType: string;
    amount: number;
  };
}

export interface UpgradeAmmoCapacityAction {
  type: 'UPGRADE_AMMO_CAPACITY';
  payload: {
    ammoType: string;
  };
}

/**
 * Union type of all possible game actions.
 */
export type GameAction =
  | ClickResourceAction
  | PurchaseUpgradeAction
  | MarkLogReadAction
  | MarkAllLogsReadAction
  | InitiateJumpAction
  | CompleteEncounterAction
  | SelectRegionAction
  | StoryChoiceAction
  | CombatActionAction
  | RetreatFromBattleAction
  | DismissBattleIntroAction
  | EndTurnAction
  | EquipAbilityAction
  | UnequipAbilityAction
  | CraftAmmoAction
  | UpgradeAmmoCapacityAction
  | AssignWorkerAction
  | UnassignWorkerAction
  | BuyCapacityUpgradeAction
  | BuyEfficiencyUpgradeAction
  | BuyMaxWorkersUpgradeAction
  | BuySpeedUpgradeAction
  | HireWorkerAction
  | BuyWorkerCapUpgradeAction
  | EnableAutomationAction
  | DisableAutomationAction
  | AssignBridgeFuelWorkerAction
  | UnassignBridgeFuelWorkerAction
  | SetBridgeFuelAutomationAction
  | BuyFuelPumpUpgradeAction
  | StartManualFuelCycleAction
  | UnlockTierAction
  | UnlockBridgeAction
  | PurchaseResearchAction;

/** @deprecated Use GameAction instead */
export type GameActions = GameAction;
