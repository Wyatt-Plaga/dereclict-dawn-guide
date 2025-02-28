"use client"

import { useState, useEffect, ReactNode, useCallback } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { LucideIcon } from "lucide-react"
import { checkResourceMilestones } from "@/utils/milestone-system"

// Import Zustand store hooks
import { useGameStore } from "@/store/rootStore"
import { useGameResources } from "@/hooks/useGameResources"

// Import types
import { ResourceType } from "@/types/game.types"

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
}

export function ResourcePageWithStore({
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
  upgrades
}: ResourcePageProps) {
  // Get actions and state from store
  const updateResource = useGameStore(state => state.updateResource)
  const batchUpdateResources = useGameStore(state => state.batchUpdateResources)
  const updatePageTimestamp = useGameStore(state => state.updatePageTimestamp)
  const unlockLog = useGameStore(state => state.unlockLog)
  const unlockUpgrade = useGameStore(state => state.unlockUpgrade)
  
  // Use the resource hook for consistent access to resource methods
  const { 
    getResourceAmount, 
    getResourceCapacity, 
    getAutoGeneration,
    getAutoGenPropertyName,
    hasEnoughResource
  } = useGameResources()
  
  // Local state for UI
  const [amount, setAmount] = useState(0)
  const [capacity, setCapacity] = useState(0)
  const [autoGeneration, setAutoGeneration] = useState(0)
  
  const { shouldFlicker } = useSystemStatus()
  
  // Track if we've already updated the page timestamp
  const [timestampUpdated, setTimestampUpdated] = useState(false);
  
  // Get the auto-generation property name for this resource type
  const autoGenProperty = useCallback(() => {
    return getAutoGenPropertyName(resourceType);
  }, [resourceType, getAutoGenPropertyName]);
  
  // Update the page timestamp on component mount
  useEffect(() => {
    if (!timestampUpdated) {
      updatePageTimestamp(pageName);
      setTimestampUpdated(true);
      
      // Note: Offline progress calculation will be handled separately
      // and fed into the store via the StoreBridge component
    }
  }, [timestampUpdated, pageName, updatePageTimestamp]);
  
  // Synchronize local state with store
  useEffect(() => {
    setAmount(getResourceAmount(resourceType));
    setCapacity(getResourceCapacity(resourceType));
    setAutoGeneration(getAutoGeneration(resourceType));
  }, [resourceType, getResourceAmount, getResourceCapacity, getAutoGeneration]);
  
  // Auto-generate resource based on autoGeneration rate
  useEffect(() => {
    // Don't set up interval if no auto generation
    if (autoGeneration <= 0) return;
    
    const interval = setInterval(() => {
      const currentAmount = getResourceAmount(resourceType);
      const currentCapacity = getResourceCapacity(resourceType);
      
      // Calculate new value respecting capacity
      const newValue = Math.min(
        currentAmount + autoGeneration * autoGenerationMultiplier, 
        currentCapacity
      );
      
      // Only update if there's actually a change
      if (newValue > currentAmount) {
        // Update store
        updateResource(resourceType, 'amount', newValue);
        
        // Update local state for UI
        setAmount(newValue);
        
        // Check if any milestones have been reached - pass unlockLog and unlockUpgrade directly
        unlockLog && unlockUpgrade && checkResourceMilestones(
          { 
            resources: { [resourceType]: { amount: newValue } },
            upgrades: {},
            unlockedLogs: [],
            lastOnline: new Date().toISOString(),
            page_timestamps: {}
          }, 
          resourceType, 
          unlockLog, 
          unlockUpgrade
        );
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoGeneration, resourceType, autoGenerationMultiplier, getResourceAmount, getResourceCapacity, updateResource, unlockLog, unlockUpgrade]);
  
  // Generate resource on manual click
  const generateResource = useCallback(() => {
    const currentAmount = getResourceAmount(resourceType);
    const currentCapacity = getResourceCapacity(resourceType);
    
    // Calculate new value, respecting capacity
    const newValue = Math.min(currentAmount + manualGenerationAmount, currentCapacity);
    
    // Update store
    updateResource(resourceType, 'amount', newValue);
    
    // Update local state for UI
    setAmount(newValue);
    
    // Check if any milestones have been reached - pass unlockLog and unlockUpgrade directly
    unlockLog && unlockUpgrade && checkResourceMilestones(
      { 
        resources: { [resourceType]: { amount: newValue } },
        upgrades: {},
        unlockedLogs: [],
        lastOnline: new Date().toISOString(),
        page_timestamps: {}
      }, 
      resourceType, 
      unlockLog, 
      unlockUpgrade
    );
  }, [resourceType, manualGenerationAmount, getResourceAmount, getResourceCapacity, updateResource, unlockLog, unlockUpgrade]);
  
  // Handle upgrade
  const handleUpgrade = useCallback((upgrade: ResourceUpgrade) => {
    const currentAmount = getResourceAmount(resourceType);
    const currentValue = getAutoGeneration(resourceType);
    const upgradeCost = upgrade.getCost(currentValue);
    
    if (hasEnoughResource(resourceType, upgradeCost)) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newValue = upgrade.getNextValue(currentValue);
      
      // Batch update both resource amount and the upgraded property
      batchUpdateResources([
        { resourceType, property: 'amount', value: newAmount },
        { resourceType, property: upgrade.propertyToUpgrade, value: newValue }
      ]);
      
      // Update local state for UI
      setAmount(newAmount);
      
      // Update the correct property in local state
      if (upgrade.propertyToUpgrade === 'capacity') {
        setCapacity(newValue);
      } else if (upgrade.propertyToUpgrade === autoGenProperty()) {
        setAutoGeneration(newValue);
      }
    }
  }, [resourceType, getResourceAmount, getAutoGeneration, hasEnoughResource, batchUpdateResources, autoGenProperty]);
  
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
          
          {/* Generate button */}
          <button
            onClick={generateResource}
            className="system-panel-button p-4 w-full flex items-center justify-center text-lg mb-8"
          >
            {generateButtonLabel}
          </button>
          
          {/* Upgrades */}
          <h2 className="text-xl font-semibold text-primary mb-4">{resourceName} Upgrades</h2>
          <div className="space-y-4">
            {upgrades.map((upgrade) => {
              // Get current value based on property being upgraded
              const currentValue = upgrade.propertyToUpgrade === 'capacity' 
                ? capacity 
                : upgrade.propertyToUpgrade === autoGenProperty()
                  ? autoGeneration 
                  : 0;
              
              const nextValue = upgrade.getNextValue(currentValue);
              const cost = upgrade.getCost(currentValue);
              const canAfford = amount >= cost;
              
              return (
                <div key={upgrade.id} className="system-panel p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <upgrade.icon className={`h-5 w-5 ${iconClassName}`} />
                        <h3 className="font-semibold">{upgrade.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{upgrade.description}</p>
                      <div className="text-xs flex justify-between">
                        <span>Current: {formatValue(currentValue)}</span>
                        <span className="text-primary">Next: {formatValue(nextValue)}</span>
                      </div>
                    </div>
                    <button 
                      className={`ml-4 px-4 py-2 rounded text-sm ${
                        canAfford 
                          ? 'system-panel-button hover:bg-primary/90' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                      onClick={() => handleUpgrade(upgrade)}
                      disabled={!canAfford}
                    >
                      <span className="block">{formatValue(cost)}</span>
                      <span className="block text-xs">{resourceName}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Secondary content if any */}
          {secondaryContent}
        </div>
      </div>
    </main>
  );
} 