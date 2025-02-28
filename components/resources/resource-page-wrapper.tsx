"use client"

import React, { useCallback } from 'react';
import { ResourcePage, ResourceType, ResourceUpgrade } from './resource-page';
import { useResourcePageAdapter } from '@/src/ui/adapters/useResourcePageAdapter';
import { useGameEngine } from '@/src/ui/providers/GameEngineProvider';

/**
 * ResourcePageWrapper
 * 
 * This wrapper provides compatibility between the existing ResourcePage component
 * and the new game engine architecture. It gradually integrates the new resource
 * management system while maintaining backward compatibility.
 */
export function ResourcePageWrapper({
  resourceType,
  pageName,
  resourceIcon,
  resourceName,
  pageTitle,
  pageDescription,
  iconClassName,
  generateButtonLabel,
  manualGenerationAmount,
  autoGenerationLabel,
  autoGenerationMultiplier,
  formatValue = (value: number) => value.toFixed(1),
  generateResourceLabel,
  secondaryContent,
  upgrades = [],
  unlockLog,
  unlockUpgrade
}: {
  resourceType: ResourceType;
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
  formatValue?: (value: number) => string;
  generateResourceLabel: string;
  secondaryContent?: React.ReactNode;
  upgrades?: ResourceUpgrade[];
  unlockLog?: (logId: number) => void;
  unlockUpgrade?: (upgradeId: string) => void;
}) {
  const { initialized, game } = useGameEngine();
  const adapter = useResourcePageAdapter(resourceType);
  
  // If the game engine isn't initialized yet, just render the original component
  if (!initialized || !game) {
    return (
      <ResourcePage
        resourceType={resourceType}
        pageName={pageName}
        resourceIcon={resourceIcon}
        resourceName={resourceName}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        iconClassName={iconClassName}
        generateButtonLabel={generateButtonLabel}
        manualGenerationAmount={manualGenerationAmount}
        autoGenerationLabel={autoGenerationLabel}
        autoGenerationMultiplier={autoGenerationMultiplier}
        formatValue={formatValue}
        generateResourceLabel={generateResourceLabel}
        secondaryContent={secondaryContent}
        upgrades={upgrades}
        unlockLog={unlockLog}
        unlockUpgrade={unlockUpgrade}
      />
    );
  }
  
  // Create a wrapper for unlockLog that works with both systems
  const handleUnlockLog = (logId: number) => {
    // Call original function if provided
    if (unlockLog) {
      unlockLog(logId);
    }
    
    // Also log in the new system
    game.getLogs().info(
      `Log ${logId} unlocked`,
      { logId }, 
      game.getLogs().LogCategory.SYSTEM
    );
  };
  
  // Create a wrapper for unlockUpgrade that works with both systems
  const handleUnlockUpgrade = (upgradeId: string) => {
    // Call original function if provided
    if (unlockUpgrade) {
      unlockUpgrade(upgradeId);
    }
    
    // TODO: When upgrade system is ready, also handle in the game engine
    // game.getUpgrades().purchaseUpgrade(upgradeId);
  };
  
  // Override the generateResource function to hook it into our game engine
  const generateResource = useCallback(() => {
    // Call our adapter to add resources using the game engine
    if (adapter) {
      adapter.addAmount(manualGenerationAmount);
      
      // Log the action in the new system
      game.getLogs().info(
        `Generated ${manualGenerationAmount} ${resourceName}`,
        { resourceType, amount: manualGenerationAmount },
        game.getLogs().LogCategory.RESOURCE
      );
    }
    
    // The original component will still handle UI, milestones, etc.
  }, [adapter, game, manualGenerationAmount, resourceName, resourceType]);
  
  return (
    <ResourcePage
      resourceType={resourceType}
      pageName={pageName}
      resourceIcon={resourceIcon}
      resourceName={resourceName}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      iconClassName={iconClassName}
      generateButtonLabel={generateButtonLabel}
      manualGenerationAmount={manualGenerationAmount}
      autoGenerationLabel={autoGenerationLabel}
      autoGenerationMultiplier={autoGenerationMultiplier}
      formatValue={formatValue}
      generateResourceLabel={generateResourceLabel}
      secondaryContent={secondaryContent}
      upgrades={upgrades}
      // Use our wrappers that work with both systems
      unlockLog={handleUnlockLog}
      unlockUpgrade={handleUnlockUpgrade}
      // Override these with our values from the game engine
      currentAmount={adapter.getCurrentAmount()}
      resourceCapacity={adapter.getResourceCapacity()}
      // Add our custom handlers for resource generation
      onGenerateResource={generateResource}
      // We'll monkey-patch the internal generateResource function through React's ref system
      ref={(resourcePageComponent: any) => {
        if (resourcePageComponent && typeof resourcePageComponent.generateResource === 'function') {
          // Replace the original function with our own
          resourcePageComponent.generateResource = generateResource;
        }
      }}
    />
  );
} 