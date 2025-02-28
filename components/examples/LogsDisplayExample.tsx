"use client"

import { useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { LogDisplayWithStore } from "@/components/logs/log-display-with-store"
import { useGameStore } from "@/store/rootStore"
import { AlertCircle, BookOpen } from "lucide-react"

// Example logs data
const EXAMPLE_LOGS = [
  {
    id: 1,
    title: "Welcome to Derelict Dawn",
    content: "System initialized. Welcome to Derelict Dawn, a once-functional space station now abandoned and in need of restoration. Your mission is to bring it back online.",
    category: "System",
    timestamp: "2023-01-15T08:30:00Z"
  },
  {
    id: 2,
    title: "Power Systems Critical",
    content: "Critical power failure detected in all station systems. Emergency power reserves at 15%. Immediate restoration of power systems is required.",
    category: "Engineering",
    timestamp: "2023-01-15T09:45:22Z"
  },
  {
    id: 3,
    title: "Last Crew Log",
    content: "This is Captain Reynolds. We've been ordered to evacuate the station due to the approaching solar storm. Systems are being placed in hibernation mode. May whoever finds this station bring it back to life.",
    category: "Captain's Log",
    timestamp: "2023-01-14T22:17:35Z"
  },
  {
    id: 4,
    title: "Processor Wing Damage",
    content: "Processor wing has sustained significant damage from micrometeorite impacts. Primary coolant system compromised. Secondary systems operational but at reduced capacity.",
    category: "Engineering",
    timestamp: "2023-01-14T19:30:10Z"
  },
  {
    id: 5,
    title: "Research Data Backup",
    content: "All research data has been backed up to secure storage. Priority level: Alpha. Access requires station commander authorization.",
    category: "Science",
    timestamp: "2023-01-14T20:05:47Z"
  },
  {
    id: 6,
    title: "Crew Quarters Status",
    content: "Crew quarters section sealed and atmospherically stable. Life support systems in standby mode. All personal belongings have been secured as per evacuation protocol.",
    category: "Facilities",
    timestamp: "2023-01-14T21:40:12Z"
  },
  {
    id: 7,
    title: "AI Core Integrity",
    content: "AI core integrity at 97%. Minor corruption detected in non-essential subroutines. Core decision matrix unaffected. Station AI 'ARIA' remains operational in low-power mode.",
    category: "System",
    timestamp: "2023-01-15T00:15:33Z"
  },
  {
    id: 8,
    title: "Manufacturing Bay Alert",
    content: "Manufacturing systems automatically shut down due to power allocation protocols. In-progress fabrications have been preserved in current state. Resume operations will require manual intervention.",
    category: "Engineering",
    timestamp: "2023-01-14T18:22:09Z"
  }
]

export function LogsDisplayExample() {
  // Access the store to unlock logs for testing
  const unlockLog = useGameStore(state => state.unlockLog)
  const unlockedLogs = useGameStore(state => state.unlockedLogs)
  
  // Unlock some example logs for demonstration
  useEffect(() => {
    // If no logs are unlocked, unlock the first three for demo purposes
    if (unlockedLogs.length === 0) {
      unlockLog(1) // Welcome to Derelict Dawn
      unlockLog(2) // Power Systems Critical
      unlockLog(3) // Last Crew Log
    }
  }, [unlockLog, unlockedLogs])
  
  // Function to unlock a random additional log for testing
  const unlockRandomLog = () => {
    // Filter out already unlocked logs
    const lockedLogs = EXAMPLE_LOGS
      .map(log => log.id)
      .filter(id => !unlockedLogs.includes(id))
    
    // If there are any locked logs left, unlock one randomly
    if (lockedLogs.length > 0) {
      const randomIndex = Math.floor(Math.random() * lockedLogs.length)
      unlockLog(lockedLogs[randomIndex])
    }
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Logs System Demo (Store-Based)
          </h1>
          <p className="text-muted-foreground mb-6">
            This page demonstrates the new logs system using the Zustand store.
            Try unlocking additional logs to see how they appear in the categories.
          </p>
          
          {/* Testing info box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-semibold text-blue-500 mb-1">Testing Mode</h3>
                <p className="text-sm">
                  The first three logs have been automatically unlocked for demonstration.
                  Use the button below to unlock additional random logs.
                </p>
              </div>
            </div>
          </div>
          
          {/* Button to unlock a random log */}
          <button
            onClick={unlockRandomLog}
            disabled={unlockedLogs.length >= EXAMPLE_LOGS.length}
            className={`
              mb-6 py-2 px-4 rounded flex items-center justify-center
              ${unlockedLogs.length < EXAMPLE_LOGS.length
                ? 'system-panel-button hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Unlock Random Log ({unlockedLogs.length}/{EXAMPLE_LOGS.length})
          </button>
          
          {/* Logs display */}
          <LogDisplayWithStore
            title="Station Activity Logs"
            description="Review logs recovered from the station's database."
            logs={EXAMPLE_LOGS}
            showCategories={true}
          />
          
          {/* Debug panel to view store state */}
          <div className="mt-8 system-panel p-4">
            <h3 className="text-lg font-semibold mb-2">Debug: Store State</h3>
            <div className="font-mono text-xs bg-black/30 p-3 rounded overflow-x-auto">
              <pre>
                {JSON.stringify({ unlockedLogs: unlockedLogs.sort((a, b) => a - b) }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 