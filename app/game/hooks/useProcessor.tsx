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

export const useProcessor = () => {
  const { state, dispatch } = useGame();
  const bus = useGameBus();
  const upgradeSystem = new UpgradeSystem();

  // Ensure processor data exists, provide defaults if not
  const processor = state.categories.processor || {
    resources: { insight: 0 },
    stats: { 
      insightCapacity: 10, 
      insightPerClick: 0.5, 
      insightPerSecond: 0,
      activeProcessingThreads: 0 
    },
    upgrades: { mainframeExpansions: 0, processingThreads: 0 },
  };

  const insight = processor.resources.insight;
  const insightCapacity = processor.stats.insightCapacity;
  const insightPerClick = processor.stats.insightPerClick;
  const insightPerSecond = processor.stats.insightPerSecond;
  
  // Need reactor energy state for checks
  const currentEnergy = state.categories.reactor?.resources?.energy ?? 0;
  
  // Upgrades Data
  const processingThreads = processor.upgrades.processingThreads;
  const threadCosts = upgradeSystem.calculateProcessingThreadCost(processingThreads);
  const threadCost = formatResourceCosts(threadCosts);
  const threadDescription = "Increases automatic Insight generation.";
  const canUpgradeThreads = upgradeSystem.canAffordUpgrade(state, threadCosts);

  const dataBuffers = processor.upgrades.mainframeExpansions;
  const bufferCosts = upgradeSystem.calculateMainframeExpansionCost(dataBuffers, insightCapacity);
  const bufferCost = formatResourceCosts(bufferCosts);
  const bufferDescription = "Increases Insight storage capacity.";
  const canUpgradeBuffers = upgradeSystem.canAffordUpgrade(state, bufferCosts);

  // Active automation
  const activeProcessingThreads = processor.stats.activeProcessingThreads ?? 0;
  const canIncreaseThreads = activeProcessingThreads < processingThreads;
  const canDecreaseThreads = activeProcessingThreads > 0;

  // Check if manual generation is possible based on energy
  const canGenerateWithEnergy = currentEnergy >= AutomationConstants.ENERGY_COST_PER_CLICK;

  // Actions
  const generateInsight = () => {
    // Check energy before dispatching
    if (!canGenerateWithEnergy) return; 
    
    bus.emit('resourceClick', { state, category: 'processor' });
    // Note: Energy consumption for clicks will be handled in ActionSystem
  };

  const upgradeThreads = () => {
    if (canUpgradeThreads) {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'processor', upgradeType: 'processingThreads' } });
    }
  };

  const upgradeBuffers = () => {
    if (canUpgradeBuffers) {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'processor', upgradeType: 'mainframeExpansions' } });
    }
  };

  const adjustActiveThreads = (direction: 'increase' | 'decrease') => {
    bus.emit('adjustAutomation', {
      state,
      category: 'processor',
      automationType: 'processingThreads',
      direction,
    });
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