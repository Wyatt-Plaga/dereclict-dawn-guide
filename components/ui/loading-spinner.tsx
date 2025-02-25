"use client"

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  className?: string
  text?: string | null
}

export function LoadingSpinner({ 
  size = 24, 
  className = "", 
  text = "Loading..." 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 
        className={`animate-spin text-primary`} 
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {text && <p className="text-xs text-muted-foreground mt-2">{text}</p>}
    </div>
  )
} 