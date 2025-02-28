"use client"

import { useState, useEffect } from "react"
import { useGameUpgrades } from "@/hooks/useGameUpgrades"
import { useGameResources } from "@/hooks/useGameResources"
import { ResourceType } from "@/types/game.types"

// Define the upgrade interface
interface Upgrade {
  id: string
  title: string
  description: string
  requiredUpgrades: string[]
  resourceRequirements: {
    type: ResourceType
    amount: number
  }[]
  unlockPageId?: string
}

// Props for the upgrade panel component
interface UpgradePanelProps {
  title: string
  description?: string
  upgrades: Upgrade[]
}

export function UpgradePanelWithStore({
  title,
  description,
  upgrades
}: UpgradePanelProps) {
  // Get upgrade functions from the custom hook
  const { 
    isUpgradeUnlocked, 
    unlockUpgrade, 
    hasRequiredUpgrades 
  } = useGameUpgrades()
  
  // Get resource functions from the custom hook
  const { 
    getResourceAmount, 
    hasEnoughResource 
  } = useGameResources()
  
  // Check if an upgrade can be purchased
  const canPurchaseUpgrade = (upgrade: Upgrade): boolean => {
    // Check if already unlocked
    if (isUpgradeUnlocked(upgrade.id)) return false
    
    // Check if required upgrades are unlocked
    if (!hasRequiredUpgrades(upgrade.requiredUpgrades)) return false
    
    // Check if has enough resources
    return upgrade.resourceRequirements.every(req => 
      hasEnoughResource(req.type, req.amount)
    )
  }
  
  // Handle upgrading
  const handleUpgrade = (upgrade: Upgrade) => {
    if (!canPurchaseUpgrade(upgrade)) return
    
    // Unlock the upgrade in the store
    unlockUpgrade(upgrade.id)
    
    // Resource deduction would happen inside the unlockUpgrade action
    // in a more complete implementation
  }
  
  return (
    <div className="system-panel p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      
      <div className="space-y-4">
        {upgrades.map(upgrade => {
          const isUnlocked = isUpgradeUnlocked(upgrade.id)
          const canPurchase = canPurchaseUpgrade(upgrade)
          const hasRequirements = hasRequiredUpgrades(upgrade.requiredUpgrades)
          
          return (
            <div key={upgrade.id} className={`
              system-panel p-4 relative
              ${isUnlocked ? 'bg-primary/10' : 'bg-background/80'}
              ${!hasRequirements ? 'opacity-60' : ''}
            `}>
              {isUnlocked && (
                <div className="absolute right-2 top-2 text-xs px-2 py-1 bg-primary/20 rounded-full">
                  Unlocked
                </div>
              )}
              
              <h3 className="text-lg font-semibold mb-1">{upgrade.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{upgrade.description}</p>
              
              {!isUnlocked && (
                <>
                  {/* Required upgrades */}
                  {upgrade.requiredUpgrades.length > 0 && (
                    <div className="text-xs mb-2">
                      <span className="font-semibold">Required: </span>
                      {upgrade.requiredUpgrades.map((reqId, idx) => (
                        <span key={reqId} className={isUpgradeUnlocked(reqId) ? 'text-green-500' : 'text-red-500'}>
                          {reqId}
                          {idx < upgrade.requiredUpgrades.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Resource requirements */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {upgrade.resourceRequirements.map(req => (
                      <div 
                        key={req.type} 
                        className={`
                          text-sm px-2 py-1 rounded
                          ${hasEnoughResource(req.type, req.amount) ? 'bg-green-500/20' : 'bg-red-500/20'}
                        `}
                      >
                        {req.type}: {req.amount} / {getResourceAmount(req.type)}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleUpgrade(upgrade)}
                    disabled={!canPurchase}
                    className={`
                      mt-2 py-2 px-4 rounded w-full
                      ${canPurchase 
                        ? 'system-panel-button hover:bg-primary/90' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'}
                    `}
                  >
                    {hasRequirements 
                      ? 'Unlock Upgrade' 
                      : 'Missing Requirements'}
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 