/**
 * Combat Types
 * 
 * Type definitions for the combat system
 */

import { ResourceCost } from './resources';

/**
 * Enemy Types
 */
export enum EnemyType {
  VESSEL = 'vessel',
  STATION = 'station',
  ANOMALY = 'anomaly',
  SWARM = 'swarm'
}

/**
 * Action Categories - Used for gameplay and UI organization
 */
export enum CombatActionCategory {
  SHIELD = 'shield',
  WEAPON = 'weapon',
  REPAIR = 'repair',
  SABOTAGE = 'sabotage'
}

/**
 * Region Types
 */
export enum RegionType {
  NEBULA = 'nebula',
  ASTEROID_FIELD = 'asteroidField',
  SUPERNOVA = 'supernova',
  VOID = 'void',
  RADIATION_ZONE = 'radiationZone'
}

/**
 * Resource Types used in combat
 */
export interface ResourceCost {
  type: 'energy' | 'insight' | 'crew' | 'scrap';
  amount: number;
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
  cooldown?: number;
}

/**
 * Status Effect Definition
 */
export interface StatusEffect {
  type: 'WEAKEN' | 'STUN' | 'EXPOSE' | 'DISABLE';
  duration: number; // In turns
  magnitude: number; // Effect strength
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
 * Enemy Action Condition
 */
export interface EnemyActionCondition {
  type: 'HEALTH_THRESHOLD' | 'SHIELD_THRESHOLD' | 'ALWAYS' | 'RANDOM';
  threshold?: number; // For threshold-based conditions
  probability?: number; // For random conditions
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
  image: string;
  actions: string[]; // IDs of actions this enemy can use
  loot: ResourceReward[];
  regions: RegionType[]; // Regions where this enemy can appear
  difficultyTier: number; // 1-5, how challenging the enemy is
}

/**
 * Resource Reward for defeating enemies
 */
export interface ResourceReward {
  type: 'energy' | 'insight' | 'crew' | 'scrap';
  amount: number;
  probability?: number; // Chance of getting this reward (0-1)
}

/**
 * Region Definition
 */
export interface RegionDefinition {
  id: string;
  name: string;
  description: string;
  type: RegionType;
  difficulty: number;
  enemyProbabilities: { enemyId: string, weight: number }[];
  resourceModifiers: Record<string, number>;
  encounterChance: number; // 0-1 chance of encounter when jumping
}

/**
 * Combat Stats - Used for both player and enemies
 */
export interface CombatStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  statusEffects: StatusEffectInstance[];
}

/**
 * Active Status Effect Instance
 */
export interface StatusEffectInstance extends StatusEffect {
  remainingTurns: number;
}

/**
 * Action Result
 */
export interface ActionResult {
  success: boolean;
  damageDealt?: number;
  shieldDamage?: number;
  healthRepaired?: number;
  shieldRepaired?: number;
  statusEffectApplied?: StatusEffect;
  resourcesConsumed?: ResourceCost[];
  message: string;
}

// Resource types for combat actions
export type ResourceType = 'energy' | 'insight' | 'crew' | 'scrap';

// Resource cost for actions
export interface ResourceCost {
  type: ResourceType;
  amount: number;
}

// Types of combat actions
export type CombatActionCategory = 'SHIELD' | 'WEAPON' | 'REPAIR' | 'SABOTAGE';

// Combat-specific status effect types
export type StatusEffectType = 
  'STUNNED' |           // Cannot take action
  'SHIELD_DISRUPTED' |  // Shields reduced effectiveness
  'DAMAGE_REDUCED' |    // Damage output reduced
  'DAMAGE_BOOST' |      // Damage output increased
  'HULL_LEAKING' |      // Take damage over time
  'SENSOR_DISRUPTION' | // Cannot see enemy intentions
  'WEAKEN' |            // Legacy type support
  'STUN' |              // Legacy type support
  'EXPOSE' |            // Legacy type support
  'DISABLE';            // Legacy type support

// Status effect during combat
export interface StatusEffect {
  type: StatusEffectType;
  remainingTurns: number;
}

// Stats for player or enemy during combat
export interface CombatantStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  statusEffects: StatusEffect[];
}

// Status effect applied by an action
export interface ActionStatusEffect {
  type: StatusEffectType;
  duration: number;
}

// Combat action (both player and enemy)
export interface CombatAction {
  id: string;
  name: string;
  description: string;
  category?: CombatActionCategory;
  cost?: ResourceCost[];
  damage?: number;
  shieldRepair?: number;
  hullRepair?: number;
  statusEffect?: ActionStatusEffect;
}

// Resource rewards from combat
export interface CombatRewards {
  energy: number;
  insight: number;
  crew: number;
  scrap: number;
}

// Battle log entry types
export type BattleLogEntryType = 'SYSTEM' | 'PLAYER' | 'ENEMY' | 'ANALYSIS';

// Battle log entry
export interface BattleLogEntry {
  id: string;
  type: BattleLogEntryType;
  text: string;
  timestamp: string | number; // Support both string and number formats
}

// Current state of a combat encounter
export interface CombatState {
  active: boolean;
  playerStats: CombatantStats;
  enemyStats: CombatantStats;
  currentEnemy: string | null | undefined;  // Support both null and undefined
  currentRegion: string | null | undefined; // Support both null and undefined
  turn: number;
  battleLog: BattleLogEntry[];
  enemyIntentions: string | null;
  encounterCompleted: boolean;
  rewards: CombatRewards;
  // Legacy support
  availableActions?: string[];
  lastActionResult?: any;
  cooldowns?: Record<string, number>;
  outcome?: 'victory' | 'defeat' | 'retreat';
}

// Types of actions a player can perform
export type GameActionType = 
  | 'START_COMBAT' 
  | 'PERFORM_COMBAT_ACTION' 
  | 'RETREAT_FROM_COMBAT' 
  | 'END_COMBAT'
  | 'INITIATE_JUMP';

// Payload for starting combat
export interface StartCombatAction {
  type: 'START_COMBAT';
  payload: {
    enemyId: string;
    regionId: string;
  };
}

// Payload for performing a combat action
export interface PerformCombatAction {
  type: 'PERFORM_COMBAT_ACTION';
  payload: {
    actionId: string;
  };
}

// Payload for retreating from combat
export interface RetreatFromCombatAction {
  type: 'RETREAT_FROM_COMBAT';
}

// Payload for ending combat (system action)
export interface EndCombatAction {
  type: 'END_COMBAT';
  payload: {
    victory: boolean;
  };
}

// Payload for initiating a jump to a new region
export interface InitiateJumpAction {
  type: 'INITIATE_JUMP';
  payload: {
    targetRegion: string;
  };
}

// Union type of all combat-related actions
export type CombatAction_Union = 
  | StartCombatAction
  | PerformCombatAction
  | RetreatFromCombatAction
  | EndCombatAction
  | InitiateJumpAction; 