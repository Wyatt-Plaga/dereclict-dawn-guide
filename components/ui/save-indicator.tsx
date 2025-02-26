"use client"

import { useState, useEffect } from "react"
import { Save, Check, AlertTriangle } from "lucide-react"

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  errorMessage?: string;
}

export function SaveIndicator({ status, errorMessage }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Set last saved timestamp when status changes to 'saved'
  useEffect(() => {
    if (status === 'saved') {
      setLastSaved(new Date());
      
      // Auto-hide the "saved" indicator after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [status]);
  
  // Always show if not in idle state or if explicitly made visible
  const shouldShow = status !== 'idle' || visible;
  
  if (!shouldShow) return null;
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  return (
    <div className="fixed bottom-4 right-4 system-panel p-2 flex items-center gap-2 z-50 shadow-lg">
      {status === 'idle' && (
        <>
          <Save className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs">
            {lastSaved ? `Last saved: ${formatTime(lastSaved)}` : 'Not saved yet'}
          </span>
        </>
      )}
      {status === 'saving' && (
        <>
          <Save className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-xs">Saved at {formatTime(new Date())}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-xs">{errorMessage || 'Save error'}</span>
        </>
      )}
    </div>
  );
} 