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
  calculateAwakeningProgressWidth
} from '../utils/crewUtils';
import { CrewQuartersConstants } from '../config/gameConstants';
import { CrewQuartersTexts } from '../content/texts';
import { formatTemplate } from '../utils/crewUtils';
import { formatResourceCosts } from '../utils/formattingUtils';
import { ResourceCost } from '../types/combat';
import { AutomationConstants } from '../config/gameConstants';

/**
 * Hook for accessing and manipulating crew quarters data
 */
export function useCrewQuarters() {
  const { state, dispatch } = useGame();
  const [awakeningFlavor, setAwakeningFlavor] = useState("");
  
  // Create an instance of UpgradeSystem for cost calculations
  const upgradeSystem = new UpgradeSystem();
  
  // Get crew quarters data from game state
  const crewQuarters = state.categories.crewQuarters || {
    resources: { crew: 0 },
    stats: { 
      crewCapacity: 5, 
      crewPerSecond: 0, 
      awakeningProgress: 0, 
      activeWorkerCrews: 0 
    },
    upgrades: { additionalQuarters: 0, workerCrews: 0 },
  };

  const { crew } = crewQuarters.resources;
  const { crewCapacity, crewPerSecond, awakeningProgress } = crewQuarters.stats;
  
  // Need reactor energy state for checks
  const currentEnergy = state.categories.reactor?.resources?.energy ?? 0;
  
  // Upgrades Data
  const workerCrews = crewQuarters.upgrades.workerCrews;
  const workerCrewCosts = upgradeSystem.calculateWorkerCrewCost(workerCrews);
  const workerCrewCost = formatResourceCosts(workerCrewCosts);
  const workerCrewDescription = "Increases automatic Crew awakening rate."; // Placeholder
  const canUpgradeWorkerCrews = upgradeSystem.canAffordUpgrade(state, workerCrewCosts);

  const additionalQuarters = crewQuarters.upgrades.additionalQuarters;
  const quarterCosts = upgradeSystem.calculateQuartersCost(additionalQuarters, crewCapacity);
  const quarterCost = formatResourceCosts(quarterCosts);
  const quarterDescription = "Increases Crew capacity."; // Placeholder
  const canUpgradeQuarters = upgradeSystem.canAffordUpgrade(state, quarterCosts);

  // Active automation
  const activeWorkerCrews = crewQuarters.stats.activeWorkerCrews ?? 0;
  const canIncreaseCrews = activeWorkerCrews < workerCrews;
  const canDecreaseCrews = activeWorkerCrews > 0;

  // Check if manual awakening is possible based on crew capacity AND energy
  const canAwaken = crew < crewCapacity;
  const canAwakenWithEnergy = canAwaken && currentEnergy >= AutomationConstants.ENERGY_COST_PER_CLICK;

  // Calculate upgrade costs (returns ResourceCost[])
  const quartersCostArray = upgradeSystem.calculateQuartersCost(crewQuarters.upgrades.additionalQuarters, crewCapacity);
  const workerCrewCostArray = upgradeSystem.calculateWorkerCrewCost(crewQuarters.upgrades.workerCrews);
  const maxWorkerCrews = upgradeSystem.getMaxWorkerCrews();

  // Format costs for display
  const formattedQuartersCost = formatResourceCosts(quartersCostArray);
  const formattedWorkerCrewCost = formatResourceCosts(workerCrewCostArray);
  
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
    
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: {
        category: 'crewQuarters'
      }
    });
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
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'crewQuarters',
        upgradeType: 'additionalQuarters'
      }
    });
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
      
      dispatch({
        type: 'PURCHASE_UPGRADE',
        payload: {
          category: 'crewQuarters',
          upgradeType: 'workerCrews'
        }
      });
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
    dispatch({
      type: 'ADJUST_AUTOMATION',
      payload: {
        category: 'crewQuarters',
        automationType: 'workerCrews',
        direction,
      },
    });
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
    canUpgradeQuarters,
    activeWorkerCrews,
    canIncreaseCrews,
    canDecreaseCrews,
    awakenCrew,
    upgradeWorkerCrews,
    upgradeQuarters,
    adjustActiveCrews,
    
    // Utilities
    canAwaken: canAwakenWithEnergy,
    canUpgradeQuarters,
    canUpgradeWorkerCrews
  };
} 