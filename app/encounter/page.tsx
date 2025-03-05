"use client"

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavBar } from "@/components/ui/navbar";
import { useGame } from '@/app/game/hooks/useGame';
import EncounterDisplay from '@/app/components/EncounterDisplay';
import GameLoader from '@/app/components/GameLoader';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { BaseEncounter, EmptyEncounter } from '../game/types';

export default function EncounterPage() {
  const { state, dispatch, engine } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  const encounterId = searchParams.get('id');
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    'Rendering EncounterPage',
    LogContext.UI_RENDER
  );
  
  // Restore encounter from ID in URL if needed
  useEffect(() => {
    // If we have an active encounter with matching ID, nothing to do
    if (state.encounters.active && 
        state.encounters.encounter && 
        state.encounters.encounter.id === encounterId) {
      return;
    }

    // If URL has encounter ID but encounter is not active or doesn't match
    if (encounterId) {
      // Look for this encounter in history
      const historicEncounter = state.encounters.history.find(e => e.id === encounterId);
      
      if (historicEncounter) {
        Logger.info(
          LogCategory.UI,
          `Found historic encounter ${encounterId} in URL, but this encounter has already been completed`,
          LogContext.UI_RENDER
        );
        // This encounter is already in history (completed) - navigate back to navigation
        router.push('/navigation');
        return;
      }
      
      if (state.encounters.encounter && state.encounters.encounter.id === encounterId) {
        // We have the encounter, just need to activate it
        Logger.info(
          LogCategory.UI,
          `Found encounter ${encounterId} in state, activating it`,
          LogContext.UI_RENDER
        );
        
        dispatch({
          type: 'SET_ENCOUNTER_ACTIVE',
          payload: { active: true }
        });
        return;
      }
      
      // If we have some other encounter active, we'll need to generate a new one
      Logger.info(
        LogCategory.UI,
        `Encounter ID ${encounterId} from URL not found in current state, generating new encounter`,
        LogContext.UI_RENDER
      );
      
      // Start a new encounter with the current region
      dispatch({
        type: 'INITIATE_JUMP'
      });
      return;
    }

    // If combat is active, redirect to battle page
    if (state.combat?.active) {
      Logger.info(
        LogCategory.COMBAT,
        'Active combat detected - redirecting to battle page',
        LogContext.COMBAT
      );
      router.push('/battle');
      return;
    }
    
    // If no encounter ID in URL and no active encounter, redirect to navigation
    if (!state.encounters.active || !state.encounters.encounter) {
      Logger.info(
        LogCategory.UI,
        'No encounter ID in URL and no active encounter, redirecting to navigation',
        LogContext.UI_RENDER
      );
      router.push('/navigation');
    }
  }, [state.encounters.active, state.encounters.encounter, state.combat?.active, encounterId, dispatch, router, state.encounters.history]);
  
  // When a new encounter becomes active, update the URL
  useEffect(() => {
    if (state.encounters.active && state.encounters.encounter) {
      const currentId = state.encounters.encounter.id;
      
      // Only update if the URL doesn't already have this ID
      if (encounterId !== currentId) {
        Logger.info(
          LogCategory.UI,
          `Updating URL with encounter ID: ${currentId}`,
          LogContext.UI_RENDER
        );
        
        // Use replace to avoid adding to browser history
        router.replace(`/encounter?id=${currentId}`);
      }
    }
  }, [state.encounters.active, state.encounters.encounter, router, encounterId]);
  
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
              <p className="text-lg">Loading encounter...</p>
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
            encounter={state.encounters.encounter}
            onComplete={handleCompleteEncounter}
          />
        </div>
      </main>
    </GameLoader>
  );
} 