"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorBanner } from '@/components/ui/error-banner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }
  
  public resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="p-4">
          <ErrorBanner 
            message={`An unexpected error occurred: ${this.state.error?.message || 'Unknown error'}`} 
            onClose={this.resetError}
          />
          <div className="system-panel p-6 mt-4">
            <h2 className="text-lg font-semibold terminal-text mb-4">System Error</h2>
            <p className="text-sm text-muted-foreground mb-6">
              A system error has occurred. Please try refreshing the page or contact support if the issue persists.
            </p>
            <button 
              onClick={this.resetError}
              className="system-panel py-2 px-4 hover:bg-accent/10 transition-colors"
            >
              <span className="terminal-text text-sm">Restart System</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 