"use client"

import { ResourcePage } from "@/components/resources/resource-page"
import { insightConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"

export default function ProcessorPage() {
  const { unlockLog, unlockUpgrade } = useSupabase();
  
  return <ResourcePage {...insightConfig} unlockLog={unlockLog} unlockUpgrade={unlockUpgrade} />
} 