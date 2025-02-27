"use client"

import { ReactNode } from "react";
import { DatabaseProvider } from "@/contexts/database/DatabaseContext";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { GameStateProvider } from "@/contexts/game/GameStateContext";
import { OfflineProgressProvider } from "@/contexts/game/OfflineProgressContext";

/**
 * RootProvider composes all context providers into a single provider
 * This ensures proper nesting order and simplifies the app structure
 */
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <GameStateProvider>
          <OfflineProgressProvider>
            {children}
          </OfflineProgressProvider>
        </GameStateProvider>
      </AuthProvider>
    </DatabaseProvider>
  );
} 