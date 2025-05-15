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
import { getCategoryEntity } from 'core/ecs/selectors';
import { ResourceStorage, Upgradable, Generator } from '../components/interfaces';

export function useReactor() {
  const { state } = useGame();
  const bus = useGameBus();
  const { dispatchAction } = useGame();
  
  const upgradeSystem = new UpgradeSystem();
  
  const entity = getCategoryEntity(state.world, 'reactor');
  const storage = entity?.get<ResourceStorage>('ResourceStorage');
  const generator = entity?.get<Generator>('Generator');
  const expansions = entity?.get<Upgradable>('reactor:expansions');
  const converters = entity?.get<Upgradable>('reactor:converters');

  const energy = storage?.current ?? 0;
  const energyCapacity = storage?.capacity ?? 0;
  const energyPerSecond = generator?.ratePerSecond ?? 0;
  const reactorExpansions = expansions?.level ?? 0;
  const energyConverters = converters?.level ?? 0;
  const activeEnergyConverters = generator?.active ? energyConverters : 0;

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
    if (entity) {
      // Prefer new namespaced action
      dispatchAction('action:resource_click', { entityId: entity.id, amount: 1 });
    } else {
      // Fallback to legacy event for safety
      bus.emit('resourceClick', { state, category: 'reactor' });
    }
  };

  // Upgrade actions
  const upgradeExpansions = () => {
    if (!upgradeSystem.canAffordUpgrade(state, expansionCostArray)) return;
    Logger.debug(LogCategory.UI, 'Upgrade reactor expansions clicked', [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]);
    bus.emit('purchaseUpgrade', { state, category: 'reactor', upgradeType: 'reactorExpansions' });
  };

  const upgradeConverters = () => {
    if (!upgradeSystem.canAffordUpgrade(state, converterCostArray)) return;
    Logger.debug(LogCategory.UI, 'Upgrade energy converters clicked', [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]);
    bus.emit('purchaseUpgrade', { state, category: 'reactor', upgradeType: 'energyConverters' });
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