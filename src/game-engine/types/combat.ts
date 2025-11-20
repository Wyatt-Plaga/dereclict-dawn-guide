import { RegionType } from './regions';
import { BaseEncounter } from './encounters';
import { ResourceCost, ResourceReward } from './resources';

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
 */
export interface StatusEffectInstance extends StatusEffect {
  remainingTurns: number;
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
 * Enemy Action Condition Types
 */
export type EnemyActionConditionType = 'HEALTH_THRESHOLD' | 'SHIELD_THRESHOLD' | 'ALWAYS' | 'RANDOM';

/**
 * Enemy Action Condition
 */
export interface EnemyActionCondition {
  type: EnemyActionConditionType;
  threshold?: number;
  probability?: number;
}

/**
 * Enemy Action Definition
 */
export interface EnemyActionDefinition {
  id: string;
  name: string;
  description: string;
  damage?: number;
  shieldDamage?: number;
  statusEffect?: StatusEffect;
  cooldown: number;
  useCondition: EnemyActionCondition;
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
  type: string;
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
 * Combat State interface
 */
export interface CombatState {
  active: boolean;
  currentEnemy: string | null;
  currentRegion: string | null; // RegionType? index.ts said string | null. Let's use RegionType | null
  turn: number;
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
  cooldowns: Record<string, number>;
  lastActionResult?: ActionResult;
  lastEnemyActionId: string | null;
  rewards?: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
  };
  enemyIntentions: any | null; // Define better type if possible
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
