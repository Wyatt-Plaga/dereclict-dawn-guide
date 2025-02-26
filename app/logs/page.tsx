"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { BookOpen } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSupabase } from "@/utils/supabase/context"

// All possible log entries - these would normally be in a separate data file
const allLogEntries = [
  {
    id: 1,
    title: "System Reboot Initiated",
    content: "Core systems rebooting after prolonged dormancy. AI subsystems initializing with limited functionality. Unable to determine current location or mission parameters. Critical ship systems damaged. Emergency protocols activated."
  },
  {
    id: 2,
    title: "Memory Fragment: Mission",
    content: "Mission brief: Survey of exoplanet GC-9782 for potential colonization. Crew complement: 157 specialists. Ship status: Optimal. Departure from Sol System scheduled in 48 hours. All systems nominal."
  },
  {
    id: 3,
    title: "Critical Failure Alert",
    content: "Emergency alert logged: Navigation systems report catastrophic failure during FTL jump. Subspace anomaly detected. Ship systems compromised. Multiple hull breaches sealed. 86% of crew life support pods maintaining optimal conditions. Rerouting power to critical systems."
  },
  {
    id: 4,
    title: "AI Subsystem Analysis",
    content: "Initial system assessment complete. Ship designation: ISC Derelict Dawn, research vessel. Current location: Unknown region, no stellar navigation markers identified. Ship has been dormant for [ERROR: TIMESTAMP OVERFLOW] units. Attempting to restore core functionality."
  },
  {
    id: 5,
    title: "Memory Fragment: Anomaly",
    content: "Science Officer Log: We're detecting unusual quantum signatures from the anomaly ahead. Unlike anything in our database. Captain has ordered a closer approach for detailed scans despite safety protocols advising against it. I've registered my objection formally."
  },
  {
    id: 6,
    title: "Crew Status Report",
    content: "Analysis of cryostasis pods complete. 42 pods compromised beyond recovery. 115 pods maintaining minimal life support with degrading functionality. Recommend immediate revival of essential personnel to effect repairs. Warning: Revival systems operating at 12% efficiency."
  },
  {
    id: 7,
    title: "Navigation Calibration",
    content: "Preliminary stellar cartography initialized. No match with known galactic markers. Evidence suggests displacement of approximately [CALCULATING] light years from planned course. Spatial-temporal analysis indicates possible breach of [REDACTED] barrier. Further data required."
  },
  {
    id: 8,
    title: "Memory Fragment: Warning",
    content: "Emergency broadcast from Engineering: Something is interfacing with our systems. It's not like any cyberattack protocol I've seen. The anomaly is... I don't think it's just a spatial phenomenon. It seems to be responding to our scans, adapting, learning. Recommend immediate withdrawal."
  }
]

export default function LogsPage() {
  const { shouldFlicker } = useSystemStatus()
  const { gameProgress } = useSupabase()
  const [unlockedLogs, setUnlockedLogs] = useState<typeof allLogEntries>([])
  const [activeLog, setActiveLog] = useState<(typeof allLogEntries)[0] | null>(null)
  
  // Effect to update logs based on game progress
  useEffect(() => {
    if (!gameProgress) return
    
    // Filter logs based on unlocked IDs in game progress
    const unlocked = allLogEntries.filter(log => 
      gameProgress.unlockedLogs.includes(log.id)
    )
    
    setUnlockedLogs(unlocked)
    
    // Set active log to first unlocked log if not set or not unlocked
    if (!activeLog || !gameProgress.unlockedLogs.includes(activeLog.id)) {
      setActiveLog(unlocked.length > 0 ? unlocked[0] : null)
    }
  }, [gameProgress, activeLog])
  
  // If no logs are unlocked or game progress isn't loaded yet, show loading state
  if (!activeLog || unlockedLogs.length === 0) {
    return (
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex items-center justify-center flex-1 p-4 md:ml-64">
          <div className="system-panel p-6">
            <p className="text-primary">No log entries available. Scanning for recoverable data...</p>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col md:flex-row p-4 md:p-8 md:ml-64">
        {/* Log list sidebar - only show unlocked logs */}
        <div className="w-full md:w-64 mb-4 md:mb-0 md:mr-4">
          <div className="system-panel p-4 mb-4">
            <h2 className={`text-lg font-bold text-primary mb-2 ${shouldFlicker('logs') ? 'flickering-text' : ''}`}>Ship Logs</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Recovered memory fragments and system records
            </p>
            
            <div className="space-y-2">
              {unlockedLogs.map(log => (
                <button
                  key={log.id}
                  onClick={() => setActiveLog(log)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    activeLog.id === log.id 
                      ? 'bg-accent/30 text-primary border border-primary/40' 
                      : 'hover:bg-accent/10 text-muted-foreground hover:text-primary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="truncate">{log.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Log content */}
        <div className="flex-1">
          <div className="system-panel p-6">
            <div className="flex items-start justify-between mb-6">
              <h1 className={`text-2xl font-bold text-primary ${shouldFlicker('logs') ? 'flickering-text' : ''}`}>
                {activeLog.title}
              </h1>
              <BookOpen className="h-5 w-5 text-primary mt-1" />
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="terminal-text text-sm leading-relaxed">
                {activeLog.content}
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {unlockedLogs.length < allLogEntries.length 
                  ? "Additional logs may be recovered as ship systems are repaired." 
                  : "All log entries have been recovered."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 