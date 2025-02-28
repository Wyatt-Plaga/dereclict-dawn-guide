/**
 * Resources Domain
 * Export all public interfaces, models, and services
 */

// Models
export type { Resource, ResourceProperties, ResourceCost, ResourceRegistry } from './models/ResourceInterfaces';
export { BaseResource } from './models/BaseResource';
export { EnergyResource } from './models/EnergyResource';

// Services
export { ResourceManager } from './services/ResourceManager'; 