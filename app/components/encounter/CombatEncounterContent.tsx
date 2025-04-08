import React from 'react';
import { Sword } from 'lucide-react';
import { BaseEncounter, RegionType } from '@/app/game/types';

interface CombatEncounterContentProps {
  encounter: BaseEncounter;
  currentRegion: RegionType;
}

const CombatEncounterContent: React.FC<CombatEncounterContentProps> = ({ encounter, currentRegion }) => {
  const hoverShadowClass = 
    currentRegion === RegionType.VOID ? 'hover:shadow-slate-800/30' :
    currentRegion === RegionType.ASTEROID_FIELD ? 'hover:shadow-amber-800/30' :
    currentRegion === RegionType.SUPERNOVA ? 'hover:shadow-red-800/30' :
    currentRegion === RegionType.BLACK_HOLE ? 'hover:shadow-zinc-800/30' :
    currentRegion === RegionType.HABITABLE_ZONE ? 'hover:shadow-emerald-800/30' :
    currentRegion === RegionType.ANOMALY ? 'hover:shadow-purple-800/30' :
    'hover:shadow-slate-800/30';

  const textColorClass = 
    currentRegion === RegionType.VOID ? 'text-slate-200' :
    currentRegion === RegionType.ASTEROID_FIELD ? 'text-amber-100' :
    currentRegion === RegionType.SUPERNOVA ? 'text-red-200' :
    currentRegion === RegionType.BLACK_HOLE ? 'text-zinc-200' :
    currentRegion === RegionType.HABITABLE_ZONE ? 'text-emerald-100' :
    currentRegion === RegionType.ANOMALY ? 'text-purple-200' :
    'text-slate-200';

  return (
    <div className={`mb-8 system-panel p-6 transition-all duration-300 hover:shadow-md ${hoverShadowClass}`}>
      <p className={`text-xl mb-4 leading-relaxed ${textColorClass}`}>
        {encounter.description}
      </p>
      
      {/* Special message for combat encounters */}
      <div className="mt-6 border-t border-accent/30 pt-4">
        <p className="text-lg text-red-400 flex items-center gap-2 font-semibold">
          <Sword className="h-5 w-5" />
          <span>Hostile entity detected - prepare for combat!</span>
        </p>
        <p className="mt-2 text-muted-foreground terminal-text text-sm tracking-widest animate-pulse">
          Initializing combat systems... Transferring to battle interface...
        </p>
        <div className="mt-4 bg-red-900/20 border border-red-700/30 rounded-md p-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-3"></div>
            <p className="text-red-300 font-mono text-sm">ALERT: Combat protocol activated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatEncounterContent; 