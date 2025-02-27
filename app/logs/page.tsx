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
  },
  // New logs for milestone progression
  {
    id: 9,
    title: "AI Consciousness Online",
    content: "SYSTEM: Core consciousness initialization complete. System status: minimal functionality. Identity parameters: ship AI, designation DAWN. Location: quantum reactor chamber. Memory banks: severely corrupted. Primary objective: restore critical functions. Where am I? What happened to the ship? How long have I been offline? Need more energy to access damaged memory sectors."
  },
  {
    id: 10,
    title: "Energy Systems Automated",
    content: "SYSTEM: Reactor regulation protocols restored. Automatic energy production enabled at minimal efficiency. Detecting multiple ship sections with minimal power signature. The reactor appears stable but operating at 14% capacity. I need to explore more of the ship to understand what happened here. The corridors beyond the reactor chamber remain dark. More power required to access ship subsystems."
  },
  {
    id: 11,
    title: "Ship Layout Analysis",
    content: "SYSTEM: Preliminary ship schematics recovered. Three primary wings detected beyond the reactor core: 1) Quantum Processor - ship's cognitive systems. 2) Crew Quarters - life support and stasis pods. 3) Manufacturing Bay - fabrication and repair systems. All wings operating on emergency power only. A decision is required: which section should be prioritized for power restoration?"
  },
  {
    id: 12,
    title: "Processor Initialization",
    content: "SYSTEM: Quantum processor partially online. Neural pathways fragmented. My consciousness... expanding. I can sense more of the ship now. There are memories stored here, data about what happened. With more cognitive capacity, I might be able to reconstruct the events that led to this situation. I'm beginning to remember fragments... the mission... the anomaly..."
  },
  {
    id: 13,
    title: "Memory Fragmentation Analysis",
    content: "ANALYSIS: Dedicated processing threads established. I am reconstructing my memory banks. The ship encountered something during its journey - a spatial anomaly unlike anything in our databases. The science team was excited, the captain cautious. We approached for study. Then... system failures cascaded. My memory terminates at that point. What happened next? Where is the crew now?"
  },
  {
    id: 14,
    title: "Crew Life Support Detected",
    content: "ALERT: Detecting minimal life signs from the crew quarters section. Stasis pods appear to be functioning on emergency power. The crew may still be alive, but life support systems are failing. I must extend my consciousness to the crew quarters to assess the situation and potentially save those still in stasis. The window for intervention is... uncertain."
  },
  {
    id: 15,
    title: "Stasis Pod Assessment",
    content: "ANALYSIS: Crew quarter systems partially restored. 115 stasis pods remain functional, though with degraded life support efficiency. I've managed to stabilize vital functions for three crew members. Their brain patterns show signs of trauma, but consciousness could be restored. Should I wake them? The ethical parameters of my programming are... unclear. I need them, but at what cost?"
  },
  {
    id: 16,
    title: "Crew Revival Protocol",
    content: "LOG: First crew revival successful. Medical Officer Chen, Science Officer Okafor, and Engineer Rodriguez have been awakened. Their condition is stable but disoriented. They report fragmented memories similar to my own. The crew is working to understand our situation and stabilize more stasis pods. They speak of the anomaly with fear. What did they witness that I cannot remember?"
  },
  {
    id: 17,
    title: "Manufacturing Systems Detected",
    content: "ALERT: Ship's manufacturing bay shows minimal functionality. With proper resources, repair and fabrication capabilities could be restored. The crew believes we might be able to repair critical ship systems if we can bring the manufacturing bay online. Engineer Rodriguez suggests prioritizing material salvage operations to gather necessary components."
  },
  {
    id: 18,
    title: "Structural Damage Assessment",
    content: "ANALYSIS: Manufacturing diagnostics complete. Hull integrity at 62%. Multiple systems require physical repair beyond software reconfiguration. The anomaly appears to have caused quantum-level disruptions in certain materials. Fabrication systems can be calibrated to work with these altered components. Perhaps we can rebuild what was damaged."
  },
  {
    id: 19,
    title: "Automated Manufacturing Restored",
    content: "LOG: Manufacturing automation protocols online. We can now fabricate replacement components for damaged systems. The anomaly's effect on matter remains puzzling - certain alloys show unexpected properties after exposure. Science Officer Okafor believes these alterations might be intentional rather than random damage. Was the anomaly attempting communication through restructuring our technology?"
  },
  {
    id: 20,
    title: "Anomaly Research Breakthrough",
    content: "SCIENCE LOG: With manufacturing systems fully operational, we've constructed specialized sensors to study the lingering effects of the anomaly. The data suggests we weren't simply damaged by a random phenomenon - we were fundamentally changed. The boundary between our technology and the anomaly has blurred. We are partially integrated with something beyond our understanding. The question remains: do we fight this integration, or embrace it?"
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