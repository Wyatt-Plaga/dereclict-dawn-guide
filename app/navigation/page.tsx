"use client"

import { NavBar } from "@/components/ui/navbar"
import { Compass, Rocket } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { useRouter } from "next/navigation"

// Region types
interface Region {
  id: string;
  name: string;
  description: string;
}

export default function NavigationPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const router = useRouter()
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering NavigationPage`,
    LogContext.UI_RENDER
  )
  
  // Current region is hardcoded to Void for now
  const currentRegion: Region = {
    id: 'void',
    name: 'Void of Space',
    description: 'The empty vacuum of space surrounds the Dawn. Long-range sensors detect potential areas of interest.'
  }
  
  // Dispatch INITIATE_JUMP action and navigate to encounter page
  const initiateJump = () => {
    Logger.info(
      LogCategory.ACTIONS, 
      'Initiating jump sequence', 
      LogContext.NONE
    );
    
    // Dispatch the action to generate an encounter
    dispatch({ type: 'INITIATE_JUMP' });
    
    // Give a small delay to ensure the state is updated before navigating
    setTimeout(() => {
      router.push('/encounter');
    }, 100);
  }
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('navigation') ? 'flickering-text' : ''}`}>Navigation</h1>
            
            {/* Current region display */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="h-5 w-5 text-chart-1" />
                <h2 className="text-lg font-medium">Current Location: {currentRegion.name}</h2>
              </div>
              <p className="text-muted-foreground">
                {currentRegion.description}
              </p>
            </div>
            
            {/* Jump button */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 terminal-text">Ship Controls</h2>
              
              <button 
                onClick={initiateJump}
                className="system-panel w-full py-8 flex items-center justify-center hover:bg-accent/10 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Rocket className={`h-12 w-12 text-chart-1 mb-2 ${shouldFlicker('navigation') ? 'flickering-text' : ''}`} />
                  <span className="terminal-text">Initiate Jump</span>
                  <span className="text-xs text-muted-foreground mt-1">Engage engines and prepare for potential encounters</span>
                </div>
              </button>
            </div>
            
            {/* Ship status */}
            <div>
              <h2 className="text-lg font-semibold mb-4 terminal-text">Ship Status</h2>
              <div className="system-panel p-4">
                <p className="text-muted-foreground">
                  All systems nominal. Jump drive charged and ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 