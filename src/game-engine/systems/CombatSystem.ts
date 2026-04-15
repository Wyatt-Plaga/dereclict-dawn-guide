import { GameState, RegionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  ActionResult,
  CombatActionDefinition,
  EnemyActionDefinition,
  EnemyDefinition
} from '../types/combat';
import { RegionDefinition } from '../types/regions';
import { ENEMY_DEFINITIONS } from '@/game-engine/content/enemies';
import { REGION_DEFINITIONS } from '@/game-engine/content/regions';
import { REGION_WING_UNLOCKS, WING_ORDER } from '@/game-engine/content/wingResources';
import { ResourceSystem } from './ResourceSystem';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";
import { CombatCalculator } from './combat/CombatCalculator';
import { CombatLogger } from './combat/CombatLogger';
import { resolvePlayerAction, PlayerCombatAction } from './combat/abilityAdapter';
import { PLAYER_ACTIONS, ENEMY_ACTIONS } from '@/game-engine/content/combatActions';
import { ALL_PLAYER_ABILITIES } from '@/game-engine/content/playerAbilities';
import { getResourceAccessor } from '../utils/resourceAccessor';
import { getRegionKey } from './EncounterSystem';

export class CombatSystem {
  private resourceSystem: ResourceSystem | null = null;
  private eventBus?: EventBus<EventMap>;

  constructor(eventBus?: EventBus<EventMap>) {
    this.eventBus = eventBus;

    if (this.eventBus) {
      this.eventBus.on('START_COMBAT', (data) => {
        this.startCombatEncounter(data.state, data.enemyId, data.regionId);
      });

      this.eventBus.on('COMBAT_ACTION', (data) => {
        this.performCombatAction(data.state, data.actionId);
      });

      this.eventBus.on('RETREAT_FROM_BATTLE', (data) => {
        this.retreat(data.state);
      });

      this.eventBus.on('END_TURN', (data) => {
        this.endPlayerTurn(data.state);
      });
    }
  }

  setResourceSystem(resourceSystem: ResourceSystem) {
    this.resourceSystem = resourceSystem;
  }

  /**
   * Per-tick update — turn-based combat does not need any real-time work.
   * Kept as a no-op so the GameSystemManager loop can call it harmlessly.
   */
  update(_state: GameState, _delta: number): void {
    /* turn-based: nothing to do per tick */
  }

  // ─── PLAYER ACTION ─────────────────────────────────────────────────

