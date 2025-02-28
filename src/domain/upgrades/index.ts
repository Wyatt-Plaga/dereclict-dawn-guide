/**
 * Upgrades Domain
 * 
 * This module contains all upgrade-related models, interfaces, and services.
 */

// Interfaces
export * from './interfaces/UpgradeInterfaces';

// Models
export { BaseUpgrade } from './models/BaseUpgrade';
export { ResourceUpgrade } from './models/ResourceUpgrade';
export { UnlockUpgrade } from './models/UnlockUpgrade';
export { EffectUpgrade } from './models/EffectUpgrade';

// Services
export { UpgradeManager } from './services/UpgradeManager'; 