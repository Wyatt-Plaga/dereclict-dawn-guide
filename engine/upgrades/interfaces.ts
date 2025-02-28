import { ResourceType } from '@/types/game.types';
import { CommandResult, ResourceCost } from '../interfaces';

/**
 * Types of upgrades available in the game
 */
export enum UpgradeType {
  RESOURCE = 'resource',   // Affects resource production or capacity
  UNLOCK = 'unlock',       // Unlocks new content or features
  EFFECT = 'effect',       // Provides special effects or bonuses
  MILESTONE = 'milestone', // Achievement-like upgrades
}

/**
 * Base properties for all upgrades
 */
export interface UpgradeProperties {
  id: string;             // Unique identifier
  name: string;           // Display name
  description: string;    // Description of what the upgrade does
  type: UpgradeType;      // Type of upgrade
  level: number;          // Current level of the upgrade (for multi-level upgrades)
  maxLevel: number;       // Maximum level this upgrade can reach (Infinity for unlimited)
  cost: ResourceCost;     // Cost to purchase/level up
  prerequisites?: string[]; // IDs of upgrades that must be purchased first
  unlocked: boolean;      // Whether the upgrade is visible to the player
  purchased: boolean;     // Whether the upgrade has been purchased
  effects: UpgradeEffect[]; // Effects this upgrade provides
  timestamp: string;      // When the upgrade was last updated
}

/**
 * Effect provided by an upgrade
 */
export interface UpgradeEffect {
  id: string;             // Unique identifier for the effect
  type: EffectType;       // Type of effect
  target: string;         // What the effect targets (resource ID, etc.)
  value: number;          // Value of the effect (multiplier, flat bonus, etc.)
  operation: EffectOperation; // How to apply the effect (add, multiply, etc.)
}

/**
 * Types of effects an upgrade can provide
 */
export enum EffectType {
  PRODUCTION_RATE = 'productionRate',  // Affects resource generation rate
  CAPACITY = 'capacity',               // Affects resource storage capacity
  EFFICIENCY = 'efficiency',           // Affects how efficiently resources are used
  UNLOCK = 'unlock',                   // Unlocks new content
  SPECIAL = 'special',                 // Special effects (custom logic)
}

/**
 * How the effect should be applied
 */
export enum EffectOperation {
  ADD = 'add',           // Add the value (flat bonus)
  MULTIPLY = 'multiply', // Multiply by the value (percentage bonus)
  SET = 'set',           // Set to the value (override)
}

/**
 * Specific properties for resource upgrades
 */
export interface ResourceUpgradeProperties extends UpgradeProperties {
  resourceType: ResourceType; // The resource this upgrade affects
  rateBonus?: number;        // Production rate bonus (if applicable)
  capacityBonus?: number;    // Capacity bonus (if applicable)
}

/**
 * Specific properties for unlock upgrades
 */
export interface UnlockUpgradeProperties extends UpgradeProperties {
  unlockType: string;        // Type of content being unlocked
  unlockKey: string;         // Key identifier of what's being unlocked
}

/**
 * Specific properties for effect upgrades
 */
export interface EffectUpgradeProperties extends UpgradeProperties {
  duration?: number;         // Duration of effect in seconds (undefined = permanent)
  cooldown?: number;         // Cooldown before can be used again (for active effects)
  isActive?: boolean;        // Whether this is an active effect that must be triggered
}

/**
 * Interface for upgrade management
 */
export interface UpgradeRegistry {
  getUpgrade(id: string): Upgrade | undefined;
  getAllUpgrades(): Upgrade[];
  getUpgradesByType(type: UpgradeType): Upgrade[];
  registerUpgrade(upgrade: Upgrade): void;
  removeUpgrade(id: string): boolean;
  getAvailableUpgrades(): Upgrade[];
  getPurchasedUpgrades(): Upgrade[];
  updateUpgradeAvailability(): void;
  applyAllUpgradeEffects(): void;
  cleanup(): void;
}

/**
 * Interface for an upgrade
 */
export interface Upgrade<T extends UpgradeProperties = UpgradeProperties> {
  properties: T;
  
  /**
   * Get the cost to purchase/level up this upgrade
   */
  getCost(): ResourceCost;
  
  /**
   * Get the effects this upgrade provides
   */
  getEffects(): UpgradeEffect[];
  
  /**
   * Check if this upgrade can be purchased
   */
  canPurchase(availableResources: Record<string, number>): boolean;
  
  /**
   * Purchase this upgrade
   */
  purchase(): CommandResult;
  
  /**
   * Apply the effects of this upgrade
   */
  applyEffects(): void;
  
  /**
   * Check if this upgrade is unlocked (visible to the player)
   */
  isUnlocked(): boolean;
  
  /**
   * Check if this upgrade has been purchased
   */
  isPurchased(): boolean;
  
  /**
   * Check if the upgrade has met its prerequisites
   */
  hasMetPrerequisites(purchasedUpgrades: string[]): boolean;
  
  /**
   * Update upgrade properties
   */
  update(properties: Partial<T>): void;
} 