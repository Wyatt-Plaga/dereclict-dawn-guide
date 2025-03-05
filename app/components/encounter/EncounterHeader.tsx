import React from 'react';
import { 
  CompassIcon, 
  ActivityIcon,
  ShieldIcon,
  MapIcon,
  Sword
} from 'lucide-react';
import { RegionType } from '@/app/game/types';
import { useSystemStatus } from "@/components/providers/system-status-provider";

interface EncounterHeaderProps {
  title: string;
  region: RegionType;
  type: 'empty' | 'story' | 'combat';
}

// Get an icon for the region
const getRegionIcon = (region: RegionType) => {
  switch (region) {
    case 'void':
      return <CompassIcon className="h-6 w-6 text-slate-400" />;
    case 'nebula':
      return <ActivityIcon className="h-6 w-6 text-purple-400" />;
    case 'asteroid':
      return <ShieldIcon className="h-6 w-6 text-amber-400" />;
    case 'deepspace':
      return <MapIcon className="h-6 w-6 text-blue-400" />;
    case 'blackhole':
      return <CompassIcon className="h-6 w-6 text-zinc-400" />;
    default:
      return <CompassIcon className="h-6 w-6 text-slate-400" />;
  }
};

const EncounterHeader: React.FC<EncounterHeaderProps> = ({ title, region, type }) => {
  const { shouldFlicker } = useSystemStatus();
  const regionIcon = getRegionIcon(region);
  const isCombatEncounter = type === 'combat';
  
  return (
    <div className="flex items-center gap-3 mb-8 border-b border-accent/30 pb-4">
      {regionIcon}
      <div className="flex-1">
        <h1 className={`text-3xl font-bold mb-1 ${shouldFlicker('encounters') ? 'flickering-text' : ''} ${
          region === 'void' ? 'text-slate-300' :
          region === 'nebula' ? 'text-indigo-300' :
          region === 'asteroid' ? 'text-amber-300' :
          region === 'deepspace' ? 'text-blue-300' :
          region === 'blackhole' ? 'text-zinc-300' : 'text-slate-300'
        }`} style={{
          textShadow: shouldFlicker('encounters') ? 'none' : `0 0 10px ${
            region === 'void' ? 'rgba(203, 213, 225, 0.5)' :
            region === 'nebula' ? 'rgba(165, 180, 252, 0.5)' :
            region === 'asteroid' ? 'rgba(251, 191, 36, 0.5)' :
            region === 'deepspace' ? 'rgba(96, 165, 250, 0.5)' :
            region === 'blackhole' ? 'rgba(212, 212, 216, 0.5)' : 'rgba(203, 213, 225, 0.5)'
          }`
        }}>
          {title}
        </h1>
        <div className="flex items-center text-sm">
          <span className={`px-2 py-1 rounded-md ${
            region === 'void' ? 'bg-slate-800 text-slate-300' :
            region === 'nebula' ? 'bg-indigo-900 text-indigo-300' :
            region === 'asteroid' ? 'bg-amber-900 text-amber-300' :
            region === 'deepspace' ? 'bg-blue-900 text-blue-300' :
            region === 'blackhole' ? 'bg-zinc-900 text-zinc-300' : 'bg-slate-800 text-slate-300'
          }`}>
            Region: {region.charAt(0).toUpperCase() + region.slice(1)}
          </span>
          
          {/* Display combat badge for combat encounters */}
          {isCombatEncounter && (
            <div className="ml-3 flex items-center bg-red-900/60 text-red-300 px-2 py-1 rounded-md border border-red-700 animate-pulse">
              <Sword className="h-4 w-4 mr-1" />
              <span>Combat</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncounterHeader; 