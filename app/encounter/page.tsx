"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from "@/components/ui/navbar";
import { useGame } from '@/app/game/hooks/useGame';
import EncounterDisplay from '@/app/components/EncounterDisplay';
import GameLoader from '@/app/components/GameLoader';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EmptyEncounter } from '../game/types';

export default function EncounterPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    'Rendering EncounterPage',
    LogContext.UI_RENDER
  );
  
  // If there's no active encounter, redirect back to navigation
  useEffect(() => {
    if (!state.encounters.active) {
      router.push('/navigation');
    }

    // If combat is active, redirect to battle page
    // But only if there's no active encounter - this ensures we don't
    // redirect during the initial combat encounter display
    if (state.combat?.active && !state.encounters.active) {
      Logger.info(
        LogCategory.COMBAT,
        'Active combat detected - redirecting to battle page',
        LogContext.COMBAT
      );
      router.push('/battle');
    }
  }, [state.encounters.active, state.combat?.active, router]);
  
  // Handle completing the encounter
  const handleCompleteEncounter = (choiceId?: string) => {
    Logger.info(
      LogCategory.ACTIONS,
      `Completing encounter${choiceId ? ` with choice: ${choiceId}` : ''}`,
      LogContext.NONE
    );
    
    if (choiceId) {
      dispatch({
        type: 'MAKE_STORY_CHOICE',
        payload: {
          choiceId
        }
      });
    } else {
      dispatch({
        type: 'COMPLETE_ENCOUNTER'
      });
    }
    
    // Give a small delay to ensure the state is updated before navigating
    setTimeout(() => {
      // Navigate back to the navigation page
      router.push('/navigation');
    }, 100);
  };
  
  // If there's no active encounter or encounter data, show loading
  if (!state.encounters.active || !state.encounters.encounter) {
    return (
      <GameLoader>
        <main className="flex min-h-screen flex-col">
          <NavBar />
          <div className="flex flex-col items-center justify-center flex-grow p-4">
            <div className="system-panel p-6 text-center">
              <p className="text-lg">No active encounter detected...</p>
              <button 
                onClick={() => router.push('/navigation')}
                className="mt-4 system-panel py-2 px-4 hover:bg-accent/10 transition-colors"
              >
                Return to Navigation
              </button>
            </div>
          </div>
        </main>
      </GameLoader>
    );
  }
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <EncounterDisplay 
            encounter={state.encounters.encounter!}
            onComplete={handleCompleteEncounter}
          />
        </div>
      </main>
    </GameLoader>
  );
} 