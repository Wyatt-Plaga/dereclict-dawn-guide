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

/**
 * Hook for accessing and manipulating crew quarters data
 */
export function useCrewQuarters() {
  const { state, dispatch } = useGame();
  const [awakeningFlavor, setAwakeningFlavor] = useState("");
  
  // Create an instance of UpgradeSystem for cost calculations
  const upgradeSystem = new UpgradeSystem();
  
  // Get crew quarters data from game state
  const crewQuarters = state.categories.crewQuarters;
  const { crew } = crewQuarters.resources;
  const { crewCapacity, crewPerSecond, awakeningProgress } = crewQuarters.stats;
  
  // Calculate upgrade costs
  const quartersCost = upgradeSystem.calculateQuartersCost(crewCapacity);
  const workerCrewCost = upgradeSystem.calculateWorkerCrewCost(crewQuarters.upgrades.workerCrews);
  const maxWorkerCrews = upgradeSystem.getMaxWorkerCrews();
  
  // Calculate what capacity would be after purchasing quarters upgrade
  const newCapacityAfterUpgrade = crewCapacity + CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE;
  
  // Generate crew on manual click (awakening)
  const awakenCrew = () => {
    if (crew >= crewCapacity) return;
    
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
    if (crew < quartersCost) return;
    
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
    if (crew < workerCrewCost || crewQuarters.upgrades.workerCrews >= maxWorkerCrews) return;
    
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
  
  // Return all the data and functions needed by the crew quarters page
  return {
    // State
    crew,
    crewCapacity,
    crewPerSecond,
    awakeningProgress,
    awakeningFlavor,
    quartersCost,
    workerCrewCost,
    workerCrewLevel: crewQuarters.upgrades.workerCrews,
    quartersLevel: crewQuarters.upgrades.additionalQuarters,
    maxWorkerCrews,
    
    // UI helpers
    awakeningStageText: getAwakeningStageText(awakeningProgress),
    formattedCrewCount: formatCrewCount(crew),
    calculateAwakeningProgressWidth: () => calculateAwakeningProgressWidth(crew, crewCapacity, awakeningProgress),
    additionalQuartersDescription: getAdditionalQuartersDescription(),
    workerCrewsDescription: getWorkerCrewsDescription(),
    texts: CrewQuartersTexts.ui,
    
    // Actions
    awakenCrew,
    upgradeQuarters,
    upgradeWorkerCrews,
    
    // Utilities
    canAwaken: crew < crewCapacity,
    canUpgradeQuarters: crew >= quartersCost,
    canUpgradeWorkerCrews: crew >= workerCrewCost && crewQuarters.upgrades.workerCrews < maxWorkerCrews
  };
} 