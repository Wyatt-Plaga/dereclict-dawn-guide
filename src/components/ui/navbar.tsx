"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, CpuIcon, Users, Package, BookOpen, Rocket, Wrench, Gem, FlaskConical, Swords, Microscope } from "lucide-react"
import { DEV_PRESETS } from "@/game-engine/devPresets"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"
import { useAdvisor } from "@/components/providers/advisor-provider"
import { ADVISOR_MESSAGES } from "@/game-engine/content/advisorMessages"
import { ResourceSystem } from "@/game-engine/systems/ResourceSystem"
import { clearCachedState } from "@/game-engine/core/memoryCache"

const navigation = [
  { name: "Reactor", href: "/reactor", icon: Zap },
  { name: "Laboratory", href: "/laboratory", icon: Microscope },
  { name: "Processor", href: "/processor", icon: CpuIcon },
  { name: "Crew Quarters", href: "/crew-quarters", icon: Users },
  { name: "Manufacturing", href: "/manufacturing", icon: Package },
  { name: "Bridge", href: "/bridge", icon: Rocket },
  { name: "Armory", href: "/loadout", icon: Swords },
  { name: "Logs", href: "/logs", icon: BookOpen },
]

export function NavBar() {
  const pathname = usePathname()
  const { status, statusText, shouldFlicker } = useSystemStatus()
  const { state, engine } = useGame()
  const { devMode, toggleDevMode } = useDevMode()
  const { showAdvisor } = useAdvisor()

  const triggerTestAdvisor = () => {
    const pools = Object.values(ADVISOR_MESSAGES)
    const pool = pools[Math.floor(Math.random() * pools.length)]
    const line = pool[Math.floor(Math.random() * pool.length)]
    showAdvisor(line.text)
  }

  // Count unread logs
  const unreadLogsCount = state?.logs?.unread?.length || 0

  // Format number
  const formatNumber = (num: number) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }

  /* ----------------------- NAV VISIBILITY CONDITIONS ----------------------- */
  const hasAnyLogs = Object.keys(state?.logs?.discovered || {}).length > 0
  const processorUnlocked = state?.categories?.processor?.unlocked ?? false
  const crewUnlocked = state?.categories?.crewQuarters?.unlocked ?? false
  const manufacturingUnlocked = state?.categories?.manufacturing?.unlocked ?? false
  const bridgeUnlocked = (state?.laboratory?.workerHiring ?? false) || devMode
  // Lab shows once 50 energy has been reached, or any research is already done
  const labUnlocked = (state?.categories?.reactor?.resources?.primary ?? 0) >= 50
    || (state?.laboratory?.researched?.length ?? 0) > 0
    || devMode

  const filteredNavigation = navigation.filter((item) => {
    switch (item.name) {
      case 'Reactor':
        return true
      case 'Laboratory':
        return labUnlocked
      case 'Logs':
        return hasAnyLogs
      case 'Bridge':
        return bridgeUnlocked
      case 'Armory':
        return bridgeUnlocked
      case 'Processor':
        return processorUnlocked || devMode
      case 'Crew Quarters':
        return crewUnlocked || devMode
      case 'Manufacturing':
        return manufacturingUnlocked || devMode
      default:
        return true
    }
  })

  // Track which nav items have already been seen so newly-appearing ones can
  // play a one-shot entrance animation. On first mount we seed the set with
  // whatever is currently visible so existing tabs don't animate on reload.
  // The `animatingNavItems` state keeps the CSS class applied for the full
  // animation duration — re-renders that happen during the 900ms animation
  // won't strip the class and cut the animation short.
  const seenNavItemsRef = useRef<Set<string> | null>(null)
  if (seenNavItemsRef.current === null) {
    seenNavItemsRef.current = new Set(filteredNavigation.map((i) => i.name))
  }
  const seenNavItems = seenNavItemsRef.current
  const [animatingNavItems, setAnimatingNavItems] = useState<Set<string>>(new Set())
  useEffect(() => {
    const newlyUnlocked: string[] = []
    for (const item of filteredNavigation) {
      if (!seenNavItems.has(item.name)) {
        seenNavItems.add(item.name)
        newlyUnlocked.push(item.name)
      }
    }
    if (newlyUnlocked.length === 0) return
    setAnimatingNavItems((prev) => {
      const next = new Set(prev)
      newlyUnlocked.forEach((n) => next.add(n))
      return next
    })
    const timers = newlyUnlocked.map((name) =>
      window.setTimeout(() => {
        setAnimatingNavItems((prev) => {
          if (!prev.has(name)) return prev
          const next = new Set(prev)
          next.delete(name)
          return next
        })
      }, 950)
    )
    return () => timers.forEach((t) => clearTimeout(t))
  })

  // If on battle page or encounter page, don't show navbar
  if (pathname === '/battle' || pathname === '/encounter') {
    return null
  }

  /* ----------------------- ENERGY BALANCE ------------------------------- */
  const rs = new ResourceSystem()
  const energyProd = rs.getEnergyProduction(state)
  const energyConsume = rs.getEnergyConsumption(state)
  const netEnergy = energyProd - energyConsume

  /* ------------------------ DEV RESET HANDLER ------------------------- */
  const handleResetGame = async () => {
    try {
      // Kill the engine without saving so autosave can't re-write
      engine.destroy()

      // Clear all persistence layers
      const localforage = (await import('localforage')).default
      await localforage.clear()
      localStorage.clear()
      clearCachedState()

      // Hard reload
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
          const isNewlyUnlocked = animatingNavItems.has(item.name)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-sm transition-all relative group overflow-hidden
                ${isActive
                  ? "bg-primary/20 text-primary border-l-4 border-primary shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                  : "hover:bg-primary/10 text-muted-foreground hover:text-primary border-l-4 border-transparent hover:border-primary/50"
                }
                ${isNewlyUnlocked ? "nav-item-enter" : ""}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />
              <item.icon className={`h-5 w-5 z-10 ${isReactor && shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
              <span className="hidden md:inline z-10 font-mono tracking-wide uppercase text-sm">{item.name}</span>

              {isLogs && unreadLogsCount > 0 && (
                <span className="ml-auto mr-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 animate-pulse">
                  {unreadLogsCount > 9 ? '9+' : unreadLogsCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Active buffs */}
      {(state?.buffs?.length ?? 0) > 0 && (
        <div className="hidden md:flex flex-col gap-1.5 mt-auto p-2 bg-primary/5 rounded border border-primary/10 mb-2">
          <div className="text-[10px] text-primary/70 font-mono uppercase tracking-widest">Active Buffs</div>
          {state.buffs.map((buff) => {
            const pct = buff.totalMs > 0 ? (buff.remainingMs / buff.totalMs) * 100 : 0;
            const secsLeft = Math.ceil(buff.remainingMs / 1000);
            const minsLeft = Math.floor(secsLeft / 60);
            const secs = secsLeft % 60;
            const magnitudeLabel = buff.magnitude > 0
              ? `+${Math.round(buff.magnitude * 100)}%`
              : `${Math.round(buff.magnitude * 100)}%`;
            return (
              <div key={buff.id} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-primary">{buff.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{minsLeft}:{secs.toString().padStart(2, '0')}</span>
                </div>
                <p className="text-[9px] text-muted-foreground leading-snug">{buff.description} ({magnitudeLabel})</p>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resource summary section */}
      <div className={`hidden md:flex flex-col ${(state?.buffs?.length ?? 0) === 0 ? 'mt-auto' : ''} mb-4 p-3 bg-black/20 rounded border border-white/5`}>
        <div className="text-xs text-primary/70 font-mono mb-3 uppercase tracking-widest border-b border-white/5 pb-1">Ship Resources</div>
        <div className="flex flex-col gap-2 text-sm font-mono">
          <div className="flex items-center gap-2 group">
            <Zap className="h-4 w-4 text-chart-1 group-hover:text-chart-1/80 transition-colors" />
            <span className="text-muted-foreground text-xs">ENERGY</span>
            <span className="ml-auto text-chart-1">
              {formatNumber(Math.floor(state?.categories?.reactor?.resources?.primary ?? 0))}
            </span>
          </div>
          {/* Net energy rate */}
          <div className="text-[10px] font-mono text-muted-foreground ml-6 -mt-1">
            {netEnergy >= 0 ? (
              <span className="text-chart-1/70">+{netEnergy.toFixed(1)}/s</span>
            ) : (
              <span className="text-red-400">{netEnergy.toFixed(1)}/s</span>
            )}
          </div>
          {(devMode || processorUnlocked) && (
          <div className="flex items-center gap-2 group">
            <CpuIcon className="h-4 w-4 text-chart-2 group-hover:text-chart-2/80 transition-colors" />
            <span className="text-muted-foreground text-xs">INSIGHT</span>
            <span className="ml-auto text-chart-2">
              {formatNumber(Math.floor(state?.categories?.processor?.resources?.primary ?? 0))}
            </span>
          </div>)}
          {(devMode || crewUnlocked) && (
          <div className="flex items-center gap-2 group">
            <Users className="h-4 w-4 text-chart-3 group-hover:text-chart-3/80 transition-colors" />
            <span className="text-muted-foreground text-xs">CREW</span>
            <span className="ml-auto text-chart-3">
              {formatNumber(Math.floor(state?.categories?.crewQuarters?.resources?.primary ?? 0))}
            </span>
          </div>)}
          {(devMode || manufacturingUnlocked) && (
          <div className="flex items-center gap-2 group">
            <Package className="h-4 w-4 text-chart-4 group-hover:text-chart-4/80 transition-colors" />
            <span className="text-muted-foreground text-xs">SCRAP</span>
            <span className="ml-auto text-chart-4">
              {formatNumber(Math.floor(state?.categories?.manufacturing?.resources?.primary ?? 0))}
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

      {/* Dev: trigger test advisor message */}
      {devMode && (
        <button
          onClick={triggerTestAdvisor}
          className="hidden md:flex items-center gap-2 text-xs px-2 py-1 border border-cyan-500/40 text-cyan-400 rounded-md hover:bg-cyan-500/10 mb-2"
        >
          <Wrench className="h-4 w-4" /> Test Advisor
        </button>
      )}

      {/* Dev presets */}
      {devMode && (
        <div className="hidden md:flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase tracking-wider px-1">
            <FlaskConical className="h-3 w-3" /> Presets
          </div>
          <div className="flex flex-wrap gap-1">
            {DEV_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => engine.loadPreset(preset.state)}
                title={preset.description}
                className="text-[10px] px-2 py-0.5 border rounded hover:bg-accent/10 font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hidden md:block pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground w-full">
          <p className={`terminal-text ${shouldFlicker('status') ? 'flickering-text' : ''} w-full text-center`}>{statusText}</p>
        </div>
      </div>
    </nav>
  )
}
