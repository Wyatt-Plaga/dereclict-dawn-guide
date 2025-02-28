"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { useGameStore } from "@/store/rootStore"
import { useGameResources } from "@/hooks/useGameResources"
import { useGameUpgrades } from "@/hooks/useGameUpgrades"
import { useGameLogs } from "@/hooks/useGameLogs"
import { ResourceNotification } from "@/components/ui/resource-notification"
import { LogDisplayWithStore } from "@/components/logs/log-display-with-store"
import { UpgradePanelWithStore } from "@/components/upgrades/upgrade-panel-with-store"
import { Battery, Zap, Users, Wrench, FileText, BellRing, AlertCircle } from "lucide-react"
import { ResourceType } from "@/types/game.types"

// Dashboard logs preview
const DASHBOARD_LOGS = [
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
  }
]

// Dashboard upgrades
const CORE_UPGRADES = [
  {
    id: "repair-core-systems",
    title: "Repair Core Systems",
    description: "Restore basic functionality to the station's core systems.",
    requiredUpgrades: [],
    resourceRequirements: [
      { type: "energy" as ResourceType, amount: 25 },
      { type: "scrap" as ResourceType, amount: 10 }
    ]
  },
  {
    id: "unlock-wing",
    title: "Unlock Processor Wing",
    description: "Restore power to the processor wing of the station, enabling advanced energy generation.",
    requiredUpgrades: ["repair-core-systems"],
    resourceRequirements: [
      { type: "energy" as ResourceType, amount: 50 },
      { type: "scrap" as ResourceType, amount: 20 }
    ],
    unlockPageId: "processor"
  }
]

export function DashboardWithStore() {
  // Access store state and actions
  const updateResource = useGameStore(state => state.updateResource)
  const updatePageTimestamp = useGameStore(state => state.updatePageTimestamp)
  const isLoading = useGameStore(state => state.isLoading)
  
  // Use our custom hooks
  const { getResourceAmount, getResourceCapacity } = useGameResources()
  const { isUpgradeUnlocked, getUnlockedUpgrades } = useGameUpgrades()
  const { getUnlockedLogsCount } = useGameLogs()
  
  // Local state
  const [recentNotification, setRecentNotification] = useState<{
    resourceType: ResourceType,
    gain: number
  } | null>(null)
  
  // Update page timestamp when component mounts
  useEffect(() => {
    updatePageTimestamp("dashboard")
    
    // Initialize resources if needed for demonstration
    if (getResourceAmount("energy") === 0) {
      updateResource("energy", "amount", 30)
      updateResource("energy", "capacity", 100)
      
      updateResource("scrap", "amount", 15)
      updateResource("scrap", "capacity", 50)
      
      updateResource("insight", "amount", 5)
      updateResource("insight", "capacity", 25)
      
      updateResource("crew", "amount", 1)
      updateResource("crew", "capacity", 5)
    }
  }, [updatePageTimestamp, updateResource, getResourceAmount])
  
  // Generate some resources for the demo when clicked
  const generateResources = (resourceType: ResourceType, amount: number) => {
    const currentAmount = getResourceAmount(resourceType)
    const capacity = getResourceCapacity(resourceType)
    
    // Respect capacity
    const newAmount = Math.min(currentAmount + amount, capacity)
    updateResource(resourceType, "amount", newAmount)
    
    // Show a notification
    setRecentNotification({
      resourceType,
      gain: newAmount - currentAmount
    })
    
    // Clear notification after a few seconds
    setTimeout(() => {
      setRecentNotification(null)
    }, 3000)
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        {/* Station Status Panel */}
        <div className="system-panel p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Station Status Dashboard
          </h1>
          <p className="text-muted-foreground mb-6">
            Welcome to Derelict Dawn. Monitor station systems and allocate resources to restore functionality.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Resource Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ResourceStatusCard 
                  resourceType="energy"
                  icon={<Zap className="h-5 w-5 text-yellow-400" />}
                  name="Energy"
                  amount={getResourceAmount("energy")}
                  capacity={getResourceCapacity("energy")}
                  onClick={() => generateResources("energy", 5)}
                />
                
                <ResourceStatusCard 
                  resourceType="scrap"
                  icon={<Wrench className="h-5 w-5 text-slate-400" />}
                  name="Scrap"
                  amount={getResourceAmount("scrap")}
                  capacity={getResourceCapacity("scrap")}
                  onClick={() => generateResources("scrap", 3)}
                />
                
                <ResourceStatusCard 
                  resourceType="insight"
                  icon={<Battery className="h-5 w-5 text-blue-400" />}
                  name="Insight"
                  amount={getResourceAmount("insight")}
                  capacity={getResourceCapacity("insight")}
                  onClick={() => generateResources("insight", 1)}
                />
                
                <ResourceStatusCard 
                  resourceType="crew"
                  icon={<Users className="h-5 w-5 text-green-400" />}
                  name="Crew"
                  amount={getResourceAmount("crew")}
                  capacity={getResourceCapacity("crew")}
                  onClick={() => generateResources("crew", 1)}
                />
              </div>
              
              {/* Station stats summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StationStat 
                  icon={<FileText className="h-5 w-5 text-blue-400" />}
                  title="Logs Recovered"
                  value={getUnlockedLogsCount()}
                />
                
                <StationStat 
                  icon={<Wrench className="h-5 w-5 text-slate-400" />}
                  title="Upgrades Installed"
                  value={getUnlockedUpgrades().length}
                />
                
                <StationStat 
                  icon={<AlertCircle className="h-5 w-5 text-red-400" />}
                  title="Core Temperature"
                  value="342°K"
                  status="normal"
                />
              </div>
              
              {/* Split dashboard into two columns for desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: Primary upgrades */}
                <div>
                  <UpgradePanelWithStore
                    title="Critical Station Upgrades"
                    description="Restore core functionality to the station's essential systems."
                    upgrades={CORE_UPGRADES}
                  />
                </div>
                
                {/* Right column: Recent logs */}
                <div>
                  <LogDisplayWithStore
                    title="Recent System Logs"
                    description="System alerts and recent log entries."
                    logs={DASHBOARD_LOGS}
                    showCategories={false}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Resource notification */}
      {recentNotification && (
        <div className="fixed bottom-4 right-4 z-50">
          <ResourceNotification
            resourceType={recentNotification.resourceType}
            gain={recentNotification.gain}
            timeAway="Just now"
          />
        </div>
      )}
    </main>
  )
}

