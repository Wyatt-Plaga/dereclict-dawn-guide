"use client"

import { useState, useEffect, ReactNode, useCallback } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Progress } from "@/components/ui/progress"
import { useSupabase } from "@/utils/supabase/context"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { resourceToPageMap, pageToResourceMap } from "@/utils/page-helpers"
import { ResourceManager } from "@/utils/game-helpers"
import { handleResourcePageLoad } from "@/utils/page-helpers"
import { LucideIcon } from "lucide-react"
import { checkResourceMilestones } from "@/utils/milestone-system"

// Define resource type
export type ResourceType = 'energy' | 'insight' | 'crew' | 'scrap'

// Define upgrade type
export interface ResourceUpgrade {
  id: string
  name: string
  description: string
  icon: LucideIcon
  costMultiplier: number
  getCost: (current: number) => number
  getNextValue: (current: number) => number
  propertyToUpgrade: string
}

// Props for the resource page component
interface ResourcePageProps {
  resourceType: ResourceType
  pageName: string
  resourceIcon: ReactNode
  resourceName: string
  pageTitle: string
  pageDescription: string
  iconClassName: string
  generateButtonLabel: string
  manualGenerationAmount: number
  autoGenerationLabel: string
  autoGenerationMultiplier: number
  formatValue?: (value: number) => string
  generateResourceLabel: string
  secondaryContent?: ReactNode
  upgrades: ResourceUpgrade[]
  unlockLog: (logId: number) => void
  unlockUpgrade: (upgradeId: string) => void
}

