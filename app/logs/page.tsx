'use client';

import { useGame } from '@/app/game/hooks/useGame';
import GameLoader from '@/app/components/GameLoader';
import { useState } from 'react';
import { LogCategory, LogEntry } from '@/app/game/types';
import Link from 'next/link';

export default function LogsPage() {
  const { state, dispatch, isInitializing } = useGame();
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
  const currentLog = selectedLog ? logs[selectedLog] : null;
  
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
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-500">Ship Logs</h1>
          <div className="flex gap-2">
            <Link href="/" className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition">
              Back to Dashboard
            </Link>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
        
        {logEntries.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-400">No logs discovered yet. Explore the ship and restore systems to uncover the ship's story.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gray-800 rounded-lg p-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-blue-400 mb-2">Filter by Category</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedCategory === category 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {category === 'all' ? 'All Logs' : category}
                    </button>
                  ))}
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-blue-400 mb-2">Log Entries ({sortedLogs.length})</h2>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {sortedLogs.map(log => (
                  <div
                    key={log.id}
                    onClick={() => handleLogClick(log.id)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedLog === log.id 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">
                        {log.title}
                        {!log.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {log.category} • {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              {currentLog ? (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="mb-4 pb-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-blue-400">{currentLog.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {currentLog.category} • {new Date(currentLog.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {currentLog.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center">
                    {logEntries.length > 0 
                      ? 'Select a log entry to view its contents' 
                      : 'No logs discovered yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GameLoader>
  );
} 