"use client"

import { NavBar } from "@/components/ui/navbar"
import { Package, Cog, Warehouse, Factory, Shield } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'

export default function ManufacturingPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // Get manufacturing data from game state
  const manufacturing = state.categories.manufacturing
  const { scrap } = manufacturing.resources
  const { scrapCapacity, scrapPerSecond } = manufacturing.stats
  
  // Log component render
  Logger.debug(
    LogCategory.UI, 
    `Manufacturing page rendering with scrap: ${scrap}`,
    [LogContext.UI_RENDER, LogContext.MANUFACTURING_LIFECYCLE]
  );
  
  // Collect scrap on manual click
  const collectScrap = () => {
    Logger.debug(
      LogCategory.UI, 
      'Collect scrap button clicked', 
      LogContext.MANUFACTURING_LIFECYCLE
    );
    
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: {
        category: 'manufacturing'
      }
    })
  }
  
  // Upgrade cargo capacity
  const upgradeCargoHold = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade cargo hold clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'manufacturing',
        upgradeType: 'cargoHoldExpansions'
      }
    })
  }
  
  // Upgrade manufacturing bay
  const upgradeManufacturingBay = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade manufacturing bay clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.MANUFACTURING_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'manufacturing',
        upgradeType: 'manufacturingBays'
      }
    })
  }
  
  // Calculate upgrade costs
  const expansionCost = Math.floor(scrapCapacity * 0.5)
  const bayCost = (manufacturing.upgrades.manufacturingBays + 1) * 25
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`}>Manufacturing Bay</h1>
            <p className="text-muted-foreground mb-6">
              Salvage and process ship materials. Collect Scrap to construct upgrades and repair systems.
            </p>
            
            {/* Resource display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-chart-4 mr-2" />
                  <span className="terminal-text">Scrap</span>
                </div>
                <span className="font-mono">{Math.floor(scrap)} / {Math.floor(scrapCapacity)}</span>
              </div>
              <Progress value={(scrap / scrapCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-4" />
              <div className="text-xs text-muted-foreground mt-1">
                {scrapPerSecond > 0 && <span>+{scrapPerSecond} per second</span>}
              </div>
            </div>
            
            {/* Manual button */}
            <button 
              onClick={collectScrap} 
              disabled={scrap >= scrapCapacity}
              className={`system-panel w-full py-8 flex items-center justify-center mb-8 transition-colors ${
                scrap >= scrapCapacity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
              }`}
            >
              <div className="flex flex-col items-center">
                <Cog className={`h-12 w-12 text-chart-4 mb-2 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Collect Scrap</span>
                <span className="text-xs text-muted-foreground mt-1">+1 Scrap per click</span>
              </div>
            </button>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              {/* Cargo hold upgrade */}
              <div 
                className={`system-panel p-4 ${scrap >= expansionCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                onClick={upgradeCargoHold}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Warehouse className="h-5 w-5 text-chart-4 mr-2" />
                    <span>Cargo Hold Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{expansionCost} Scrap</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expand cargo storage capacity to {Math.floor(scrapCapacity * 1.5)}
                </p>
                <div className="mt-2 text-xs">
                  Level: {manufacturing.upgrades.cargoHoldExpansions}
                </div>
              </div>
              
              {/* Manufacturing bay upgrade */}
              <div 
                className={`system-panel p-4 ${scrap >= bayCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                onClick={upgradeManufacturingBay}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Factory className="h-5 w-5 text-chart-4 mr-2" />
                    <span>Manufacturing Bay</span>
                  </div>
                  <span className="font-mono text-xs">{bayCost} Scrap</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automated scrap collection (+0.5 per second)
                </p>
                <div className="mt-2 text-xs">
                  Level: {manufacturing.upgrades.manufacturingBays}
                </div>
              </div>
              
              {/* Manufacturing projects placeholder */}
              <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Projects</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Use scrap to manufacture special components
              </p>
              
              <div className="opacity-60 system-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Cog className="h-5 w-5 text-chart-4 mr-2" />
                    <span>Navigation System</span>
                  </div>
                  <span className="font-mono text-xs">300 Scrap</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Repair ship&apos;s navigation capabilities [Coming Soon]
                </p>
              </div>
              
              <div className="opacity-60 system-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-chart-5 mr-2" />
                    <span>Hull Integrity</span>
                  </div>
                  <span className="font-mono text-xs">500 Scrap</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reinforce ship&apos;s hull integrity [Coming Soon]
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 
