"use client"

import { ResourcePage } from "@/components/resources/resource-page"
import { scrapConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"
import { GameEngineLayout } from "@/src/ui/layouts/GameEngineLayout"
import { useResourcePageAdapter } from "@/src/ui/adapters/useResourcePageAdapter"

export default function ManufacturingPage() {
  const { unlockLog, unlockUpgrade } = useSupabase();
  const adapter = useResourcePageAdapter(scrapConfig, unlockLog, unlockUpgrade);
  
  // If the adapter is still loading, show a loading indicator
  if (adapter.isLoading) {
    return (
      <GameEngineLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-primary">Initializing manufacturing systems...</p>
        </div>
      </GameEngineLayout>
    );
  }
  
  return (
    <GameEngineLayout>
      <ResourcePage 
        {...scrapConfig}
        unlockLog={unlockLog}
        unlockUpgrade={adapter.unlockUpgrade}
        upgrades={adapter.upgrades}
      />
    </GameEngineLayout>
  )
} 