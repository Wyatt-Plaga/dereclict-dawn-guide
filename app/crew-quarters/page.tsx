"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Users, Brain, CpuIcon, ArrowUpCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { OfflineProgress } from "@/components/ui/offline-progress"
import { ErrorBanner } from "@/components/ui/error-banner"
import { AuthCheck } from "@/components/auth/auth-check"
import { ErrorBoundary } from "@/components/providers/error-boundary"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useGameLoader } from "@/hooks/use-game-loader"

export default function CrewQuartersPage() {
  const [morale, setMorale] = useState(0)
  const [moraleCapacity, setMoraleCapacity] = useState(50)
  const [autoGeneration, setAutoGeneration] = useState(0)
  const [showOfflineProgress, setShowOfflineProgress] = useState(false)
  const [offlineGain, setOfflineGain] = useState(0)
  const [lastOnline, setLastOnline] = useState(Date.now())
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { shouldFlicker } = useSystemStatus()
  
  // Set up auto-save
  const { isSaving, error: autoSaveError } = useAutoSave({
    resourceType: 'crew',
    resourceData: {
      amount: morale,
      capacity: moraleCapacity,
      autoGeneration
    }
  });
  
  // Set up game loading
  const { isLoading, error: loadingError, offlineGains } = useGameLoader({
    resourceType: 'crew',
    onLoadSuccess: (data) => {
      setMorale(data.amount || 0);
      setMoraleCapacity(data.capacity || 50);
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
  
  // Auto-generate morale based on autoGeneration rate (per second)
  useEffect(() => {
    if (autoGeneration <= 0) return
    
    const interval = setInterval(() => {
      setMorale(current => {
        const newValue = current + autoGeneration * 0.1 // Morale generates slowest
        return newValue > moraleCapacity ? moraleCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoGeneration, moraleCapacity])
  
  // Generate morale on manual click
  const generateMorale = () => {
    setMorale(current => {
      const newValue = current + 0.3
      return newValue > moraleCapacity ? moraleCapacity : newValue
    })
  }
  
  // Upgrade morale capacity
  const upgradeCapacity = () => {
    const upgradeCost = Math.round(moraleCapacity * 0.8);
    
    if (morale >= upgradeCost) {
      setMorale(current => current - upgradeCost)
      setMoraleCapacity(current => current * 1.3)
    }
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    const upgradeCost = (autoGeneration + 1) * 20
    
    if (morale >= upgradeCost) {
      setMorale(current => current - upgradeCost)
      setAutoGeneration(current => current + 1)
    }
  }
  
  // Handle closing the offline progress notification
  const handleCloseOfflineProgress = () => {
    setShowOfflineProgress(false)
    
    // Add the offline gain to the current morale
    setMorale(current => {
      const newValue = current + offlineGain
      return newValue > moraleCapacity ? moraleCapacity : newValue
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
                resourceType="Morale"
                gainAmount={offlineGain}
                lastOnlineTimestamp={lastOnline}
                onClose={handleCloseOfflineProgress}
                colorClass="text-chart-3"
              />
            )}
            
            <div className="system-panel p-6 mb-6">
              <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('crew') ? 'flickering-text' : ''}`}>Crew Quarters</h1>
              <p className="text-muted-foreground mb-6">
                Monitor the ship's crew morale and schedule recreational activities to boost productivity.
              </p>
              
              {/* Resource display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 text-chart-3 mr-2" />
                    <span className="terminal-text">Morale</span>
                  </div>
                  <span className="font-mono">{morale.toFixed(1)} / {Math.floor(moraleCapacity)}</span>
                </div>
                <Progress value={(morale / moraleCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-3" />
                <div className="text-xs text-muted-foreground mt-1">
                  {autoGeneration > 0 && <span>+{(autoGeneration * 0.1).toFixed(1)} per second</span>}
                </div>
              </div>
              
              {/* Manual button */}
              <button 
                onClick={generateMorale} 
                className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Users className={`h-12 w-12 text-chart-3 mb-2 ${shouldFlicker('crew') ? 'flickering-text' : ''}`} />
                  <span className="terminal-text">Boost Morale</span>
                  <span className="text-xs text-muted-foreground mt-1">+0.3 Morale per click</span>
                </div>
              </button>
              
              {/* Upgrades section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
                
                {/* Capacity upgrade */}
                <div 
                  className={`system-panel p-4 ${morale >= Math.round(moraleCapacity * 0.8) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={upgradeCapacity}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 text-chart-3 mr-2" />
                      <span>Quarters Expansion</span>
                    </div>
                    <span className="font-mono text-xs">{Math.round(moraleCapacity * 0.8)} Morale</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Improve crew living quarters to {Math.floor(moraleCapacity * 1.3)}
                  </p>
                </div>
                
                {/* Auto generation upgrade */}
                <div 
                  className={`system-panel p-4 ${morale >= (autoGeneration + 1) * 20 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={upgradeAutoGeneration}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CpuIcon className="h-5 w-5 text-chart-3 mr-2" />
                      <span>Recreation Program</span>
                    </div>
                    <span className="font-mono text-xs">{(autoGeneration + 1) * 20} Morale</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add +1 automated recreation program (+0.1 Morale per second)
                  </p>
                </div>
                
                {/* Placeholder for future features */}
                <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Crew Initiatives</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Special crew projects that provide unique bonuses
                </p>
                
                <div className="opacity-60 system-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-chart-3 mr-2" />
                      <span>Team-Building Exercise</span>
                    </div>
                    <span className="font-mono text-xs">80 Morale</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temporarily boosts all resource generation by 20% [Coming Soon]
                  </p>
                </div>
                
                <div className="opacity-60 system-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-chart-3 mr-2" />
                      <span>Stress Management Program</span>
                    </div>
                    <span className="font-mono text-xs">120 Morale</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Increases offline resource accumulation rate [Coming Soon]
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