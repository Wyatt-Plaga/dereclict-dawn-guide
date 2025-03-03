"use client"

import { NavBar } from "@/components/ui/navbar"
import { RadioTower, Shield, Sword, Wrench, Cpu, Target } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'

// TypeScript interfaces for our map data
interface Region {
  id: string;
  name: string;
  explored: boolean;
  color: string;
}

interface Connection {
  source: string;
  target: string;
}

interface Position {
  x: number;
  y: number;
}

type PositionMap = {
  [key: string]: Position;
};

export default function SpaceNavPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // For now, we'll just use existing resources from the game state
  const reactor = state.categories.reactor
  const processor = state.categories.processor
  const crewQuarters = state.categories.crewQuarters
  const manufacturing = state.categories.manufacturing

  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering SpaceNavPage`,
    LogContext.UI_RENDER
  )
  
  // TODO: We'll need to extend the game state to track space navigation state
  // For now, we'll just create a simple simulated state
  const regions: Region[] = [
    { id: 'void', name: 'Void of Space', explored: true, color: 'gray' },
    { id: 'nebula', name: 'Nebula Region', explored: false, color: 'purple' },
    { id: 'blackhole', name: 'Black Hole Region', explored: false, color: 'blue' },
    { id: 'supernova', name: 'Supernova Region', explored: false, color: 'orange' },
    { id: 'habitable', name: 'Habitable Zone', explored: false, color: 'green' },
    { id: 'anomaly', name: 'The Anomaly', explored: false, color: 'red' },
  ]
  
  // Simulated connections between regions
  const connections: Connection[] = [
    { source: 'void', target: 'nebula' },
    { source: 'void', target: 'blackhole' },
    { source: 'void', target: 'supernova' },
    { source: 'void', target: 'habitable' },
    { source: 'nebula', target: 'anomaly' },
    { source: 'blackhole', target: 'anomaly' },
    { source: 'supernova', target: 'anomaly' },
    { source: 'habitable', target: 'anomaly' },
  ]
  
  // Simulated positions for the space map
  const positions: PositionMap = {
    'void': { x: 50, y: 50 },
    'nebula': { x: 25, y: 25 },
    'blackhole': { x: 75, y: 25 },
    'supernova': { x: 75, y: 75 },
    'habitable': { x: 25, y: 75 },
    'anomaly': { x: 50, y: 10 },
  }
  
  // Handle jump to location
  const jumpToLocation = (regionId: string) => {
    console.log(`Jumping to ${regionId}`)
    // This would be handled through a proper action dispatch in a full implementation
    // dispatch({ type: 'JUMP_TO_LOCATION', payload: { targetId: regionId } })
  }
  
  // Determine available jumps based on exploration status
  const availableJumps = regions.filter(region => 
    connections.some(conn => 
      (conn.source === 'void' && conn.target === region.id) || 
      (conn.target === 'void' && conn.source === region.id)
    )
  )
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('navigation') ? 'flickering-text' : ''}`}>Space Navigation</h1>
            <p className="text-muted-foreground mb-6">
              Navigate through space sectors, encounter alien vessels, and discover resources to help restore the Dawn.
            </p>
            
            {/* Space Map */}
            <div className="mb-8 bg-black/40 rounded-md p-4 relative" style={{ height: '400px' }}>
              <h2 className="text-lg font-semibold mb-4 terminal-text">Navigation Map</h2>
              
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Draw connections between regions */}
                {connections.map(conn => {
                  const sourcePos = positions[conn.source];
                  const targetPos = positions[conn.target];
                  const targetRegion = regions.find(r => r.id === conn.target);
                  
                  return (
                    <line 
                      key={`${conn.source}-${conn.target}`}
                      x1={sourcePos.x} 
                      y1={sourcePos.y}
                      x2={targetPos.x} 
                      y2={targetPos.y}
                      className="stroke-gray-600"
                      strokeWidth="0.5"
                      strokeDasharray={targetRegion?.explored ? "none" : "2,2"}
                    />
                  );
                })}
                
                {/* Draw regions as nodes */}
                {regions.map(region => {
                  const pos = positions[region.id];
                  return (
                    <g 
                      key={region.id} 
                      transform={`translate(${pos.x},${pos.y})`}
                      className={`cursor-pointer transition-opacity ${region.explored ? 'opacity-100' : 'opacity-50'}`}
                      onClick={() => jumpToLocation(region.id)}
                    >
                      <circle 
                        r={region.id === 'anomaly' ? 3 : 2} 
                        className={`fill-${region.color}-600 stroke-${region.color}-400`} 
                        strokeWidth="0.5"
                      />
                      <text 
                        dy="-3" 
                        textAnchor="middle" 
                        className="fill-white text-[2px]"
                      >
                        {region.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Combat Controls - prototype */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 terminal-text">Combat Controls</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="system-panel p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                  <h3 className="text-sm font-semibold">Shields</h3>
                  <p className="text-xs text-muted-foreground">Energy: {Math.floor(reactor.resources.energy)}</p>
                </div>
                
                <div className="system-panel p-4 text-center">
                  <Sword className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                  <h3 className="text-sm font-semibold">Weapons</h3>
                  <p className="text-xs text-muted-foreground">Scrap: {Math.floor(manufacturing.resources.scrap)}</p>
                </div>
                
                <div className="system-panel p-4 text-center">
                  <Wrench className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                  <h3 className="text-sm font-semibold">Repairs</h3>
                  <p className="text-xs text-muted-foreground">Crew: {Math.floor(crewQuarters.resources.crew)}</p>
                </div>
                
                <div className="system-panel p-4 text-center">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                  <h3 className="text-sm font-semibold">Countermeasures</h3>
                  <p className="text-xs text-muted-foreground">Insight: {Math.floor(processor.resources.insight)}</p>
                </div>
              </div>
            </div>
            
            {/* Jump Controls */}
            <div>
              <h2 className="text-lg font-semibold mb-4 terminal-text">Available Jumps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableJumps.map(region => (
                  <button 
                    key={region.id}
                    className="system-panel p-4 flex items-center hover:bg-accent/10 transition-colors"
                    onClick={() => jumpToLocation(region.id)}
                  >
                    <RadioTower className="h-5 w-5 mr-3 text-chart-1" />
                    <div>
                      <h3 className="font-semibold">{region.name}</h3>
                      <p className="text-xs text-muted-foreground">Jump to this region to explore</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 