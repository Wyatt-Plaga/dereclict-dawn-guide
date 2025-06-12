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
  // Ensure exactly 4 grid slots for a 2x2 layout
  const slots: (EnemyActionDefinition | null)[] = [...actions];
  while (slots.length < 4) slots.push(null);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full font-mono">
      {slots.map((a, idx) => (
        <button
          key={a ? a.id : `empty-${idx}`}
          type="button"
          disabled
          className={cn(
            'system-panel relative flex flex-col items-center justify-center p-4 h-full text-center',
            a && chargingActionId === a.id && 'bg-chart-2/20 text-chart-2 animate-pulse',
            !a && 'opacity-0 pointer-events-none'
          )}
        >
          {a && (
            <>
              <div className="flex flex-col items-center mb-1 relative z-10">
                {iconForAction(a.id)}
                <span className="text-sm font-medium truncate mt-1">{a.name}</span>
              </div>
              {chargingActionId === a.id && (
                <span className="absolute inset-y-0 left-0 bg-chart-2/20 animate-grow pointer-events-none" />
              )}
            </>
          )}
        </button>
      ))}
    </div>
  );
} 