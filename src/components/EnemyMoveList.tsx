import { EnemyActionDefinition } from '@/game-engine/types/combat';
import { cn } from '@/lib/utils';
import { Zap, Shield, Crosshair, Flame } from 'lucide-react';

interface Props {
  actions: EnemyActionDefinition[];
  chargingActionId?: string; // currently charging
}

// Simple helper to choose an icon based on action id keywords
const iconForAction = (id: string) => {
  if (id.includes('shield')) return <Shield className="h-5 w-5 mr-2" />;
  if (id.includes('laser')) return <Zap className="h-5 w-5 mr-2" />;
  if (id.includes('cannon') || id.includes('volley')) return <Crosshair className="h-5 w-5 mr-2" />;
  if (id.includes('missile') || id.includes('flame')) return <Flame className="h-5 w-5 mr-2" />;
  return <Zap className="h-5 w-5 mr-2" />;
};

const getActionSummary = (action: EnemyActionDefinition) => {
  if (action.damage && action.shieldDamage) return `Dmg: ${action.damage} | Shld: ${action.shieldDamage}`;
  if (action.damage) return `Damage: ${action.damage}`;
  if (action.shieldDamage) return `Shield Dmg: ${action.shieldDamage}`;
  if (action.statusEffect) return `${action.statusEffect.type} (${action.statusEffect.duration}t)`;
  return "";
};

export default function EnemyMoveList({ actions, chargingActionId }: Props) {
  return (
    <div className={`grid gap-3 h-full font-mono ${
      actions.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
    }`}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          disabled
          className={cn(
            'system-panel relative flex flex-col items-center justify-center p-4 h-full text-center min-h-[100px]',
            chargingActionId === a.id && 'bg-chart-2/20 text-chart-2 animate-pulse border-chart-2/50'
          )}
        >
          <div className="flex flex-col items-center mb-2 relative z-10 w-full">
            <div className="flex items-center mb-1">
              {iconForAction(a.id)}
              <span className="text-sm font-medium truncate">{a.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight px-2">
              {a.description}
            </p>
          </div>
          
          <div className="mt-auto relative z-10 bg-background/50 px-2 py-1 rounded text-xs font-semibold">
            {getActionSummary(a)}
          </div>

          {chargingActionId === a.id && (
            <span className="absolute inset-y-0 left-0 bg-chart-2/10 animate-grow pointer-events-none w-full" />
          )}
        </button>
      ))}
    </div>
  );
} 
