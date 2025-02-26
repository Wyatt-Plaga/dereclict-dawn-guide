"use client"

import { useSupabase } from "@/utils/supabase/context";
import { OfflineProgress } from "@/components/ui/offline-progress";

export function OfflineProgressWrapper() {
  const { offlineGains, dismissOfflineGains } = useSupabase();
  
  if (!offlineGains) return null;
  
  return (
    <OfflineProgress
      minutesPassed={offlineGains.minutesPassed}
      gains={offlineGains.gains}
      onClose={dismissOfflineGains}
    />
  );
} 