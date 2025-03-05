import React from 'react';
import { Sword } from 'lucide-react';
import { BaseEncounter } from '@/app/game/types';

interface CombatEncounterContentProps {
  encounter: BaseEncounter;
}

const CombatEncounterContent: React.FC<CombatEncounterContentProps> = ({ encounter }) => {
  return (
    <div className="mb-8 system-panel p-6">
      <p className="text-xl mb-4 leading-relaxed">{encounter.description}</p>
      
      {/* Special message for combat encounters */}
      <div className="mt-6 border-t border-accent/30 pt-4">
        <p className="text-lg text-red-400 flex items-center gap-2">
          <Sword className="h-5 w-5" />
          <span>Hostile entity detected - prepare for combat!</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Initializing combat systems... Transferring to battle interface...
        </p>
      </div>
    </div>
  );
};

export default CombatEncounterContent; 