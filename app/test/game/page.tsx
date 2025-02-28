"use client"

import { Suspense } from 'react';
import { GameEngineProvider } from '@/src/ui/providers/GameEngineProvider';
import GameTest from '@/components/testing/GameTest';

export default function GameTestPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Game Engine Test</h1>
      <Suspense fallback={<div>Loading game engine...</div>}>
        <GameEngineProvider>
          <GameTest />
        </GameEngineProvider>
      </Suspense>
    </main>
  );
} 