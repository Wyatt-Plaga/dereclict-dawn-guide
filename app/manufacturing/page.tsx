"use client"

import { NavBar } from "@/components/ui/navbar"
import { Package, PackageSearch, ArrowUpCircle, MinusCircle, PlusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useManufacturing } from "@/app/game/hooks/useManufacturing"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { Button } from "@/components/ui/button"
import { useGame } from "@/app/game/hooks/useGame"

export default function ManufacturingPage() {
  const manufacturing = useManufacturing()
  const { dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // Early exit or loading state if manufacturing data isn't ready
  if (!manufacturing) {
    return <GameLoader><p>Loading Manufacturing...</p></GameLoader>;
  }
  
  // Log component render
  Logger.debug(
    LogCategory.UI, 
    `Manufacturing page rendering with scrap: ${manufacturing.scrap}`,
    [LogContext.UI_RENDER, LogContext.MANUFACTURING_LIFECYCLE]
  );
  
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
            
            {/* Resource display and automation controls */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                {manufacturing.manufacturingBays > 0 && (
                  <div className="order-2 md:order-1 mt-3 md:mt-0 mb-3 md:mb-0 bg-background/30 rounded-md p-2 md:min-w-[140px]">
                    <div className="text-center mb-1">
                      <span className="text-xs text-muted-foreground">Active Bays</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); manufacturing.adjustActiveBays('decrease'); }} 
                        disabled={!manufacturing.canDecreaseBays}
                        className="h-7 w-7 rounded-md"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="font-mono text-sm font-semibold mx-2">
                        {manufacturing.activeManufacturingBays}/{manufacturing.manufacturingBays}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); manufacturing.adjustActiveBays('increase'); }} 
                        disabled={!manufacturing.canIncreaseBays}
                        className="h-7 w-7 rounded-md"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="order-1 md:order-2 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-chart-4 mr-2" />
                      <span className="terminal-text">Scrap</span>
                    </div>
                    <span className="font-mono">{manufacturing.scrap.toFixed(0)} / {manufacturing.scrapCapacity.toFixed(0)}</span>
                  </div>
                  <Progress value={(manufacturing.scrap / manufacturing.scrapCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-4" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {manufacturing.scrapPerSecond > 0 && <span>+{manufacturing.scrapPerSecond.toFixed(1)} per second</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Manual button */}
            <button 
              onClick={manufacturing.collectScrap}
              disabled={!manufacturing.canCollectWithEnergy}
              className={`system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors ${
                !manufacturing.canCollectWithEnergy ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex flex-col items-center">
                <PackageSearch className={`h-12 w-12 text-chart-4 mb-2 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Collect Scrap</span>
              </div>
            </button>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              {/* Cargo Hold Expansions upgrade */}
              <div className={`system-panel p-4 ${manufacturing.canUpgradeExpansions ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={manufacturing.upgradeCargoHoldExpansions}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-chart-4 mr-2" />
                    <span>Cargo Hold Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{manufacturing.expansionCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {manufacturing.expansionDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {manufacturing.cargoHoldExpansions}
                </div>
              </div>
              
              {/* Manufacturing Bays upgrade */}
              <div className={`system-panel p-4 ${manufacturing.canUpgradeBays ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={manufacturing.upgradeManufacturingBays}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-chart-4 mr-2" />
                    <span>Manufacturing Bay</span>
                  </div>
                  <span className="font-mono text-xs">{manufacturing.bayCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {manufacturing.bayDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {manufacturing.manufacturingBays}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 