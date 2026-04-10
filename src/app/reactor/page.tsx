"use client"

import { Zap, Gem, Shield, ChevronUp } from "lucide-react"
import { AMMO_TIER_NAMES, getAmmoMax, getAmmoUpgradeRelicCost } from "@/game-engine/content/ammoTypes"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"
import WingPage from '@/app/components/WingPage'

export default function ReactorPage() {
  const { state, dispatch } = useGame()
  const { devMode } = useDevMode()

  const reactor = state.categories.reactor
  const relics = state.relics

  const shieldingPurchased = reactor.specialUpgrades.shielding === 1
  const shieldCost = 50
  const ammoTier = state.ammo.powerCells.tier
  const ammoRelicCost = getAmmoUpgradeRelicCost(ammoTier)

  const purchaseUpgrade = (upgradeType: string) =>
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'reactor', upgradeType } })

  return (
    <WingPage wingId="reactor" icon={Zap} flickerKey="reactor">
      {/* Relic Enhancements */}
      {(devMode || relics > 0 || shieldingPurchased) && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Gem className="h-3.5 w-3.5 text-chart-5" />
            <h2 className="text-sm font-semibold terminal-text">Relic Enhancements</h2>
          </div>

          {/* Shielding */}
          <div
            className={`system-panel p-3 ${!shieldingPurchased && relics >= shieldCost ? 'cursor-pointer hover:bg-accent/10' : shieldingPurchased ? '' : 'opacity-60'}`}
            onClick={() => !shieldingPurchased && purchaseUpgrade('shielding')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-chart-5 mr-2" />
                <span className="text-sm">Shielding</span>
              </div>
              {!shieldingPurchased && <span className="font-mono text-xs text-chart-5">{shieldCost} Relics</span>}
              {shieldingPurchased && <span className="text-xs text-primary">Installed</span>}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {shieldingPurchased ? 'Shields active — 50 shield points' : 'Enable 50-point shields for combat'}
            </p>
          </div>

          {/* Power Cell capacity */}
          {ammoTier < 3 && (
            <div
              className={`system-panel p-3 ${relics >= ammoRelicCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={() => dispatch({ type: 'UPGRADE_AMMO_CAPACITY', payload: { ammoType: 'powerCells' } })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChevronUp className="h-4 w-4 text-chart-5 mr-2" />
                  <span className="text-sm">Power Cell Capacity</span>
                  <span className="text-[10px] font-mono text-primary/60 ml-2">{AMMO_TIER_NAMES[ammoTier]}</span>
                </div>
                <span className="font-mono text-xs text-chart-5">{ammoRelicCost} Relics</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Upgrade to {AMMO_TIER_NAMES[ammoTier + 1]} — max {getAmmoMax('powerCells', ammoTier + 1)} Power Cells
              </p>
            </div>
          )}
        </div>
      )}
    </WingPage>
  )
}
