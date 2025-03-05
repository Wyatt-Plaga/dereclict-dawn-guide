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
      <div>
        <h1 className={`text-3xl font-bold mb-1 ${shouldFlicker('encounters') ? 'flickering-text' : ''}`}>
          {title}
        </h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Region: {region.charAt(0).toUpperCase() + region.slice(1)}</span>
          
          {/* Display combat badge for combat encounters */}
          {isCombatEncounter && (
            <div className="ml-3 flex items-center text-red-500">
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