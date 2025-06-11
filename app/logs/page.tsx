'use client';

import { useGame } from '@/app/game/hooks/useGame';
import GameLoader from '@/app/components/GameLoader';
import { useState } from 'react';
import { LogCategory, LogEntry } from '@/app/game/types';
import Link from 'next/link';
import { NavBar } from "@/components/ui/navbar";
import { BookOpen } from "lucide-react";
import { useSystemStatus } from "@/components/providers/system-status-provider";

export default function LogsPage() {
  const { state, dispatch, isInitializing } = useGame();
  const { shouldFlicker } = useSystemStatus();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  
  // Get all discovered logs
  const logs = state?.logs?.discovered || {};
  const logEntries = Object.values(logs);
  
  // Filter logs by category if a category is selected
  const filteredLogs = selectedCategory === 'all' 
    ? logEntries 
    : logEntries.filter(log => log.category === selectedCategory);
  
  // Sort logs by timestamp (newest first)
  const sortedLogs = filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  
  // Get the selected log
  const currentLog = selectedLog ? logs[selectedLog] : (sortedLogs.length > 0 ? sortedLogs[0] : null);
  
  // Handle clicking on a log
  const handleLogClick = (logId: string) => {
    setSelectedLog(logId);
    
    // Mark as read if it's not already
    if (logs[logId] && !logs[logId].isRead) {
      dispatch({
        type: 'MARK_LOG_READ',
        payload: { logId }
      });
    }
  };
  
  // Handle marking all logs as read
  const handleMarkAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_LOGS_READ' });
  };
  
  // Get all available categories from discovered logs
  const categories = [
    'all' as const,
    ...Array.from(new Set(logEntries.map(log => log.category)))
  ];
  
  // Count unread logs
  const unreadCount = state?.logs?.unread?.length || 0;
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        {logEntries.length === 0 ? (
          <div className="flex items-center justify-center flex-1 p-4 md:ml-64">
            <div className="system-panel p-6">
              <p className="text-primary">No log entries available. Scanning for recoverable data...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row p-4 md:p-8 md:ml-64">
            {/* Log list sidebar */}
            <div className="w-full md:w-64 mb-4 md:mb-0 md:mr-4">
              <div className="system-panel p-4 mb-4">
                <h2 className={`text-lg font-bold text-primary mb-2 ${shouldFlicker('logs') ? 'flickering-text' : ''}`}>Ship Logs</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Recovered memory fragments and system records
                </p>
                
                {/* Mark-all button (disabled when no unread) */}
                <div className="mb-3">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className={`px-3 py-1 text-xs rounded-md flex items-center border transition
                      ${unreadCount === 0
                        ? 'bg-accent/20 text-muted-foreground border-border cursor-not-allowed opacity-50'
                        : 'bg-red-900/40 text-red-200 border-red-700/60 hover:bg-red-800/60'}`}
                  >
                    <span>Mark all as read</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-700/80 rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {sortedLogs.map(log => (
                    <button
                      key={log.id}
                      onClick={() => handleLogClick(log.id)}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        currentLog?.id === log.id 
                          ? 'bg-accent/30 text-primary border border-primary/40' 
                          : 'hover:bg-accent/10 text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="truncate">
                          {log.title}
                          {!log.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Log content */}
            <div className="flex-1">
              {currentLog ? (
                <div className="system-panel p-6">
                  <div className="flex items-start justify-between mb-6">
                    <h1 className={`text-2xl font-bold text-primary ${shouldFlicker('logs') ? 'flickering-text' : ''}`}>
                      {currentLog.title}
                    </h1>
                    <BookOpen className="h-5 w-5 text-primary mt-1" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-4">
                    {currentLog.category} • {new Date(currentLog.timestamp).toLocaleDateString()}
                  </p>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="terminal-text text-sm leading-relaxed">
                      {currentLog.content.split('\n\n').map((paragraph, index) => (
                        <span key={index}>
                          {paragraph}
                          {index < currentLog.content.split('\n\n').length - 1 && (
                            <><br /><br /></>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {Object.keys(logs).length < 7 
                        ? "Additional logs may be recovered as ship systems are repaired." 
                        : "All log entries have been recovered."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="system-panel p-6">
                  <p className="text-primary">Select a log entry to view its contents.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </GameLoader>
  );
} 