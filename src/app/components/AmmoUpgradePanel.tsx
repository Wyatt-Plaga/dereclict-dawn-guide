"use client"

import { Gem, ChevronUp } from "lucide-react"
import { AMMO_TIER_NAMES, AMMO_TYPES, AmmoTypeId, getAmmoMax, getAmmoUpgradeRelicCost } from "@/game-engine/content/ammoTypes"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"

interface AmmoUpgradePanelProps {
  ammoType: AmmoTypeId
}

/**
 * Relic-funded capacity upgrade panel for a single ammo type.
 * Shared by processor/manufacturing/crew-quarters wing pages.
 */
export default function AmmoUpgradePanel({ ammoType }: AmmoUpgradePanelProps) {
  const { state, dispatch } = useGame()
  const { devMode } = useDevMode()
  const relics = state.relics

  if (!devMode && relics <= 0) return null

  const ammoTier = state.ammo[ammoType].tier
  const ammoRelicCost = getAmmoUpgradeRelicCost(ammoTier)
  const ammoName = AMMO_TYPES[ammoType].name
  const canAfford = relics >= ammoRelicCost

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex items-center gap-2">
        <Gem className="h-3.5 w-3.5 text-chart-5" />
        <h2 className="text-sm font-semibold terminal-text">Relic Enhancements</h2>
      </div>

      {ammoTier < 3 && (
        <div
          className={`system-panel p-3 ${canAfford ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
          onClick={() => dispatch({ type: 'UPGRADE_AMMO_CAPACITY', payload: { ammoType } })}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChevronUp className="h-4 w-4 text-chart-5 mr-2" />
              <span className="text-sm">{ammoName} Capacity</span>
              <span className="text-[10px] font-mono text-primary/60 ml-2">{AMMO_TIER_NAMES[ammoTier]}</span>
            </div>
            <span className="font-mono text-xs text-chart-5">{ammoRelicCost} Relics</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Upgrade to {AMMO_TIER_NAMES[ammoTier + 1]} — max {getAmmoMax(ammoType, ammoTier + 1)} {ammoName}
          </p>
        </div>
      )}
    </div>
  )
}
