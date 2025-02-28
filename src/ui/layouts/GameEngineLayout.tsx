"use client"

import React from 'react';
import { GameEngineProvider } from '../providers/GameEngineProvider';
import { ResourceSynchronizer } from '../components/ResourceSynchronizer';

/**
 * GameEngineLayout
 * 
 * Wraps children with the GameEngineProvider and includes ResourceSynchronizer
 * to keep both systems in sync during the transition period.
 */
export function GameEngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameEngineProvider>
      {/* Invisible component that synchronizes existing state with game engine */}
      <ResourceSynchronizer />
      
      {/* Render children (typically the page content) */}
      {children}
    </GameEngineProvider>
  );
} 