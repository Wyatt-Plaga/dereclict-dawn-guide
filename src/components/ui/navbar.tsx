"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, CpuIcon, Users, Package, BookOpen, Settings, Rocket } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"

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
  
  // Check if there's an active combat - if so, don't render the navbar
  const isInCombat = state?.combat?.active === true
  
  // If in active combat and not on the battle page, we shouldn't show navbar
  if (isInCombat && pathname !== '/battle') {
    return null
  }

  // If on battle page, don't show navbar
  if (pathname === '/battle') {
    return null
  }
  
  // Count unread logs
  const unreadLogsCount = state?.logs?.unread?.length || 0

  // Format number to show with one decimal place when needed, but as an integer when possible
  const formatNumber = (num: number) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }

  return (
    <nav className="system-panel p-2 md:p-4 fixed bottom-0 left-0 right-0 md:left-4 md:top-4 md:bottom-4 md:w-64 flex md:flex-col gap-1 z-10">
      <div className="hidden md:flex items-center justify-center p-2 mb-6">
        <h1 className={`text-xl font-bold text-primary ${shouldFlicker('title') ? 'flickering-text' : ''}`}>DERELICT DAWN</h1>
      </div>
      
      <div className="flex md:flex-col w-full justify-around md:justify-start">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isReactor = item.name === "Reactor"
          const isLogs = item.name === "Logs"
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors relative
                ${isActive 
                  ? "bg-accent/30 text-primary border border-primary/40"
                  : "hover:bg-accent/10 text-muted-foreground hover:text-primary"
                }`}
            >
              <item.icon className={`h-5 w-5 ${isReactor && shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
              <span className="hidden md:inline">{item.name}</span>
              
              {/* Notification indicator for unread logs */}
              {isLogs && unreadLogsCount > 0 && (
                <span className="ml-auto mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadLogsCount > 9 ? '9+' : unreadLogsCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Resource summary section - moved just above the system status */}
      <div className="hidden md:flex flex-col mt-auto mb-4">
        <div className="text-base text-primary font-semibold mb-2">RESOURCES</div>
        <div className="flex flex-col gap-3 text-base">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-chart-1" />
            <span className="text-muted-foreground">Energy:</span>
            <span className="ml-auto text-primary">
              {state?.categories?.reactor ? formatNumber(state.categories.reactor.resources.energy) : '0'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CpuIcon className="h-5 w-5 text-chart-2" />
            <span className="text-muted-foreground">Insight:</span>
            <span className="ml-auto text-primary">
              {state?.categories?.processor ? formatNumber(state.categories.processor.resources.insight) : '0'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-chart-3" />
            <span className="text-muted-foreground">Crew:</span>
            <span className="ml-auto text-primary">
              {state?.categories?.crewQuarters ? formatNumber(state.categories.crewQuarters.resources.crew) : '0'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-chart-4" />
            <span className="text-muted-foreground">Scrap:</span>
            <span className="ml-auto text-primary">
              {state?.categories?.manufacturing ? formatNumber(state.categories.manufacturing.resources.scrap) : '0'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="hidden md:block pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground w-full">
          <p className={`terminal-text ${shouldFlicker('status') ? 'flickering-text' : ''} w-full text-center`}>{statusText}</p>
        </div>
        
        {/* Settings cog button removed as requested */}
      </div>
    </nav>
  )
} 
