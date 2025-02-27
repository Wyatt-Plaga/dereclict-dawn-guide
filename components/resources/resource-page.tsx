"use client"

import { useState, useEffect, ReactNode } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Progress } from "@/components/ui/progress"
import { useSupabase } from "@/utils/supabase/context"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { resourceToPageMap, pageToResourceMap } from "@/utils/page-helpers"
import { updateResource } from "@/utils/game-helpers"
import { handleResourcePageLoad } from "@/utils/page-helpers"
import { LucideIcon } from "lucide-react"

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
  upgrades
}: ResourcePageProps) {
  // State for resource values
  const [amount, setAmount] = useState(0)
  const [capacity, setCapacity] = useState(0)
  const [autoGeneration, setAutoGeneration] = useState(0)
  
  // Function to get the correct auto-generation property name
  const getAutoGenProperty = () => {
    switch (resourceType) {
      case 'energy':
      case 'insight':
        return 'autoGeneration'
      case 'crew':
        return 'workerCrews'
      case 'scrap':
        return 'manufacturingBays'
      default:
        return 'autoGeneration'
    }
  }
  
  // Access Supabase context for game state
  const { 
    gameProgress, 
    triggerSave, 
    updatePageTimestamp, 
    calculateResourceOfflineProgress 
  } = useSupabase()
  
  const { shouldFlicker } = useSystemStatus()
  
  // Track if we've already updated the page timestamp
  const [timestampUpdated, setTimestampUpdated] = useState(false);
  
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
      console.log(`Initializing ${resourceType} component state from gameProgress:`, gameProgress.resources[resourceType]);
      setAmount(gameProgress.resources[resourceType]?.amount || 0);
      setCapacity(gameProgress.resources[resourceType]?.capacity || 0);
      
      // Handle different auto generation property names
      const autoGenProperty = getAutoGenProperty();
      const autoGenValue = (gameProgress.resources[resourceType] as any)?.[autoGenProperty] || 0;
      setAutoGeneration(autoGenValue);
    }
  }, [gameProgress, resourceType]);
  
  // Auto-generate resource based on autoGeneration rate
  useEffect(() => {
    // Don't set up interval if no auto generation or no game progress
    if (autoGeneration <= 0 || !gameProgress) return;
    
    console.log(`Setting up ${resourceType} auto-generation interval with rate: ${autoGeneration * autoGenerationMultiplier}/sec`);
    
    const interval = setInterval(() => {
      // Get current values from gameProgress to stay in sync
      const currentAmount = gameProgress.resources[resourceType]?.amount || 0;
      const currentCapacity = gameProgress.resources[resourceType]?.capacity || 0;
      
      // Calculate new value respecting capacity
      const newValue = Math.min(
        currentAmount + autoGeneration * autoGenerationMultiplier, 
        currentCapacity
      );
      
      // Only update if there's actually a change
      if (newValue > currentAmount) {
        console.log(`Auto-generating ${resourceType}: ${currentAmount} -> ${newValue}`);
        
        // Use updateResource to handle state update and trigger save
        updateResource(
          gameProgress,
          resourceType,
          'amount',
          newValue,
          triggerSave
        );
        
        // Update local state for UI
        setAmount(newValue);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoGeneration, gameProgress, resourceType, autoGenerationMultiplier, triggerSave]);
  
  // Generate resource on manual click
  const generateResource = () => {
    if (!gameProgress) return;
    
    // Get current values from gameProgress
    const currentAmount = gameProgress.resources[resourceType]?.amount || 0;
    const currentCapacity = gameProgress.resources[resourceType]?.capacity || 0;
    
    // Calculate new value, respecting capacity
    const newValue = Math.min(currentAmount + manualGenerationAmount, currentCapacity);
    
    console.log(`Generating ${resourceType}: ${currentAmount} -> ${newValue}`);
    
    // Update and save automatically using helper function
    updateResource(
      gameProgress,
      resourceType,
      'amount',
      newValue,
      triggerSave
    );
    
    // Update local state for UI
    setAmount(newValue);
  }
  
  // Handle upgrade
  const handleUpgrade = (upgrade: ResourceUpgrade) => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources[resourceType]?.amount || 0;
    const currentValue = (gameProgress.resources[resourceType] as any)?.[upgrade.propertyToUpgrade] || 0;
    const upgradeCost = upgrade.getCost(currentValue);
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newValue = upgrade.getNextValue(currentValue);
      
      // Update resource amount first (cost deduction)
      const updatedProgress1 = updateResource(
        gameProgress,
        resourceType,
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update the property being upgraded and trigger save
      const updatedProgress2 = updateResource(
        updatedProgress1,
        resourceType,
        upgrade.propertyToUpgrade,
        newValue,
        triggerSave
      );
      
      // Update local state for UI
      setAmount(newAmount);
      
      // Update the correct property in local state
      if (upgrade.propertyToUpgrade === 'capacity') {
        setCapacity(newValue);
      } else if (upgrade.propertyToUpgrade === getAutoGenProperty()) {
        setAutoGeneration(newValue);
      }
    }
  };
  
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
              <div className={`h-12 w-12 ${iconClassName} mb-2 ${shouldFlicker(pageName) ? 'flickering-text' : ''}`}>
                {resourceIcon}
              </div>
              <span className="terminal-text">{generateButtonLabel}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {generateResourceLabel} {formatValue(manualGenerationAmount)} {resourceName} per click
              </span>
            </div>
          </button>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {upgrades.map((upgrade) => {
              const currentValue = upgrade.propertyToUpgrade === 'capacity' 
                ? capacity 
                : (upgrade.propertyToUpgrade === getAutoGenProperty() ? autoGeneration : 0);
              
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