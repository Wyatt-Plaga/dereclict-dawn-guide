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
 * Status Effect Instance (applied to an entity)
 * remainingTime is in seconds for real-time combat.
 */
export interface StatusEffectInstance extends StatusEffect {
  remainingTime: number;
}

/**
 * Combat Action Definition
 */
export interface CombatActionDefinition {
  id: string;
  name: string;
  description: string;
  category: CombatActionCategory;
  cost: ResourceCost;
  damage?: number;
  shieldRepair?: number;
  hullRepair?: number;
  statusEffect?: StatusEffect;
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
 * Enemy Action Definition (real-time)
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
  stunDuration?: number;      // stun player for N seconds
  armorBuff?: number;         // temporarily increase own armor by N (duration = cooldown)
  radiationStacks?: number;   // apply N radiation stacks to player
  cloakDuration?: number;     // enemy becomes untargetable for N seconds
  cooldown: number;           // seconds between uses
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
 * Combat State interface (real-time)
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
  cooldowns: Record<string, number>;          // player ability cooldowns (seconds, fractional)
  enemyCooldowns: Record<string, number>;     // enemy ability cooldowns (seconds, fractional)
  playerStunTimer: number;                    // seconds of stun remaining
  lastActionResult?: ActionResult;
  lastEnemyActionId: string | null;
  /** Per-enemy-action "just fired" flash timers (seconds remaining) */
  enemyActionFlash: Record<string, number>;
  rewards?: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
    relics?: number;
  };
  // Radiation mechanic — every 4s the player takes stacks*3 hull damage and loses 1 stack
  radiationStacks: number;
  radiationTickTimer: number;                 // seconds until next radiation tick
  // Cloak mechanic
  enemyCloaked: boolean;                      // enemy currently untargetable
  enemyCloakTimer: number;                    // seconds of cloak remaining
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