  performCombatAction(state: GameState, actionId: string): ActionResult {
    if (!state.combat?.active) {
      return { success: false, message: 'No active combat.' };
    }

    if (state.combat.turnPhase !== 'PLAYER') {
      return { success: false, message: 'Not your turn.' };
    }

    if (state.combat.playerStunTurns > 0) {
      return { success: false, message: 'Stunned.' };
    }

    // Cloak check — can't damage cloaked enemies (Scan/EXPOSE / repair still works)
    if (state.combat.enemyCloaked) {
      const abil = ALL_PLAYER_ABILITIES[actionId];
      const isScanAbility = abil?.statusEffect?.type === 'EXPOSE';
      const isRepairAbility = abil?.hullRepair || abil?.shieldRepair;
      if (!isScanAbility && !isRepairAbility) {
        return { success: false, message: 'Target is cloaked — use Scan to reveal' };
      }
      if (isScanAbility) {
        state.combat.enemyCloaked = false;
        state.combat.enemyCloakTurns = 0;
        CombatLogger.log(state, 'Scan penetrated enemy cloak!', 'SYSTEM');
      }
    }

    // Resolve action via the equipment system, falling back to legacy PLAYER_ACTIONS
    const ability = ALL_PLAYER_ABILITIES[actionId];
    const action = resolvePlayerAction(actionId);
    if (!action) {
      return { success: false, message: `Unknown action: ${actionId}` };
    }

    // AP check
    const apCost = action.apCost ?? 1;
    if (state.combat.playerAP < apCost) {
      return { success: false, message: `Need ${apCost} AP` };
    }

    // Cooldown check
    if ((state.combat.cooldowns[actionId] ?? 0) > 0) {
      return { success: false, message: 'On cooldown' };
    }

    // Ammo check (preferred) or legacy resource check
    if (ability?.ammoCost) {
      const ammoState = state.ammo[ability.ammoCost.type];
      if (!ammoState || ammoState.current < ability.ammoCost.amount) {
        return { success: false, message: `Not enough ${ability.ammoCost.type}` };
      }
      ammoState.current -= ability.ammoCost.amount;
    } else if (action.cost && action.cost.amount > 0) {
      if (!this.resourceSystem?.hasResources(state, [action.cost])) {
        return { success: false, message: `Insufficient ${action.cost.type}` };
      }
      this.resourceSystem?.consumeResources(state, [action.cost]);
    }

    // Spend AP and set cooldown
    state.combat.playerAP -= apCost;
    if (action.cooldown > 0) {
      state.combat.cooldowns[actionId] = action.cooldown;
    }

    // Look up enemy definition for armor
    const enemy = state.combat.currentEnemy ? this.getEnemyDefinition(state.combat.currentEnemy) : undefined;
    const enemyArmor = enemy?.armor ?? 0;

    // Apply effects
    const result = this.applyPlayerAction(state, action, enemyArmor);
    CombatLogger.log(state, result.message, 'PLAYER');
    state.combat.lastActionResult = result;

    // Check victory
    if (state.combat.enemyStats.health <= 0) {
      this.endCombatEncounter(state, 'victory');
      return result;
    }

    // Auto-end the player turn once AP is exhausted
    if (state.combat.playerAP <= 0) {
      this.endPlayerTurn(state);
    }

    return result;
  }

  private applyPlayerAction(state: GameState, action: PlayerCombatAction, enemyArmor: number = 0): ActionResult {
    const result: ActionResult = { success: true, message: `Used ${action.name}` };
    result.resourcesConsumed = action.cost ? [action.cost] : [];

    const weakenEffect = state.combat.enemyStats.statusEffects.find(e => e.type === 'WEAKEN');
    const weakenMult = weakenEffect ? (1 + weakenEffect.magnitude) : 1;

    // Split damage model: shieldDamage hits shields, damage hits hull directly
    if (action.damage || action.shieldDamage) {
      const dmg = CombatCalculator.calculateSplitDamage(
        state.combat.enemyStats.health,
        state.combat.enemyStats.shield,
        action.damage ?? 0,
        action.shieldDamage ?? 0,
        weakenMult,
        enemyArmor,
      );
      state.combat.enemyStats.shield = dmg.newShield;
      state.combat.enemyStats.health = dmg.newHealth;

      result.damageDealt = dmg.hullDamage;
      result.shieldDamage = dmg.shieldDamage;

      const parts: string[] = [];
      if (dmg.shieldDamage > 0) parts.push(`${dmg.shieldDamage} shield`);
      if (dmg.hullDamage > 0) parts.push(`${dmg.hullDamage} hull`);
      result.message = `${action.name} dealt ${parts.join(' + ')} damage`;
    }

    // Shield repair
    if (action.shieldRepair) {
      const rep = CombatCalculator.calculateShieldRepair(
        state.combat.playerStats.shield, state.combat.playerStats.maxShield, action.shieldRepair
      );
      state.combat.playerStats.shield = rep.newShield;
      result.shieldRepaired = rep.repairedAmount;
      result.message = `${action.name} restored ${rep.repairedAmount} shields`;
    }

    // Hull repair
    if (action.hullRepair) {
      const rep = CombatCalculator.calculateHullRepair(
        state.combat.playerStats.health, state.combat.playerStats.maxHealth, action.hullRepair
      );
      state.combat.playerStats.health = rep.newHealth;
      result.healthRepaired = rep.repairedAmount;
      result.message = `${action.name} repaired ${rep.repairedAmount} hull`;
    }

    // Status effect (EXPOSE, WEAKEN, etc.) — duration is in turns
    if (action.statusEffect) {
      state.combat.enemyStats.statusEffects.push({
        ...action.statusEffect,
        remainingTurns: action.statusEffect.duration
      });
      result.message += ` — applied ${action.statusEffect.type}`;
      result.statusEffectApplied = action.statusEffect;
    }

    return result;
  }

