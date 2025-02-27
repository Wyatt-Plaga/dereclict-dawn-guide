"use client"

import { Clock, Zap, Brain, Users, Wrench } from "lucide-react"
import { ReactNode } from "react"

interface ResourceGainProps {
  resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
  gain: number;
  timeAway: string;
}

// Get the appropriate icon for each resource type
const getResourceIcon = (type: string): ReactNode => {
  switch (type) {
    case 'energy':
      return <Zap className="h-5 w-5 text-chart-1" />;
    case 'insight':
      return <Brain className="h-5 w-5 text-chart-2" />;
    case 'crew':
      return <Users className="h-5 w-5 text-chart-3" />;
    case 'scrap':
      return <Wrench className="h-5 w-5 text-chart-4" />;
    default:
      return null;
  }
};

// Resource type to name mapping 
const resourceNames = {
  energy: "Energy",
  insight: "Insight",
  crew: "Crew",
  scrap: "Scrap"
};

// Format resource amounts to show decimals when needed
const formatResourceAmount = (amount: number): string => {
  // For small values, show with 1 decimal place
  if (amount > 0 && amount < 1) {
    return amount.toFixed(1);
  }
  // For zero or larger values, round to nearest whole number
  return Math.round(amount).toString();
};

export function ResourceNotification({ resourceType, gain, timeAway }: ResourceGainProps) {
  const icon = getResourceIcon(resourceType);
  const name = resourceNames[resourceType];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span>{name}</span>
        </div>
        <span className="font-mono">+{formatResourceAmount(gain)}</span>
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        <span>Last updated {timeAway} ago</span>
      </div>
    </div>
  );
}

export function MultiResourceNotification({ resources, timeAway }: { 
  resources: { type: 'energy' | 'insight' | 'crew' | 'scrap', gain: number }[],
  timeAway: string 
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold mb-2">While You Were Away</h4>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>You were away for {timeAway}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {resources.map(resource => (
          <div key={resource.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getResourceIcon(resource.type)}
              <span>{resourceNames[resource.type]}</span>
            </div>
            <span className="font-mono">+{formatResourceAmount(resource.gain)}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 