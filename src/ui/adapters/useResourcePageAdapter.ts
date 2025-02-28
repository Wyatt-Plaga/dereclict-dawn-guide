import { useEffect, useState } from 'react';
import { useResourcesAdapter } from './useResourcesAdapter';
import { useUpgradesAdapter } from './useUpgradesAdapter';
import { useLogsAdapter } from './useLogsAdapter';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useGameResources } from '../hooks/useGameResources';
import { ResourceUpgrade } from '@/components/resources/resource-page';

// Type definitions matching the ResourcePage component's expected props
type ResourceConfig = {
  resourceType: string;
  pageName: string;
  resourceIcon: React.ReactNode;
  resourceName: string;
  pageTitle: string;
  pageDescription: string;
  iconClassName: string;
  generateButtonLabel: string;
  manualGenerationAmount: number;
  autoGenerationLabel: string;
  autoGenerationMultiplier: number;
  generateResourceLabel: string;
  upgrades: ResourceUpgrade[];
  // Optional properties
  formatValue?: (value: number) => string;
  secondaryContent?: React.ReactNode;
  // Milestone-related properties
  milestones?: Array<{
    id: number;
    amount: number;
    title: string;
    description: string;
    unlockLogId?: number;
    unlockUpgradeId?: string;
  }>;
};

/**
 * Hook that adapts the ResourcePage component to work with the game engine
 * @param resourceConfig The configuration for the resource page
 * @param unlockLog Function to unlock a log in the old system
 * @param unlockUpgrade Function to unlock an upgrade in the old system
 */
