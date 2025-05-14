"use client"

import { NavBar } from "@/components/ui/navbar"
import { Battery, Zap, ArrowUpCircle, MinusCircle, PlusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useReactor } from "@/app/game/hooks/useReactor"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { Button } from "@/components/ui/button"

export default function ReactorPage() {
  const reactor = useReactor()
  const { shouldFlicker } = useSystemStatus()
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering ReactorPage: Energy: ${reactor.formattedEnergy}/${reactor.formattedCapacity}, Active Converters: ${reactor.activeEnergyConverters}/${reactor.energyConverters}`,
    LogContext.UI_RENDER
  )
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`}>Reactor Core</h1>
            <p className="text-muted-foreground mb-6">
              The ship's primary energy generation system. Repair and enhance to power all ship functions.
            </p>
            
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                {reactor.energyConverters > 0 && (
                  <div className="order-2 md:order-1 mt-3 md:mt-0 mb-3 md:mb-0 bg-background/30 rounded-md p-2 md:min-w-[140px]">
                    <div className="text-center mb-1">
                      <span className="text-xs text-muted-foreground">Active Converters</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { 
                          e.stopPropagation(); 
                          reactor.adjustActiveConverters('decrease'); 
                        }} 
                        disabled={!reactor.canDecreaseConverters}
                        className="h-7 w-7 rounded-md"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>

                      <span className="font-mono text-sm font-semibold mx-2">
                        {reactor.activeEnergyConverters}/{reactor.energyConverters}
                      </span>

                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { 
                          e.stopPropagation(); 
                          reactor.adjustActiveConverters('increase'); 
                        }} 
                        disabled={!reactor.canIncreaseConverters}
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
                      <Battery className="h-5 w-5 text-chart-1 mr-2" />
                      <span className="terminal-text">Energy</span>
                    </div>
                    <span className="font-mono">{Math.floor(reactor.formattedEnergy)} / {Math.floor(reactor.formattedCapacity)}</span>
                  </div>
                  <Progress value={(reactor.energy / reactor.energyCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {reactor.energyPerSecond > 0 && <span>+{reactor.energyPerSecond.toFixed(1)} per second</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={reactor.generateEnergy}
              disabled={!reactor.canGenerate}
              className={`system-panel w-full py-8 flex items-center justify-center mb-8 transition-colors ${
                !reactor.canGenerate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
              }`}
            >
              <div className="flex flex-col items-center">
                <Zap className={`h-12 w-12 text-chart-1 mb-2 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Generate Energy</span>
                <span className="text-xs text-muted-foreground mt-1">+1 Energy per click</span>
              </div>
            </button>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              <div className={`system-panel p-4 ${reactor.canUpgradeExpansions ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={reactor.upgradeExpansions}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Reactor Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{reactor.expansionCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {reactor.expansionDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {reactor.reactorExpansions}
                </div>
              </div>
              
              <div className={`system-panel p-4 ${reactor.canUpgradeConverters ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={reactor.upgradeConverters}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Energy Converter</span>
                  </div>
                  <span className="font-mono text-xs">{reactor.converterCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {reactor.converterDescription}
                </p>
                <div className="mt-2 text-xs">
                  Purchased: {reactor.energyConverters}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 