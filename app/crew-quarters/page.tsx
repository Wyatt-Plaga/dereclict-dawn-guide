"use client"

import { ResourcePage } from "@/components/resources/resource-page"
import { crewConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"

export default function CrewQuartersPage() {
  const { unlockLog, unlockUpgrade } = useSupabase();
  
  return <ResourcePage {...crewConfig} unlockLog={unlockLog} unlockUpgrade={unlockUpgrade} />
} 