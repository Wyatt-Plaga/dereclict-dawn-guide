import { RegionType } from './regions';
import { BaseEncounter } from './encounters';
import { ResourceCost, ResourceReward, ResourceType } from './resources';

export { RegionType }; // Re-export RegionType

/**
 * Combat Action Categories
 */
export enum CombatActionCategory {
  SHIELD = 'shield',
  WEAPON = 'weapon',
  REPAIR = 'repair',
  SABOTAGE = 'sabotage'
}

/**
 * Status Effect Types
 */
export type StatusEffectType = 'WEAKEN' | 'EXPOSE' | 'STUN' | 'DISABLE';

/**
 * Status Effect Definition
 */
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  magnitude: number;
}

/**
 * Status Effect Instance (applied to an entity).
 * remainingTurns counts down at end of player turn.
 */
export interface StatusEffectInstance extends StatusEffect {
  remainingTurns: number;
}

/**
 * Combat Action Definition (turn-based)
 * - apCost: action points spent on use (default 1)
 * - cooldown: turns until usable again
 */
export interface CombatActionDefinition {
  id: string;
  name: string;
  description: string;
  category: CombatActionCategory;
  cost: ResourceCost;
  damage?: number;
  shieldDamage?: number;
  shieldRepair?: number;
  hullRepair?: number;
  statusEffect?: StatusEffect;
  apCost: number;
  cooldown: number;
}

/**
 * Enemy Action Condition Types (real-time)
 */
export type EnemyActionConditionType =
  | 'ALWAYS'
  | 'PLAYER_HEALTH_BELOW'    // player health below threshold %
  | 'PLAYER_HAS_SHIELDS'     // player shield > 0
  | 'PLAYER_NO_SHIELDS'      // player shield <= 0
  | 'PLAYER_RADIATION_ABOVE'; // player radiation stacks above threshold

/**
 * Enemy Action Condition
 */
export interface EnemyActionCondition {
  type: EnemyActionConditionType;
  threshold?: number;         // for PLAYER_HEALTH_BELOW (0-1)
}

/**
 * Enemy Action Definition (turn-based)
 */
export interface EnemyActionDefinition {
  id: string;
  name: string;
  description: string;
  hullDamage?: number;        // direct hull damage
  shieldDamage?: number;      // direct shield damage
  selfDamage?: number;        // damage to self (e.g. Self-Implosion)
  selfShieldHeal?: number;    // heal own shields (e.g. Shield Siphon)
  selfHullHeal?: number;      // heal own hull (e.g. Repair Drones)
  stunDuration?: number;      // stun player for N turns
  armorBuff?: number;         // temporarily increase own armor by N (duration in turns = cooldown)
  radiationStacks?: number;   // apply N radiation stacks to player
  cloakDuration?: number;     // enemy becomes untargetable for N turns
  cooldown: number;           // turns between uses
  useCondition: EnemyActionCondition;
  conditionLabel?: string;    // human-readable condition (shown in UI)
}

/**
 * Enemy Types
 */
export enum EnemyType {
  DRONE = 'drone',
  FIGHTER = 'fighter',
  CRUISER = 'cruiser',
  BATTLESHIP = 'battleship',
  ALIEN = 'alien',
  VESSEL = 'vessel',
  ANOMALY = 'anomaly',
  SWARM = 'swarm',
  STATION = 'station'
}

/**
 * Enemy Loot Definition
 */
export interface EnemyLoot {
  type: ResourceType;
  amount: number;
  probability?: number;
}

/**
 * Enemy Definition
 */
export interface EnemyDefinition {
  id: string;
  name: string;
  description: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  armor?: number;             // flat damage reduction per hit: actualDmg = max(1, dmg - armor)
  actions: string[];
  loot: EnemyLoot[];
  image?: string;
  regions?: RegionType[];
  difficultyTier?: number;
}

// Simple Enemy Interface (used in GameState?)
// The index.ts had a simpler Enemy interface.
// Let's consolidate. Use EnemyDefinition where static data, Enemy where instance data.
// Actually, index.ts Enemy had 'attackDelay', 'lastAttackTime'.
// These seem like instance properties.
// But EnemyDefinition (static data) doesn't have them.
// Let's define Enemy (Instance) here too.

export interface EnemyAction {
  name: string;
  description: string;
  damage: number;
  target: 'health' | 'shield';
  probability: number;
}

export interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  image: string;
  attackDelay: number; // Time in ms between enemy attacks
  lastAttackTime: number; // Last time the enemy attacked
  actions: EnemyAction[];
  region: RegionType;
}

/**
 * Action Result
 */
export interface ActionResult {
  success: boolean;
  message: string;
  damageDealt?: number;
  shieldDamage?: number;
  healthRepaired?: number;
  shieldRepaired?: number;
  statusEffectApplied?: StatusEffect;
  resourcesConsumed?: ResourceCost[];
}

/**
 * Battle Log Entry
 */
export interface BattleLogEntry {
  id: string;
  text: string;
  type: 'SYSTEM' | 'PLAYER' | 'ENEMY' | 'ANALYSIS';
  timestamp: number;
}

/**
 * Turn phases
 */
export type CombatTurnPhase = 'PLAYER' | 'ENEMY';

/**
 * Combat State interface (turn-based, AP-driven)
 */
export interface CombatState {
  active: boolean;
  currentEnemy: string | null;
  currentRegion: string | null;
  encounterCompleted: boolean;
  outcome?: 'victory' | 'defeat' | 'retreat';
  playerStats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    statusEffects: StatusEffectInstance[];
  };
  enemyStats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    statusEffects: StatusEffectInstance[];
  };
  battleLog: BattleLogEntry[];
  availableActions: string[];

  // ── Turn / AP system ──
  turn: number;                               // current turn number (1-indexed)
  turnPhase: CombatTurnPhase;                 // who is acting
  playerAP: number;                           // current AP available this turn
  maxPlayerAP: number;                        // AP refilled at start of each player turn (upgradeable)
  playerStunTurns: number;                    // turns of stun remaining

  cooldowns: Record<string, number>;          // player ability cooldowns (turns)
  enemyCooldowns: Record<string, number>;     // enemy ability cooldowns (turns)

  lastActionResult?: ActionResult;
  lastEnemyActionId: string | null;

  rewards?: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
    relics?: number;
  };

  // Radiation: at start of each player turn, deal stacks*3 hull damage and lose 1 stack
  radiationStacks: number;

  // Cloak: enemy untargetable for N turns
  enemyCloaked: boolean;
  enemyCloakTurns: number;
}

/**
 * Combat Encounter interface
 */
export interface CombatEncounter extends BaseEncounter {
  type: 'combat';
  enemy: Enemy;
  rewards?: ResourceReward[];
  escapePenalty?: ResourceReward[];
}
