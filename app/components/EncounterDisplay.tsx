import React, { useEffect, useState } from 'react';
import { 
  AwardIcon, 
  ChevronRightIcon, 
  CompassIcon, 
  FlaskConicalIcon,
  ZapIcon, 
  UsersIcon, 
  WrenchIcon,
  ShieldIcon,
  MapIcon,
  ActivityIcon 
} from 'lucide-react';
import { EmptyEncounter, ResourceReward, RegionType } from '../game/types';
import { useSystemStatus } from "@/components/providers/system-status-provider";

interface EncounterDisplayProps {
  encounter: EmptyEncounter;
  onComplete: () => void;
}

// Helper function to get the appropriate icon for resource types
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'energy':
      return <ZapIcon className="h-5 w-5 text-yellow-400" />;
    case 'insight':
      return <FlaskConicalIcon className="h-5 w-5 text-blue-400" />;
    case 'crew':
      return <UsersIcon className="h-5 w-5 text-green-400" />;
    case 'scrap':
      return <WrenchIcon className="h-5 w-5 text-orange-400" />;
    default:
      return <AwardIcon className="h-5 w-5 text-primary" />;
  }
};

// Helper function to format resource names for display
const formatResourceName = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Get background class based on region
const getRegionBackgroundClass = (region: RegionType): string => {
  switch (region) {
    case 'void':
      return 'bg-gradient-to-br from-slate-900 to-slate-800';
    case 'nebula':
      return 'bg-gradient-to-br from-indigo-900 to-purple-800';
    case 'asteroid':
      return 'bg-gradient-to-br from-stone-800 to-amber-900';
    case 'deepspace':
      return 'bg-gradient-to-br from-slate-950 to-blue-950';
    case 'blackhole':
      return 'bg-gradient-to-br from-zinc-950 to-slate-950';
    default:
      return 'bg-gradient-to-br from-slate-900 to-slate-800';
  }
};

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

const EncounterDisplay: React.FC<EncounterDisplayProps> = ({ encounter, onComplete }) => {
  const { shouldFlicker } = useSystemStatus();
  const [showRewards, setShowRewards] = useState(false);
  const hasRewards = encounter.resources && encounter.resources.length > 0;
  
  useEffect(() => {
    if (hasRewards) {
      // Eliminate delay completely but keep the animation effect
      const timer = setTimeout(() => setShowRewards(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hasRewards]);
  
  const backgroundClass = getRegionBackgroundClass(encounter.region as RegionType);
  const regionIcon = getRegionIcon(encounter.region as RegionType);
  
  return (
    <div className={`min-h-[calc(100vh-10rem)] ${backgroundClass}`}>
      <div className="system-panel p-8 max-w-4xl w-full mx-auto backdrop-blur-sm bg-opacity-80 relative overflow-hidden">
        {/* Subtle animated region-specific effect in the background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className={`${encounter.region === 'nebula' ? 'nebula-effect' : 
                           encounter.region === 'blackhole' ? 'blackhole-effect' : 
                           encounter.region === 'asteroid' ? 'asteroid-effect' : 
                           encounter.region === 'deepspace' ? 'deepspace-effect' : 'void-effect'}`}>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 border-b border-accent/30 pb-4">
            {regionIcon}
            <div>
              <h1 className={`text-3xl font-bold mb-1 ${shouldFlicker('encounters') ? 'flickering-text' : ''}`}>
                {encounter.title}
              </h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Region: {encounter.region.charAt(0).toUpperCase() + encounter.region.slice(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-8 system-panel p-6">
            <p className="text-xl mb-4 leading-relaxed">{encounter.description}</p>
            <p className="italic text-lg">{encounter.message}</p>
          </div>
          
          {hasRewards && (
            <div className={`transition-all duration-700 mb-8 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
                <AwardIcon className="h-5 w-5 text-chart-1" />
                Discovered Resources
              </h2>
              <div className="system-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {encounter.resources && encounter.resources.map((reward: ResourceReward, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-colors">
                    <div className="p-2 rounded-full bg-accent/10">
                      {getResourceIcon(reward.type)}
                    </div>
                    <div>
                      <div className="text-lg font-medium">{formatResourceName(reward.type)}</div>
                      <div className="text-muted-foreground">+{reward.amount} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-10 flex justify-end">
            <button 
              onClick={onComplete}
              className={`flex items-center gap-2 system-panel py-3 px-6 hover:bg-accent/10 transition-colors ${shouldFlicker('navigation') ? 'flickering-text' : ''}`}
            >
              <span className="text-lg">Continue Journey</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterDisplay; 