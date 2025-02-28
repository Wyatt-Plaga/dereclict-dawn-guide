import React, { useState } from 'react';
import { useGameLogs } from '../../hooks/useGameLogs';
import { Log } from '../../../domain/logs/models/Log';
import { LogCategory, LogLevel, LogVisibility } from '../../../domain/logs/models/Log';

interface LogEntryProps {
  log: Log;
}

/**
 * Individual log entry component
 */
const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const { properties } = log;
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine log level style
  const getLevelStyle = () => {
    switch (properties.level) {
      case LogLevel.DEBUG: return 'log-debug';
      case LogLevel.INFO: return 'log-info';
      case LogLevel.WARNING: return 'log-warning';
      case LogLevel.ERROR: return 'log-error';
      case LogLevel.CRITICAL: return 'log-critical';
      default: return '';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <div className={`log-entry ${getLevelStyle()}`}>
      <div className="log-header" onClick={() => setShowDetails(prev => !prev)}>
        <span className="log-timestamp">{formatTimestamp(properties.timestamp)}</span>
        <span className="log-category">[{properties.category}]</span>
        <span className="log-message">{properties.message}</span>
        <span className="log-expand">{showDetails ? '▼' : '▶'}</span>
      </div>
      
      {showDetails && properties.data && (
        <div className="log-details">
          <pre>{JSON.stringify(properties.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * Log filter controls component
 */
interface LogFilterControlsProps {
  onFilterChange: (filter: any) => void;
  currentFilter: any;
}

const LogFilterControls: React.FC<LogFilterControlsProps> = ({ onFilterChange, currentFilter }) => {
  const { LogLevel, LogCategory, LogVisibility } = useGameLogs();
  
  // Handle level change
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ level: parseInt(e.target.value) });
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ category: value === 'all' ? undefined : value });
  };
  
  return (
    <div className="log-filter-controls">
      <div className="filter-group">
        <label>Level:</label>
        <select value={currentFilter.level} onChange={handleLevelChange}>
          <option value={LogLevel.DEBUG}>Debug</option>
          <option value={LogLevel.INFO}>Info</option>
          <option value={LogLevel.WARNING}>Warning</option>
          <option value={LogLevel.ERROR}>Error</option>
          <option value={LogLevel.CRITICAL}>Critical</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Category:</label>
        <select 
          value={currentFilter.category || 'all'} 
          onChange={handleCategoryChange}
        >
          <option value="all">All</option>
          <option value={LogCategory.SYSTEM}>System</option>
          <option value={LogCategory.GAME}>Game</option>
          <option value={LogCategory.RESOURCE}>Resources</option>
          <option value={LogCategory.UPGRADE}>Upgrades</option>
          <option value={LogCategory.COMMAND}>Commands</option>
          <option value={LogCategory.DEBUG}>Debug</option>
        </select>
      </div>
      
      <button onClick={() => onFilterChange({ limit: currentFilter.limit + 20 })}>
        Load More
      </button>
      
      <button onClick={() => onFilterChange({ limit: 100 })}>
        Reset Limit
      </button>
    </div>
  );
};

/**
 * Main log display component
 */
export const LogDisplay: React.FC = () => {
  const { logs, filter, updateFilter, clearLogs } = useGameLogs();
  
  return (
    <div className="log-display">
      <div className="log-header-bar">
        <h2>Game Logs</h2>
        <button onClick={clearLogs} className="clear-logs-button">
          Clear Logs
        </button>
      </div>
      
      <LogFilterControls
        onFilterChange={updateFilter}
        currentFilter={filter}
      />
      
      <div className="log-list">
        {logs.length === 0 ? (
          <p className="no-logs">No logs to display.</p>
        ) : (
          logs.map(log => <LogEntry key={log.getId()} log={log} />)
        )}
      </div>
    </div>
  );
}; 