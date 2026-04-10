import { EnemyActionDefinition } from '@/game-engine/types/combat';
import { cn } from '@/lib/utils';

interface Props {
  actions: EnemyActionDefinition[];
  enemyCooldowns: Record<string, number>;
  enemyActionFlash?: Record<string, number>;
  /** When true, ability descriptions/stats are visible without using Scan. */
  alwaysReveal?: boolean;
  isExposed?: boolean;
}

function formatSeconds(s: number): string {
  if (s <= 0) return "0s";
  if (s >= 10) return `${Math.ceil(s)}s`;
  return `${s.toFixed(1)}s`;
}

export default function EnemyMoveList({
  actions,
  enemyCooldowns,
  enemyActionFlash = {},
  alwaysReveal = false,
  isExposed = false,
}: Props) {
  const reveal = alwaysReveal || isExposed;

  return (
    <div className="flex flex-col gap-1.5">
      {actions.map((a) => {
        const cooldown = enemyCooldowns[a.id] ?? 0;
        const cdPct = cooldown > 0 ? Math.min(1, cooldown / a.cooldown) : 0;
        const justUsed = (enemyActionFlash[a.id] ?? 0) > 0;
        const isReady = cooldown <= 0;

        // Stats summary
        const stats: string[] = [];
        if (a.hullDamage) stats.push(`${a.hullDamage} hull`);
        if (a.shieldDamage) stats.push(`${a.shieldDamage} shield`);
        if (a.stunDuration) stats.push(`stun ${a.stunDuration}s`);
        if (a.selfShieldHeal) stats.push(`heals ${a.selfShieldHeal}`);
        if (a.radiationStacks) stats.push(`+${a.radiationStacks} rad`);
        if (a.cloakDuration) stats.push(`cloak ${a.cloakDuration}s`);

        return (
          <div
            key={a.id}
            className={cn(
              'system-panel relative overflow-hidden p-2.5 transition-colors',
              justUsed && 'bg-red-500/10 border-red-500/30',
              isReady && !justUsed && 'border-yellow-500/20',
            )}
          >
            {/* Cooldown fill */}
            {cdPct > 0 && (
              <span
                className="absolute inset-y-0 left-0 bg-red-500/8 pointer-events-none transition-all duration-100"
                style={{ width: `${cdPct * 100}%` }}
              />
            )}

            {/* Row 1: Name + status */}
            <div className="flex items-center justify-between relative z-10 mb-0.5">
              <span className={cn("text-sm font-medium font-mono", justUsed && "text-red-400")}>
                {a.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {justUsed && (
                  <span className="text-[10px] text-red-400 font-mono font-bold">FIRED</span>
                )}
                {cooldown > 0 && reveal && (
                  <span className="text-[10px] text-muted-foreground font-mono">{formatSeconds(cooldown)}</span>
                )}
                {isReady && !justUsed && (
                  <span className="text-[10px] text-yellow-400/80 font-mono animate-pulse">READY</span>
                )}
              </div>
            </div>

            {/* Row 2: Description (when revealed) */}
            {reveal && (
              <p className="text-[11px] text-muted-foreground leading-snug relative z-10 mb-1">
                {a.description}
              </p>
            )}

            {/* Row 3: Stats + condition */}
            <div className="flex items-center justify-between relative z-10">
              {reveal && stats.length > 0 ? (
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  {stats.join(" · ")}
                </span>
              ) : !reveal ? (
                <span className="text-[10px] font-mono text-muted-foreground/50 italic">
                  Use Scan to reveal details
                </span>
              ) : (
                <span />
              )}
              {a.conditionLabel && reveal && (
                <span className="text-[9px] font-mono text-yellow-400/70 ml-2 shrink-0">
                  {a.conditionLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
