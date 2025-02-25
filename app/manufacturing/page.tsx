"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Cog, Wrench, Gauge, ArrowUpCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { OfflineProgress } from "@/components/ui/offline-progress"
import { ErrorBanner } from "@/components/ui/error-banner"
import { AuthCheck } from "@/components/auth/auth-check"
import { ErrorBoundary } from "@/components/providers/error-boundary"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useGameLoader } from "@/hooks/use-game-loader"

export default function ManufacturingPage() {
  const [scrap, setScrap] = useState(0)
  const [scrapCapacity, setScrapCapacity] = useState(100)
  const [autoGeneration, setAutoGeneration] = useState(0)
  const [showOfflineProgress, setShowOfflineProgress] = useState(false)
  const [offlineGain, setOfflineGain] = useState(0)
  const [lastOnline, setLastOnline] = useState(Date.now())
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { shouldFlicker } = useSystemStatus()
  
  // Set up auto-save
  const { isSaving, error: autoSaveError } = useAutoSave({
    resourceType: 'scrap',
    resourceData: {
      amount: scrap,
      capacity: scrapCapacity,
      autoGeneration
    }
  });
  
  // Set up game loading
  const { isLoading, error: loadingError, offlineGains } = useGameLoader({
    resourceType: 'scrap',
    onLoadSuccess: (data) => {
      setScrap(data.amount || 0);
      setScrapCapacity(data.capacity || 100);
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
  
  // Auto-generate scrap based on autoGeneration rate (per second)
  useEffect(() => {
    if (autoGeneration <= 0) return
    
    const interval = setInterval(() => {
      setScrap(current => {
        const newValue = current + autoGeneration * 0.4 // Scrap generates faster than other resources
        return newValue > scrapCapacity ? scrapCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoGeneration, scrapCapacity])
  
  // Generate scrap on manual click
  const generateScrap = () => {
    setScrap(current => {
      const newValue = current + 0.5
      return newValue > scrapCapacity ? scrapCapacity : newValue
    })
  }
  
  // Upgrade scrap capacity
  const upgradeCapacity = () => {
    const upgradeCost = Math.round(scrapCapacity * 0.5);
    
    if (scrap >= upgradeCost) {
      setScrap(current => current - upgradeCost)
      setScrapCapacity(current => current * 1.5)
    }
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    const upgradeCost = (autoGeneration + 1) * 25
    
    if (scrap >= upgradeCost) {
      setScrap(current => current - upgradeCost)
      setAutoGeneration(current => current + 1)
    }
  }
  
  // Handle closing the offline progress notification
  const handleCloseOfflineProgress = () => {
    setShowOfflineProgress(false)
    
    // Add the offline gain to the current scrap
    setScrap(current => {
      const newValue = current + offlineGain
      return newValue > scrapCapacity ? scrapCapacity : newValue
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
                resourceType="Scrap"
                gainAmount={offlineGain}
                lastOnlineTimestamp={lastOnline}
                onClose={handleCloseOfflineProgress}
                colorClass="text-chart-4"
              />
            )}
            
            <div className="system-panel p-6 mb-6">
              <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`}>Manufacturing Bay</h1>
              <p className="text-muted-foreground mb-6">
                Recycle ship debris and salvage materials to create useful components and resources.
              </p>
              
              {/* Resource display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Cog className="h-5 w-5 text-chart-4 mr-2" />
                    <span className="terminal-text">Scrap Material</span>
                  </div>
                  <span className="font-mono">{scrap.toFixed(1)} / {Math.floor(scrapCapacity)}</span>
                </div>
                <Progress value={(scrap / scrapCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-4" />
                <div className="text-xs text-muted-foreground mt-1">
                  {autoGeneration > 0 && <span>+{(autoGeneration * 0.4).toFixed(1)} per second</span>}
                </div>
              </div>
              
              {/* Manual button */}
              <button 
                onClick={generateScrap} 
                className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Wrench className={`h-12 w-12 text-chart-4 mb-2 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`} />
                  <span className="terminal-text">Salvage Materials</span>
                  <span className="text-xs text-muted-foreground mt-1">+0.5 Scrap per click</span>
                </div>
              </button>
              
              {/* Upgrades section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
                
                {/* Capacity upgrade */}
                <div 
                  className={`system-panel p-4 ${scrap >= Math.round(scrapCapacity * 0.5) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={upgradeCapacity}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Gauge className="h-5 w-5 text-chart-4 mr-2" />
                      <span>Expanded Storage</span>
                    </div>
                    <span className="font-mono text-xs">{Math.round(scrapCapacity * 0.5)} Scrap</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expand storage capacity to {Math.floor(scrapCapacity * 1.5)}
                  </p>
                </div>
                
                {/* Auto generation upgrade */}
                <div 
                  className={`system-panel p-4 ${scrap >= (autoGeneration + 1) * 25 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={upgradeAutoGeneration}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 text-chart-4 mr-2" />
                      <span>Auto-Salvager</span>
                    </div>
                    <span className="font-mono text-xs">{(autoGeneration + 1) * 25} Scrap</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add +1 salvaging bot (+0.4 Scrap per second)
                  </p>
                </div>
                
                {/* Crafting section */}
                <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Crafting</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Create components from scrap materials
                </p>
                
                <div className="opacity-60 system-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Cog className="h-5 w-5 text-chart-4 mr-2" />
                      <span>Reactor Component</span>
                    </div>
                    <span className="font-mono text-xs">50 Scrap</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Boost reactor efficiency by 10% [Coming Soon]
                  </p>
                </div>
                
                <div className="opacity-60 system-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Cog className="h-5 w-5 text-chart-4 mr-2" />
                      <span>Processing Unit</span>
                    </div>
                    <span className="font-mono text-xs">75 Scrap</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Increase insight generation by 15% [Coming Soon]
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