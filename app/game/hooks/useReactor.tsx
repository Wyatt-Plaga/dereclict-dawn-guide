/**
 * useReactor Hook
 * 
 * Provides reactor-specific functionality and state management.
 */

import { useGame } from './useGame';
import { useGameBus } from './useGameBus';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { formatResourceCosts } from '../utils/formattingUtils';
import { ReactorTexts } from '../content/texts';

export function useReactor() {
  const { state, dispatch } = useGame();
  const bus = useGameBus();
  
  const upgradeSystem = new UpgradeSystem();
  
  const reactor = state.categories.reactor;
  const { energy } = reactor.resources;
  const activeEnergyConverters = reactor.stats.activeEnergyConverters ?? 0;
  const { energyCapacity, energyPerSecond } = reactor.stats;
  const { reactorExpansions, energyConverters } = reactor.upgrades;

  // Calculate costs
  const expansionCostArray = upgradeSystem.calculateReactorExpansionCost(reactorExpansions, energyCapacity);
  const converterCostArray = upgradeSystem.calculateEnergyConverterCost(energyConverters);

  // Format costs
  const formattedExpansionCost = formatResourceCosts(expansionCostArray);
  const formattedConverterCost = formatResourceCosts(converterCostArray);

  // Manual energy generation
  const generateEnergy = () => {
    if (energy >= energyCapacity) return;
    Logger.debug(LogCategory.UI, 'Generate energy button clicked', LogContext.REACTOR_LIFECYCLE);
    bus.emit('resourceClick', { state, category: 'reactor' });
  };

  // Upgrade actions
  const upgradeExpansions = () => {
    if (!upgradeSystem.canAffordUpgrade(state, expansionCostArray)) return;
    Logger.debug(LogCategory.UI, 'Upgrade reactor expansions clicked', [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]);
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'reactor', upgradeType: 'reactorExpansions' } });
  };

  const upgradeConverters = () => {
    if (!upgradeSystem.canAffordUpgrade(state, converterCostArray)) return;
    Logger.debug(LogCategory.UI, 'Upgrade energy converters clicked', [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]);
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'reactor', upgradeType: 'energyConverters' } });
  };

  // --- Adjustable Automation Logic ---
  const adjustActiveConverters = (direction: 'increase' | 'decrease') => {
    Logger.debug(LogCategory.UI, `Adjust active converters: ${direction}`, LogContext.REACTOR_LIFECYCLE);
    bus.emit('adjustAutomation', {
      state,
      category: 'reactor',
      automationType: 'energyConverters',
      direction,
    });
  };

  const canIncreaseConverters = activeEnergyConverters < energyConverters;
  const canDecreaseConverters = activeEnergyConverters > 0;
  // --- End Adjustable Automation Logic ---

  // --- Removed Logging ---
  // console.log(
  //  `[useReactor Hook] Values Check: active=${activeEnergyConverters} (type: ${typeof activeEnergyConverters}), total=${energyConverters} (type: ${typeof energyConverters}), canDec=${canDecreaseConverters}, canInc=${canIncreaseConverters}`
  // );
  // --- End Logging ---

  return {
    // State
    energy,
    energyCapacity,
    energyPerSecond,
    reactorExpansions,
    energyConverters, // Total purchased
    activeEnergyConverters, // Currently active

    // Costs
    expansionCost: formattedExpansionCost,
    converterCost: formattedConverterCost,

    // Descriptions (Rely on fallbacks for now)
    expansionDescription: "Increase max energy storage.", 
    converterDescription: "Automatically generate energy.",
    texts: ReactorTexts, // Keep passing this for other potential texts

    // Actions
    generateEnergy,
    upgradeExpansions,
    upgradeConverters,
    adjustActiveConverters, // Added action

    // Utilities
    canGenerate: energy < energyCapacity,
    canUpgradeExpansions: upgradeSystem.canAffordUpgrade(state, expansionCostArray),
    canUpgradeConverters: upgradeSystem.canAffordUpgrade(state, converterCostArray),
    canIncreaseConverters, // Added utility
    canDecreaseConverters, // Added utility
    formattedEnergy: energy,
    formattedCapacity: energyCapacity
  };
} 