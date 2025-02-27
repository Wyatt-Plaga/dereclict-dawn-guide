"use client"

import { useState, useEffect } from "react"
import { X, Clock, Zap, Brain, Users, Wrench } from "lucide-react"

interface OfflineProgressProps {
  minutesPassed: number;
  gains: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
  };
  onClose: () => void;
}

export function OfflineProgress({ 
  minutesPassed, 
  gains, 
  onClose 
}: OfflineProgressProps) {
  const [visible, setVisible] = useState(true);
  
  const handleClose = () => {
    setVisible(false);
    // Delay actual close for animation
    setTimeout(onClose, 300);
  };
  
  // Auto-dismiss after 15 seconds if not interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);
    
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
  
  // Format resource amounts to show decimals when needed
  const formatResourceAmount = (amount: number) => {
    // For small values, show with 1 decimal place
    if (amount > 0 && amount < 1) {
      return amount.toFixed(1);
    }
    // For zero or larger values, round to nearest whole number
    return Math.round(amount).toString();
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in">
      <div className="system-panel max-w-md w-full p-6 m-4 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-primary">While You Were Away</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>You were away for {timeAway}</span>
        </div>
        
        <div className="space-y-3 my-6">
          {gains.energy > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-chart-1 mr-2" />
                <span>Energy</span>
              </div>
              <span className="font-mono">+{formatResourceAmount(gains.energy)}</span>
            </div>
          )}
          
          {gains.insight > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-chart-2 mr-2" />
                <span>Insight</span>
              </div>
              <span className="font-mono">+{formatResourceAmount(gains.insight)}</span>
            </div>
          )}
          
          {gains.crew > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-chart-3 mr-2" />
                <span>Crew</span>
              </div>
              <span className="font-mono">+{formatResourceAmount(gains.crew)}</span>
            </div>
          )}
          
          {gains.scrap > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-chart-4 mr-2" />
                <span>Scrap</span>
              </div>
              <span className="font-mono">+{formatResourceAmount(gains.scrap)}</span>
            </div>
          )}
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