"use client"

import Link from "next/link"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { NavBar } from "@/components/ui/navbar"
import GameLoader from '@/app/components/GameLoader'
import { useGame } from "@/game-engine/hooks/useGame"
import { Activity, ArrowRight, Database, Shield, Zap, Cpu, Users, Package, Gem } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function HomePage() {
  const { shouldFlicker } = useSystemStatus();
  const { state } = useGame();
  
  const latestLog = state.logs.discovered[state.logs.unread[0] || Object.keys(state.logs.discovered).pop() || ''];
  
  // Resource values
  const energy = state.categories.reactor.resources.energy;
  const maxEnergy = state.categories.reactor.stats.energyCapacity;
  const energyPercent = (energy / maxEnergy) * 100;

  const insight = state.categories.processor.resources.insight;
  const maxInsight = state.categories.processor.stats.insightCapacity;
  const insightPercent = (insight / maxInsight) * 100;

  const crew = state.categories.crewQuarters.resources.crew;
  const maxCrew = state.categories.crewQuarters.stats.crewCapacity;
  const crewPercent = (crew / maxCrew) * 100;

  const scrap = state.categories.manufacturing.resources.scrap;
  const maxScrap = state.categories.manufacturing.stats.scrapCapacity;
  const scrapPercent = (scrap / maxScrap) * 100;

  const relics = state.relics;

  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64 gap-6">
          {/* Header Section */}
          <header className="flex items-end justify-between border-b border-primary/20 pb-4 mb-4">
            <div>
              <h1 className={`text-4xl font-bold text-primary tracking-tighter glitch-text ${shouldFlicker('title') ? 'flickering-text' : ''}`} data-text="COMMAND BRIDGE">
                COMMAND BRIDGE
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">UES DERELICT DAWN // ORBITAL STATION ALPHA</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-primary/60 font-mono">SYSTEM TIME</div>
              <div className="text-xl font-mono text-primary">
                {new Date().toLocaleTimeString([], { hour12: false })}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Status Panel */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="system-panel p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Activity size={120} />
                </div>
                
                <h2 className="text-xl font-mono text-primary mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5" /> SHIP RESOURCE LEVELS
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {/* Energy Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-chart-1" /> ENERGY</span>
                      <span className="text-chart-1">{Math.floor(energy)} / {maxEnergy}</span>
                    </div>
                    <div className="h-4 bg-secondary/50 rounded-sm overflow-hidden border border-chart-1/20">
                      <div 
                        className="h-full bg-chart-1 transition-all duration-1000"
                        style={{ width: `${energyPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Insight Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground flex items-center gap-2"><Cpu className="h-4 w-4 text-chart-2" /> INSIGHT</span>
                      <span className="text-chart-2">{Math.floor(insight)} / {maxInsight}</span>
                    </div>
                    <div className="h-4 bg-secondary/50 rounded-sm overflow-hidden border border-chart-2/20">
                      <div 
                        className="h-full bg-chart-2 transition-all duration-1000"
                        style={{ width: `${insightPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Crew Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4 text-chart-3" /> CREW</span>
                      <span className="text-chart-3">{Math.floor(crew)} / {maxCrew}</span>
                    </div>
                    <div className="h-4 bg-secondary/50 rounded-sm overflow-hidden border border-chart-3/20">
                      <div 
                        className="h-full bg-chart-3 transition-all duration-1000"
                        style={{ width: `${crewPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Scrap Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4 text-chart-4" /> SCRAP</span>
                      <span className="text-chart-4">{Math.floor(scrap)} / {maxScrap}</span>
                    </div>
                    <div className="h-4 bg-secondary/50 rounded-sm overflow-hidden border border-chart-4/20">
                      <div 
                        className="h-full bg-chart-4 transition-all duration-1000"
                        style={{ width: `${scrapPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Relics Display (if unlocked) */}
                {relics > 0 && (
                  <div className="mt-8 pt-6 border-t border-primary/10 relative z-10">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Rare Materials Stored</div>
                      <div className="flex items-center gap-2 text-xl font-bold text-chart-5">
                        <Gem className="h-6 w-6" />
                        {relics} RELICS
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Alerts / Logs */}
              <div className="system-panel p-6">
                <h2 className="text-xl font-mono text-primary mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5" /> RECENT TRANSMISSIONS
                </h2>
                {latestLog ? (
                  <div className="border-l-2 border-primary/50 pl-4 py-2 bg-primary/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        {latestLog.category}
                      </span>
                      <span className="text-xs font-mono text-primary/60">
                        {formatDistanceToNow(latestLog.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{latestLog.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{latestLog.content}</p>
                    <Link href="/logs" className="inline-flex items-center text-xs text-primary mt-3 hover:underline">
                      ACCESS LOGS <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm italic p-4 text-center border border-dashed border-muted rounded">
                    No recent data logs found. Systems initialized.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / Sidebar - Replaced with System Status Overview */}
            <div className="flex flex-col gap-6">
              <div className="system-panel p-6 h-full flex flex-col">
                <h2 className="text-lg font-mono text-primary mb-4 uppercase tracking-wider border-b border-primary/20 pb-2">
                  System Overview
                </h2>
                
                <div className="flex-grow space-y-6">
                  {/* Reactor Status */}
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-1/10 rounded border border-chart-1/20 group-hover:border-chart-1/50 transition-colors">
                        <Zap className="h-5 w-5 text-chart-1" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">REACTOR</div>
                        <div className="text-xs text-chart-1 font-mono">ONLINE</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">OUTPUT</div>
                      <div className="text-sm font-mono text-foreground">100%</div>
                    </div>
                  </div>

                  {/* Processor Status */}
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-2/10 rounded border border-chart-2/20 group-hover:border-chart-2/50 transition-colors">
                        <Cpu className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">PROCESSOR</div>
                        <div className="text-xs text-chart-2 font-mono">COMPUTING</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">LOAD</div>
                      <div className="text-sm font-mono text-foreground">42%</div>
                    </div>
                  </div>

                  {/* Crew Status */}
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-3/10 rounded border border-chart-3/20 group-hover:border-chart-3/50 transition-colors">
                        <Users className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">CREW DECK</div>
                        <div className="text-xs text-chart-3 font-mono">HABITABLE</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">MORALE</div>
                      <div className="text-sm font-mono text-foreground">STABLE</div>
                    </div>
                  </div>

                  {/* Manufacturing Status */}
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-4/10 rounded border border-chart-4/20 group-hover:border-chart-4/50 transition-colors">
                        <Package className="h-5 w-5 text-chart-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">FACTORY</div>
                        <div className="text-xs text-chart-4 font-mono">IDLE</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">EFFICIENCY</div>
                      <div className="text-sm font-mono text-foreground">85%</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-primary/10 text-xs text-center text-muted-foreground font-mono">
                  ALL SYSTEMS NOMINAL
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </GameLoader>
  )
}
