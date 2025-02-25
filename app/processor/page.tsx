"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Lightbulb, CpuIcon, Gauge, ArrowUpCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { OfflineProgress } from "@/components/ui/offline-progress"
import { ErrorBanner } from "@/components/ui/error-banner"
import { AuthCheck } from "@/components/auth/auth-check"
import { ErrorBoundary } from "@/components/providers/error-boundary"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useGameLoader } from "@/hooks/use-game-loader"

export default function ProcessorPage() {
  const [insight, setInsight] = useState(0)
  const [insightCapacity, setInsightCapacity] = useState(50)
  const [autoGeneration, setAutoGeneration] = useState(0)
  const [showOfflineProgress, setShowOfflineProgress] = useState(false)
  const [offlineGain, setOfflineGain] = useState(0)
  const [lastOnline, setLastOnline] = useState(Date.now())
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { shouldFlicker } = useSystemStatus()
  
  // Set up auto-save
  const { isSaving, error: autoSaveError } = useAutoSave({
    resourceType: 'insight',
    resourceData: {
      amount: insight,
      capacity: insightCapacity,
      autoGeneration
    }
  });
  
  // Set up game loading
  const { isLoading, error: loadingError, offlineGains } = useGameLoader({
    resourceType: 'insight',
    onLoadSuccess: (data) => {
      setInsight(data.amount || 0);
      setInsightCapacity(data.capacity || 50);
      setAutoGeneration(data.autoGeneration || 0);
      
      if (data.offlineGain && data.offlineGain > 0) {
        setOfflineGain(data.offlineGain);
        setLastOnline(Date.now() - (data.timeSinceLastOnline || 0));
        setShowOfflineProgress(true);
      }
    }
  });
  
  // Update errors
  useEffect(() => {
    if (autoSaveError) setSaveError(autoSaveError);
    if (loadingError) setLoadError(loadingError);
  }, [autoSaveError, loadingError]);
  
  // Auto-generate insight based on autoGeneration rate (per second)
  useEffect(() => {
    if (autoGeneration <= 0) return
    
    const interval = setInterval(() => {
      setInsight(current => {
        const newValue = current + autoGeneration * 0.2 // Processing is slower than reactor
        return newValue > insightCapacity ? insightCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoGeneration, insightCapacity])
  
  // Generate insight on manual click
  const generateInsight = () => {
    setInsight(current => {
      const newValue = current + 0.2 // Insight generation is slower
      return newValue > insightCapacity ? insightCapacity : newValue
    })
  }
  
  // Upgrade insight capacity
  const upgradeCapacity = () => {
    const upgradeCost = Math.round(insightCapacity * 0.75);
    
    if (insight >= upgradeCost) {
      setInsight(current => current - upgradeCost)
      setInsightCapacity(current => current * 1.4)
    }
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    const upgradeCost = (autoGeneration + 1) * 15
    
    if (insight >= upgradeCost) {
      setInsight(current => current - upgradeCost)
      setAutoGeneration(current => current + 1)
    }
  }
  
  // Handle closing the offline progress notification
  const handleCloseOfflineProgress = () => {
    setShowOfflineProgress(false)
    
    // Add the offline gain to the current insight
    setInsight(current => {
      const newValue = current + offlineGain
      return newValue > insightCapacity ? insightCapacity : newValue
    })
  }
  
  return (
    <AuthCheck>
      <ErrorBoundary>
        <main className="flex min-h-screen flex-col">
          <NavBar />
          
          <div className="flex flex-col p-4 md:p-8 md:ml-64">
            {(saveError || loadError) && (
              <ErrorBanner 
                message={saveError || loadError || 'An error occurred'} 
                onClose={() => {
                  setSaveError(null);
                  setLoadError(null);
                }}
              />
            )}
            
            {showOfflineProgress && autoGeneration > 0 && (
              <OfflineProgress
                resourceType="Insight"
                gainAmount={offlineGain}
                lastOnlineTimestamp={lastOnline}
                onClose={handleCloseOfflineProgress}
                colorClass="text-chart-2"
              />
            )}
            
            <div className="system-panel p-6 mb-6">
              <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('processor') ? 'flickering-text' : ''}`}>Processor Core</h1>
              <p className="text-muted-foreground mb-6">
                The ship's computational center. Analyze and process data to generate insights and upgrades.
              </p>
              
              {/* Resource display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-chart-2 mr-2" />
                    <span className="terminal-text">Insight</span>
                  </div>
                  <span className="font-mono">{insight.toFixed(1)} / {Math.floor(insightCapacity)}</span>
                </div>
                <Progress value={(insight / insightCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {autoGeneration > 0 && <span>+{(autoGeneration * 0.2).toFixed(1)} per second</span>}
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
                  <span className="text-xs text-muted-foreground mt-1">+0.2 Insight per click</span>
                </div>
              </button>
              
              {/* Upgrades section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
                
                {/* Capacity upgrade */}
                <div 
                  className={`system-panel p-4 ${insight >= Math.round(insightCapacity * 0.75) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={upgradeCapacity}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Gauge className="h-5 w-5 text-chart-2 mr-2" />
                      <span>Mainframe Capacity</span>
                    </div>
                    <span className="font-mono text-xs">{Math.round(insightCapacity * 0.75)} Insight</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expand data storage capacity to {Math.floor(insightCapacity * 1.4)}
                  </p>
                </div>
                
                {/* Auto generation upgrade */}
                <div 
                  className={`system-panel p-4 ${insight >= (autoGeneration + 1) * 15 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={upgradeAutoGeneration}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 text-chart-2 mr-2" />
                      <span>Processing Thread</span>
                    </div>
                    <span className="font-mono text-xs">{(autoGeneration + 1) * 15} Insight</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add +1 processing thread (+0.2 Insight per second)
                  </p>
                </div>
                
                {/* Research tree placeholder */}
                <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Research</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Use insights to unlock advanced ship systems
                </p>
                
                <div className="opacity-60 system-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 text-chart-2 mr-2" />
                      <span>Enhanced Reactor Coupling</span>
                    </div>
                    <span className="font-mono text-xs">75 Insight</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Improve reactor energy output by 25% [Coming Soon]
                  </p>
                </div>
                
                <div className="opacity-60 system-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 text-chart-2 mr-2" />
                      <span>Neural Response Algorithms</span>
                    </div>
                    <span className="font-mono text-xs">100 Insight</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unlock new AI capabilities and narrative options [Coming Soon]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ErrorBoundary>
    </AuthCheck>
  )
} 