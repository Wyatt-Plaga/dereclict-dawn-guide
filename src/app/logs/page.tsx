"use client";

import { useGame } from "@/game-engine/hooks/useGame";
import GameLoader from "@/app/components/GameLoader";
import { useState, useRef } from "react";
import { LogCategory } from "@/game-engine/types";
import { NavBar } from "@/components/ui/navbar";
import { BookOpen, Radio } from "lucide-react";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import LogTimeline from "./components/LogTimeline";
import LogViewer from "./components/LogViewer";

export default function LogsPage() {
  const { state, dispatch } = useGame();
  const { shouldFlicker } = useSystemStatus();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | "all">("all");

  // Track which logs have been viewed this session (for typewriter on first open)
  const viewedThisSession = useRef(new Set<string>());

  const logs = state?.logs?.discovered || {};
  const logEntries = Object.values(logs);
  const unreadIds = state?.logs?.unread ?? [];

  const filteredLogs =
    selectedCategory === "all"
      ? logEntries
      : logEntries.filter((log) => log.category === selectedCategory);

  const sortedLogs = [...filteredLogs].sort((a, b) => b.timestamp - a.timestamp);

  const currentLog = selectedLog
    ? logs[selectedLog]
    : sortedLogs.length > 0
      ? sortedLogs[0]
      : null;

  const handleLogClick = (logId: string) => {
    setSelectedLog(logId);
    if (logs[logId] && !logs[logId].isRead) {
      dispatch({ type: "MARK_LOG_READ", payload: { logId } });
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch({ type: "MARK_ALL_LOGS_READ" });
  };

  // Determine if this is a first view (triggers typewriter)
  const isFirstView = currentLog ? !viewedThisSession.current.has(currentLog.id) : false;
  if (currentLog && !viewedThisSession.current.has(currentLog.id)) {
    viewedThisSession.current.add(currentLog.id);
  }

  // Category filter chips
  const categories: { key: LogCategory | "all"; label: string }[] = [
    { key: "all", label: "All" },
    ...Array.from(new Set(logEntries.map((l) => l.category))).map((cat) => ({
      key: cat,
      label: cat,
    })),
  ];

  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />

        {logEntries.length === 0 ? (
          <div className="flex items-center justify-center flex-1 p-4 md:ml-64 min-h-[60vh]">
            <div className="system-panel p-8 text-center max-w-md">
              <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-primary font-mono mb-2">NO RECORDS FOUND</p>
              <p className="text-xs text-muted-foreground">
                Ship memory banks are corrupted. Restore power systems to begin
                data recovery.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row p-4 md:p-8 md:ml-64">
            {/* Sidebar */}
            <div className="w-full md:w-72 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
              <div className="system-panel p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    className={`text-lg font-bold text-primary ${
                      shouldFlicker("logs") ? "flickering-text" : ""
                    }`}
                  >
                    Ship Records
                  </h2>
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {logEntries.length} FRAGMENTS RECOVERED
                  </p>
                  {unreadIds.length > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors"
                    >
                      MARK ALL READ ({unreadIds.length})
                    </button>
                  )}
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        selectedCategory === cat.key
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Timeline */}
                <LogTimeline
                  logs={sortedLogs}
                  selectedId={currentLog?.id ?? null}
                  onSelect={handleLogClick}
                  unreadIds={unreadIds}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {currentLog ? (
                <LogViewer
                  key={currentLog.id}
                  log={currentLog}
                  isFirstView={isFirstView}
                />
              ) : (
                <div className="system-panel p-8 text-center">
                  <p className="text-muted-foreground font-mono text-sm">
                    Select a record to begin playback.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </GameLoader>
  );
}
