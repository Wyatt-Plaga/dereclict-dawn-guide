"use client"

import { NavBar } from "@/components/ui/navbar"
import { CpuIcon, BrainCircuit, ArrowUpCircle, CircuitBoard, MinusCircle, PlusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import { useProcessor } from "@/app/game/hooks/useProcessor"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { Button } from "@/components/ui/button"

export default function ProcessorPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const processor = useProcessor()
  
  // Log component render
  Logger.debug(
    LogCategory.UI, 
    `Processor page rendering with insight: ${processor.insight.toFixed(1)}`,
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
            
            {/* Resource display and automation controls */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                {processor.processingThreads > 0 && (
                  <div className="order-2 md:order-1 mt-3 md:mt-0 mb-3 md:mb-0 bg-background/30 rounded-md p-2 md:min-w-[140px]">
                    <div className="text-center mb-1">
                      <span className="text-xs text-muted-foreground">Active Threads</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); processor.adjustActiveThreads('decrease'); }} 
                        disabled={!processor.canDecreaseThreads}
                        className="h-7 w-7 rounded-md"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="font-mono text-sm font-semibold mx-2">
                        {processor.activeProcessingThreads}/{processor.processingThreads}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); processor.adjustActiveThreads('increase'); }} 
                        disabled={!processor.canIncreaseThreads}
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
                      <BrainCircuit className="h-5 w-5 text-chart-2 mr-2" />
                      <span className="terminal-text">Insight</span>
                    </div>
                    <span className="font-mono">{processor.insight.toFixed(1)} / {processor.insightCapacity.toFixed(0)}</span>
                  </div>
                  <Progress value={(processor.insight / processor.insightCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {processor.insightPerSecond > 0 && <span>+{processor.insightPerSecond.toFixed(1)} per second</span>}
                    {processor.insightPerClick > 0 && <span> +{processor.insightPerClick.toFixed(1)} per click</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Manual button */}
            <button 
              onClick={processor.generateInsight} 
              disabled={!processor.canGenerateWithEnergy}
              className={`system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors ${!processor.canGenerateWithEnergy ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center">
                <CpuIcon className={`h-12 w-12 text-chart-2 mb-2 ${shouldFlicker('processor') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Process Data</span>
                <span className="text-xs text-muted-foreground mt-1">+{processor.insightPerClick.toFixed(1)} Insight per click</span>
              </div>
            </button>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              {/* Mainframe capacity upgrade */}
              <div className={`system-panel p-4 ${processor.canUpgradeBuffers ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={processor.upgradeBuffers}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Mainframe Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{processor.bufferCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {processor.bufferDescription} 
                </p>
                <div className="mt-2 text-xs">
                  Level: {processor.dataBuffers}
                </div>
              </div>
              
              {/* Processing threads upgrade */}
              <div className={`system-panel p-4 ${processor.canUpgradeThreads ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={processor.upgradeThreads}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CircuitBoard className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Processing Thread</span>
                  </div>
                  <span className="font-mono text-xs">{processor.threadCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {processor.threadDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {processor.processingThreads}
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