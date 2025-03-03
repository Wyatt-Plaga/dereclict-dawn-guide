"use client"

import { NavBar } from "@/components/ui/navbar"
import { CpuIcon, Brain, ArrowUpCircle, CircuitBoard } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'

export default function ProcessorPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // Get processor data from game state
  const processor = state.categories.processor
  const { insight } = processor.resources
  const { insightCapacity, insightPerSecond } = processor.stats
  
  // Log component render
  Logger.debug(
    LogCategory.UI, 
    `Processor page rendering with insight: ${insight}`,
    [LogContext.UI_RENDER, LogContext.PROCESSOR_LIFECYCLE]
  );
  
  // Generate insight on manual click
  const generateInsight = () => {
    Logger.debug(
      LogCategory.UI, 
      'Process data button clicked', 
      LogContext.PROCESSOR_LIFECYCLE
    );
    
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: {
        category: 'processor'
      }
    })
  }
  
  // Upgrade insight capacity
  const upgradeMainframeCapacity = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade mainframe capacity clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'processor',
        upgradeType: 'mainframeExpansions'
      }
    })
  }
  
  // Upgrade auto generation
  const upgradeProcessingThreads = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade processing threads clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'processor',
        upgradeType: 'processingThreads'
      }
    })
  }
  
  // Calculate upgrade costs
  const expansionCost = Math.floor(insightCapacity * 0.7)
  const threadCost = (processor.upgrades.processingThreads + 1) * 15
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('processor') ? 'flickering-text' : ''}`}>Quantum Processor</h1>
            <p className="text-muted-foreground mb-6">
              Manage ship's computational resources. Generate Insight to unlock advanced ship capabilities.
            </p>
            
            {/* Resource display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-chart-2 mr-2" />
                  <span className="terminal-text">Insight</span>
                </div>
                <span className="font-mono">{Math.floor(insight)} / {Math.floor(insightCapacity)}</span>
              </div>
              <Progress value={(insight / insightCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {insightPerSecond > 0 && <span>+{insightPerSecond.toFixed(1)} per second</span>}
              </div>
            </div>
            
            {/* Manual button */}
            <button 
              onClick={generateInsight} 
              className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
            >
              <div className="flex flex-col items-center">
                <CpuIcon className={`h-12 w-12 text-chart-2 mb-2 ${shouldFlicker('processor') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Process Data</span>
                <span className="text-xs text-muted-foreground mt-1">+0.5 Insight per click</span>
              </div>
            </button>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              {/* Mainframe capacity upgrade */}
              <div className={`system-panel p-4 ${insight >= expansionCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeMainframeCapacity}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Mainframe Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{expansionCost} Insight</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expand insight storage capacity to {Math.floor(insightCapacity * 1.5)}
                </p>
                <div className="mt-2 text-xs">
                  Level: {processor.upgrades.mainframeExpansions}
                </div>
              </div>
              
              {/* Processing threads upgrade */}
              <div className={`system-panel p-4 ${insight >= threadCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeProcessingThreads}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CircuitBoard className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Processing Thread</span>
                  </div>
                  <span className="font-mono text-xs">{threadCost} Insight</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add +0.2 automatic insight generation per second
                </p>
                <div className="mt-2 text-xs">
                  Level: {processor.upgrades.processingThreads}
                </div>
              </div>
              
              {/* Tech tree section (placeholder for future expansion) */}
              <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Tech Tree</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Unlock advanced technologies to improve ship functions
              </p>
              
              <div className="opacity-60 system-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CircuitBoard className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Advanced Navigation</span>
                  </div>
                  <span className="font-mono text-xs">100 Insight</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unlock advanced navigation systems [Coming Soon]
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 