"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, CpuIcon, Users, Package, BookOpen, Settings, Rocket, Wrench, Gem } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"

const navigation = [
  { name: "Reactor", href: "/reactor", icon: Zap },
  { name: "Processor", href: "/processor", icon: CpuIcon },
  { name: "Crew Quarters", href: "/crew-quarters", icon: Users },
  { name: "Manufacturing", href: "/manufacturing", icon: Package },
  { name: "Navigation", href: "/navigation", icon: Rocket },
  { name: "Logs", href: "/logs", icon: BookOpen },
]

export function NavBar() {
  const pathname = usePathname()
  const { status, statusText, shouldFlicker } = useSystemStatus()
  const { state } = useGame()
  const { devMode, toggleDevMode } = useDevMode()
  
  // Check if there's an active combat - if so, don't render the navbar
  const isInCombat = state?.combat?.active === true
  
  // If in active combat and not on the battle page, we shouldn't show navbar
  if (isInCombat && pathname !== '/battle') {
    // Actually, if we are navigating away from battle, we probably want the navbar back?
    // But the requirement says "always be there except for when in combat".
    // If isInCombat is true, we are technically "in combat".
    // However, if the user manually navigates away (e.g. via URL), they might get stuck without nav.
    // Let's relax this check. If we are NOT on battle page, show navbar even if combat is active?
    // Wait, the user said "nav bar doesn't show up sometimes".
    // The issue is likely that state.combat.active remains true even if we're not on the battle page (e.g. during redirect or pre-combat).
    
    // Updated logic: Only hide navbar if we are ON the battle page.
    // Otherwise, always show it.
    // But wait, "except for when in combat or the pre-combat screen".
    // The pre-combat screen is usually the Encounter page.
    // So hide if pathname is /battle or /encounter.
  }

  // If on battle page or encounter page, don't show navbar
  if (pathname === '/battle' || pathname === '/encounter') {
    return null
  }
  
  // Count unread logs
  const unreadLogsCount = state?.logs?.unread?.length || 0

  // Format number to show with one decimal place when needed, but as an integer when possible
  const formatNumber = (num: number) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }

  /* ----------------------- NAV VISIBILITY CONDITIONS ----------------------- */
  const hasAnyLogs = Object.keys(state?.logs?.discovered || {}).length > 0
  const energyForNavigation = state?.categories?.reactor?.resources?.energy || 0
  const processorUnlocked = (state?.categories?.processor?.upgrades?.unlocked || 0) > 0
  const crewUnlocked = (state?.categories?.crewQuarters?.upgrades?.unlocked || 0) > 0
  const manufacturingUnlocked = (state?.categories?.manufacturing?.upgrades?.unlocked || 0) > 0
  const navigationUnlocked = ((state?.categories?.reactor?.upgrades?.navigationUnlocked || 0) > 0) || devMode

  const filteredNavigation = navigation.filter((item) => {
    switch (item.name) {
      case 'Reactor':
        return true
      case 'Logs':
        return hasAnyLogs
      case 'Navigation':
        return navigationUnlocked
      case 'Processor':
        return processorUnlocked
      case 'Crew Quarters':
        return crewUnlocked
      case 'Manufacturing':
        return manufacturingUnlocked
      default:
        return true
    }
  })

  /* ------------------------ DEV RESET HANDLER ------------------------- */
  const handleResetGame = async () => {
    try {
      const localforage = (await import('localforage')).default
      await localforage.clear()
      localStorage.clear()
      // @ts-expect-error dev cache clear
      if (typeof window !== 'undefined') window.__GAME_STATE_CACHE__ = null
      window.location.reload()
    } catch (e) {
      console.error('Failed to reset game', e)
    }
  }

  return (
    <nav className="system-panel p-2 md:p-4 fixed bottom-0 left-0 right-0 md:left-4 md:top-4 md:bottom-4 md:w-64 flex md:flex-col gap-1 z-10 border-r-2 border-primary/20">
      <div className="hidden md:flex items-center justify-center p-4 mb-6 bg-black/40 rounded border border-primary/10">
        <h1 
          className={`text-2xl font-bold text-primary tracking-tighter glitch-text ${shouldFlicker('title') ? 'flickering-text' : ''}`}
          data-text="DERELICT DAWN"
        >
          DERELICT DAWN
        </h1>
      </div>
      
      <div className="flex md:flex-col w-full justify-around md:justify-start gap-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isReactor = item.name === "Reactor"
          const isLogs = item.name === "Logs"
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-sm transition-all relative group overflow-hidden
                ${isActive 
                  ? "bg-primary/20 text-primary border-l-4 border-primary shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                  : "hover:bg-primary/10 text-muted-foreground hover:text-primary border-l-4 border-transparent hover:border-primary/50"
                }
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />
              <item.icon className={`h-5 w-5 z-10 ${isReactor && shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
              <span className="hidden md:inline z-10 font-mono tracking-wide uppercase text-sm">{item.name}</span>
              
              {/* Notification indicator for unread logs */}
              {isLogs && unreadLogsCount > 0 && (
                <span className="ml-auto mr-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 animate-pulse">
                  {unreadLogsCount > 9 ? '9+' : unreadLogsCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Resource summary section */}
      <div className="hidden md:flex flex-col mt-auto mb-4 p-3 bg-black/20 rounded border border-white/5">
        <div className="text-xs text-primary/70 font-mono mb-3 uppercase tracking-widest border-b border-white/5 pb-1">Ship Resources</div>
        <div className="flex flex-col gap-2 text-sm font-mono">
          <div className="flex items-center gap-2 group">
            <Zap className="h-4 w-4 text-chart-1 group-hover:text-chart-1/80 transition-colors" />
            <span className="text-muted-foreground text-xs">ENERGY</span>
            <span className="ml-auto text-chart-1">
              {state?.categories?.reactor ? formatNumber(state.categories.reactor.resources.energy) : '0'}
            </span>
          </div>
          {(devMode || processorUnlocked) && (
          <div className="flex items-center gap-2 group">
            <CpuIcon className="h-4 w-4 text-chart-2 group-hover:text-chart-2/80 transition-colors" />
            <span className="text-muted-foreground text-xs">INSIGHT</span>
            <span className="ml-auto text-chart-2">
              {state?.categories?.processor ? formatNumber(state.categories.processor.resources.insight) : '0'}
            </span>
          </div>)}
          {(devMode || crewUnlocked) && (
          <div className="flex items-center gap-2 group">
            <Users className="h-4 w-4 text-chart-3 group-hover:text-chart-3/80 transition-colors" />
            <span className="text-muted-foreground text-xs">CREW</span>
            <span className="ml-auto text-chart-3">
              {state?.categories?.crewQuarters ? formatNumber(state.categories.crewQuarters.resources.crew) : '0'}
            </span>
          </div>)}
          {(devMode || manufacturingUnlocked) && (
          <div className="flex items-center gap-2 group">
            <Package className="h-4 w-4 text-chart-4 group-hover:text-chart-4/80 transition-colors" />
            <span className="text-muted-foreground text-xs">SCRAP</span>
            <span className="ml-auto text-chart-4">
              {state?.categories?.manufacturing ? formatNumber(state.categories.manufacturing.resources.scrap) : '0'}
            </span>
          </div>)}
          {(devMode || (state?.relics || 0) > 0) && (
          <div className="flex items-center gap-2 group">
            <Gem className="h-4 w-4 text-chart-5 group-hover:text-chart-5/80 transition-colors" />
            <span className="text-muted-foreground text-xs">RELICS</span>
            <span className="ml-auto text-chart-5">
              {formatNumber(state?.relics || 0)}
            </span>
          </div>)}
        </div>
      </div>
      
      {/* Dev mode toggle */}
      <button
        onClick={toggleDevMode}
        className="hidden md:flex items-center gap-2 text-xs px-2 py-1 border rounded-md hover:bg-accent/10 mb-2"
      >
        <Wrench className="h-4 w-4" /> {devMode ? 'Dev ON' : 'Dev OFF'}
      </button>
      
      {/* Dev reset button */}
      {devMode && (
        <button
          onClick={handleResetGame}
          className="hidden md:flex items-center gap-2 text-xs px-2 py-1 border rounded-md hover:bg-accent/10 mb-2"
        >
          <Wrench className="h-4 w-4" /> Reset Game
        </button>
      )}
      
      <div className="hidden md:block pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground w-full">
          <p className={`terminal-text ${shouldFlicker('status') ? 'flickering-text' : ''} w-full text-center`}>{statusText}</p>
        </div>
        
        {/* Settings cog button removed as requested */}
      </div>
    </nav>
  )
} 
