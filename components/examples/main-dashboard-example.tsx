"use client"

import { useEffect } from "react"
import { DashboardWithStore } from "@/components/main/dashboard-with-store"
import { ResourceOfflineProgressWrapperWithStore } from "@/components/ui/resource-offline-progress-wrapper-with-store"
import { useGameStore } from "@/store/rootStore"

export function MainDashboardExample() {
  // Access store actions to initialize state if needed
  const setGameState = useGameStore(state => state.setGameState)
  const unlockLog = useGameStore(state => state.unlockLog)
  
  // Initialize game state if needed
  useEffect(() => {
    // Unlock some logs for demo purposes
    unlockLog(1)
    unlockLog(2)
    unlockLog(3)
    
    // Set last online time to now
    setGameState({
      resources: {},
      upgrades: {},
      unlockedLogs: [1, 2, 3],
      lastOnline: new Date().toISOString(),
      availablePages: ["dashboard", "logs", "upgrades"],
      page_timestamps: {
        dashboard: new Date().toISOString()
      }
    })
  }, [setGameState, unlockLog])
  
  return (
    <>
      {/* Handle offline progress in the background */}
      <ResourceOfflineProgressWrapperWithStore />
      
      {/* Main dashboard UI */}
      <DashboardWithStore />
    </>
  )
} 