export function useResourcePageAdapter(
  resourceConfig: ResourceConfig,
  unlockLog: (logId: number) => Promise<void> | void,
  unlockUpgrade: (upgradeId: string) => Promise<void> | void
) {
  const { game, initialized } = useGameEngine();
  const { addResource } = useGameResources();
  const [isLoading, setIsLoading] = useState(true);
  
  // Create adapters with the resource config data
  const resourcesAdapter = useResourcesAdapter([
    {
      id: resourceConfig.resourceType,
      name: resourceConfig.resourceName,
      description: resourceConfig.pageDescription,
      amount: 0, // Will be populated from game engine
      capacity: 100, // Default capacity
      rate: resourceConfig.autoGenerationMultiplier
    }
  ]);
  
  // Map the upgrades from the config to the format expected by the adapter
  const adapterUpgrades = resourceConfig.upgrades.map(upgrade => ({
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.getCost(1), // Initial cost
    resourceType: resourceConfig.resourceType,
    unlocked: false // Will be determined by the game engine
  }));
  
  const upgradesAdapter = useUpgradesAdapter(adapterUpgrades);
  
  // For logs, we need to extract log IDs from milestones if they exist
  const milestones = resourceConfig.milestones || [];
  const logIds = milestones
    .filter(m => m.unlockLogId !== undefined)
    .map(m => m.unlockLogId as number);
  
  // Dummy log entries array - in a real implementation you would fetch these from your data source
  const logEntries = Array(Math.max(...logIds, 0) + 1).fill(null).map((_, i) => ({
    id: i,
    title: `Log ${i}`,
    content: `Content for log ${i}`
  }));
  
  const logsAdapter = useLogsAdapter(logEntries, logIds);
  
  // Milestone tracking state
  const [unlockedMilestones, setUnlockedMilestones] = useState<Set<number>>(new Set());
  const [isCheckingMilestones, setIsCheckingMilestones] = useState(false);
  
  // Initialize the adapter
  useEffect(() => {
    if (!initialized || !game) return;
    
    // Once game is initialized and adapters have synced, set loading to false
    setIsLoading(false);
    
    console.log(`ResourcePageAdapter initialized for ${resourceConfig.resourceType}`);
  }, [initialized, game, resourceConfig.resourceType]);
  
  // Check milestones when resource amount changes
  useEffect(() => {
    if (isCheckingMilestones || isLoading || !milestones.length) return;
    
    const checkMilestones = async () => {
      setIsCheckingMilestones(true);
      
      try {
        const currentAmount = resourcesAdapter.getAmount(resourceConfig.resourceType);
        
        // Check each milestone
        for (const milestone of milestones) {
          // Skip already unlocked milestones
          if (unlockedMilestones.has(milestone.id)) continue;
          
          // Check if milestone is reached
          if (currentAmount >= milestone.amount) {
            console.log(`Milestone ${milestone.id} reached at ${milestone.amount} ${resourceConfig.resourceType}`);
            
            // Unlock log if specified
            if (milestone.unlockLogId !== undefined) {
              try {
                // Handle both Promise and non-Promise return types
                const result = unlockLog(milestone.unlockLogId);
                if (result instanceof Promise) {
                  await result;
                }
                console.log(`Log ${milestone.unlockLogId} unlocked by milestone ${milestone.id}`);
                
                // Create a log in the game engine
                logsAdapter.createEngineLog(
                  `Milestone reached: ${milestone.title}`, 
                  'LORE', 
                  'INFO'
                );
              } catch (error) {
                console.error(`Error unlocking log ${milestone.unlockLogId}:`, error);
              }
            }
            
            // Unlock upgrade if specified
            if (milestone.unlockUpgradeId !== undefined) {
              try {
                // Handle both Promise and non-Promise return types
                const result = unlockUpgrade(milestone.unlockUpgradeId);
                if (result instanceof Promise) {
                  await result;
                }
                console.log(`Upgrade ${milestone.unlockUpgradeId} unlocked by milestone ${milestone.id}`);
              } catch (error) {
                console.error(`Error unlocking upgrade ${milestone.unlockUpgradeId}:`, error);
              }
            }
            
            // Mark milestone as unlocked
            setUnlockedMilestones(prev => {
              const newSet = new Set(prev);
              newSet.add(milestone.id);
              return newSet;
            });
          }
        }
      } catch (error) {
        console.error('Error checking milestones:', error);
      } finally {
        setIsCheckingMilestones(false);
      }
    };
    
    checkMilestones();
  }, [
    resourcesAdapter.getAmount(resourceConfig.resourceType),
    isCheckingMilestones,
    isLoading,
    milestones,
    resourceConfig.resourceType,
    unlockedMilestones,
    unlockLog,
    unlockUpgrade,
    logsAdapter
  ]);
  
  return {
    // These properties will be passed directly to the ResourcePage component
    resourceType: resourceConfig.resourceType,
    resourceName: resourceConfig.resourceName,
    
    // Resource data from the adapter
    resource: {
      id: resourceConfig.resourceType,
      type: resourceConfig.resourceType,
      name: resourceConfig.resourceName,
      description: resourceConfig.pageDescription,
      amount: resourcesAdapter.getAmount(resourceConfig.resourceType),
      capacity: resourcesAdapter.getCapacity(resourceConfig.resourceType),
      rate: resourcesAdapter.getRate(resourceConfig.resourceType)
    },
    
    isLoading,
    
    // Resource operations
    addResource: (amount: number) => {
      if (game && initialized) {
        addResource(resourceConfig.resourceType, amount);
      }
    },
    
    // Get all upgrades with unlocked status from adapter
    // We maintain the original upgrade objects but add the unlocked status
    upgrades: resourceConfig.upgrades.map(upgrade => ({
      ...upgrade,
      // We add this property to match what the ResourcePage component expects
      unlocked: upgradesAdapter.isUpgradePurchased(upgrade.id)
    })),
    
    // Pass through upgrade functions to the ResourcePage
    unlockUpgrade: upgradesAdapter.purchaseUpgrade,
    
    // Milestone tracking for the ResourcePage
    unlockedMilestones: Array.from(unlockedMilestones.values()),
    checkMilestone: (id: number) => unlockedMilestones.has(id)
  };
} 