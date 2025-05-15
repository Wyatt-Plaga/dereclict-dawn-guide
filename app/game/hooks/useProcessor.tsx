import { useGame } from './useGame';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ResourceCost } from '../types/combat';
import { AutomationConstants, ProcessorConstants } from '../config/gameConstants';
import { getCategoryEntity } from 'core/ecs/selectors';
import { ResourceStorage, Generator, Upgradable } from '../components/interfaces';

// Helper to format resource costs
const formatResourceCosts = (costs: ResourceCost[]): string => {
  if (!costs || costs.length === 0) return 'Free';
  return costs.map(c => `${c.amount.toFixed(0)} ${c.type}`).join(', ');
};

export const useProcessor = () => {
  const { state, dispatchAction } = useGame();
  const upgradeSystem = new UpgradeSystem();

  const entity = getCategoryEntity(state.world, 'processor');
  const storage = entity?.get<ResourceStorage>('ResourceStorage');
  const generator = entity?.get<Generator>('Generator');
  const threadsUpg = entity?.get<Upgradable>('processor:threads');
  const expansionsUpg = entity?.get<Upgradable>('processor:expansions');

  const insight = storage?.current ?? 0;
  const insightCapacity = storage?.capacity ?? 0;
  const insightPerClick = ProcessorConstants.INSIGHT_PER_CLICK;
  const insightPerSecond = generator?.ratePerSecond ?? 0;

  const processingThreads = threadsUpg?.level ?? 0;
  const threadCosts = upgradeSystem.calculateProcessingThreadCost(processingThreads);
  const threadCost = formatResourceCosts(threadCosts);
  const threadDescription = "Increases automatic Insight generation.";
  const canUpgradeThreads = upgradeSystem.canAffordUpgrade(state, threadCosts);

  const dataBuffers = expansionsUpg?.level ?? 0;
  const bufferCosts = upgradeSystem.calculateMainframeExpansionCost(dataBuffers, insightCapacity);
  const bufferCost = formatResourceCosts(bufferCosts);
  const bufferDescription = "Increases Insight storage capacity.";
  const canUpgradeBuffers = upgradeSystem.canAffordUpgrade(state, bufferCosts);

  const activeProcessingThreads = generator?.active ? processingThreads : 0;
  const canIncreaseThreads = activeProcessingThreads < processingThreads;
  const canDecreaseThreads = activeProcessingThreads > 0;

  const reactorEntity = getCategoryEntity(state.world, 'reactor');
  const reactorStorage = reactorEntity?.get<ResourceStorage>('ResourceStorage');
  const currentEnergy = reactorStorage?.current ?? 0;
  const canGenerateWithEnergy = currentEnergy >= AutomationConstants.ENERGY_COST_PER_CLICK;

  const generateInsight = () => {
    if (!canGenerateWithEnergy) return; 
    
    if (entity) {
      dispatchAction('action:resource_click', { entityId: entity.id, amount: 1 });
    }
  };

  const upgradeThreads = () => {
    if (canUpgradeThreads) {
      if (entity) {
        dispatchAction('action:purchase_upgrade', { entityId: entity.id, upgradeId: 'processor:threads' });
      }
    }
  };

  const upgradeBuffers = () => {
    if (canUpgradeBuffers) {
      if (entity) {
        dispatchAction('action:purchase_upgrade', { entityId: entity.id, upgradeId: 'processor:expansions' });
      }
    }
  };

  const adjustActiveThreads = (direction: 'increase' | 'decrease') => {
    if (entity) {
      dispatchAction('action:adjust_automation', { entityId: entity.id, automationType: 'processingThreads', direction });
    }
  };

  return {
    insight,
    insightCapacity,
    insightPerClick,
    insightPerSecond,
    processingThreads,
    threadCost,
    threadDescription,
    canUpgradeThreads,
    dataBuffers,
    bufferCost,
    bufferDescription,
    canUpgradeBuffers,
    activeProcessingThreads,
    canIncreaseThreads,
    canDecreaseThreads,
    canGenerateWithEnergy,
    generateInsight,
    upgradeThreads,
    upgradeBuffers,
    adjustActiveThreads,
  };
}; 