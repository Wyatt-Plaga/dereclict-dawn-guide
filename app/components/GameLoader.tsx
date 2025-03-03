'use client';

import { useGame } from '@/app/game/hooks/useGame';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GameLoaderProps {
  children: React.ReactNode;
}

/**
 * GameLoader component
 * 
 * Shows a loading screen during initial game loading
 * but doesn't interfere with in-app navigation
 */
export default function GameLoader({ children }: GameLoaderProps) {
  const { isInitializing } = useGame();
  
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Derelict Dawn</h1>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading ship systems...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 