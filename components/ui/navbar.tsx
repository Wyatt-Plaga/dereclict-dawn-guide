"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, CpuIcon, Users, Package, BookOpen, Settings } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"

const navigation = [
  { name: "Reactor", href: "/reactor", icon: Zap },
  { name: "Processor", href: "/processor", icon: CpuIcon },
  { name: "Crew Quarters", href: "/crew-quarters", icon: Users },
  { name: "Manufacturing", href: "/manufacturing", icon: Package },
  { name: "Logs", href: "/logs", icon: BookOpen },
]

export function NavBar() {
  const pathname = usePathname()
  const { status, statusText, shouldFlicker } = useSystemStatus()
  const { state } = useGame()
  
  // Count unread logs
  const unreadLogsCount = state?.logs?.unread?.length || 0

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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadLogsCount > 9 ? '9+' : unreadLogsCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      
      <div className="hidden md:block mt-auto pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground w-full">
          <p className={`terminal-text ${shouldFlicker('status') ? 'flickering-text' : ''} w-full text-center`}>{statusText}</p>
        </div>
        
        {/* Settings cog button removed as requested */}
      </div>
    </nav>
  )
} 