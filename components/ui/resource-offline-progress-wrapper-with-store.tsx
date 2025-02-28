"use client"

import { useEffect, useState } from "react";
import { ResourceNotification } from "@/components/ui/resource-notification";
import { useGameStore } from "@/store/rootStore";
import { useGameResources } from "@/hooks/useGameResources";
import { ResourceType } from "@/types/game.types";

// Define the window notifications interface
declare global {
  interface Window {
    notifications: {
      addCustomNotification: (content: React.ReactNode, type: string, duration: number, category: string) => void;
      addToast: (options: { message: string; type: string; duration: number; category: string }) => void;
    };
  }
}

// Interface for resource offline gains
interface ResourceOfflineGains {
  resourceType: ResourceType;
  gain: number;
  minutesPassed: number;
}

export function ResourceOfflineProgressWrapperWithStore() {
  // State to store offline gains
  const [resourceOfflineGains, setResourceOfflineGains] = useState<ResourceOfflineGains | null>(null);
  
  // Get last online timestamp from store
  const lastOnline = useGameStore(state => state.lastOnline);
  const updateResource = useGameStore(state => state.updateResource);
  
  // Use the resource hook for accessing resource data
  const { 
    resources,
    getResourceAmount, 
    getResourceCapacity, 
    getAutoGeneration 
  } = useGameResources();
  
  // Calculate offline progress when component mounts or lastOnline changes
  useEffect(() => {
    // Skip if we've already calculated offline gains
    if (resourceOfflineGains !== null || typeof window === 'undefined') return;
    
    // Calculate minutes since last online
    const lastOnlineDate = new Date(lastOnline);
    const now = new Date();
    const minutesPassed = (now.getTime() - lastOnlineDate.getTime()) / (1000 * 60);
    
    // Skip if less than 1 minute has passed
    if (minutesPassed < 1) return;
    
    // Find the resource with the highest auto-generation value
    let bestResourceType: ResourceType | null = null;
    let bestGain = 0;
    
    // Check each resource type
    const resourceTypes: ResourceType[] = ['energy', 'insight', 'crew', 'scrap'];
    
    resourceTypes.forEach(resourceType => {
      const autoGenValue = getAutoGeneration(resourceType);
      const currentAmount = getResourceAmount(resourceType);
      const capacity = getResourceCapacity(resourceType);
      
      // Calculate potential gain
      if (autoGenValue > 0) {
        const gain = Math.min(
          autoGenValue * minutesPassed * 60, // Convert minutes to seconds
          capacity - currentAmount // Can't exceed capacity
        );
        
        // If this resource would provide more gain, update our best
        if (gain > bestGain) {
          bestResourceType = resourceType;
          bestGain = gain;
        }
      }
    });
    
    // If we found a resource type with gain, set it and update the resource
    if (bestResourceType && bestGain > 0) {
      // Apply the gain to the resource
      const currentAmount = getResourceAmount(bestResourceType);
      updateResource(bestResourceType, 'amount', currentAmount + bestGain);
      
      // Set the offline gains to display notification
      setResourceOfflineGains({
        resourceType: bestResourceType,
        gain: bestGain,
        minutesPassed
      });
    }
  }, [lastOnline, resources, updateResource, resourceOfflineGains, getResourceAmount, getResourceCapacity, getAutoGeneration]);
  
  // Show notification for resource gains
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
      
      // Clear the offline gains after showing the notification
      setResourceOfflineGains(null);
    }
  }, [resourceOfflineGains]);
  
  return null;
} 