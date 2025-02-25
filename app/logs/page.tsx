"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { BookOpen, Calendar, Clock, Lock } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"

// Sample log entries that would normally be unlocked based on game progress
const logEntries = [
  {
    id: 1,
    title: "System Reboot Initiated",
    date: "Ship Date: Unknown",
    time: "Time: --:--:--",
    content: "Core systems rebooting after prolonged dormancy. AI subsystems initializing with limited functionality. Unable to determine current location or mission parameters. Critical ship systems damaged. Emergency protocols activated.",
    unlocked: true
  },
  {
    id: 2,
    title: "Memory Fragment: Mission",
    date: "Ship Date: -3652.4",
    time: "Time: 09:32:17",
    content: "Mission brief: Survey of exoplanet GC-9782 for potential colonization. Crew complement: 157 specialists. Ship status: Optimal. Departure from Sol System scheduled in 48 hours. All systems nominal.",
    unlocked: true
  },
  {
    id: 3,
    title: "Critical Failure Alert",
    date: "Ship Date: Unknown",
    time: "Time: --:--:--",
    content: "Emergency alert logged: Navigation systems report catastrophic failure during FTL jump. Subspace anomaly detected. Ship systems compromised. Multiple hull breaches sealed. 86% of crew life support pods maintaining optimal conditions. Rerouting power to critical systems.",
    unlocked: true
  },
  {
    id: 4,
    title: "AI Subsystem Analysis",
    date: "Ship Date: Recalibrating",
    time: "Time: Error",
    content: "Initial system assessment complete. Ship designation: ISC Derelict Dawn, research vessel. Current location: Unknown region, no stellar navigation markers identified. Ship has been dormant for [ERROR: TIMESTAMP OVERFLOW] units. Attempting to restore core functionality.",
    unlocked: false
  },
  {
    id: 5,
    title: "Memory Fragment: Anomaly",
    date: "Ship Date: -3210.7",
    time: "Time: 23:14:05",
    content: "Science Officer Log: We're detecting unusual quantum signatures from the anomaly ahead. Unlike anything in our database. Captain has ordered a closer approach for detailed scans despite safety protocols advising against it. I've registered my objection formally.",
    unlocked: false
  },
  {
    id: 6,
    title: "Crew Status Report",
    date: "Ship Date: Recalibrating",
    time: "Time: Resyncing",
    content: "Analysis of cryostasis pods complete. 42 pods compromised beyond recovery. 115 pods maintaining minimal life support with degrading functionality. Recommend immediate revival of essential personnel to effect repairs. Warning: Revival systems operating at 12% efficiency.",
    unlocked: false
  },
  {
    id: 7,
    title: "Navigation Calibration",
    date: "Ship Date: 0.1",
    time: "Time: 00:00:01",
    content: "Preliminary stellar cartography initialized. No match with known galactic markers. Evidence suggests displacement of approximately [CALCULATING] light years from planned course. Spatial-temporal analysis indicates possible breach of [REDACTED] barrier. Further data required.",
    unlocked: false
  },
  {
    id: 8,
    title: "Memory Fragment: Warning",
    date: "Ship Date: -3210.7",
    time: "Time: 23:47:52",
    content: "Emergency broadcast from Engineering: Something is interfacing with our systems. It's not like any cyberattack protocol I've seen. The anomaly is... I don't think it's just a spatial phenomenon. It seems to be responding to our scans, adapting, learning. Recommend immediate withdrawal.",
    unlocked: false
  }
]

export default function LogsPage() {
  const [activeLog, setActiveLog] = useState(logEntries[0])
  const [unlockedLogs, setUnlockedLogs] = useState(logEntries.filter(log => log.unlocked))
  const { shouldFlicker } = useSystemStatus()
  
  // In a real implementation, this would pull from a global game state
  // to determine which logs have been unlocked based on progress
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col md:flex-row p-4 md:p-8 md:ml-64">
        {/* Log list sidebar */}
        <div className="w-full md:w-64 mb-4 md:mb-0 md:mr-4">
          <div className="system-panel p-4 mb-4">
            <h2 className={`text-lg font-bold text-primary mb-2 ${shouldFlicker('logs') ? 'flickering-text' : ''}`}>Ship Logs</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Recovered memory fragments and system records
            </p>
            
            <div className="space-y-2">
              {logEntries.map(log => (
                <button
                  key={log.id}
                  onClick={() => log.unlocked && setActiveLog(log)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    log.unlocked 
                      ? activeLog.id === log.id 
                        ? 'bg-accent/30 text-primary border border-primary/40' 
                        : 'hover:bg-accent/10 text-muted-foreground hover:text-primary'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="truncate">{log.title}</span>
                    {!log.unlocked && <Lock className="h-3 w-3 ml-1 mt-1 shrink-0" />}
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
            
            <div className="flex text-xs text-muted-foreground mb-6 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{activeLog.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{activeLog.time}</span>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="terminal-text text-sm leading-relaxed">
                {activeLog.content}
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Additional logs will be recovered as ship systems are repaired.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 