  // ─── TURN FLOW ──────────────────────────────────────────────────────

  /**
   * End the player's turn → run the enemy turn → start the next player turn.
   */
  endPlayerTurn(state: GameState): void {
    if (!state.combat?.active) return;
    if (state.combat.turnPhase !== 'PLAYER') return;

    state.combat.turnPhase = 'ENEMY';

    // Decay player status effects at the close of the player's turn
    state.combat.playerStats.statusEffects = CombatCalculator.processStatusEffects(
      state.combat.playerStats.statusEffects
    );

    this.executeEnemyTurn(state);
    if (!state.combat.active) return; // executeEnemyTurn may have ended combat

    this.startPlayerTurn(state);
  }

  /**
   * Run a single enemy turn: enemy fires the highest-priority ready ability whose
   * use-condition is met, then all enemy cooldowns tick down by 1.
   */
  private executeEnemyTurn(state: GameState): void {
    const enemy = state.combat.currentEnemy ? this.getEnemyDefinition(state.combat.currentEnemy) : undefined;
    if (!enemy) return;

    // Decay enemy status effects at the start of the enemy's turn
    state.combat.enemyStats.statusEffects = CombatCalculator.processStatusEffects(
      state.combat.enemyStats.statusEffects
    );

    // Cloak countdown (in turns)
    if (state.combat.enemyCloaked && state.combat.enemyCloakTurns > 0) {
      state.combat.enemyCloakTurns -= 1;
      if (state.combat.enemyCloakTurns <= 0) {
        state.combat.enemyCloaked = false;
        CombatLogger.log(state, 'Enemy cloak has dissipated.', 'SYSTEM');
      }
    }

    // Pick the first ready ability whose condition is met
    let chosen: EnemyActionDefinition | null = null;
    for (const actionId of enemy.actions) {
      const def = ENEMY_ACTIONS[actionId];
      if (!def) continue;
      if ((state.combat.enemyCooldowns[actionId] ?? 0) > 0) continue;
      if (!this.checkEnemyCondition(state, def)) continue;
      chosen = def;
      break;
    }

    if (chosen) {
      this.fireEnemyAction(state, enemy, chosen);
      state.combat.enemyCooldowns[chosen.id] = chosen.cooldown;
    } else {
      CombatLogger.log(state, `${enemy.name} hesitates.`, 'ENEMY');
    }

    // Tick down all enemy cooldowns by 1 turn
    for (const aid of Object.keys(state.combat.enemyCooldowns)) {
      if (state.combat.enemyCooldowns[aid] > 0) {
        state.combat.enemyCooldowns[aid] -= 1;
      }
    }

    if (state.combat.playerStats.health <= 0) {
      this.endCombatEncounter(state, 'defeat');
    }
  }

