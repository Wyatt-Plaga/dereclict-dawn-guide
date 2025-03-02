"use client"

import { NavBar } from "@/components/ui/navbar"
import { Battery, Zap, ArrowUpCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'

export default function ReactorPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // Get reactor data from game state
  const reactor = state.categories.reactor
  const { energy } = reactor.resources
  const { energyCapacity, energyPerSecond } = reactor.stats
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering ReactorPage: Energy: ${energy}/${energyCapacity}`,
    LogContext.UI_RENDER
  )
  
  // Handle reactor click
  const generateEnergy = () => {
    Logger.debug(LogCategory.ACTIONS, "Manual energy generation clicked", LogContext.REACTOR_LIFECYCLE)
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: { category: 'reactor' }
    })
  }
  
  // Upgrade energy capacity
  const upgradeCapacity = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade reactor capacity clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'reactor',
        upgradeType: 'reactorExpansions'
      }
    })
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade energy converters clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'reactor',
        upgradeType: 'energyConverters'
      }
    })
  }
  
  // Calculate upgrade costs
  const expansionCost = Math.floor(energyCapacity * 0.8)
  const converterCost = (reactor.upgrades.energyConverters + 1) * 20
  
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
            
            {/* Resource display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Battery className="h-5 w-5 text-chart-1 mr-2" />
                  <span className="terminal-text">Energy</span>
                </div>
                <span className="font-mono">{Math.floor(energy)} / {Math.floor(energyCapacity)}</span>
              </div>
              <Progress value={(energy / energyCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
              <div className="text-xs text-muted-foreground mt-1">
                {energyPerSecond > 0 && <span>+{energyPerSecond} per second</span>}
              </div>
            </div>
            
            {/* Manual button */}
            <button 
              onClick={generateEnergy} 
              className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
            >
              <div className="flex flex-col items-center">
                <Zap className={`h-12 w-12 text-chart-1 mb-2 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Generate Energy</span>
                <span className="text-xs text-muted-foreground mt-1">+1 Energy per click</span>
              </div>
            </button>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              {/* Capacity upgrade */}
              <div className={`system-panel p-4 ${energy >= expansionCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeCapacity}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Reactor Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{expansionCost} Energy</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expand energy storage capacity to {Math.floor(energyCapacity * 1.5)}
                </p>
                <div className="mt-2 text-xs">
                  Level: {reactor.upgrades.reactorExpansions}
                </div>
              </div>
              
              {/* Auto generation upgrade */}
              <div className={`system-panel p-4 ${energy >= converterCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeAutoGeneration}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Energy Converter</span>
                  </div>
                  <span className="font-mono text-xs">{converterCost} Energy</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add +1 automatic energy generation per second
                </p>
                <div className="mt-2 text-xs">
                  Level: {reactor.upgrades.energyConverters}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 