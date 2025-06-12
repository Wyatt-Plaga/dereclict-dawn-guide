import { EnemyActionDefinition } from '@/app/game/types/combat';
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

export default function EnemyMoveList({ actions, chargingActionId }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono">
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          disabled
          className={cn(
            'system-panel relative flex flex-col items-start justify-center p-4 h-24 text-left',
            chargingActionId === a.id && 'bg-chart-2/20 text-chart-2 animate-pulse'
          )}
        >
          <div className="flex items-center mb-1">
            {iconForAction(a.id)}
            <span className="text-sm font-medium truncate">{a.name}</span>
          </div>

          {/* Progress bar when charging */}
          {chargingActionId === a.id && (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-chart-2 animate-grow" />
          )}
        </button>
      ))}
    </div>
  );
} 