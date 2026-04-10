"use client";

import { LogEntry, LogCategory } from "@/game-engine/types";
import { Radio, Terminal, FileText, User } from "lucide-react";
import GlitchText from "./GlitchText";

const CATEGORY_CONFIG: Record<LogCategory, { icon: typeof Terminal; color: string; label: string }> = {
  [LogCategory.SHIP_SYSTEMS]: { icon: Terminal, color: "text-chart-1", label: "SYS" },
  [LogCategory.CREW_RECORDS]: { icon: FileText, color: "text-chart-3", label: "CREW" },
  [LogCategory.MISSION_DATA]: { icon: FileText, color: "text-chart-2", label: "DATA" },
  [LogCategory.PERSONAL_LOGS]: { icon: User, color: "text-chart-4", label: "LOG" },
  [LogCategory.UNKNOWN]: { icon: Radio, color: "text-red-500", label: "???" },
};

interface LogTimelineProps {
  logs: LogEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  unreadIds: string[];
}

export default function LogTimeline({ logs, selectedId, onSelect, unreadIds }: LogTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {logs.map((log, i) => {
          const config = CATEGORY_CONFIG[log.category] ?? CATEGORY_CONFIG[LogCategory.UNKNOWN];
          const Icon = config.icon;
          const isSelected = selectedId === log.id;
          const isUnread = unreadIds.includes(log.id);
          const isUnknown = log.category === LogCategory.UNKNOWN;

          return (
            <button
              key={log.id}
              onClick={() => onSelect(log.id)}
              className={`w-full text-left flex items-start gap-3 p-2 rounded-md transition-all duration-200 relative ${
                isSelected
                  ? "bg-accent/20 border border-primary/30"
                  : "hover:bg-accent/10 border border-transparent"
              }`}
            >
              {/* Timeline node */}
              <div className={`relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? `border-primary bg-primary/20`
                  : isUnread
                    ? `border-red-500/60 bg-red-500/10 ${isUnknown ? "animate-pulse" : ""}`
                    : "border-border bg-background"
              }`}>
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                <span className={`text-sm block truncate ${
                  isSelected ? "text-foreground" : "text-muted-foreground"
                } ${isUnknown && isUnread ? "glitch-text" : ""}`}>
                  {isUnknown && isUnread ? (
                    <GlitchText text={log.title} interval={800} maxGlitch={2} glitchDuration={100} />
                  ) : (
                    <GlitchText text={log.title} interval={6000} maxGlitch={1} glitchDuration={80} />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