export function ResourcePage({
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
  upgrades,
  unlockLog,
  unlockUpgrade
}: ResourcePageProps) {
  // State for resource values
  const [amount, setAmount] = useState(0)
  const [capacity, setCapacity] = useState(0)
  const [autoGeneration, setAutoGeneration] = useState(0)
  
  // Access Supabase context for game state
  const { 
    gameProgress, 
    triggerSave, 
    updatePageTimestamp, 
    calculateResourceOfflineProgress,
    godMode
  } = useSupabase()
  
  const { shouldFlicker } = useSystemStatus()
  
  // Track if we've already updated the page timestamp
  const [timestampUpdated, setTimestampUpdated] = useState(false);
  
  // Get the auto-generation property name for this resource type
  const autoGenProperty = useCallback(() => {
    return ResourceManager.getAutoGenProperty(resourceType);
  }, [resourceType]);
  
  // Update the page timestamp and calculate offline progress on component mount
  useEffect(() => {
    if (gameProgress && !timestampUpdated) {
      handleResourcePageLoad(pageName, updatePageTimestamp, calculateResourceOfflineProgress);
      setTimestampUpdated(true);
    }
  }, [gameProgress, timestampUpdated, pageName, updatePageTimestamp, calculateResourceOfflineProgress]);
  
  // Synchronize local state with gameProgress from context
  useEffect(() => {
    if (gameProgress?.resources && gameProgress.resources[resourceType]) {
      setAmount(gameProgress.resources[resourceType]?.amount || 0);
      setCapacity(gameProgress.resources[resourceType]?.capacity || 0);
      
      // Get auto generation value using the ResourceManager
      const autoGenValue = ResourceManager.getResourceProperty(
        gameProgress, 
        resourceType, 
        autoGenProperty()
      );
      setAutoGeneration(autoGenValue);
    }
  }, [gameProgress, resourceType, autoGenProperty]);
  
  // Auto-generate resource based on autoGeneration rate
  useEffect(() => {
    // Don't set up interval if no auto generation or no game progress
    if (autoGeneration <= 0 || !gameProgress) return;
    
    const interval = setInterval(() => {
      // Get current values using ResourceManager
      const currentAmount = ResourceManager.getResourceProperty(gameProgress, resourceType, 'amount');
      const currentCapacity = ResourceManager.getResourceProperty(gameProgress, resourceType, 'capacity');
      
      // Calculate new value respecting capacity
      const newValue = Math.min(
        currentAmount + autoGeneration * autoGenerationMultiplier, 
        currentCapacity
      );
      
      // Only update if there's actually a change
      if (newValue > currentAmount) {
        // Use ResourceManager to handle state update and trigger save
        ResourceManager.updateResource(
          gameProgress,
          resourceType,
          'amount',
          newValue,
          triggerSave
        );
        
        // Update local state for UI
        setAmount(newValue);
        
        // Check if any milestones have been reached
        if (typeof unlockLog === 'function' && typeof unlockUpgrade === 'function') {
          checkResourceMilestones(gameProgress, resourceType, unlockLog, unlockUpgrade);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoGeneration, gameProgress, resourceType, autoGenerationMultiplier, triggerSave, unlockLog, unlockUpgrade]);
  
  // Generate resource on manual click
  const generateResource = useCallback(() => {
    if (!gameProgress) return;
    
    // Get current values using ResourceManager
    const currentAmount = ResourceManager.getResourceProperty(gameProgress, resourceType, 'amount');
    const currentCapacity = ResourceManager.getResourceProperty(gameProgress, resourceType, 'capacity');
    
    // Apply god mode - add 1000 instead of multiplying by 10
    const generationAmount = godMode ? 1000 : manualGenerationAmount;
    
    // Calculate new value, respecting capacity
    const newValue = Math.min(currentAmount + generationAmount, currentCapacity);
    
    // Update and save automatically using ResourceManager
    ResourceManager.updateResource(
      gameProgress,
      resourceType,
      'amount',
      newValue,
      triggerSave
    );
    
    // Update local state for UI
    setAmount(newValue);
    
    // Check if any milestones have been reached
    if (typeof unlockLog === 'function' && typeof unlockUpgrade === 'function') {
      checkResourceMilestones(gameProgress, resourceType, unlockLog, unlockUpgrade);
    }
  }, [gameProgress, resourceType, manualGenerationAmount, triggerSave, unlockLog, unlockUpgrade, godMode]);
  
  // Handle upgrade
  const handleUpgrade = useCallback((upgrade: ResourceUpgrade) => {
    if (!gameProgress) return;
    
    const currentAmount = ResourceManager.getResourceProperty(gameProgress, resourceType, 'amount');
    const currentValue = ResourceManager.getResourceProperty(gameProgress, resourceType, upgrade.propertyToUpgrade);
    const upgradeCost = upgrade.getCost(currentValue);
    
    if (ResourceManager.hasEnoughResource(gameProgress, resourceType, upgradeCost)) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newValue = upgrade.getNextValue(currentValue);
      
      // Batch update both resource amount and the upgraded property
      ResourceManager.batchUpdateResources(
        gameProgress,
        [
          { resourceType, property: 'amount', value: newAmount },
          { resourceType, property: upgrade.propertyToUpgrade, value: newValue }
        ],
        triggerSave
      );
      
      // Update local state for UI
      setAmount(newAmount);
      
      // Update the correct property in local state
      if (upgrade.propertyToUpgrade === 'capacity') {
        setCapacity(newValue);
      } else if (upgrade.propertyToUpgrade === autoGenProperty()) {
        setAutoGeneration(newValue);
      }
    }
  }, [gameProgress, resourceType, triggerSave, autoGenProperty]);
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker(pageName) ? 'flickering-text' : ''}`}>
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mb-6">
            {pageDescription}
          </p>
          
          {/* Resource display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {resourceIcon}
                <span className="terminal-text">{resourceName}</span>
              </div>
              <span className="font-mono">{formatValue(amount)} / {Math.floor(capacity)}</span>
            </div>
            <Progress 
              value={(amount / capacity) * 100} 
              className="h-2 bg-muted" 
              indicatorClassName={iconClassName} 
            />
            <div className="text-xs text-muted-foreground mt-1">
              {autoGeneration > 0 && (
                <span>+{formatValue(autoGeneration * autoGenerationMultiplier)} per second</span>
              )}
            </div>
          </div>
          
          {/* Manual button */}
          <button 
            onClick={generateResource} 
            className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
          >
            <div className="flex flex-col items-center">
              <div className={`h-12 w-12 ${iconClassName} mb-2 ${shouldFlicker(pageName) ? 'flickering-text' : ''} flex items-center justify-center`}>
                {resourceIcon}
              </div>
              <span className="terminal-text">{generateButtonLabel}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {generateResourceLabel} {formatValue(godMode ? 1000 : manualGenerationAmount)} {resourceName} per click
                {godMode && <span className="ml-1 text-success font-bold"> (GOD MODE)</span>}
              </span>
            </div>
          </button>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {upgrades.map((upgrade) => {
              const currentValue = upgrade.propertyToUpgrade === 'capacity' 
                ? capacity 
                : (upgrade.propertyToUpgrade === autoGenProperty() ? autoGeneration : 0);
              
              const upgradeCost = upgrade.getCost(currentValue);
              const canAfford = amount >= upgradeCost;
              const nextValue = upgrade.getNextValue(currentValue);
              
              return (
                <div 
                  key={upgrade.id}
                  className={`system-panel p-4 ${canAfford ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={() => canAfford && handleUpgrade(upgrade)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <upgrade.icon className={`h-5 w-5 ${iconClassName} mr-2`} />
                      <span>{upgrade.name}</span>
                    </div>
                    <span className="font-mono text-xs">{formatValue(upgradeCost)} {resourceName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {upgrade.description.replace('{value}', formatValue(nextValue))}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Optional secondary content */}
          {secondaryContent}
        </div>
      </div>
    </main>
  )
} 