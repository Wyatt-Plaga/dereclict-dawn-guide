"use client"

import { ResourcePage } from "@/components/resources/resource-page"
import { insightConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"
import { GameEngineLayout } from "@/src/ui/layouts/GameEngineLayout"

export default function ProcessorPage() {
  const { unlockLog, unlockUpgrade } = useSupabase();
  
  return (
    <GameEngineLayout>
      <ResourcePage 
        {...insightConfig}
        unlockLog={unlockLog}
        unlockUpgrade={unlockUpgrade}
      />
    </GameEngineLayout>
  )
} 