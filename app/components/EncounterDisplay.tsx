import React, { useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { BaseEncounter, EmptyEncounter, StoryEncounter, RegionType } from '../game/types';
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useRouter } from 'next/navigation';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

// Import the new components
import EncounterHeader from './encounter/EncounterHeader';
import RegionEffects from './encounter/RegionEffects';
import EmptyEncounterContent from './encounter/EmptyEncounterContent';
import StoryEncounterContent from './encounter/StoryEncounterContent';
import CombatEncounterContent from './encounter/CombatEncounterContent';

interface EncounterDisplayProps {
  encounter: BaseEncounter;
  currentRegion: RegionType;
  onComplete: (choiceId?: string) => void;
}

const EncounterDisplay: React.FC<EncounterDisplayProps> = ({ encounter, currentRegion, onComplete }) => {
  const { shouldFlicker } = useSystemStatus();
  const router = useRouter();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  
  // Determine the encounter type
  const isEmptyEncounter = encounter.type === 'empty';
  const isStoryEncounter = encounter.type === 'story';
  const isCombatEncounter = encounter.type === 'combat';
  
  // Handle selecting a choice in a story encounter
  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
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
  
  return (
    <div className="relative w-full">
      {/* Region-specific effects */}
      <RegionEffects region={currentRegion} />
      
      {/* Main content */}
      <div className="system-panel p-6 mb-6 relative z-10">
        {/* Header with title and region */}
        <EncounterHeader 
          title={encounter.title} 
          region={currentRegion}
          type={encounter.type} 
        />
        
        {/* Encounter content based on type */}
        {isEmptyEncounter && (
          <EmptyEncounterContent encounter={encounter as EmptyEncounter} />
        )}
        
        {isStoryEncounter && (
          <StoryEncounterContent 
            encounter={encounter as StoryEncounter} 
            onChoiceSelect={handleChoiceSelect} 
          />
        )}
        
        {isCombatEncounter && (
          <CombatEncounterContent encounter={encounter} currentRegion={currentRegion} />
        )}
        
        {/* Continue button */}
        <div className="mt-10">
          <button 
            onClick={handleComplete}
            disabled={isStoryEncounter && !selectedChoice}
            className={`w-full flex items-center justify-center gap-2 system-panel py-3 px-6 transition-all ${
              isCombatEncounter 
                ? 'bg-red-900/40 hover:bg-red-800/50 text-red-100 border-red-700/50' 
                : 'hover:bg-accent/20'
            } ${shouldFlicker('navigation') ? 'flickering-text' : ''} ${isStoryEncounter && !selectedChoice ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`text-lg font-medium ${isCombatEncounter ? 'text-red-100' : ''}`}>
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