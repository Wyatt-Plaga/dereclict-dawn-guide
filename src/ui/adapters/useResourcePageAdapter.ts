import { useEffect } from 'react';
import { useGameResources } from '../hooks/useGameResources';
import { useGameLogs } from '../hooks/useGameLogs';
import { useGameUpgrades } from '../hooks/useGameUpgrades';
import { useGameEngine } from '../providers/GameEngineProvider';

/**
 * This adapter hook connects the new game engine architecture to the existing UI components
 * It maps the new domain-driven hooks to the interface expected by the legacy ResourcePage component
 */
export function useResourcePageAdapter(resourceType: string) {
  const { game, initialized } = useGameEngine();
  const { resources, addResource, subtractResource, canAfford } = useGameResources();
  const { upgrades, purchaseUpgrade, isUpgradePurchased } = useGameUpgrades();
  const { logs, LogCategory, LogLevel } = useGameLogs();
  
  // Find the main resource for this page
  const mainResource = resources.find(r => r.getType() === resourceType);
  
  // Prepare adapter functions that match the existing ResourcePage component interface
  const adapter = {
    // Resource functions
    getCurrentAmount: () => mainResource?.getAmount() || 0,
    getResourceCapacity: () => mainResource?.getCapacity() || 100,
    addAmount: (amount: number) => {
      if (mainResource) {
        addResource(mainResource.getId(), amount);
        return true;
      }
      return false;
    },
    subtractAmount: (amount: number) => {
      if (mainResource) {
        subtractResource(mainResource.getId(), amount);
        return true;
      }
      return false;
    },
    
    // Upgrade functions
    unlockUpgrade: (id: string) => {
      purchaseUpgrade(id);
    },
    isUpgradeUnlocked: (id: string) => {
      return isUpgradePurchased(id);
    },
    
    // Log functions
    unlockLog: (logId: number) => {
      // Create a log entry about unlocking a log
      if (game) {
        game.getLogs().createLog({
          message: `Log entry #${logId} unlocked`,
          level: LogLevel.INFO,
          category: LogCategory.SYSTEM,
          timestamp: Date.now(),
          id: `log_unlock_${logId}_${Date.now()}`
        });
      }
      
      // We need to add this to the game's unlockedLogs state
      // This will depend on how your existing UI expects unlocked logs to be stored
    }
  };
  
  // Initialize the resource if needed
  useEffect(() => {
    if (!initialized || !game) return;
    
    // Check if the resource exists, create it if not
    if (resourceType && !mainResource) {
      // Create default resource based on type
      const resourceMap = {
        'energy': {
          id: 'energy',
          name: 'Energy',
          type: 'energy',
          amount: 50,
          capacity: 1000,
        },
        'insight': {
          id: 'insight',
          name: 'Insight',
          type: 'insight',
          amount: 25,
          capacity: 500,
        },
        'crew': {
          id: 'crew',
          name: 'Crew',
          type: 'crew',
          amount: 0,
          capacity: 10,
        },
        'scrap': {
          id: 'scrap',
          name: 'Scrap',
          type: 'scrap',
          amount: 0,
          capacity: 100,
        }
      };
      
      const defaultProps = resourceMap[resourceType as keyof typeof resourceMap];
      
      if (defaultProps) {
        game.getResources().createResource({
          ...defaultProps,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, [initialized, game, resourceType, mainResource]);
  
  return adapter;
} 