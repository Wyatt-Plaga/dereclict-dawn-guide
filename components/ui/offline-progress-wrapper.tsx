"use client"

import { useEffect } from "react";
import { useOfflineProgress } from "@/contexts/game/OfflineProgressContext";
import { MultiResourceNotification } from "@/components/ui/resource-notification";

export function OfflineProgressWrapper() {
  const { offlineGains, dismissOfflineGains } = useOfflineProgress();
  
  useEffect(() => {
    if (!offlineGains || typeof window === 'undefined' || !window.notifications) return;
    
    // Format time in hours, minutes, and seconds
    const formatTimeAway = (minutes: number) => {
      if (minutes < 0.17) { // Less than 10 seconds
        return 'Just now';
      } else if (minutes < 1) {
        return `${Math.round(minutes * 60)}s`;
      } else if (minutes >= 60) {
        return `${Math.floor(minutes / 60)}h ${Math.floor(minutes % 60)}m`;
      } else {
        return `${Math.floor(minutes)}m`;
      }
    };
    
    const timeAway = formatTimeAway(offlineGains.minutesPassed);
    
    // Build a list of resources that have gains
    const resourcesWithGains = [];
    
    if (offlineGains.gains.energy > 0) {
      resourcesWithGains.push({ type: 'energy' as const, gain: offlineGains.gains.energy });
    }
    
    if (offlineGains.gains.insight > 0) {
      resourcesWithGains.push({ type: 'insight' as const, gain: offlineGains.gains.insight });
    }
    
    if (offlineGains.gains.crew > 0) {
      resourcesWithGains.push({ type: 'crew' as const, gain: offlineGains.gains.crew });
    }
    
    if (offlineGains.gains.scrap > 0) {
      resourcesWithGains.push({ type: 'scrap' as const, gain: offlineGains.gains.scrap });
    }
    
    // Only show notification if there are resources with gains
    if (resourcesWithGains.length > 0) {
      // Create a JSX notification with proper icons
      const notificationContent = (
        <MultiResourceNotification 
          resources={resourcesWithGains}
          timeAway={timeAway}
        />
      );
      
      // Use a single category for all multi-resource notifications
      const category = "multi-resource-gain";
      
      // Check if addCustomNotification exists
      if (typeof window.notifications.addCustomNotification === 'function') {
        // Use the custom notification method
        window.notifications.addCustomNotification(
          notificationContent,
          "success",
          8000, // Show for 8 seconds
          category // Add category to prevent stacking
        );
      } else {
        // Fallback to standard toast if custom notification isn't available
        window.notifications.addToast({
          message: "You gained resources while away!",
          type: "success",
          duration: 8000,
          category // Add category to prevent stacking
        });
        console.error("Custom notification method not available");
      }
    }
    
    // Dismiss the offline gains after showing the toast
    dismissOfflineGains();
  }, [offlineGains, dismissOfflineGains]);
  
  return null;
} 