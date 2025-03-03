"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// Define the system status levels
export type SystemStatus = 
  | "awakening"    // Initial state
  | "degraded"     // Early progress
  | "stabilizing"  // Mid progress
  | "operational"  // Late progress
  | "optimal"      // End game

type SystemStatusContextType = {
  status: SystemStatus
  setStatus: (status: SystemStatus) => void
  statusText: string
  shouldFlicker: (element: string) => boolean
}

const statusDescriptions = {
  awakening: "System Status: Awakening",
  degraded: "System Status: Degraded",
  stabilizing: "System Status: Stabilizing",
  operational: "System Status: Operational",
  optimal: "System Status: Optimal"
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined)

export function SystemStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SystemStatus>("awakening")
  
  // Determine if an element should flicker based on status
  const shouldFlicker = (element: string) => {
    switch (status) {
      case "awakening":
        // In awakening state, most critical elements flicker
        return ["title", "reactor", "status"].includes(element)
      case "degraded":
        // In degraded state, only title and status flicker
        return ["title", "status"].includes(element)
      case "stabilizing":
      case "operational":
        // In more stable states, only status indicator flickers
        return element === "status"
      case "optimal":
        // In optimal state, nothing flickers
        return false
    }
  }
  
  return (
    <SystemStatusContext.Provider
      value={{
        status,
        setStatus,
        statusText: statusDescriptions[status],
        shouldFlicker
      }}
    >
      {children}
    </SystemStatusContext.Provider>
  )
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext)
  if (context === undefined) {
    throw new Error("useSystemStatus must be used within a SystemStatusProvider")
  }
  return context
} 