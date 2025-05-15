/**
 * useCrewQuarters Hook
 * 
 * A specialized hook that provides crew quarters functionality.
 * This hook uses the useGame hook internally and provides a more
 * focused API specifically for the crew quarters page.
 */

import { useState } from 'react';
import { useGame } from './useGame';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import {
  getAwakeningStageText,
  getRandomAwakeningFlavor,
  formatCrewCount,
  calculateAwakeningProgressWidth,
  formatTemplate
} from '../utils/crewUtils';
import { CrewQuartersConstants, AutomationConstants } from '../config/gameConstants';
import { CrewQuartersTexts } from '../content/texts';
import { formatResourceCosts } from '../utils/formattingUtils';
import { ResourceCost } from '../types/combat';
import { getCategoryEntity } from 'core/ecs/selectors';
import { ResourceStorage, Generator, Upgradable } from '../components/interfaces';

/**
 * Hook for accessing and manipulating crew quarters data
 */
export function useCrewQuarters() {
  const { state, dispatchAction } = useGame();
  const [awakeningFlavor, setAwakeningFlavor] = useState("");
  
  // Create an instance of UpgradeSystem for cost calculations
  const upgradeSystem = new UpgradeSystem();
  
  const entity = getCategoryEntity(state.world, 'crewQuarters');
  const storage = entity?.get<ResourceStorage>('ResourceStorage');
  const generator = entity?.get<Generator>('Generator');
  const quartersUpg = entity?.get<Upgradable>('crew:quartersExpansion');
  const workerCrewsUpg = entity?.get<Upgradable>('crew:workerCrews');

  const crew = storage?.current ?? 0;
  const crewCapacity = storage?.capacity ?? CrewQuartersConstants.BASE_CREW_CAPACITY;
  const crewPerSecond = generator?.ratePerSecond ?? 0;
  const awakeningProgress = 0; // placeholder until CrewAwakening component exists

  // Need reactor energy state for manual awaken
  const reactorEntity = getCategoryEntity(state.world, 'reactor');
  const reactorStorage = reactorEntity?.get<ResourceStorage>('ResourceStorage');
  const currentEnergy = reactorStorage?.current ?? 0;

  // Upgrades Data
  const workerCrews = workerCrewsUpg?.level ?? 0;
  const workerCrewCosts = upgradeSystem.calculateWorkerCrewCost(workerCrews);
  const workerCrewCost = formatResourceCosts(workerCrewCosts);
  const workerCrewDescription = "Increases automatic Crew awakening rate."; // Placeholder
  const canUpgradeWorkerCrews = upgradeSystem.canAffordUpgrade(state, workerCrewCosts);

  const additionalQuarters = quartersUpg?.level ?? 0;
  const quarterCosts = upgradeSystem.calculateQuartersCost(additionalQuarters, crewCapacity);
  const quarterCost = formatResourceCosts(quarterCosts);
  const quarterDescription = "Increases Crew capacity."; // Placeholder
  const canUpgradeQuarters = upgradeSystem.canAffordUpgrade(state, quarterCosts);

  // Active automation
  const activeWorkerCrews = generator?.active ? workerCrews : 0;
  const canIncreaseCrews = activeWorkerCrews < workerCrews;
  const canDecreaseCrews = activeWorkerCrews > 0;

  // Check if manual awakening is possible based on crew capacity AND energy
  const canAwaken = crew < crewCapacity;
  const canAwakenWithEnergy = canAwaken && currentEnergy >= AutomationConstants.ENERGY_COST_PER_CLICK;

  // Max limits
  const maxWorkerCrews = upgradeSystem.getMaxWorkerCrews();

  // Formatted costs for UI reuse
  const formattedQuartersCost = quarterCost;
  const formattedWorkerCrewCost = workerCrewCost;
  
  // Calculate what capacity would be after purchasing quarters upgrade
  const newCapacityAfterUpgrade = crewCapacity + CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE;
  
  // Generate crew on manual click (awakening)
  const awakenCrew = () => {
    // Check energy and capacity before dispatching
    if (!canAwakenWithEnergy) return;
    
    Logger.debug(
      LogCategory.UI, 
      'Awaken crew button clicked', 
      LogContext.CREW_LIFECYCLE
    );
    
    // Set a random flavor text when clicked
    const randomFlavor = getRandomAwakeningFlavor();
    setAwakeningFlavor(randomFlavor);
    
    if (entity) {
      dispatchAction('action:resource_click', { entityId: entity.id, amount: 1 });
    }
  };
  
  // Upgrade crew capacity
  const upgradeQuarters = () => {
    // Check costs using UpgradeSystem's public method
    if (!upgradeSystem.canAffordUpgrade(state, quarterCosts)) return; 
    
    Logger.debug(
      LogCategory.UI, 
      'Upgrade crew quarters clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
    );
    
    if (entity) {
      dispatchAction('action:purchase_upgrade', { entityId: entity.id, upgradeId: 'crew:quartersExpansion' });
    }
  };
  
  // Upgrade auto awakening
  const upgradeWorkerCrews = () => {
    // Check costs using UpgradeSystem's public method
    if (canUpgradeWorkerCrews) {
      Logger.debug(
        LogCategory.UI, 
        'Upgrade worker crews clicked', 
        [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
      );
      
      if (entity) {
        dispatchAction('action:purchase_upgrade', { entityId: entity.id, upgradeId: 'crew:workerCrews' });
      }
    }
  };
  
  // Get descriptions with proper values inserted
  const getAdditionalQuartersDescription = () => {
    return formatTemplate(
      CrewQuartersTexts.upgradeDescriptions.additionalQuarters,
      CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE,
      newCapacityAfterUpgrade
    );
  };
  
  const getWorkerCrewsDescription = () => {
    return formatTemplate(
      CrewQuartersTexts.upgradeDescriptions.workerCrews,
      CrewQuartersConstants.WORKER_CREW_PRODUCTION_RATE.toFixed(1)
    );
  };
  
  // Actions
  const adjustActiveCrews = (direction: 'increase' | 'decrease') => {
    if (entity) {
      dispatchAction('action:adjust_automation', { entityId: entity.id, automationType: 'workerCrews', direction });
    }
  };
  
  // Return all the data and functions needed by the crew quarters page
  return {
    crew,
    crewCapacity,
    crewPerSecond,
    awakeningProgress,
    workerCrews,
    workerCrewCost,
    workerCrewDescription,
    canUpgradeWorkerCrews,
    additionalQuarters,
    quarterCost,
    quarterDescription,
    activeWorkerCrews,
    canIncreaseCrews,
    canDecreaseCrews,
    awakenCrew,
    upgradeWorkerCrews,
    upgradeQuarters,
    adjustActiveCrews,
    
    // Utilities
    canAwaken: canAwakenWithEnergy,
    canUpgradeQuarters
  };
} 