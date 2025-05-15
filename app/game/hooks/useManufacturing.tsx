import { useGame } from './useGame';
import { useGameBus } from './useGameBus';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ResourceCost } from '../types/combat';
import { AutomationConstants, ManufacturingConstants } from '../config/gameConstants';
import { getCategoryEntity } from 'core/ecs/selectors';
import { ResourceStorage, Generator, Upgradable } from '../components/interfaces';

// Helper to format resource costs
const formatResourceCosts = (costs: ResourceCost[]): string => {
  if (!costs || costs.length === 0) return 'Free';
  return costs.map(c => `${c.amount.toFixed(0)} ${c.type}`).join(', ');
};

export const useManufacturing = () => {
  const { state } = useGame();
  const bus = useGameBus();
  const upgradeSystem = new UpgradeSystem();

  const entity = getCategoryEntity(state.world, 'manufacturing');
  const storage = entity?.get<ResourceStorage>('ResourceStorage');
  const generator = entity?.get<Generator>('Generator');
  const expansionsUpg = entity?.get<Upgradable>('manufacturing:expansions');
  const baysUpg = entity?.get<Upgradable>('manufacturing:bays');

  const scrap = storage?.current ?? 0;
  const scrapCapacity = storage?.capacity ?? ManufacturingConstants.BASE_SCRAP_CAPACITY;
  const scrapPerSecond = generator?.ratePerSecond ?? 0;

  // Need reactor energy
  const reactorEntity = getCategoryEntity(state.world, 'reactor');
  const reactorStorage = reactorEntity?.get<ResourceStorage>('ResourceStorage');
  const currentEnergy = reactorStorage?.current ?? 0;

  const manufacturingBays = baysUpg?.level ?? 0;
  const bayCosts = upgradeSystem.calculateManufacturingBayCost(manufacturingBays);
  const bayCost = formatResourceCosts(bayCosts);
  const bayDescription = "Increases automatic Scrap collection rate."; // Placeholder
  const canUpgradeBays = upgradeSystem.canAffordUpgrade(state, bayCosts);

  const cargoHoldExpansions = expansionsUpg?.level ?? 0;
  const expansionCosts = upgradeSystem.calculateCargoHoldExpansionCost(cargoHoldExpansions, scrapCapacity);
  const expansionCost = formatResourceCosts(expansionCosts);
  const expansionDescription = "Increases Scrap storage capacity."; // Placeholder
  const canUpgradeExpansions = upgradeSystem.canAffordUpgrade(state, expansionCosts);

  const activeManufacturingBays = generator?.active ? manufacturingBays : 0;
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
      bus.emit('purchaseUpgrade', { state, category: 'manufacturing', upgradeType: 'manufacturingBays' });
    }
  };

  const upgradeCargoHoldExpansions = () => {
    if (canUpgradeExpansions) {
      bus.emit('purchaseUpgrade', { state, category: 'manufacturing', upgradeType: 'cargoHoldExpansions' });
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