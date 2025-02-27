"use client"

import { useEffect } from "react";
import { useOfflineProgress } from "@/contexts/game/OfflineProgressContext";
import { ResourceNotification } from "@/components/ui/resource-notification";

export function ResourceOfflineProgressWrapper() {
  const { resourceOfflineGains, dismissResourceOfflineGains } = useOfflineProgress();
  
  useEffect(() => {
    if (!resourceOfflineGains || typeof window === 'undefined' || !window.notifications) return;
    
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
    
    if (resourceOfflineGains.gain > 0) {
      const timeAway = formatTimeAway(resourceOfflineGains.minutesPassed);
      
      // Create a JSX notification with proper icons
      const notificationContent = (
        <ResourceNotification 
          resourceType={resourceOfflineGains.resourceType}
          gain={resourceOfflineGains.gain}
          timeAway={timeAway}
        />
      );
      
      // Use a category that's specific to the resource type
      const category = `resource-gain-${resourceOfflineGains.resourceType}`;
      
      // Check if addCustomNotification exists
      if (typeof window.notifications.addCustomNotification === 'function') {
        // Use the custom notification method with category
        window.notifications.addCustomNotification(
          notificationContent,
          "success",
          5000, // Show for 5 seconds
          category // Add category to prevent stacking
        );
      } else {
        // Fallback to standard toast if custom notification isn't available
        window.notifications.addToast({
          message: `You gained ${resourceOfflineGains.gain} ${resourceOfflineGains.resourceType}!`,
          type: "success",
          duration: 5000,
          category // Add category to prevent stacking
        });
        console.error("Custom notification method not available");
      }
    }
    
    // Dismiss the resource offline gains after showing the toast
    dismissResourceOfflineGains();
  }, [resourceOfflineGains, dismissResourceOfflineGains]);
  
  return null;
} 