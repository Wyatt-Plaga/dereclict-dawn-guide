/**
 * Combat Types
 * 
 * This file contains all the type definitions for the combat system.
 */

/**
 * Region Types
 * 
 * These match the string values in index.ts RegionType
 */
export enum RegionType {
  VOID = 'void',
  BLACK_HOLE = 'blackhole',
  ASTEROID_FIELD = 'asteroid',
  HABITABLE_ZONE = 'habitable',
  SUPERNOVA = 'supernova',
  ANOMALY = 'anomaly',
  NEBULA = 'nebula',
  DEEP_SPACE = 'deepspace'
}

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
 * Resource Cost for combat actions
 */
export interface ResourceCost {
  type: string;
  amount: number;
}

/**
 * Region-based enemy action
 * This represents the new format used in region-specific enemy files
 */
export interface RegionEnemyAction {
  name: string;
  damage: number;
  description: string;
  target: 'health' | 'shield';
  probability: number;
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
  actions: RegionEnemyAction[];
  loot: EnemyLoot[];
  image?: string;
  isBoss: boolean;
  spawnLocations: {
    regionId: string;
    subRegionId?: string;
    weight: number;
  }[];
  difficultyTier?: number;
  introTitle?: string;
  introDescription?: string;
  attackDelay?: number;
  lastAttackTime?: number;
  region?: RegionType;
  subRegion?: string;
}

/**
 * Region Definition
 */
export interface RegionDefinition {
  id: string;
  name: string;
  description: string;
  type: RegionType;
  difficulty?: number;
  encounterChance: number;
  enemyProbabilities: {
    enemyId: string;
    weight: number;
  }[];
  resourceModifiers?: Record<string, number>;
  subRegions?: {
    id: string;
    name: string;
    description: string;
  }[];
  bossEnemyId: string;
  bossDefeatThreshold: number;
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