  /**
   * Begin a new player turn: refill AP, decrement player cooldowns and stun,
   * apply per-turn passives (radiation, regenerative shielding, etc.).
   */
  private startPlayerTurn(state: GameState): void {
    state.combat.turn += 1;
    state.combat.turnPhase = 'PLAYER';

    // Refill AP
    state.combat.playerAP = state.combat.maxPlayerAP;

    // Decrement player ability cooldowns
    for (const aid of Object.keys(state.combat.cooldowns)) {
      if (state.combat.cooldowns[aid] > 0) {
        state.combat.cooldowns[aid] -= 1;
      }
    }

    // Decrement stun
    if (state.combat.playerStunTurns > 0) {
      state.combat.playerStunTurns -= 1;
    }

    // Radiation: deal stacks*3 hull damage and lose 1 stack
    if (state.combat.radiationStacks > 0) {
      const radDmg = state.combat.radiationStacks * 3;
      state.combat.playerStats.health = Math.max(0, state.combat.playerStats.health - radDmg);
      CombatLogger.log(state, `Radiation dealt ${radDmg} hull damage (${state.combat.radiationStacks} stacks).`, 'SYSTEM');
      state.combat.radiationStacks -= 1;
      if (state.combat.radiationStacks > 0) {
        CombatLogger.log(state, `Radiation decayed to ${state.combat.radiationStacks} stacks.`, 'SYSTEM');
      }
      if (state.combat.playerStats.health <= 0) {
        CombatLogger.log(state, 'Radiation exposure proved fatal.', 'SYSTEM');
        this.endCombatEncounter(state, 'defeat');
        return;
      }
    }

    // Passive shield regen from equipped shield ability
    const shieldId = state.loadout?.shield;
    if (shieldId) {
      const shieldAbility = ALL_PLAYER_ABILITIES[shieldId];
      if (shieldAbility?.passive && shieldAbility.shieldRepair) {
        const rep = CombatCalculator.calculateShieldRepair(
          state.combat.playerStats.shield,
          state.combat.playerStats.maxShield,
          shieldAbility.shieldRepair
        );
        state.combat.playerStats.shield = rep.newShield;
      }
    }
  }

  // ─── ENEMY CONDITION CHECK ──────────────────────────────────────────

  private checkEnemyCondition(state: GameState, action: EnemyActionDefinition): boolean {
    const cond = action.useCondition;
    switch (cond.type) {
      case 'ALWAYS':
        return true;
      case 'PLAYER_HEALTH_BELOW':
        return (state.combat.playerStats.health / state.combat.playerStats.maxHealth) < (cond.threshold ?? 0.3);
      case 'PLAYER_HAS_SHIELDS':
        return state.combat.playerStats.shield > 0;
      case 'PLAYER_NO_SHIELDS':
        return state.combat.playerStats.shield <= 0;
      case 'PLAYER_RADIATION_ABOVE':
        return state.combat.radiationStacks >= (cond.threshold ?? 5);
      default:
        return true;
    }
  }

  // ─── FIRE ENEMY ACTION ─────────────────────────────────────────────

  private fireEnemyAction(state: GameState, enemy: EnemyDefinition, action: EnemyActionDefinition): void {
    const parts: string[] = [];

    // Apply shield damage
    if (action.shieldDamage && action.shieldDamage > 0) {
      const actual = Math.min(state.combat.playerStats.shield, action.shieldDamage);
      state.combat.playerStats.shield -= actual;
      if (actual > 0) parts.push(`${actual} shield damage`);
    }

    // Apply hull damage
    if (action.hullDamage && action.hullDamage > 0) {
      state.combat.playerStats.health = Math.max(0, state.combat.playerStats.health - action.hullDamage);
      parts.push(`${action.hullDamage} hull damage`);
    }

    // Apply stun (in turns)
    if (action.stunDuration && action.stunDuration > 0) {
      state.combat.playerStunTurns = Math.max(state.combat.playerStunTurns, action.stunDuration);
      parts.push(`stunned for ${action.stunDuration} turns`);
    }

    // Self-damage
    if (action.selfDamage && action.selfDamage > 0) {
      state.combat.enemyStats.health = Math.max(0, state.combat.enemyStats.health - action.selfDamage);
    }

    // Self-shield heal
    if (action.selfShieldHeal && action.selfShieldHeal > 0) {
      state.combat.enemyStats.shield = Math.min(
        state.combat.enemyStats.maxShield,
        state.combat.enemyStats.shield + action.selfShieldHeal
      );
    }

    // Self-hull heal
    if (action.selfHullHeal && action.selfHullHeal > 0) {
      const oldHealth = state.combat.enemyStats.health;
      state.combat.enemyStats.health = Math.min(
        state.combat.enemyStats.maxHealth,
        state.combat.enemyStats.health + action.selfHullHeal
      );
      const healed = state.combat.enemyStats.health - oldHealth;
      if (healed > 0) parts.push(`repaired ${healed} hull`);
    }

    // Radiation stacks
    if (action.radiationStacks && action.radiationStacks > 0) {
      state.combat.radiationStacks = Math.min(20, state.combat.radiationStacks + action.radiationStacks);
      parts.push(`+${action.radiationStacks} radiation`);
    }

    // Cloak (in turns)
    if (action.cloakDuration && action.cloakDuration > 0) {
      state.combat.enemyCloaked = true;
      state.combat.enemyCloakTurns = action.cloakDuration;
      parts.push(`cloaked for ${action.cloakDuration} turns`);
    }

    // Build log message
    const effectStr = parts.length > 0 ? ` — ${parts.join(', ')}` : '';
    CombatLogger.log(state, `${enemy.name} used ${action.name}${effectStr}`, 'ENEMY');

    state.combat.lastEnemyActionId = action.id;
  }

