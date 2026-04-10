"use client";

import { Shield, Swords, Wrench, Crosshair, Plus, X, Zap } from "lucide-react";
import ItemSprite from "@/components/ui/ItemSprite";
import { NavBar } from "@/components/ui/navbar";
import { useGame } from "@/game-engine/hooks/useGame";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import GameLoader from "@/app/components/GameLoader";
import { ALL_PLAYER_ABILITIES, PlayerAbilityDef, AbilitySlot } from "@/game-engine/content/playerAbilities";
import { AMMO_TYPES, AmmoTypeId, AMMO_TIER_NAMES, getAmmoMax } from "@/game-engine/content/ammoTypes";
import { getResourceAccessor } from "@/game-engine/utils/resourceAccessor";

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const SLOT_CONFIG: Record<AbilitySlot, { icon: typeof Shield; color: string; label: string; singular: boolean }> = {
  shield: { icon: Shield, color: "chart-5", label: "Shield", singular: true },
  weapon: { icon: Swords, color: "chart-1", label: "Weapons", singular: false },
  utility: { icon: Wrench, color: "chart-2", label: "Utilities", singular: false },
  stance: { icon: Crosshair, color: "chart-3", label: "Stance", singular: true },
};

const SLOT_ORDER: AbilitySlot[] = ["shield", "weapon", "utility", "stance"];
const AMMO_ORDER: AmmoTypeId[] = ["powerCells", "munitions", "dataCores", "repairKits"];

