"use client"

import { useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { UpgradePanelWithStore } from "@/components/upgrades/upgrade-panel-with-store"
import { useGameStore } from "@/store/rootStore"
import { Battery, Cpu, AlertCircle } from "lucide-react"

// Example upgrades data
const EXAMPLE_UPGRADES = [
  {
    id: "unlock-wing",
    title: "Unlock Processor Wing",
    description: "Restore power to the processor wing of the station, enabling advanced energy generation.",
    requiredUpgrades: [],
    resourceRequirements: [
      { type: "energy" as const, amount: 50 },
      { type: "scrap" as const, amount: 20 }
    ],
    unlockPageId: "processor"
  },
  {
    id: "unlock-next-wing",
    title: "Unlock Crew Quarters",
    description: "Restore power to the crew quarters, allowing crew management.",
    requiredUpgrades: ["unlock-wing"],
    resourceRequirements: [
      { type: "energy" as const, amount: 100 },
      { type: "scrap" as const, amount: 50 },
      { type: "insight" as const, amount: 25 }
    ],
    unlockPageId: "crew-quarters"
  },
  {
    id: "unlock-final-wing",
    title: "Unlock Manufacturing Bay",
    description: "Restore power to the manufacturing wing, enabling advanced resource production.",
    requiredUpgrades: ["unlock-next-wing"],
    resourceRequirements: [
      { type: "energy" as const, amount: 250 },
      { type: "scrap" as const, amount: 100 },
      { type: "crew" as const, amount: 5 }
    ],
    unlockPageId: "manufacturing"
  }
]

export function UpgradePanelExample() {
  // Access the store to initialize resources for testing
  const updateResource = useGameStore(state => state.updateResource)
  
  // Initialize some resources for testing
  useEffect(() => {
    // Set initial resources for testing upgrades
    updateResource("energy", "amount", 150)
    updateResource("scrap", "amount", 75)
    updateResource("insight", "amount", 30)
    updateResource("crew", "amount", 3)
    
    // Set capacity for each resource
    updateResource("energy", "capacity", 300)
    updateResource("scrap", "capacity", 200)
    updateResource("insight", "capacity", 100)
    updateResource("crew", "capacity", 10)
  }, [updateResource])
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Upgrade System Demo (Store-Based)
          </h1>
          <p className="text-muted-foreground mb-6">
            This page demonstrates the new upgrade system using the Zustand store.
            Try unlocking upgrades and observe how the state changes.
          </p>
          
          {/* Resource initialization info box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-semibold text-blue-500 mb-1">Testing Mode</h3>
                <p className="text-sm">
                  Resources have been automatically initialized with test values.
                  The store state will persist in local storage between page refreshes.
                </p>
              </div>
            </div>
          </div>
          
          {/* Station upgrades panel */}
          <UpgradePanelWithStore
            title="Station System Upgrades"
            description="Restore and upgrade critical station infrastructure."
            upgrades={EXAMPLE_UPGRADES}
          />
          
          {/* Technical upgrades panel - for additional examples */}
          <UpgradePanelWithStore
            title="Technical System Upgrades"
            description="Enhance station capabilities with technical improvements."
            upgrades={[
              {
                id: "upgrade-energy-system",
                title: "Energy Distribution Improvement",
                description: "Upgrade the energy distribution grid to increase energy storage capacity.",
                requiredUpgrades: [],
                resourceRequirements: [
                  { type: "energy" as const, amount: 30 },
                  { type: "scrap" as const, amount: 15 }
                ]
              },
              {
                id: "advanced-data-processors",
                title: "Advanced Data Processors",
                description: "Install next-generation data processors to improve insight generation.",
                requiredUpgrades: ["upgrade-energy-system"],
                resourceRequirements: [
                  { type: "energy" as const, amount: 50 },
                  { type: "insight" as const, amount: 20 }
                ]
              }
            ]}
          />
          
          {/* Debug panel to view store state */}
          <div className="mt-8 system-panel p-4">
            <h3 className="text-lg font-semibold mb-2">Debug: Store State</h3>
            <div className="font-mono text-xs bg-black/30 p-3 rounded overflow-x-auto">
              <StoreStateDebug />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Debug component to display current store state
function StoreStateDebug() {
  const resources = useGameStore(state => state.resources)
  const upgrades = useGameStore(state => state.upgrades)
  const availablePages = useGameStore(state => state.availablePages)
  
  return (
    <pre>
      {JSON.stringify({ resources, upgrades, availablePages }, null, 2)}
    </pre>
  )
} 