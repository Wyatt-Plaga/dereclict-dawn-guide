"use client"

import React, { useState, useEffect } from 'react'
import { Clock, XCircle } from 'lucide-react'

interface OfflineProgressProps {
  resourceType: string
  gainAmount: number
  lastOnlineTimestamp: number  // in milliseconds since epoch
  onClose: () => void
  colorClass?: string
}

export function OfflineProgress({
  resourceType,
  gainAmount,
  lastOnlineTimestamp,
  onClose,
  colorClass = 'text-primary'
}: OfflineProgressProps) {
  const [visible, setVisible] = useState(true)
  const [timeAway, setTimeAway] = useState('')
  
  useEffect(() => {
    // Calculate time away
    const now = Date.now()
    const diffMs = now - lastOnlineTimestamp
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 60) {
      setTimeAway(`${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`)
    } else {
      const diffHours = Math.floor(diffMinutes / 60)
      const remainingMinutes = diffMinutes % 60
      
      if (remainingMinutes === 0) {
        setTimeAway(`${diffHours} hour${diffHours !== 1 ? 's' : ''}`)
      } else {
        setTimeAway(`${diffHours} hour${diffHours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`)
      }
    }
  }, [lastOnlineTimestamp])
  
  const handleClose = () => {
    setVisible(false)
    onClose()
  }
  
  if (!visible) return null
  
  return (
    <div className="system-panel p-4 mb-4 relative">
      <button 
        onClick={handleClose} 
        className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
        aria-label="Close"
      >
        <XCircle className="h-4 w-4" />
      </button>
      
      <div className="flex items-start mb-2">
        <Clock className={`h-5 w-5 ${colorClass} mr-2 mt-0.5`} />
        <div>
          <h3 className="text-sm font-medium">While you were away...</h3>
          <p className="text-xs text-muted-foreground">You've been gone for {timeAway}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs">Generated:</span>
          <span className={`font-mono text-sm ${colorClass}`}>+{Math.floor(gainAmount)} {resourceType}</span>
        </div>
      </div>
    </div>
  )
} 