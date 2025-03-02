"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { CpuIcon, Brain, ArrowUpCircle, CircuitBoard } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSearchParams } from "next/navigation"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"

export default function ProcessorPage() {
  const [insight, setInsight] = useState(0)
  const [mainframeCapacity, setMainframeCapacity] = useState(50)
  const [processingThreads, setProcessingThreads] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Log component mount
  useEffect(() => {
    Logger.debug(
      LogCategory.UI, 
      "Processor page mounted",
      [LogContext.UI_RENDER, LogContext.PROCESSOR_LIFECYCLE]
    );
    
    return () => {
      Logger.debug(
        LogCategory.UI, 
        "Processor page unmounted",
        [LogContext.UI_RENDER, LogContext.PROCESSOR_LIFECYCLE]
      );
    };
  }, []);
  
  // Auto-generate insight based on processingThreads rate (per second)
  useEffect(() => {
    if (processingThreads <= 0) return
    
    Logger.debug(
      LogCategory.RESOURCES, 
      `Setting up automatic insight generation: +${processingThreads * 0.2}/s`,
      LogContext.PROCESSOR_LIFECYCLE
    );
    
    const interval = setInterval(() => {
      setInsight(current => {
        const newValue = current + processingThreads * 0.2
        const capped = newValue > mainframeCapacity ? mainframeCapacity : newValue;
        
        if (capped === mainframeCapacity && newValue > mainframeCapacity) {
          Logger.debug(
            LogCategory.RESOURCES,
            "Insight generation capped at maximum capacity",
            LogContext.PROCESSOR_LIFECYCLE
          );
        }
        
        return capped;
      })
    }, 1000)
    
    return () => {
      Logger.debug(
        LogCategory.RESOURCES, 
        "Cleaning up automatic insight generation",
        LogContext.PROCESSOR_LIFECYCLE
      );
      clearInterval(interval);
    }
  }, [processingThreads, mainframeCapacity])
  
  // Generate insight on manual click
  const generateInsight = () => {
    Logger.debug(
      LogCategory.UI, 
      "Process data button clicked", 
      LogContext.PROCESSOR_LIFECYCLE
    );
    
    setInsight(current => {
      const newValue = current + 0.5
      const capped = newValue > mainframeCapacity ? mainframeCapacity : newValue;
      
      Logger.debug(
        LogCategory.RESOURCES,
        `Insight generated: ${current} → ${capped}`,
        LogContext.PROCESSOR_LIFECYCLE
      );
      
      return capped;
    })
  }
  
  // Upgrade mainframe capacity
  const upgradeMainframeCapacity = () => {
    const upgradeCost = mainframeCapacity * 0.7
    
    Logger.debug(
      LogCategory.UI, 
      `Mainframe expansion clicked. Cost: ${upgradeCost.toFixed(1)}`, 
      [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
    );
    
    if (insight >= upgradeCost) {
      setInsight(current => {
        const newValue = current - upgradeCost;
        Logger.info(
          LogCategory.UPGRADES,
          `Purchased mainframe expansion. Insight: ${current.toFixed(1)} → ${newValue.toFixed(1)}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        return newValue;
      });
      
      setMainframeCapacity(current => {
        const newValue = current * 1.5;
        Logger.info(
          LogCategory.UPGRADES,
          `Mainframe capacity increased: ${current} → ${newValue.toFixed(1)}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        return newValue;
      });
    } else {
      Logger.debug(
        LogCategory.UPGRADES,
        `Insufficient insight for mainframe expansion (have: ${insight.toFixed(1)}, need: ${upgradeCost.toFixed(1)})`,
        [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
      );
    }
  }
  
  // Upgrade processing threads
  const upgradeProcessingThreads = () => {
    const threadCost = (processingThreads + 1) * 15
    
    Logger.debug(
      LogCategory.UI, 
      `Processing thread upgrade clicked. Cost: ${threadCost}`, 
      [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
    );
    
    if (insight >= threadCost) {
      setInsight(current => {
        const newValue = current - threadCost;
        Logger.info(
          LogCategory.UPGRADES,
          `Purchased processing thread. Insight: ${current.toFixed(1)} → ${newValue.toFixed(1)}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        return newValue;
      });
      
      setProcessingThreads(current => {
        const newValue = current + 1;
        Logger.info(
          LogCategory.UPGRADES,
          `Processing threads increased: ${current} → ${newValue}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        return newValue;
      });
    } else {
      Logger.debug(
        LogCategory.UPGRADES,
        `Insufficient insight for processing thread (have: ${insight.toFixed(1)}, need: ${threadCost})`,
        [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
      );
    }
  }
  
  // Unlock tech tree item (placeholder for future expansion)
  const unlockTechItem = (itemId: string, cost: number) => {
    // This would be expanded with actual tech tree implementation
    Logger.debug(
      LogCategory.UI,
      `Tech item ${itemId} unlock attempted. Cost: ${cost}`,
      [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
    );
    
    if (insight >= cost) {
      setInsight(current => {
        const newValue = current - cost;
        Logger.info(
          LogCategory.UPGRADES,
          `Tech item ${itemId} unlocked. Insight: ${current.toFixed(1)} → ${newValue.toFixed(1)}`,
          [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
        );
        return newValue;
      });
    } else {
      Logger.debug(
        LogCategory.UPGRADES,
        `Insufficient insight for tech item ${itemId} (have: ${insight.toFixed(1)}, need: ${cost})`,
        [LogContext.UPGRADE_PURCHASE, LogContext.PROCESSOR_LIFECYCLE]
      );
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
              <span className="font-mono">{insight.toFixed(1)} / {mainframeCapacity}</span>
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
                Expand insight storage capacity to {(mainframeCapacity * 1.5).toFixed(1)}
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