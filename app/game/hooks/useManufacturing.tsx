import { useGame } from './useGame';
import { useGameBus } from './useGameBus';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ResourceCost } from '../types/combat';
import { AutomationConstants } from '../config/gameConstants';

// Helper to format resource costs
const formatResourceCosts = (costs: ResourceCost[]): string => {
  if (!costs || costs.length === 0) return 'Free';
  return costs.map(c => `${c.amount.toFixed(0)} ${c.type}`).join(', ');
};

export const useManufacturing = () => {
  const { state, dispatch } = useGame();
  const bus = useGameBus();
  const upgradeSystem = new UpgradeSystem();

  // Ensure manufacturing data exists, provide defaults if not
  const manufacturing = state.categories.manufacturing || {
    resources: { scrap: 0 },
    stats: { 
      scrapCapacity: 50, 
      scrapPerSecond: 0, 
      activeManufacturingBays: 0 
    },
    upgrades: { cargoHoldExpansions: 0, manufacturingBays: 0 },
  };

  const scrap = manufacturing.resources.scrap;
  const scrapCapacity = manufacturing.stats.scrapCapacity;
  const scrapPerSecond = manufacturing.stats.scrapPerSecond;
  
  // Need reactor energy state for checks
  const currentEnergy = state.categories.reactor?.resources?.energy ?? 0;
  
  // Upgrades Data
  const manufacturingBays = manufacturing.upgrades.manufacturingBays;
  const bayCosts = upgradeSystem.calculateManufacturingBayCost(manufacturingBays);
  const bayCost = formatResourceCosts(bayCosts);
  const bayDescription = "Increases automatic Scrap collection rate."; // Placeholder
  const canUpgradeBays = upgradeSystem.canAffordUpgrade(state, bayCosts);

  const cargoHoldExpansions = manufacturing.upgrades.cargoHoldExpansions;
  const expansionCosts = upgradeSystem.calculateCargoHoldExpansionCost(cargoHoldExpansions, scrapCapacity);
  const expansionCost = formatResourceCosts(expansionCosts);
  const expansionDescription = "Increases Scrap storage capacity."; // Placeholder
  const canUpgradeExpansions = upgradeSystem.canAffordUpgrade(state, expansionCosts);

  // Active automation
  const activeManufacturingBays = manufacturing.stats.activeManufacturingBays ?? 0;
  const canIncreaseBays = activeManufacturingBays < manufacturingBays;
  const canDecreaseBays = activeManufacturingBays > 0;

  // Check if manual collection is possible based on energy
  const canCollectWithEnergy = currentEnergy >= AutomationConstants.ENERGY_COST_PER_CLICK;

  // Actions
  const collectScrap = () => {
    // Check energy before dispatching
    if (!canCollectWithEnergy) return;
    
    bus.emit('resourceClick', { state, category: 'manufacturing' });
    // Note: Energy consumption for clicks will be handled in ActionSystem
  };

  const upgradeManufacturingBays = () => {
    if (canUpgradeBays) {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'manufacturing', upgradeType: 'manufacturingBays' } });
    }
  };

  const upgradeCargoHoldExpansions = () => {
    if (canUpgradeExpansions) {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'manufacturing', upgradeType: 'cargoHoldExpansions' } });
    }
  };

  const adjustActiveBays = (direction: 'increase' | 'decrease') => {
    bus.emit('adjustAutomation', {
      state,
      category: 'manufacturing',
      automationType: 'manufacturingBays',
      direction,
    });
  };

  return {
    scrap,
    scrapCapacity,
    scrapPerSecond,
    manufacturingBays,
    bayCost,
    bayDescription,
    canUpgradeBays,
    cargoHoldExpansions,
    expansionCost,
    expansionDescription,
    canUpgradeExpansions,
    activeManufacturingBays,
    canIncreaseBays,
    canDecreaseBays,
    canCollectWithEnergy,
    collectScrap,
    upgradeManufacturingBays,
    upgradeCargoHoldExpansions,
    adjustActiveBays,
  };
}; 