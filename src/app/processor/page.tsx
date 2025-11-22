"use client"

import { NavBar } from "@/components/ui/navbar"
import { CpuIcon, Brain, ArrowUpCircle, CircuitBoard, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'

export default function ProcessorPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const { devMode } = useDevMode()
  
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
  
  // Efficiency upgrade handling
  const efficiencyLevel = state.categories.processor.upgrades.threadEfficiency || 0
  const efficiencyCost = 10 * Math.pow(efficiencyLevel + 1, 2)

  const purchaseEfficiency = () => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'processor', upgradeType: 'threadEfficiency' }
    })
  }
  
  const relics = state.relics
  
  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('processor') ? 'flickering-text' : ''}`}>Quantum Processor</h1>
            <p className="text-muted-foreground mb-6">
              Manage ship&apos;s computational resources. Generate Insight to unlock advanced ship capabilities.
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
              <button
                className={`w-full system-panel p-4 text-left transition-all relative overflow-hidden group ${
                  insight >= expansionCost 
                    ? 'hover:bg-chart-2/10 hover:border-chart-2/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(var(--chart-2),0.2)]' 
                    : 'opacity-50 cursor-not-allowed grayscale'
                }`}
                disabled={insight < expansionCost}
                onClick={upgradeMainframeCapacity}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-chart-2/5 to-transparent opacity-0 transition-opacity duration-300 ${insight >= expansionCost ? 'group-hover:opacity-100' : ''}`} />
                
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center">
                    <ArrowUpCircle className={`h-5 w-5 mr-3 ${insight >= expansionCost ? 'text-chart-2' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold ${insight >= expansionCost ? 'text-foreground' : 'text-muted-foreground'}`}>Mainframe Expansion</span>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${insight >= expansionCost ? 'bg-chart-2/20 text-chart-2' : 'bg-muted/20 text-muted-foreground'}`}>
                    {expansionCost} Insight
                  </span>
                </div>
                <p className="text-xs text-muted-foreground relative z-10">
                  Expand insight storage capacity to {Math.floor(insightCapacity * 1.5)}
                </p>
                <div className="mt-2 text-xs font-mono text-primary/60 relative z-10">
                  Level: {processor.upgrades.mainframeExpansions}
                </div>
              </button>
              
              {/* Processing threads upgrade */}
              <button
                className={`w-full system-panel p-4 text-left transition-all relative overflow-hidden group ${
                  insight >= threadCost 
                    ? 'hover:bg-chart-2/10 hover:border-chart-2/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(var(--chart-2),0.2)]' 
                    : 'opacity-50 cursor-not-allowed grayscale'
                }`}
                disabled={insight < threadCost}
                onClick={upgradeProcessingThreads}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-chart-2/5 to-transparent opacity-0 transition-opacity duration-300 ${insight >= threadCost ? 'group-hover:opacity-100' : ''}`} />
                
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center">
                    <CircuitBoard className={`h-5 w-5 mr-3 ${insight >= threadCost ? 'text-chart-2' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold ${insight >= threadCost ? 'text-foreground' : 'text-muted-foreground'}`}>Processing Thread</span>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${insight >= threadCost ? 'bg-chart-2/20 text-chart-2' : 'bg-muted/20 text-muted-foreground'}`}>
                    {threadCost} Insight
                  </span>
                </div>
                <p className="text-xs text-muted-foreground relative z-10">
                  Add +0.2 automatic insight generation per second
                </p>
                <div className="mt-2 text-xs font-mono text-primary/60 relative z-10">
                  Level: {processor.upgrades.processingThreads}
                </div>
              </button>
              
              {/* Thread efficiency upgrade */}
              {(devMode || relics > 0 || efficiencyLevel > 0) && (
              <div className={`system-panel p-4 ${relics >= efficiencyCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={purchaseEfficiency}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Processing Efficiency</span>
                  </div>
                  <span className="font-mono text-xs">{efficiencyCost} Relics</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each thread now generates +{(0.2 + efficiencyLevel).toFixed(1)} insight/s
                </p>
                <div className="mt-2 text-xs">Level: {efficiencyLevel}</div>
              </div>)}
              
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