  // ─── START / END COMBAT ─────────────────────────────────────────────

  startCombatEncounter(state: GameState, enemyId: string, regionId: RegionType): void {
    const enemy = this.getEnemyDefinition(enemyId);
    if (!enemy) return;

    if (!state.combat) {
      state.combat = {
        active: false,
        battleLog: [],
        playerStats: { health: 100, maxHealth: 100, shield: 0, maxShield: 0, statusEffects: [] },
        enemyStats: { health: 0, maxHealth: 0, shield: 0, maxShield: 0, statusEffects: [] },
        availableActions: [],
        turn: 1,
        turnPhase: 'PLAYER',
        playerAP: 1,
        maxPlayerAP: 1,
        playerStunTurns: 0,
        cooldowns: {},
        enemyCooldowns: {},
        encounterCompleted: false,
        currentEnemy: null,
        currentRegion: null,
        rewards: { energy: 0, insight: 0, crew: 0, scrap: 0 },
        lastEnemyActionId: null,
        radiationStacks: 0,
        enemyCloaked: false,
        enemyCloakTurns: 0,
      };
    }

    state.combat.active = true;
    state.combat.currentEnemy = enemyId;
    state.combat.currentRegion = regionId;
    state.combat.encounterCompleted = false;
    state.combat.outcome = undefined;
    state.combat.rewards = { energy: 0, insight: 0, crew: 0, scrap: 0, relics: 0 };
    state.combat.lastEnemyActionId = null;
    state.combat.radiationStacks = 0;
    state.combat.enemyCloaked = false;
    state.combat.enemyCloakTurns = 0;

    // Reset turn state
    state.combat.turn = 1;
    state.combat.turnPhase = 'PLAYER';
    state.combat.maxPlayerAP = state.combat.maxPlayerAP || 1;
    state.combat.playerAP = state.combat.maxPlayerAP;
    state.combat.playerStunTurns = 0;

    state.combat.enemyStats = {
      health: enemy.health,
      maxHealth: enemy.maxHealth,
      shield: enemy.shield,
      maxShield: enemy.maxShield,
      statusEffects: []
    };

    // Restore player to full
    state.combat.playerStats.health = state.combat.playerStats.maxHealth;
    state.combat.playerStats.shield = state.combat.playerStats.maxShield;
    state.combat.playerStats.statusEffects = [];

    // Build available actions from loadout (equipment system)
    const loadout = state.loadout;
    const loadoutActions: string[] = [];
    if (loadout) {
      if (loadout.shield) loadoutActions.push(loadout.shield);
      loadoutActions.push(...loadout.weapons);
      loadoutActions.push(...loadout.utilities);
      if (loadout.stance) loadoutActions.push(loadout.stance);
    }
    state.combat.availableActions = loadoutActions.length > 0
      ? loadoutActions.filter(id => ALL_PLAYER_ABILITIES[id] && !ALL_PLAYER_ABILITIES[id].passive)
      : Object.keys(PLAYER_ACTIONS);
    state.combat.cooldowns = {};
    state.combat.enemyCooldowns = {};
    for (const aid of enemy.actions) {
      state.combat.enemyCooldowns[aid] = 0;
    }

    state.combat.battleLog = [];
    CombatLogger.log(state, `Encounter with ${enemy.name} initiated.`, 'SYSTEM');
    CombatLogger.log(state, `${enemy.description}`, 'ANALYSIS');
  }

