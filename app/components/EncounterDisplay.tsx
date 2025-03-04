import React, { useEffect, useState } from 'react';
import { 
  AwardIcon, 
  ChevronRightIcon, 
  CompassIcon, 
  Brain,
  Zap, 
  Users, 
  Package,
  ShieldIcon,
  MapIcon,
  ActivityIcon 
} from 'lucide-react';
import { EmptyEncounter, StoryEncounter, ResourceReward, RegionType, BaseEncounter, EncounterChoice } from '../game/types';
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from '../game/hooks/useGame';

interface EncounterDisplayProps {
  encounter: BaseEncounter;
  onComplete: (choiceId?: string) => void;
}

// Helper function to get the appropriate icon for resource types
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'energy':
      return <Zap className="h-5 w-5 text-chart-1" />;
    case 'insight':
      return <Brain className="h-5 w-5 text-chart-2" />;
    case 'crew':
      return <Users className="h-5 w-5 text-chart-3" />;
    case 'scrap':
      return <Package className="h-5 w-5 text-chart-4" />;
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
  const { dispatch } = useGame();
  const regionIcon = getRegionIcon(encounter.region);
  const regionClass = getRegionBackgroundClass(encounter.region);
  const [showRewards, setShowRewards] = useState(false);
  const [emptyQuote, setEmptyQuote] = useState<string>("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [outcomeResources, setOutcomeResources] = useState<ResourceReward[] | null>(null);
  
  // Determine the encounter type
  const isEmptyEncounter = encounter.type === 'empty';
  const isStoryEncounter = encounter.type === 'story';
  
  // For empty encounters only
  const emptyEncounter = isEmptyEncounter ? encounter as EmptyEncounter : null;
  const hasRewards = emptyEncounter?.resources && emptyEncounter.resources.length > 0;
  
  // For story encounters only
  const storyEncounter = isStoryEncounter ? encounter as StoryEncounter : null;
  
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
  
  // Handle selecting a choice in a story encounter
  const handleChoiceSelect = (choice: EncounterChoice) => {
    setSelectedChoice(choice.id);
    setOutcomeText(choice.outcome.text);
    setOutcomeResources(choice.outcome.resources || null);
    
    // Show rewards with a delay
    setTimeout(() => setShowRewards(true), 375);
  };
  
  // Handle completing the encounter
  const handleComplete = () => {
    // For story encounters, we need a choice ID
    if (isStoryEncounter && selectedChoice) {
      onComplete(selectedChoice);
    } else {
      onComplete();
    }
  };
  
  // Set up the quote only once when component mounts for empty encounters
  useEffect(() => {
    if (isEmptyEncounter && !hasRewards) {
      setEmptyQuote(getRandomEmptyQuote());
    }
  }, [isEmptyEncounter, hasRewards]);
  
  // For empty encounters, show rewards after delay
  useEffect(() => {
    if (isEmptyEncounter) {
      // Always trigger the animation, whether there are rewards or not
      const timer = setTimeout(() => setShowRewards(true), 375);
      return () => clearTimeout(timer);
    }
  }, [isEmptyEncounter, hasRewards]);
  
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
          {isEmptyEncounter && emptyEncounter && (
            <p className="italic text-lg">{emptyEncounter.message}</p>
          )}
        </div>
        
        {/* Story Encounter Choices */}
        {isStoryEncounter && storyEncounter && !selectedChoice && (
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <Brain className="h-5 w-5 text-chart-2" />
              Available Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {storyEncounter.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="text-left system-panel p-4 hover:bg-accent/10 transition-all border-l-4 border-transparent hover:border-accent"
                  onClick={() => handleChoiceSelect(choice)}
                >
                  <p className="text-lg font-medium">{choice.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Story Encounter Outcome */}
        {isStoryEncounter && selectedChoice && (
          <div className={`transition-all duration-700 mb-8 ${outcomeText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-chart-3" />
              Outcome
            </h2>
            <div className="system-panel p-6">
              <p className="text-lg mb-6 leading-relaxed">{outcomeText}</p>
              
              {/* Resources gained from choice */}
              {outcomeResources && outcomeResources.length > 0 && (
                <div className={`transition-all duration-700 mt-6 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <h3 className="text-lg font-medium mb-4 terminal-text flex items-center gap-2">
                    <AwardIcon className="h-5 w-5 text-chart-1" />
                    Acquired Resources
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {outcomeResources.map((reward: ResourceReward, index: number) => (
                      <div key={index} className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-colors">
                          <div className={`p-2 rounded-full ${
                            reward.type === 'energy' ? 'bg-chart-1/10' : 
                            reward.type === 'insight' ? 'bg-chart-2/10' : 
                            reward.type === 'crew' ? 'bg-chart-3/10' : 
                            reward.type === 'scrap' ? 'bg-chart-4/10' : 
                            'bg-accent/10'
                          }`}>
                            {getResourceIcon(reward.type)}
                          </div>
                          <div>
                            <div className={`text-lg font-medium ${
                              reward.type === 'energy' ? 'text-chart-1' : 
                              reward.type === 'insight' ? 'text-chart-2' : 
                              reward.type === 'crew' ? 'text-chart-3' : 
                              reward.type === 'scrap' ? 'text-chart-4' : 
                              'text-primary'
                            }`}>{formatResourceName(reward.type)}</div>
                            <div className="text-muted-foreground">{reward.amount > 0 ? `+${reward.amount}` : reward.amount} units</div>
                          </div>
                        </div>
                        {reward.message && (
                          <p className="text-sm italic pl-3">{reward.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Empty Encounter Resources */}
        {isEmptyEncounter && (
          <div className={`transition-all duration-700 mb-8 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <AwardIcon className="h-5 w-5 text-chart-1" />
              Discovered Resources
            </h2>
            <div className="system-panel p-6">
              {hasRewards ? (
                <div className="grid grid-cols-1 gap-4">
                  {emptyEncounter!.resources!.map((reward: ResourceReward, index: number) => (
                    <div key={index} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-colors">
                        <div className={`p-2 rounded-full ${
                          reward.type === 'energy' ? 'bg-chart-1/10' : 
                          reward.type === 'insight' ? 'bg-chart-2/10' : 
                          reward.type === 'crew' ? 'bg-chart-3/10' : 
                          reward.type === 'scrap' ? 'bg-chart-4/10' : 
                          'bg-accent/10'
                        }`}>
                          {getResourceIcon(reward.type)}
                        </div>
                        <div>
                          <div className={`text-lg font-medium ${
                            reward.type === 'energy' ? 'text-chart-1' : 
                            reward.type === 'insight' ? 'text-chart-2' : 
                            reward.type === 'crew' ? 'text-chart-3' : 
                            reward.type === 'scrap' ? 'text-chart-4' : 
                            'text-primary'
                          }`}>{formatResourceName(reward.type)}</div>
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
        )}
        
        <div className="mt-10">
          <button 
            onClick={handleComplete}
            disabled={isStoryEncounter && !selectedChoice}
            className={`w-full flex items-center justify-center gap-2 system-panel py-3 px-6 hover:bg-accent/10 transition-colors ${shouldFlicker('navigation') ? 'flickering-text' : ''} ${isStoryEncounter && !selectedChoice ? 'opacity-50 cursor-not-allowed' : ''}`}
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