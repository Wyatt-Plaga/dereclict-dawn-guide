"use client"

import { CpuIcon, Gem, ChevronUp } from "lucide-react"
import { AMMO_TIER_NAMES, getAmmoMax, getAmmoUpgradeRelicCost } from "@/game-engine/content/ammoTypes"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"
import WingPage from '@/app/components/WingPage'

export default function ProcessorPage() {
  const { state, dispatch } = useGame()
  const { devMode } = useDevMode()
  const relics = state.relics

  const ammoTier = state.ammo.dataCores.tier
  const ammoRelicCost = getAmmoUpgradeRelicCost(ammoTier)

  return (
    <WingPage wingId="processor" icon={CpuIcon} flickerKey="processor">
      {/* Relic Enhancements */}
      {(devMode || relics > 0) && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Gem className="h-3.5 w-3.5 text-chart-5" />
            <h2 className="text-sm font-semibold terminal-text">Relic Enhancements</h2>
          </div>

          {/* Data Core capacity */}
          {ammoTier < 3 && (
            <div
              className={`system-panel p-3 ${relics >= ammoRelicCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={() => dispatch({ type: 'UPGRADE_AMMO_CAPACITY', payload: { ammoType: 'dataCores' } })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChevronUp className="h-4 w-4 text-chart-5 mr-2" />
                  <span className="text-sm">Data Core Capacity</span>
                  <span className="text-[10px] font-mono text-primary/60 ml-2">{AMMO_TIER_NAMES[ammoTier]}</span>
                </div>
                <span className="font-mono text-xs text-chart-5">{ammoRelicCost} Relics</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Upgrade to {AMMO_TIER_NAMES[ammoTier + 1]} — max {getAmmoMax('dataCores', ammoTier + 1)} Data Cores
              </p>
            </div>
          )}
        </div>
      )}
    </WingPage>
  )
}
