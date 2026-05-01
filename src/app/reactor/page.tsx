"use client"

import { Rocket, Zap } from "lucide-react"
import WingPage from '@/app/components/WingPage'
import { useGame } from "@/game-engine/hooks/useGame"
import { BRIDGE_UNLOCK_ENERGY } from "@/game-engine/content/wingResources"
import { cn } from "@/lib/utils"

export default function ReactorPage() {
  const { state, dispatch } = useGame()
  const bridgeUnlocked = state?.bridge?.unlocked ?? false
  const energy = state?.categories?.reactor?.resources?.primary ?? 0
  const canBuild = !bridgeUnlocked && energy >= BRIDGE_UNLOCK_ENERGY
  const pct = Math.min(100, (energy / BRIDGE_UNLOCK_ENERGY) * 100)

  const bridgeButton = !bridgeUnlocked ? (
    <button
      onClick={() => dispatch({ type: 'UNLOCK_BRIDGE' })}
      disabled={!canBuild}
      className={cn(
        "system-panel w-full p-4 transition-colors",
        canBuild
          ? "border-chart-5/40 hover:bg-chart-5/10 animate-unlock-btn-in"
          : "border-muted/20 opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <Rocket className={cn(
          "h-5 w-5",
          canBuild ? "text-chart-5 animate-pulse" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-mono font-semibold",
          canBuild ? "text-chart-5" : "text-muted-foreground"
        )}>
          Activate Bridge
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1 font-mono">
        {canBuild
          ? `Costs ${BRIDGE_UNLOCK_ENERGY} Energy`
          : `Costs ${BRIDGE_UNLOCK_ENERGY} Energy (${Math.floor(energy)}/${BRIDGE_UNLOCK_ENERGY})`}
      </p>
      {!canBuild && (
        <div className="h-1 bg-muted mt-2 overflow-hidden rounded">
          <div className="h-full bg-chart-5/60" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  ) : null

  return (
    <WingPage wingId="reactor" icon={Zap} flickerKey="reactor" aboveTierUnlock={bridgeButton} />
  )
}
