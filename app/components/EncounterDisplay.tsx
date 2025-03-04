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
      return <ZapIcon className="h-5 w-5 text-blue-400" />;
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
  const regionIcon = getRegionIcon(encounter.region);
  const regionClass = getRegionBackgroundClass(encounter.region);
  const [showRewards, setShowRewards] = useState(false);
  const [emptyQuote, setEmptyQuote] = useState<string>("");
  
  // Check if there are any rewards
  const hasRewards = encounter.resources && encounter.resources.length > 0;
  
  // Mystery quotes when no resources are found
  const emptyResourceQuotes = [
    "The void offers no material comfort, only the silent companionship of endless stars.",
    "Sometimes the journey itself is the only reward we find among the cosmos.",
    "Not all discoveries can be measured in units and resources.",
    "The Dawn continues its journey through the emptiness, gathering only memories.",
    "The sensors remain quiet. Perhaps the next jump will yield more tangible results.",
    "The crew logs another unremarkable sector in the ship's vast database.",
    "What cannot be seen may still be valuable; knowledge often comes in mysterious forms.",
    "The ship's storage remains unchanged, but the crew's perspective shifts slightly.",
    "Empty-handed but not empty-hearted, the Dawn presses onward through the cosmos."
  ];
  
  // Get a random quote for empty resource encounters
  const getRandomEmptyQuote = () => {
    return emptyResourceQuotes[Math.floor(Math.random() * emptyResourceQuotes.length)];
  };
  
  // Set up the quote only once when component mounts
  useEffect(() => {
    if (!hasRewards) {
      setEmptyQuote(getRandomEmptyQuote());
    }
  }, [hasRewards]);
  
  useEffect(() => {
    // Always trigger the animation, whether there are rewards or not
    const timer = setTimeout(() => setShowRewards(true), 0);
    return () => clearTimeout(timer);
  }, [hasRewards]);
  
  return (
    <div className="relative w-full">
      {/* Region-specific effects only without the gradient background */}
      <div className="absolute inset-0 -m-4 md:-m-8 z-0 overflow-hidden opacity-20">
        <div className={`${encounter.region === 'nebula' ? 'nebula-effect' : 
                     encounter.region === 'blackhole' ? 'blackhole-effect' : 
                     encounter.region === 'asteroid' ? 'asteroid-effect' : 
                     encounter.region === 'deepspace' ? 'deepspace-effect' : 'void-effect'}`}>
        </div>
      </div>
      
      {/* Main content */}
      <div className="system-panel p-6 mb-6 relative z-10">
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
        
        {/* Always show resources section with animation */}
        <div className={`transition-all duration-700 mb-8 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
            <AwardIcon className="h-5 w-5 text-chart-1" />
            Discovered Resources
          </h2>
          <div className="system-panel p-6">
            {hasRewards ? (
              <div className="grid grid-cols-1 gap-4">
                {encounter.resources!.map((reward: ResourceReward, index: number) => (
                  <div key={index} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-colors">
                      <div className="p-2 rounded-full bg-accent/10">
                        {getResourceIcon(reward.type)}
                      </div>
                      <div>
                        <div className="text-lg font-medium">{formatResourceName(reward.type)}</div>
                        <div className="text-muted-foreground">+{reward.amount} units</div>
                      </div>
                    </div>
                    {reward.message && (
                      <p className="text-sm italic pl-3">{reward.message}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="text-lg text-muted-foreground mb-2">No resources acquired</div>
                <p className="text-center italic text-sm max-w-lg">{emptyQuote}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-10">
          <button 
            onClick={onComplete}
            className={`w-full flex items-center justify-center gap-2 system-panel py-3 px-6 hover:bg-accent/10 transition-colors ${shouldFlicker('navigation') ? 'flickering-text' : ''}`}
          >
            <span className="text-lg">Continue Journey</span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncounterDisplay; 