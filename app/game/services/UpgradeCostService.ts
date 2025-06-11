/**
 * UpgradeCostService
 * 
 * Centralized service for calculating upgrade costs.
 * This breaks the circular dependency between ResourceSystem and UpgradeSystem.
 */

import { UpgradeKey, Upgradable, ResourceStorage } from '../components/interfaces';
import { ResourceCost } from '../types/combat';
import { 
  ReactorConstants, 
  ProcessorConstants, 
  CrewQuartersConstants, 
  ManufacturingConstants 
} from '../config/gameConstants';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

export class UpgradeCostService {
  /**
   * Get resource costs for a specific upgrade
   * 
   * @param upgradeKey - The namespaced upgrade identifier
   * @param upgradable - The upgradable component with current level
   * @param storage - Optional resource storage for capacity-based calculations
   * @returns Array of resource costs required for the upgrade
   */
  static getCostsFor(
    upgradeKey: UpgradeKey,
    upgradable: Upgradable,
    storage?: ResourceStorage
  ): ResourceCost[] {
    switch (upgradeKey) {
      case 'reactor:expansions':
        return this.calculateReactorExpansionCost(upgradable.level, storage?.capacity ?? 0);
      case 'reactor:converters':
        return this.calculateEnergyConverterCost(upgradable.level);
      case 'processor:expansions':
        return this.calculateMainframeExpansionCost(upgradable.level, storage?.capacity ?? 0);
      case 'processor:threads':
        return this.calculateProcessingThreadCost(upgradable.level);
      case 'crew:quartersExpansion':
        return this.calculateQuartersCost(upgradable.level, storage?.capacity ?? 0);
      case 'crew:workerCrews':
        return this.calculateWorkerCrewCost(upgradable.level);
      case 'manufacturing:expansions':
        return this.calculateCargoHoldExpansionCost(upgradable.level, storage?.capacity ?? 0);
      case 'manufacturing:bays':
        return this.calculateManufacturingBayCost(upgradable.level);
      default:
        Logger.warn(
          LogCategory.UPGRADES,
          `Unknown upgrade key: ${upgradeKey}`,
          LogContext.UPGRADE_PURCHASE
        );
        return [];
    }
  }

  private static calculateReactorExpansionCost(currentLevel: number, energyCapacity: number): ResourceCost[] {
    const baseEnergyCost = energyCapacity * ReactorConstants.EXPANSION_COST_MULTIPLIER;
    const costs: ResourceCost[] = [
      { type: 'energy', amount: Math.floor(baseEnergyCost) }
    ];

    if (currentLevel >= 4) {
      const componentCost = Math.floor(Math.pow(1.5, currentLevel - 3));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }

    return costs;
  }

  private static calculateEnergyConverterCost(currentConverters: number): ResourceCost[] {
    const baseEnergyCost = (currentConverters + 1) * ReactorConstants.CONVERTER_COST_BASE;
    return [{ type: 'energy', amount: baseEnergyCost }];
  }

  private static calculateMainframeExpansionCost(currentLevel: number, insightCapacity: number): ResourceCost[] {
    const baseInsightCost = insightCapacity * ProcessorConstants.EXPANSION_COST_MULTIPLIER;
    const costs: ResourceCost[] = [
      { type: 'insight', amount: Math.floor(baseInsightCost) }
    ];

    if (currentLevel >= 4) {
      const componentCost = Math.floor(Math.pow(1.4, currentLevel - 2));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  private static calculateProcessingThreadCost(currentThreads: number): ResourceCost[] {
    const baseInsightCost = (currentThreads + 1) * ProcessorConstants.THREAD_COST_BASE;
    const costs: ResourceCost[] = [
      { type: 'insight', amount: baseInsightCost }
    ];

    if (currentThreads >= 2) {
      const componentCost = Math.floor(Math.pow(1.7, currentThreads));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  private static calculateQuartersCost(currentLevel: number, crewCapacity: number): ResourceCost[] {
    const baseCrewCost = Math.floor(crewCapacity * CrewQuartersConstants.QUARTERS_COST_MULTIPLIER);
    const costs: ResourceCost[] = [
      { type: 'crew', amount: baseCrewCost }
    ];

    if (currentLevel >= 2) {
      const componentCost = Math.floor(Math.pow(1.3, currentLevel));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  private static calculateWorkerCrewCost(currentWorkerCrews: number): ResourceCost[] {
    const baseCrewCost = Math.floor((currentWorkerCrews + 1) * CrewQuartersConstants.WORKER_CREW_COST_BASE);
    const costs: ResourceCost[] = [
      { type: 'crew', amount: baseCrewCost }
    ];

    if (currentWorkerCrews >= 1) {
      const componentCost = Math.floor(Math.pow(1.8, currentWorkerCrews));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  private static calculateCargoHoldExpansionCost(currentLevel: number, scrapCapacity: number): ResourceCost[] {
    const baseScrapCost = Math.floor(scrapCapacity * ManufacturingConstants.EXPANSION_COST_MULTIPLIER);
    const costs: ResourceCost[] = [
      { type: 'scrap', amount: baseScrapCost }
    ];

    if (currentLevel >= 5) {
      const componentCost = Math.floor(Math.pow(1.2, currentLevel - 1));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }

  private static calculateManufacturingBayCost(currentBays: number): ResourceCost[] {
    const baseScrapCost = (currentBays + 1) * ManufacturingConstants.BAY_COST_BASE;
    const costs: ResourceCost[] = [
      { type: 'scrap', amount: baseScrapCost }
    ];

    if (currentBays >= 3) {
      const componentCost = Math.floor(Math.pow(1.9, currentBays - 1));
      costs.push({ type: 'combatComponents', amount: componentCost });
    }
    return costs;
  }
} 