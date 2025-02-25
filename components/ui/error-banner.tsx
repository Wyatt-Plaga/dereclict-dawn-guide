"use client"

import React from 'react'
import { XCircle, AlertCircle } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onClose?: () => void
  variant?: 'error' | 'warning'
}

export function ErrorBanner({ message, onClose, variant = 'error' }: ErrorBannerProps) {
  if (!message) return null
  
  return (
    <div className={`system-panel p-4 mb-4 ${
      variant === 'error' ? 'border-red-400/50' : 'border-yellow-400/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          {variant === 'error' ? (
            <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 shrink-0" />
          )}
          <div>
            <h3 className={`text-sm font-medium ${
              variant === 'error' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {variant === 'error' ? 'Error' : 'Warning'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-primary"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
} 