  endCombatEncounter(state: GameState, outcome: 'victory' | 'defeat' | 'retreat'): void {
    if (!state.combat) return;

    state.combat.active = false;
    state.combat.encounterCompleted = true;
    state.combat.outcome = outcome;

    if (outcome === 'victory') {
      CombatLogger.log(state, 'Victory! The enemy has been defeated.', 'SYSTEM');
      this.processVictoryRewards(state);
    } else if (outcome === 'defeat') {
      CombatLogger.log(state, 'Defeat! The Dawn has sustained critical damage.', 'SYSTEM');
      this.applyDefeatPenalty(state);
    } else {
      CombatLogger.log(state, 'Tactical retreat successful.', 'SYSTEM');
    }
  }

  /**
   * On defeat: reset encounter progress in the region the fight occurred in.
   */
  private applyDefeatPenalty(state: GameState): void {
    const baseRegion = (state.combat.currentRegion ?? state.bridge?.currentRegion) as RegionType | undefined;
    if (!baseRegion) return;
    const tier = state.bridge?.currentTier ?? 1;
    const regionKey = getRegionKey(baseRegion, tier);

    state.encounters.history = state.encounters.history.filter(h => h.region !== regionKey);

    if (state.bridge?.completedRegions) {
      state.bridge.completedRegions = state.bridge.completedRegions.filter(r => r !== regionKey);
    }

    if (state.encounters.pendingRematch?.regionKey === regionKey) {
      state.encounters.pendingRematch = undefined;
    }

    CombatLogger.log(state, `Sector progress lost — ${regionKey} reset.`, 'SYSTEM');
  }

  // ─── REWARDS ────────────────────────────────────────────────────────

  private processVictoryRewards(state: GameState): void {
    if (!state.combat.currentEnemy) return;
    const enemy = this.getEnemyDefinition(state.combat.currentEnemy);
    if (!enemy) return;

    const baseRegion = (state.combat.currentRegion ?? state.bridge.currentRegion) as RegionType;
    const tier = state.bridge.currentTier ?? 1;
    const regionKey = getRegionKey(baseRegion, tier);
    state.encounters.history.push({
      id: `combat-${Date.now()}`,
      type: 'combat',
      result: 'victory',
      date: Date.now(),
      region: regionKey,
    });

    enemy.loot.forEach(reward => {
      if (reward.probability && Math.random() > reward.probability) return;

      const accessor = getResourceAccessor(state, reward.type);
      if (accessor) {
        accessor.obj[accessor.key] += reward.amount;
        if (state.combat.rewards && reward.type in state.combat.rewards) {
          const key = reward.type as keyof typeof state.combat.rewards;
          (state.combat.rewards[key] as number) = ((state.combat.rewards[key] as number) || 0) + reward.amount;
        }
      }
      CombatLogger.log(state, `Recovered ${reward.amount} ${reward.type}.`, 'SYSTEM');
    });

    if (baseRegion === 'void') {
      state.relics += 1;
      if (state.combat.rewards) {
        state.combat.rewards.relics = (state.combat.rewards.relics || 0) + 1;
      }
      CombatLogger.log(state, 'Recovered 1 relic from the wreckage.', 'SYSTEM');
    }

    const VICTORIES_TO_COMPLETE = 5;
    const victories = state.encounters.history.filter(h => h.region === regionKey && h.result === 'victory').length;
    if (victories >= VICTORIES_TO_COMPLETE && !state.bridge.completedRegions.includes(regionKey)) {
      state.bridge.completedRegions.push(regionKey);
      CombatLogger.log(state, 'SECTOR SECURED. Navigational data acquired.', 'SYSTEM');

      const unlock = REGION_WING_UNLOCKS.find(u => u.region === regionKey);
      if (unlock) {
        const wing = state.categories[unlock.wing];
        if (wing && !wing.unlocked) {
          wing.unlocked = true;
          CombatLogger.log(state, `Ship systems restored: ${unlock.wing.toUpperCase()} wing now operational.`, 'SYSTEM');
        }
      }
    }
  }

