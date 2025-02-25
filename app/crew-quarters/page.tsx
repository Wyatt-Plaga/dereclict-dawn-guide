"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Users, User, Home, Wrench, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"

export default function CrewQuartersPage() {
  const [crew, setCrew] = useState(0)
  const [crewCapacity, setCrewCapacity] = useState(5)
  const [awakening, setAwakening] = useState(0)
  const [workerCrews, setWorkerCrews] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Auto-generate crew based on workerCrews rate (per 10 seconds)
  useEffect(() => {
    if (workerCrews <= 0) return
    
    const interval = setInterval(() => {
      setCrew(current => {
        if (current >= crewCapacity) return current
        const newValue = current + workerCrews * 0.1 // 1 crew per 10 seconds per worker crew
        return newValue > crewCapacity ? crewCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [workerCrews, crewCapacity])
  
  // Generate crew on manual click (awakening)
  const awakenCrew = () => {
    if (crew >= crewCapacity) return
    
    // Add 0.1 to crew for each click (it takes 10 clicks to awaken 1 crew member)
    setCrew(current => {
      const newValue = current + 0.1
      return newValue > crewCapacity ? crewCapacity : newValue
    })
    
    // Increment awakening counter
    setAwakening(current => current + 1)
  }
  
  // Upgrade crew capacity
  const upgradeQuarters = () => {
    const upgradeCost = Math.floor(crewCapacity * 0.6)
    
    if (crew >= upgradeCost) {
      setCrew(current => current - upgradeCost)
      setCrewCapacity(current => current + 3)
    }
  }
  
  // Upgrade auto awakening
  const upgradeWorkerCrews = () => {
    const upgradeCost = Math.floor((workerCrews + 1) * 2.5)
    
    if (crew >= upgradeCost && workerCrews < 5) { // max 5 worker crews
      setCrew(current => current - upgradeCost)
      setWorkerCrews(current => current + 1)
    }
  }
  
  // Format crew count (show as integers when whole numbers, 1 decimal when partial)
  const formatCrewCount = (count: number) => {
    return Number.isInteger(count) ? count.toString() : count.toFixed(1)
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('crew') ? 'flickering-text' : ''}`}>Crew Quarters</h1>
          <p className="text-muted-foreground mb-6">
            Awaken and manage the ship's crew from cryostasis. Each crew member can be assigned to help with ship operations.
          </p>
          
          {/* Resource display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-chart-3 mr-2" />
                <span className="terminal-text">Crew Members</span>
              </div>
              <span className="font-mono">{formatCrewCount(crew)} / {crewCapacity}</span>
            </div>
            <Progress value={(crew / crewCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-3" />
            <div className="text-xs text-muted-foreground mt-1">
              {workerCrews > 0 && <span>+{(workerCrews * 0.1).toFixed(1)} per second (auto-awakening)</span>}
            </div>
          </div>
          
          {/* Manual button */}
          <button 
            onClick={awakenCrew} 
            disabled={crew >= crewCapacity}
            className={`system-panel w-full py-8 flex items-center justify-center mb-8 transition-colors ${
              crew >= crewCapacity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
            }`}
          >
            <div className="flex flex-col items-center">
              <User className={`h-12 w-12 text-chart-3 mb-2 ${shouldFlicker('crew') ? 'flickering-text' : ''}`} />
              <span className="terminal-text">Awaken Crew Member</span>
              <span className="text-xs text-muted-foreground mt-1">
                {awakening % 10 === 0 ? 
                  "Initiate awakening sequence" : 
                  `Awakening progress: ${awakening % 10}/10`
                }
              </span>
            </div>
          </button>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {/* Quarters upgrade */}
            <div 
              className={`system-panel p-4 ${crew >= Math.floor(crewCapacity * 0.6) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={upgradeQuarters}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Additional Quarters</span>
                </div>
                <span className="font-mono text-xs">{Math.floor(crewCapacity * 0.6)} Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Prepare {3} more crew quarters, increasing capacity to {crewCapacity + 3}
              </p>
            </div>
            
            {/* Worker crews upgrade */}
            {workerCrews < 5 && (
              <div 
                className={`system-panel p-4 ${crew >= Math.floor((workerCrews + 1) * 2.5) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                onClick={upgradeWorkerCrews}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Worker Crew</span>
                  </div>
                  <span className="font-mono text-xs">{Math.floor((workerCrews + 1) * 2.5)} Crew</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dedicate crew to help awaken others (+0.1 crew per second)
                </p>
              </div>
            )}
            
            {/* Crew assignments placeholder */}
            <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Crew Assignments</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Assign crew to boost operations in other ship systems
            </p>
            
            <div className="opacity-60 system-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Reactor Team</span>
                </div>
                <span className="font-mono text-xs">3 Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Assign crew to boost reactor efficiency [Coming Soon]
              </p>
            </div>
            
            <div className="opacity-60 system-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Research Team</span>
                </div>
                <span className="font-mono text-xs">3 Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Assign crew to assist with processing [Coming Soon]
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 