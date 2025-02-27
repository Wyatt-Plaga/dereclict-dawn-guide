"use client"

import { useState, useEffect } from "react"
import { X, Clock, Zap, Brain, Users, Wrench } from "lucide-react"

interface ResourceOfflineProgressProps {
  resourceType: 'energy' | 'insight' | 'crew' | 'scrap';
  minutesPassed: number;
  gain: number;
  onClose: () => void;
}

const ResourceIcons = {
  energy: <Zap className="h-5 w-5 text-chart-1 mr-2" />,
  insight: <Brain className="h-5 w-5 text-chart-2 mr-2" />,
  crew: <Users className="h-5 w-5 text-chart-3 mr-2" />,
  scrap: <Wrench className="h-5 w-5 text-chart-4 mr-2" />
};

const ResourceNames = {
  energy: "Energy",
  insight: "Insight",
  crew: "Crew",
  scrap: "Scrap"
};

export function ResourceOfflineProgress({ 
  resourceType,
  minutesPassed, 
  gain, 
  onClose 
}: ResourceOfflineProgressProps) {
  const [visible, setVisible] = useState(true);
  
  const handleClose = () => {
    setVisible(false);
    // Delay actual close for animation
    setTimeout(onClose, 300);
  };
  
  // Auto-dismiss after 10 seconds if not interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  const timeAway = formatTimeAway(minutesPassed);
  
  if (!visible || gain <= 0 || minutesPassed <= 0) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in">
      <div className="system-panel max-w-md w-full p-6 m-4 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-primary">Resource Gained</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>Last updated {timeAway} ago</span>
        </div>
        
        <div className="space-y-3 my-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {ResourceIcons[resourceType]}
              <span>{ResourceNames[resourceType]}</span>
            </div>
            <span className="font-mono">+{Math.floor(gain)}</span>
          </div>
        </div>
        
        <button 
          onClick={handleClose}
          className="w-full system-panel-button py-2 flex justify-center items-center"
        >
          Collect Resources
        </button>
      </div>
    </div>
  );
} 