  // ─── RETREAT ────────────────────────────────────────────────────────

  retreat(state: GameState): void {
    if (state.combat.currentEnemy && state.combat.currentRegion) {
      const tier = state.bridge?.currentTier ?? 1;
      const regionKey = getRegionKey(state.combat.currentRegion as RegionType, tier);
      state.encounters.pendingRematch = {
        enemyId: state.combat.currentEnemy,
        regionKey,
      };
    }

    CombatLogger.log(state, 'Retreat initiated.', 'PLAYER');
    this.endCombatEncounter(state, 'retreat');
  }

  retreatFromCombat(state: GameState): GameState {
    if (!state.combat?.active) return state;

    const newState = { ...state };
    const penalty = 0.25;

    // Apply 25% penalty to each wing's primary resource
    for (const wingId of WING_ORDER) {
      const res = newState.categories[wingId].resources;
      const lost = Math.floor(res.primary * penalty);
      res.primary = Math.max(0, res.primary - lost);
    }

    newState.combat = {
      ...newState.combat,
      active: false,
      encounterCompleted: true,
      outcome: 'retreat',
      battleLog: [
        ...newState.combat.battleLog,
        { id: uuidv4(), text: 'Retreated — lost 25% of resources.', type: 'SYSTEM', timestamp: Date.now() }
      ]
    };

    if (newState.encounters.active && newState.encounters.encounter) {
      newState.encounters.history = [
        ...newState.encounters.history,
        {
          id: newState.encounters.encounter.id,
          type: newState.encounters.encounter.type,
          result: 'retreat',
          date: Date.now(),
          region: newState.encounters.encounter.region
        }
      ];
      newState.encounters.active = false;
      newState.encounters.encounter = undefined;
    }

    return newState;
  }

  // ─── ENCOUNTER GENERATION ───────────────────────────────────────────

  checkForEncounter(state: GameState, toRegion: RegionType): boolean {
    if (!state.bridge) {
      state.bridge = { currentRegion: toRegion, currentTier: 1, completedRegions: [], fuel: 0, fuelWorkers: 0, fuelAutomated: false, fuelPumpLevel: 0 };
    }

    const tier = state.bridge.currentTier ?? 1;
    const rKey = getRegionKey(toRegion, tier);
    const region = this.getRegionDefinition(toRegion);
    if (!region) return false;

    const currentJumps = state.encounters.history.filter(h => h.region === rKey && h.result === 'victory').length;
    if (toRegion === 'void' && currentJumps >= 5) return true;

    return Math.random() < region.encounterChance;
  }

  generateRandomEncounter(state: GameState): string | null {
    if (!state.bridge) return null;

    const regionId = state.bridge.currentRegion;
    const tier = state.bridge.currentTier ?? 1;
    const rKey = getRegionKey(regionId, tier);
    const currentJumps = state.encounters.history.filter(h => h.region === rKey && h.result === 'victory').length;

    if (regionId === 'void' && currentJumps >= 5) {
      return 'void-lurker'; // Boss placeholder
    }

    const region = this.getRegionDefinition(regionId);
    if (!region) return null;

    const possibleEnemies = region.enemyProbabilities;
    if (possibleEnemies.length === 0) return null;

    const totalWeight = possibleEnemies.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of possibleEnemies) {
      roll -= entry.weight;
      if (roll <= 0) return entry.enemyId;
    }

    return possibleEnemies[0].enemyId;
  }

  // ─── HELPERS ────────────────────────────────────────────────────────

  private getEnemyDefinition(enemyId: string): EnemyDefinition | undefined {
    return ENEMY_DEFINITIONS[enemyId];
  }

  private getRegionDefinition(regionId: string): RegionDefinition | undefined {
    return REGION_DEFINITIONS[regionId];
  }
}
