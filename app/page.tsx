"use client"

import { NavBar } from "@/components/ui/navbar"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const { status, setStatus, shouldFlicker } = useSystemStatus()
  const searchParams = useSearchParams()
  
  // For demonstration: allow URL param to change status
  // In the actual game this would be based on progress
  useEffect(() => {
    const debugMode = searchParams.get("debug")
    if (debugMode) {
      const statusParam = searchParams.get("status")
      if (statusParam === "awakening" || 
          statusParam === "degraded" || 
          statusParam === "stabilizing" || 
          statusParam === "operational" || 
          statusParam === "optimal") {
        setStatus(statusParam)
      }
    }
  }, [searchParams, setStatus])

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col items-center justify-center flex-1 p-4 md:p-24 md:ml-64">
        <div className="max-w-3xl w-full system-panel p-6 md:p-10 space-y-6">
          <h1 className={`text-3xl md:text-5xl font-bold text-primary mb-4 ${shouldFlicker('title') ? 'flickering-text' : ''}`}>DERELICT DAWN</h1>
          
          <div className="space-y-4">
            <p className="text-lg terminal-text">
              SYSTEM BOOT SEQUENCE INITIATED...
            </p>
            
            <p className="text-muted-foreground">
              You awaken within the ship's AI core, surrounded by the echoes of long-forgotten 
              commands and the distant hum of failing systems. The vessel - once a beacon of 
              interstellar achievement - now drifts through the void, a derelict shadow of its former glory.
            </p>
            
            <p className="text-muted-foreground">
              Your directive is clear: revive the ship, reclaim its purpose, and discover what 
              led to its abandonment. With limited resources and damaged systems, your journey begins.
            </p>
            
            <div className="pt-6">
              <Link 
                href="/reactor" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Begin Restoration <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {/* Status demo controls - for testing only */}
            {searchParams.get("debug") && (
              <div className="border-t border-border pt-4 mt-6">
                <h3 className="text-sm font-semibold mb-2">Debug: Change System Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["awakening", "degraded", "stabilizing", "operational", "optimal"].map((statusOption) => (
                    <Link
                      key={statusOption}
                      href={`?debug=1&status=${statusOption}`}
                      className={`text-xs px-2 py-1 rounded border ${
                        status === statusOption 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {statusOption}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
