import React, { useEffect, useState } from 'react';
import { AwardIcon } from 'lucide-react';
import { EmptyEncounter } from '@/app/game/types';
import ResourceRewardsList from './ResourceRewardsList';

interface EmptyEncounterContentProps {
  encounter: EmptyEncounter;
}

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

const EmptyEncounterContent: React.FC<EmptyEncounterContentProps> = ({ encounter }) => {
  const [emptyQuote, setEmptyQuote] = useState<string>("");
  const [showRewards, setShowRewards] = useState(false);
  const hasRewards = encounter.resources && encounter.resources.length > 0;
  
  // Set up the quote only once when component mounts
  useEffect(() => {
    if (!hasRewards) {
      setEmptyQuote(getRandomEmptyQuote());
    }
  }, [hasRewards]);
  
  // Show rewards after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowRewards(true), 375);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <div className="mb-8 system-panel p-6">
        <p className="text-xl mb-4 leading-relaxed">{encounter.description}</p>
        <p className="italic text-lg">{encounter.message}</p>
      </div>
      
      <div className={`transition-all duration-700 mb-8 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {hasRewards ? (
          <>
            <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
              <AwardIcon className="h-5 w-5 text-chart-1" />
              Discovered Resources
            </h2>
            <div className="system-panel p-6">
              <ResourceRewardsList 
                resources={encounter.resources!} 
                title="" 
                showAnimation={false}
              />
            </div>
          </>
        ) : (
          <div className="system-panel p-6">
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-center italic text-sm max-w-lg text-muted-foreground">{emptyQuote}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmptyEncounterContent; 