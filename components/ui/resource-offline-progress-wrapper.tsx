"use client"

import { useSupabase } from "@/utils/supabase/context";
import { ResourceOfflineProgress } from "@/components/ui/resource-offline-progress";

export function ResourceOfflineProgressWrapper() {
  const { resourceOfflineGains, dismissResourceOfflineGains } = useSupabase();
  
  if (!resourceOfflineGains) return null;
  
  return (
    <ResourceOfflineProgress
      resourceType={resourceOfflineGains.resourceType}
      minutesPassed={resourceOfflineGains.minutesPassed}
      gain={resourceOfflineGains.gain}
      onClose={dismissResourceOfflineGains}
    />
  );
} 