"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, CpuIcon, Users, Package, BookOpen, Settings } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSupabase } from "@/utils/supabase/context"

const allNavigation = [
  { name: "Reactor", href: "/reactor", icon: Zap, page: "reactor" },
  { name: "Processor", href: "/processor", icon: CpuIcon, page: "processor" },
  { name: "Crew Quarters", href: "/crew-quarters", icon: Users, page: "crew-quarters" },
  { name: "Manufacturing", href: "/manufacturing", icon: Package, page: "manufacturing" },
  { name: "Logs", href: "/logs", icon: BookOpen, page: "logs" },
]

export function NavBar() {
  const pathname = usePathname()
  const { status, statusText, shouldFlicker } = useSystemStatus()
  const { gameProgress } = useSupabase()
  
  // Determine which pages are available based on upgrades
  const getIsPageAvailable = (pageName: string) => {
    // Reactor is always available
    if (pageName === 'reactor' || pageName === 'logs') return true;
    
    // Check if the wing has been selected/unlocked
    if (gameProgress?.upgrades) {
      return !!gameProgress.upgrades[`selected-wing-${pageName}`];
    }
    
    return false;
  };
  
  // Filter navigation to only show available pages
  const navigation = allNavigation.filter(item => getIsPageAvailable(item.page));

  return (
    <nav className="system-panel p-2 md:p-4 fixed bottom-0 left-0 right-0 md:left-4 md:top-4 md:bottom-4 md:w-64 flex md:flex-col gap-1 z-10">
      <div className="hidden md:flex items-center justify-center p-2 mb-6">
        <h1 className={`text-xl font-bold text-primary ${shouldFlicker('title') ? 'flickering-text' : ''}`}>DERELICT DAWN</h1>
      </div>
      
      <div className="flex md:flex-col w-full justify-around md:justify-start">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isReactor = item.name === "Reactor"
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors
                ${isActive 
                  ? "bg-accent/30 text-primary border border-primary/40"
                  : "hover:bg-accent/10 text-muted-foreground hover:text-primary"
                }`}
            >
              <item.icon className={`h-5 w-5 ${isReactor && shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
              <span className="hidden md:inline">{item.name}</span>
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