"use client";

import { Shield, Swords, Wrench, Crosshair, ZapOff } from "lucide-react";
import { ALL_PLAYER_ABILITIES, PlayerAbilityDef } from "@/game-engine/content/playerAbilities";
import { AMMO_TYPES } from "@/game-engine/content/ammoTypes";
import { cn } from "@/lib/utils";
import ItemSprite from "@/components/ui/ItemSprite";

interface AmmoState {
  current: number;
  tier: number;
}

interface CombatActionGridProps {
  availableActions: string[];
  cooldowns: Record<string, number>;
  canAfford: (actionId: string) => boolean;
  onAction: (actionId: string) => void;
  isStunned?: boolean;
  stunSecondsRemaining?: number;
  enemyCloaked?: boolean;
  ammo?: Record<string, AmmoState>;
}

const SLOT_ICONS = {
  weapon: Swords,
  shield: Shield,
  utility: Wrench,
  stance: Crosshair,
} as const;

const AMMO_BADGE: Record<string, { text: string; bg: string }> = {
  cyan:    { text: "text-cyan-400",    bg: "bg-cyan-500/20" },
  amber:   { text: "text-amber-400",   bg: "bg-amber-500/20" },
  violet:  { text: "text-violet-400",  bg: "bg-violet-500/20" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/20" },
};

function formatSeconds(s: number): string {
  if (s <= 0) return "0s";
  if (s >= 10) return `${Math.ceil(s)}s`;
  return `${s.toFixed(1)}s`;
}

function ActionButton({
  ability,
  cooldown,
  disabled,
  onAction,
  isStunned,
}: {
  ability: PlayerAbilityDef;
  cooldown: number;
  disabled: boolean;
  onAction: (id: string) => void;
  isStunned?: boolean;
}) {
  const cdPct = cooldown > 0 ? Math.min(1, cooldown / ability.cooldown) : 0;
  const ready = cooldown <= 0 && !isStunned && !disabled;
  const SlotIcon = SLOT_ICONS[ability.slot] || Swords;
  const ammoDef = ability.ammoCost ? AMMO_TYPES[ability.ammoCost.type] : null;
  const ammoColors = ammoDef ? AMMO_BADGE[ammoDef.color] : null;

  // Build effect description
  const effects: string[] = [];
  if (ability.damage) effects.push(`${ability.damage} hull dmg`);
  if (ability.shieldDamage) effects.push(`${ability.shieldDamage} shield dmg`);
  if (ability.shieldRepair) effects.push(`+${ability.shieldRepair} shield`);
  if (ability.hullRepair) effects.push(`+${ability.hullRepair} hull`);
  if (ability.statusEffect) effects.push(`${ability.statusEffect.type} ${ability.statusEffect.duration}s`);

  return (
    <button
      onClick={() => onAction(ability.id)}
      disabled={disabled}
      className={cn(
        "system-panel relative overflow-hidden p-2.5 text-left transition-colors",
        ready && "hover:bg-accent/10 hover:border-primary/40",
        disabled && "opacity-40 cursor-not-allowed",
        isStunned && "opacity-20",
      )}
    >
      {/* Cooldown fill */}
      {cdPct > 0 && (
        <span
          className="absolute inset-y-0 left-0 bg-muted/40 pointer-events-none transition-all duration-100"
          style={{ width: `${cdPct * 100}%` }}
        />
      )}

      {/* Row 1: Name + status */}
      <div className="flex items-center justify-between relative z-10 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <SlotIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{ability.name}</span>
        </div>
        {cooldown > 0 ? (
          <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">
            {formatSeconds(cooldown)}
          </span>
        ) : ready ? (
          <span className="text-[10px] font-mono text-primary shrink-0 ml-2 animate-pulse">
            READY
          </span>
        ) : null}
      </div>

      {/* Row 2: Effects */}
      {effects.length > 0 && (
        <div className="relative z-10 text-xs font-mono text-muted-foreground mb-1.5">
          {effects.join(" · ")}
        </div>
      )}

      {/* Row 3: Cost + cooldown */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] text-muted-foreground/70 font-mono">
          {ability.cooldown}s cooldown
        </span>
        {ability.ammoCost && ammoDef && ammoColors ? (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${ammoColors.bg} ${ammoColors.text} flex items-center gap-1`}>
            <ItemSprite itemId={ability.ammoCost.type} size={12} />
            {ability.ammoCost.amount} {ammoDef.name}
          </span>
        ) : ability.cost && ability.cost.amount > 0 ? (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
            {ability.cost.amount} {ability.cost.type}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function CombatActionGrid({
  availableActions,
  cooldowns,
  canAfford,
  onAction,
  isStunned = false,
  stunSecondsRemaining = 0,
  enemyCloaked = false,
}: CombatActionGridProps) {
  const abilities: PlayerAbilityDef[] = availableActions
    .map(id => ALL_PLAYER_ABILITIES[id])
    .filter((a): a is PlayerAbilityDef => !!a && !a.passive);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Actions</h2>
        <div className="flex gap-2">
          {isStunned && (
            <span className="text-[10px] font-mono text-red-400 animate-pulse flex items-center gap-1">
              <ZapOff className="h-3 w-3" /> STUNNED {formatSeconds(stunSecondsRemaining)}
            </span>
          )}
          {enemyCloaked && (
            <span className="text-[10px] font-mono text-purple-400 animate-pulse">
              TARGET CLOAKED
            </span>
          )}
        </div>
      </div>

      {/* Action grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {abilities.map(a => {
          const isScanOrRepair = !!a.statusEffect?.type || !!a.hullRepair || !!a.shieldRepair;
          const blockedByCloak = enemyCloaked && !isScanOrRepair;
          return (
            <ActionButton
              key={a.id}
              ability={a}
              cooldown={cooldowns[a.id] || 0}
              disabled={
                isStunned ||
                blockedByCloak ||
                (cooldowns[a.id] || 0) > 0 ||
                !canAfford(a.id)
              }
              onAction={onAction}
              isStunned={isStunned}
            />
          );
        })}
      </div>
    </div>
  );
}
