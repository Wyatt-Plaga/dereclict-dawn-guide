"use client"

import { useState, useEffect } from "react"
import { useGameLogs } from "@/hooks/useGameLogs"
import { FileText, Lock, ChevronDown, ChevronRight } from "lucide-react"

// Define the log interface
interface Log {
  id: number
  title: string
  content: string
  category: string
  timestamp?: string // ISO timestamp or null
}

// Props for the log display component
interface LogDisplayProps {
  logs: Log[]
  title?: string
  description?: string
  showCategories?: boolean
}

export function LogDisplayWithStore({
  logs,
  title = "Station Logs",
  description,
  showCategories = true
}: LogDisplayProps) {
  // Get logs data and functions from the custom hook
  const { isLogUnlocked, getUnlockedLogs } = useGameLogs()
  
  // Local state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({})
  
  // Group logs by category
  const groupedLogs = logs.reduce((groups, log) => {
    if (!groups[log.category]) {
      groups[log.category] = []
    }
    
    groups[log.category].push(log)
    return groups
  }, {} as Record<string, Log[]>)
  
  // Sort categories by number of unlocked logs (most to least)
  const sortedCategories = Object.keys(groupedLogs).sort((catA, catB) => {
    const unlockedInA = groupedLogs[catA].filter(log => isLogUnlocked(log.id)).length
    const unlockedInB = groupedLogs[catB].filter(log => isLogUnlocked(log.id)).length
    
    // First by unlocked count, then alphabetically
    return unlockedInB - unlockedInA || catA.localeCompare(catB)
  })
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }
  
  // Toggle log expansion
  const toggleLog = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }))
  }
  
  // Format timestamp for display
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ""
    
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch (e) {
      return timestamp // Fallback to raw timestamp if parsing fails
    }
  }
  
  return (
    <div className="system-panel p-6 mb-6">
      <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      
      <div className="space-y-4">
        {showCategories ? (
          // Grouped by categories
          sortedCategories.map(category => {
            const logsInCategory = groupedLogs[category]
            const unlockedLogsCount = logsInCategory.filter(log => isLogUnlocked(log.id)).length
            const isExpanded = !!expandedCategories[category]
            
            // Skip categories with no unlocked logs
            if (unlockedLogsCount === 0) return null
            
            return (
              <div key={category} className="system-panel p-4">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between text-left mb-2"
                >
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <h3 className="font-semibold">{category}</h3>
                    <span className="text-xs ml-2 bg-primary/20 px-2 py-0.5 rounded-full">
                      {unlockedLogsCount} / {logsInCategory.length}
                    </span>
                  </div>
                </button>
                
                {/* Logs in this category */}
                {isExpanded && (
                  <div className="space-y-3 pl-6">
                    {logsInCategory.map(log => {
                      const isUnlocked = isLogUnlocked(log.id)
                      const isLogExpanded = !!expandedLogs[`log-${log.id}`]
                      
                      // Skip locked logs
                      if (!isUnlocked) return null
                      
                      return (
                        <div 
                          key={log.id} 
                          className="border-l-2 border-primary/30 pl-3 py-1"
                        >
                          {/* Log title */}
                          <button
                            onClick={() => toggleLog(`log-${log.id}`)}
                            className="flex items-center w-full text-left"
                          >
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">{log.title}</span>
                            {isLogExpanded ? (
                              <ChevronDown className="h-3 w-3 ml-2" />
                            ) : (
                              <ChevronRight className="h-3 w-3 ml-2" />
                            )}
                          </button>
                          
                          {/* Log content when expanded */}
                          {isLogExpanded && (
                            <div className="mt-2 ml-6 text-sm text-muted-foreground">
                              {log.timestamp && (
                                <div className="text-xs opacity-70 mb-1">
                                  {formatTimestamp(log.timestamp)}
                                </div>
                              )}
                              <div className="whitespace-pre-line">{log.content}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          // Simple list view of all logs
          <div className="space-y-4">
            {logs
              .filter(log => isLogUnlocked(log.id))
              .sort((a, b) => a.id - b.id)
              .map(log => {
                const isLogExpanded = !!expandedLogs[`log-${log.id}`]
                
                return (
                  <div key={log.id} className="system-panel p-4">
                    <button
                      onClick={() => toggleLog(`log-${log.id}`)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{log.title}</span>
                      </div>
                      {isLogExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isLogExpanded && (
                      <div className="mt-3 text-sm text-muted-foreground pl-6 border-l-2 border-primary/30">
                        {log.timestamp && (
                          <div className="text-xs opacity-70 mb-1">
                            {formatTimestamp(log.timestamp)}
                          </div>
                        )}
                        <div className="whitespace-pre-line">{log.content}</div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
        
        {/* No logs unlocked message */}
        {getUnlockedLogs().length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
            <Lock className="h-12 w-12 mb-3 opacity-30" />
            <p>No logs have been unlocked yet.</p>
            <p className="text-sm mt-1">
              Continue exploring the station to discover logs.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 