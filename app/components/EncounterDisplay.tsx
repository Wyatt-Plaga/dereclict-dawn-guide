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
  ActivityIcon,
  Sword
} from 'lucide-react';
import { EmptyEncounter, StoryEncounter, ResourceReward, RegionType, BaseEncounter, EncounterChoice } from '../game/types';
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from '../game/hooks/useGame';
import { useRouter } from 'next/navigation';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

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
  const router = useRouter();
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
  const isCombatEncounter = encounter.type === 'combat';
  
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
    } else if (isCombatEncounter) {
      // For combat encounters, we'll complete the encounter
      // which will initiate combat, then redirect to battle
      Logger.info(
        LogCategory.COMBAT,
        'Combat encounter initiated - redirecting to battle page',
        LogContext.COMBAT
      );
      
      // Complete the encounter first (this starts the combat)
      onComplete();
      
      // Give a small delay to ensure the state is updated before navigating
      setTimeout(() => {
        router.push('/battle');
      }, 100);
    } else {
      // For empty encounters, just complete
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
      <div className="absolute inset-0 -m-4 md:-m-8 z-0 overflow-hidden opacity-30">
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
          <div className="flex-1">
            <h1 className={`text-3xl font-bold mb-1 ${shouldFlicker('encounters') ? 'flickering-text' : ''} ${
              encounter.region === 'void' ? 'text-slate-300' :
              encounter.region === 'nebula' ? 'text-indigo-300' :
              encounter.region === 'asteroid' ? 'text-amber-300' :
              encounter.region === 'deepspace' ? 'text-blue-300' :
              encounter.region === 'blackhole' ? 'text-zinc-300' : 'text-slate-300'
            }`} style={{
              textShadow: shouldFlicker('encounters') ? 'none' : `0 0 10px ${
                encounter.region === 'void' ? 'rgba(203, 213, 225, 0.5)' :
                encounter.region === 'nebula' ? 'rgba(165, 180, 252, 0.5)' :
                encounter.region === 'asteroid' ? 'rgba(251, 191, 36, 0.5)' :
                encounter.region === 'deepspace' ? 'rgba(96, 165, 250, 0.5)' :
                encounter.region === 'blackhole' ? 'rgba(212, 212, 216, 0.5)' : 'rgba(203, 213, 225, 0.5)'
              }`
            }}>
              {encounter.title}
            </h1>
            <div className="flex items-center text-sm">
              <span className={`px-2 py-1 rounded-md ${
                encounter.region === 'void' ? 'bg-slate-800 text-slate-300' :
                encounter.region === 'nebula' ? 'bg-indigo-900 text-indigo-300' :
                encounter.region === 'asteroid' ? 'bg-amber-900 text-amber-300' :
                encounter.region === 'deepspace' ? 'bg-blue-900 text-blue-300' :
                encounter.region === 'blackhole' ? 'bg-zinc-900 text-zinc-300' : 'bg-slate-800 text-slate-300'
              }`}>
                Region: {encounter.region.charAt(0).toUpperCase() + encounter.region.slice(1)}
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
        
        <div className={`mb-8 system-panel p-6 transition-all duration-300 hover:shadow-md ${
          encounter.region === 'void' ? 'hover:shadow-slate-800/30' :
          encounter.region === 'nebula' ? 'hover:shadow-indigo-800/30' :
          encounter.region === 'asteroid' ? 'hover:shadow-amber-800/30' :
          encounter.region === 'deepspace' ? 'hover:shadow-blue-800/30' :
          encounter.region === 'blackhole' ? 'hover:shadow-zinc-800/30' : 'hover:shadow-slate-800/30'
        }`}>
          <p className={`text-xl mb-4 leading-relaxed font-light ${
            encounter.region === 'void' ? 'text-slate-200' :
            encounter.region === 'nebula' ? 'text-indigo-200' :
            encounter.region === 'asteroid' ? 'text-amber-100' :
            encounter.region === 'deepspace' ? 'text-blue-200' :
            encounter.region === 'blackhole' ? 'text-zinc-200' : 'text-slate-200'
          }`}>{encounter.description}</p>
          
          {isEmptyEncounter && emptyEncounter && (
            <p className="italic text-lg text-muted-foreground">{emptyEncounter.message}</p>
          )}
          
          {/* Special message for combat encounters */}
          {isCombatEncounter && (
            <div className="mt-6 border-t border-accent/30 pt-4">
              <p className="text-lg text-red-400 flex items-center gap-2 font-semibold">
                <Sword className="h-5 w-5" />
                <span>Hostile entity detected - prepare for combat!</span>
              </p>
              <p className="mt-2 text-muted-foreground terminal-text text-sm tracking-widest animate-pulse">
                Initializing combat systems... Transferring to battle interface...
              </p>
            </div>
          )}
        </div>
        
        {/* Story Encounter Choices */}
        {isStoryEncounter && storyEncounter && !selectedChoice && (
          <div className="mb-8 animate-fadeIn">
            <h2 className={`text-xl font-medium mb-4 terminal-text flex items-center gap-2 ${
              encounter.region === 'void' ? 'text-slate-300' :
              encounter.region === 'nebula' ? 'text-indigo-300' :
              encounter.region === 'asteroid' ? 'text-amber-300' :
              encounter.region === 'deepspace' ? 'text-blue-300' :
              encounter.region === 'blackhole' ? 'text-zinc-300' : 'text-slate-300'
            }`}>
              <Brain className="h-5 w-5 text-chart-2" />
              Available Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {storyEncounter.choices.map((choice, index) => (
                <button
                  key={choice.id}
                  className={`text-left system-panel p-4 transition-all hover:bg-accent/20 border-l-4 
                    ${
                      encounter.region === 'void' ? 'border-slate-700 hover:border-slate-400' :
                      encounter.region === 'nebula' ? 'border-indigo-700 hover:border-indigo-400' :
                      encounter.region === 'asteroid' ? 'border-amber-700 hover:border-amber-400' :
                      encounter.region === 'deepspace' ? 'border-blue-700 hover:border-blue-400' :
                      encounter.region === 'blackhole' ? 'border-zinc-700 hover:border-zinc-400' : 'border-slate-700 hover:border-slate-400'
                    }
                  `}
                  onClick={() => handleChoiceSelect(choice)}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: 'fadeIn 0.5s ease forwards'
                  }}
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
            <h2 className={`text-xl font-medium mb-4 terminal-text flex items-center gap-2 ${
              encounter.region === 'void' ? 'text-slate-300' :
              encounter.region === 'nebula' ? 'text-indigo-300' :
              encounter.region === 'asteroid' ? 'text-amber-300' :
              encounter.region === 'deepspace' ? 'text-blue-300' :
              encounter.region === 'blackhole' ? 'text-zinc-300' : 'text-slate-300'
            }`}>
              <ActivityIcon className="h-5 w-5 text-chart-3" />
              Outcome
            </h2>
            <div className={`system-panel p-6 transition-all duration-300 hover:shadow-md ${
              encounter.region === 'void' ? 'hover:shadow-slate-800/30' :
              encounter.region === 'nebula' ? 'hover:shadow-indigo-800/30' :
              encounter.region === 'asteroid' ? 'hover:shadow-amber-800/30' :
              encounter.region === 'deepspace' ? 'hover:shadow-blue-800/30' :
              encounter.region === 'blackhole' ? 'hover:shadow-zinc-800/30' : 'hover:shadow-slate-800/30'
            }`}>
              <p className={`text-lg mb-6 leading-relaxed ${
                encounter.region === 'void' ? 'text-slate-200' :
                encounter.region === 'nebula' ? 'text-indigo-200' :
                encounter.region === 'asteroid' ? 'text-amber-100' :
                encounter.region === 'deepspace' ? 'text-blue-200' :
                encounter.region === 'blackhole' ? 'text-zinc-200' : 'text-slate-200'
              }`}>{outcomeText}</p>
              
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
            <h2 className={`text-xl font-medium mb-4 terminal-text flex items-center gap-2 ${
              encounter.region === 'void' ? 'text-slate-300' :
              encounter.region === 'nebula' ? 'text-indigo-300' :
              encounter.region === 'asteroid' ? 'text-amber-300' :
              encounter.region === 'deepspace' ? 'text-blue-300' :
              encounter.region === 'blackhole' ? 'text-zinc-300' : 'text-slate-300'
            }`}>
              <AwardIcon className="h-5 w-5 text-chart-1" />
              Discovered Resources
            </h2>
            <div className={`system-panel p-6 transition-all duration-300 hover:shadow-md ${
              encounter.region === 'void' ? 'hover:shadow-slate-800/30' :
              encounter.region === 'nebula' ? 'hover:shadow-indigo-800/30' :
              encounter.region === 'asteroid' ? 'hover:shadow-amber-800/30' :
              encounter.region === 'deepspace' ? 'hover:shadow-blue-800/30' :
              encounter.region === 'blackhole' ? 'hover:shadow-zinc-800/30' : 'hover:shadow-slate-800/30'
            }`}>
              {hasRewards ? (
                <div className="grid grid-cols-1 gap-4">
                  {emptyEncounter!.resources!.map((reward: ResourceReward, index: number) => (
                    <div 
                      key={index} 
                      className="flex flex-col gap-3 animate-fadeIn"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-all duration-300 hover:translate-x-1 hover:shadow-sm">
                        <div className={`p-2 rounded-full ${
                          reward.type === 'energy' ? 'bg-chart-1/20' : 
                          reward.type === 'insight' ? 'bg-chart-2/20' : 
                          reward.type === 'crew' ? 'bg-chart-3/20' : 
                          reward.type === 'scrap' ? 'bg-chart-4/20' : 
                          'bg-accent/20'
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
                        <p className="text-sm italic pl-3 text-muted-foreground">{reward.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-lg text-muted-foreground mb-2">No resources acquired</div>
                  <p className={`text-center italic text-sm max-w-lg ${
                    encounter.region === 'void' ? 'text-slate-400' :
                    encounter.region === 'nebula' ? 'text-indigo-400' :
                    encounter.region === 'asteroid' ? 'text-amber-400' :
                    encounter.region === 'deepspace' ? 'text-blue-400' :
                    encounter.region === 'blackhole' ? 'text-zinc-400' : 'text-slate-400'
                  }`}>{emptyQuote}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-10">
          <button 
            onClick={handleComplete}
            disabled={isStoryEncounter && !selectedChoice}
            className={`w-full flex items-center justify-center gap-2 system-panel py-3 px-6 transition-all ${
              isCombatEncounter 
                ? 'bg-red-900/40 hover:bg-red-800/50 text-red-100 border-red-700/50' 
                : `hover:bg-accent/20 ${
                  encounter.region === 'void' ? 'hover:border-slate-500' :
                  encounter.region === 'nebula' ? 'hover:border-indigo-500' :
                  encounter.region === 'asteroid' ? 'hover:border-amber-500' :
                  encounter.region === 'deepspace' ? 'hover:border-blue-500' :
                  encounter.region === 'blackhole' ? 'hover:border-zinc-500' : 'hover:border-slate-500'
                }`
            } ${shouldFlicker('navigation') ? 'flickering-text' : ''} ${isStoryEncounter && !selectedChoice ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`text-lg font-medium ${
              isCombatEncounter ? 'text-red-100' : `${
                encounter.region === 'void' ? 'text-slate-200' :
                encounter.region === 'nebula' ? 'text-indigo-200' :
                encounter.region === 'asteroid' ? 'text-amber-100' :
                encounter.region === 'deepspace' ? 'text-blue-200' :
                encounter.region === 'blackhole' ? 'text-zinc-200' : 'text-slate-200'
              }`
            }`}>
              {isCombatEncounter ? 'All Hands to Battle Stations!' : 'Continue Journey'}
            </span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncounterDisplay; 