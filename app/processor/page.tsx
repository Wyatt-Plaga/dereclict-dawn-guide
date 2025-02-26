"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { CpuIcon, Brain, ArrowUpCircle, CircuitBoard } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSearchParams } from "next/navigation"
import { useSupabase } from "@/utils/supabase/context"
import { updateResource } from "@/utils/game-helpers"

export default function ProcessorPage() {
  const [insight, setInsight] = useState(0)
  const [mainframeCapacity, setMainframeCapacity] = useState(50)
  const [processingThreads, setProcessingThreads] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Supabase integration
  const { gameProgress, triggerSave } = useSupabase()
  
  // Synchronize local state with gameProgress from context
  useEffect(() => {
    if (gameProgress?.resources?.insight) {
      console.log("Initializing processor state from gameProgress:", gameProgress.resources.insight);
      setInsight(gameProgress.resources.insight.amount || 0);
      setMainframeCapacity(gameProgress.resources.insight.capacity || 50);
      setProcessingThreads(gameProgress.resources.insight.autoGeneration || 0);
    }
  }, [gameProgress]);
  
  // Auto-generate insight based on processingThreads rate (per second)
  useEffect(() => {
    if (processingThreads <= 0 || !gameProgress) return
    
    const interval = setInterval(() => {
      // Get current values from gameProgress to stay in sync
      const currentAmount = gameProgress.resources.insight?.amount || 0;
      const currentCapacity = gameProgress.resources.insight?.capacity || 50;
      const threads = gameProgress.resources.insight?.autoGeneration || 0;
      
      // Only proceed if we have processing threads
      if (threads <= 0) return;
      
      // Calculate new insight value respecting capacity
      const newValue = Math.min(currentAmount + threads * 0.2, currentCapacity);
      
      // Use updateResource to handle state update and trigger save
      updateResource(
        gameProgress,
        'insight',
        'amount',
        newValue,
        triggerSave
      );
      
      // Update local state for UI
      setInsight(newValue);
    }, 1000)
    
    return () => clearInterval(interval)
  }, [processingThreads, mainframeCapacity, gameProgress, triggerSave])
  
  // Generate insight on manual click
  const generateInsight = () => {
    if (!gameProgress) return;
    
    // Get current values from gameProgress
    const currentAmount = gameProgress.resources.insight?.amount || 0;
    const currentCapacity = gameProgress.resources.insight?.capacity || 50;
    
    // Calculate new insight value with +0.5 increment, respecting capacity
    const newValue = Math.min(currentAmount + 0.5, currentCapacity);
    
    console.log(`Generating insight: ${currentAmount} -> ${newValue}`);
    
    // Update and save automatically using helper function
    updateResource(
      gameProgress,
      'insight',
      'amount',
      newValue,
      triggerSave
    );
    
    // Update local state for UI
    setInsight(newValue);
  }
  
  // Upgrade mainframe capacity
  const upgradeMainframeCapacity = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.insight?.amount || 0;
    const currentCapacity = gameProgress.resources.insight?.capacity || 50;
    const upgradeCost = currentCapacity * 0.7;
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newCapacity = currentCapacity * 1.5;
      
      // Update insight amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'insight',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update capacity and trigger save
      updateResource(
        updatedProgress1,
        'insight',
        'capacity',
        newCapacity,
        triggerSave
      );
      
      // Update local state for UI
      setInsight(newAmount);
      setMainframeCapacity(newCapacity);
    }
  }
  
  // Upgrade processing threads
  const upgradeProcessingThreads = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.insight?.amount || 0;
    const currentThreads = gameProgress.resources.insight?.autoGeneration || 0;
    const threadCost = (currentThreads + 1) * 15;
    
    if (currentAmount >= threadCost) {
      // Calculate new values
      const newAmount = currentAmount - threadCost;
      const newThreads = currentThreads + 1;
      
      // Update insight amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'insight',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update processing threads and trigger save
      updateResource(
        updatedProgress1,
        'insight',
        'autoGeneration',
        newThreads,
        triggerSave
      );
      
      // Update local state for UI
      setInsight(newAmount);
      setProcessingThreads(newThreads);
    }
  }
  
  // Unlock tech tree item (placeholder for future expansion)
  const unlockTechItem = (itemId: string, cost: number) => {
    // This would be expanded with actual tech tree implementation
    if (insight >= cost) {
      setInsight(current => current - cost)
      // Add logic to unlock specific tech item
      console.log(`Tech item ${itemId} unlocked`)
    }
  }
  
  return (
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
              <span className="font-mono">{insight.toFixed(1)} / {Math.floor(mainframeCapacity)}</span>
            </div>
            <Progress value={(insight / mainframeCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {processingThreads > 0 && <span>+{(processingThreads * 0.2).toFixed(1)} per second</span>}
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
            <div className={`system-panel p-4 ${insight >= mainframeCapacity * 0.7 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                 onClick={upgradeMainframeCapacity}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ArrowUpCircle className="h-5 w-5 text-chart-2 mr-2" />
                  <span>Mainframe Expansion</span>
                </div>
                <span className="font-mono text-xs">{(mainframeCapacity * 0.7).toFixed(1)} Insight</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Expand insight storage capacity to {Math.floor(mainframeCapacity * 1.5)}
              </p>
            </div>
            
            {/* Processing threads upgrade */}
            <div className={`system-panel p-4 ${insight >= (processingThreads + 1) * 15 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                 onClick={upgradeProcessingThreads}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <CircuitBoard className="h-5 w-5 text-chart-2 mr-2" />
                  <span>Processing Thread</span>
                </div>
                <span className="font-mono text-xs">{((processingThreads + 1) * 15).toFixed(1)} Insight</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Add +0.2 automatic insight generation per second
              </p>
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
  )
} 