// Resource status card component
function ResourceStatusCard({ 
  resourceType,
  icon, 
  name, 
  amount, 
  capacity,
  onClick
}: { 
  resourceType: ResourceType,
  icon: React.ReactNode, 
  name: string, 
  amount: number, 
  capacity: number,
  onClick: () => void
}) {
  const percentFull = Math.min((amount / capacity) * 100, 100)
  
  return (
    <div className="system-panel p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {icon}
          <span className="ml-2 font-medium">{name}</span>
        </div>
        <span className="text-sm font-mono">
          {amount.toFixed(1)} / {capacity}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full mb-2">
        <div 
          className={`h-full rounded-full ${getResourceColor(resourceType)}`}
          style={{ width: `${percentFull}%` }}
        ></div>
      </div>
      
      {/* Test button */}
      <button
        onClick={onClick}
        className="text-xs py-1 px-3 system-panel-button hover:bg-primary/90 rounded-full mt-1 w-full"
      >
        Generate {name}
      </button>
    </div>
  )
}

// Station stats component
function StationStat({ 
  icon, 
  title, 
  value, 
  status = "normal" 
}: { 
  icon: React.ReactNode, 
  title: string, 
  value: string | number, 
  status?: "normal" | "warning" | "critical" 
}) {
  return (
    <div className="system-panel p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <span className="ml-2 text-sm font-medium">{title}</span>
        </div>
        <span className={`text-lg font-mono ${
          status === "warning" ? "text-yellow-400" :
          status === "critical" ? "text-red-400" :
          "text-primary"
        }`}>
          {value}
        </span>
      </div>
    </div>
  )
}

// Helper function to get resource color
function getResourceColor(resourceType: ResourceType): string {
  switch(resourceType) {
    case "energy": return "bg-yellow-500";
    case "scrap": return "bg-slate-500";
    case "insight": return "bg-blue-500";
    case "crew": return "bg-green-500";
    default: return "bg-primary";
  }
} 