// Tailwind needs full class names statically for JIT
const AMMO_COLOR_CLASSES: Record<string, { text: string; bg: string; bgLight: string; indicator: string }> = {
  cyan:    { text: "text-cyan-400",    bg: "bg-cyan-500",    bgLight: "bg-cyan-500/20",    indicator: "bg-cyan-500" },
  amber:   { text: "text-amber-400",   bg: "bg-amber-500",   bgLight: "bg-amber-500/20",   indicator: "bg-amber-500" },
  violet:  { text: "text-violet-400",  bg: "bg-violet-500",  bgLight: "bg-violet-500/20",  indicator: "bg-violet-500" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500", bgLight: "bg-emerald-500/20", indicator: "bg-emerald-500" },
};

/* -------------------------------------------------------------------------- */
/* Ammo Bar Component                                                          */
/* -------------------------------------------------------------------------- */

interface AmmoBarProps {
  ammoId: AmmoTypeId;
  current: number;
  tier: number;
  sourceAmount: number;
  onCraft: (amount: number) => void;
}

function AmmoBar({ ammoId, current, tier, sourceAmount, onCraft }: AmmoBarProps) {
  const def = AMMO_TYPES[ammoId];
  const max = getAmmoMax(ammoId, tier);
  const colors = AMMO_COLOR_CLASSES[def.color];
  const tierName = AMMO_TIER_NAMES[tier] ?? 'Mk1';

  // How many can we craft?
  const space = max - current;
  const affordableFromResource = Math.floor(sourceAmount / def.craftCost);
  const canCraft1 = space > 0 && affordableFromResource >= 1;
  const craftMax = Math.min(space, affordableFromResource);

  return (
    <div className="system-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ItemSprite itemId={ammoId} size={20} />
          <span className={`font-semibold text-sm ${colors.text}`}>{def.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{tierName}</span>
        </div>
        <span className={`text-xs font-mono ${colors.text}`}>
          {current}/{max}
        </span>
      </div>

      {/* Individual ammo cells */}
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm transition-colors ${
              i < current ? colors.bg : "bg-muted/30"
            }`}
          />
        ))}
      </div>

      {/* Craft buttons */}
      <div className="flex items-center gap-3">
        <button
          disabled={!canCraft1}
          onClick={() => onCraft(1)}
          className={`text-xs font-mono px-4 py-2 rounded transition-colors ${
            canCraft1
              ? `${colors.bgLight} ${colors.text} hover:opacity-80`
              : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          Craft 1 ({def.craftCost} {def.sourceResource})
        </button>
        {craftMax > 1 && (
          <button
            onClick={() => onCraft(craftMax)}
            className={`text-xs font-mono px-4 py-2 rounded transition-colors ${colors.bgLight} ${colors.text} hover:opacity-80`}
          >
            Craft to Max ({craftMax})
          </button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">{def.description}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ability Card Component                                                      */
/* -------------------------------------------------------------------------- */

interface AbilityCardProps {
  ability: PlayerAbilityDef;
  equipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  colorClass: string;
}

function AbilityCard({ ability, equipped, onEquip, onUnequip, colorClass }: AbilityCardProps) {
  const ammoDef = ability.ammoCost ? AMMO_TYPES[ability.ammoCost.type] : null;
  const ammoColors = ammoDef ? AMMO_COLOR_CLASSES[ammoDef.color] : null;

  return (
    <div
      className={`system-panel p-3 flex flex-col gap-1.5 transition-colors ${
        equipped ? "border-primary/30 bg-primary/5" : "opacity-70"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-medium text-sm ${equipped ? "text-primary" : ""}`}>
          {ability.name}
        </span>
        {ability.passive && (
          <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
            PASSIVE
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">{ability.description}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex gap-2 text-[10px] text-muted-foreground font-mono">
          {ability.cooldown > 0 && <span>{ability.cooldown}s cd</span>}
          {ability.ammoCost && ammoDef && ammoColors && (
            <span className={ammoColors.text}>
              {ability.ammoCost.amount} {ammoDef.name}
            </span>
          )}
          {ability.damage && <span>{ability.damage} hull</span>}
          {ability.shieldDamage && <span>{ability.shieldDamage} shield</span>}
          {ability.shieldRepair && <span>+{ability.shieldRepair} shield</span>}
          {ability.hullRepair && <span>+{ability.hullRepair} hull</span>}
        </div>
        {equipped ? (
          <button
            onClick={onUnequip}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X className="h-3 w-3" />Unequip
          </button>
        ) : (
          <button
            onClick={onEquip}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3 w-3" />Equip
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function LoadoutPage() {
  const { state, dispatch, isInitializing } = useGame();
  const { shouldFlicker } = useSystemStatus();

  if (isInitializing) {
    return (
      <GameLoader>
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4 animate-pulse">
            <p className="text-xl terminal-text">Loading armory systems...</p>
          </div>
        </main>
      </GameLoader>
    );
  }

  const inventory = state.inventory ?? [];
  const loadout = state.loadout ?? { shield: null, weapons: [], utilities: [], stance: null };
  const ammo = state.ammo;

  const isEquipped = (abilityId: string): boolean => {
    const ability = ALL_PLAYER_ABILITIES[abilityId];
    if (!ability) return false;
    switch (ability.slot) {
      case "shield": return loadout.shield === abilityId;
      case "weapon": return loadout.weapons.includes(abilityId);
      case "utility": return loadout.utilities.includes(abilityId);
      case "stance": return loadout.stance === abilityId;
      default: return false;
    }
  };

  const equip = (abilityId: string) =>
    dispatch({ type: "EQUIP_ABILITY", payload: { abilityId } });
  const unequip = (abilityId: string) =>
    dispatch({ type: "UNEQUIP_ABILITY", payload: { abilityId } });
  const craftAmmo = (ammoType: string, amount: number) =>
    dispatch({ type: "CRAFT_AMMO", payload: { ammoType, amount } });

  // Get source resource amount for an ammo type
  const getSourceAmount = (ammoId: AmmoTypeId): number => {
    const def = AMMO_TYPES[ammoId];
    const accessor = getResourceAccessor(state, def.sourceResource);
    return accessor ? Math.floor(accessor.obj[accessor.key]) : 0;
  };

  // Group inventory abilities by slot
  const grouped: Record<AbilitySlot, PlayerAbilityDef[]> = {
    shield: [], weapon: [], utility: [], stance: [],
  };
  for (const id of inventory) {
    const ability = ALL_PLAYER_ABILITIES[id];
    if (ability) grouped[ability.slot].push(ability);
  }

  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <h1
            className={`text-xl font-bold text-primary mb-1 ${
              shouldFlicker("loadout") ? "flickering-text" : ""
            }`}
          >
            Armory
          </h1>
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            Craft ammunition and equip abilities for combat.
          </p>

          {/* ── AMMO SECTION ─────────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold terminal-text mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Ammunition
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {AMMO_ORDER.map((ammoId) => (
                <AmmoBar
                  key={ammoId}
                  ammoId={ammoId}
                  current={ammo[ammoId].current}
                  tier={ammo[ammoId].tier}
                  sourceAmount={getSourceAmount(ammoId)}
                  onCraft={(amount) => craftAmmo(ammoId, amount)}
                />
              ))}
            </div>
          </section>

          {/* ── LOADOUT SECTION ───────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold terminal-text mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary" />
              Loadout
            </h2>
            <div className="grid gap-6">
              {SLOT_ORDER.map((slot) => {
                const config = SLOT_CONFIG[slot];
                const abilities = grouped[slot];
                const Icon = config.icon;

                if (abilities.length === 0) return null;

                const equippedIds =
                  slot === "shield" ? (loadout.shield ? [loadout.shield] : []) :
                  slot === "weapon" ? loadout.weapons :
                  slot === "utility" ? loadout.utilities :
                  slot === "stance" ? (loadout.stance ? [loadout.stance] : []) :
                  [];

                return (
                  <div key={slot}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-4 w-4 text-${config.color}`} />
                      <h3 className="text-sm font-semibold terminal-text">{config.label}</h3>
                      {config.singular && (
                        <span className="text-[10px] text-muted-foreground font-mono ml-1">(1 slot)</span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                        {equippedIds.length} equipped
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {abilities.map((a) => (
                        <AbilityCard
                          key={a.id}
                          ability={a}
                          equipped={isEquipped(a.id)}
                          onEquip={() => equip(a.id)}
                          onUnequip={() => unequip(a.id)}
                          colorClass={config.color}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {inventory.length === 0 && (
                <div className="system-panel p-8 text-center text-muted-foreground">
                  <p className="text-sm">No abilities acquired yet.</p>
                  <p className="text-xs mt-2">Defeat enemies and explore regions to find equipment.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </GameLoader>
  );
}
