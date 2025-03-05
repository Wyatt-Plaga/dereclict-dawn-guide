import React, { useState, useEffect } from 'react';
import { Brain, ActivityIcon } from 'lucide-react';
import { StoryEncounter, EncounterChoice, ResourceReward } from '@/app/game/types';
import ResourceRewardsList from './ResourceRewardsList';

interface StoryEncounterContentProps {
  encounter: StoryEncounter;
  onChoiceSelect: (choiceId: string) => void;
}

const StoryEncounterContent: React.FC<StoryEncounterContentProps> = ({ 
  encounter, 
  onChoiceSelect 
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [outcomeResources, setOutcomeResources] = useState<ResourceReward[] | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  
  // Handle selecting a choice
  const handleChoiceSelect = (choice: EncounterChoice) => {
    setSelectedChoice(choice.id);
    setOutcomeText(choice.outcome.text);
    setOutcomeResources(choice.outcome.resources || null);
    
    // Show rewards with a delay
    setTimeout(() => setShowRewards(true), 375);
    
    // Notify parent component
    onChoiceSelect(choice.id);
  };
  
  return (
    <>
      <div className="mb-8 system-panel p-6">
        <p className="text-xl mb-4 leading-relaxed">{encounter.description}</p>
      </div>
      
      {/* Story Encounter Choices */}
      {!selectedChoice && (
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
            <Brain className="h-5 w-5 text-chart-2" />
            Available Actions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {encounter.choices.map((choice) => (
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
      {selectedChoice && (
        <div className={`transition-all duration-700 mb-8 ${outcomeText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-xl font-medium mb-4 terminal-text flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-chart-3" />
            Outcome
          </h2>
          <div className="system-panel p-6">
            <p className="text-lg mb-6 leading-relaxed">{outcomeText}</p>
            
            {/* Resources gained from choice */}
            {outcomeResources && outcomeResources.length > 0 && (
              <ResourceRewardsList 
                resources={outcomeResources} 
                showAnimation={showRewards}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StoryEncounterContent; 