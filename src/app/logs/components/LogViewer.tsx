"use client";

import { useState, useEffect, useRef } from "react";
import { LogEntry, LogCategory } from "@/game-engine/types";
import { Radio, Terminal, FileText, User, Volume2 } from "lucide-react";
import GlitchText from "./GlitchText";

const CATEGORY_CONFIG: Record<LogCategory, { icon: typeof Terminal; color: string; borderColor: string; label: string }> = {
  [LogCategory.SHIP_SYSTEMS]: { icon: Terminal, color: "text-chart-1", borderColor: "border-chart-1/30", label: "SHIP SYSTEMS" },
  [LogCategory.CREW_RECORDS]: { icon: FileText, color: "text-chart-3", borderColor: "border-chart-3/30", label: "CREW RECORDS" },
  [LogCategory.MISSION_DATA]: { icon: FileText, color: "text-chart-2", borderColor: "border-chart-2/30", label: "MISSION DATA" },
  [LogCategory.PERSONAL_LOGS]: { icon: User, color: "text-chart-4", borderColor: "border-chart-4/30", label: "PERSONAL LOG" },
  [LogCategory.UNKNOWN]: { icon: Radio, color: "text-red-500", borderColor: "border-red-500/30", label: "UNKNOWN SIGNAL" },
};

interface LogViewerProps {
  log: LogEntry;
  isFirstView: boolean;
}

export default function LogViewer({ log, isFirstView }: LogViewerProps) {
  const config = CATEGORY_CONFIG[log.category] ?? CATEGORY_CONFIG[LogCategory.UNKNOWN];
  const Icon = config.icon;
  const isUnknown = log.category === LogCategory.UNKNOWN;
  const isPersonal = log.category === LogCategory.PERSONAL_LOGS;

  // Typewriter state
  const [displayedChars, setDisplayedChars] = useState(isFirstView ? 0 : log.content.length);
  const [decrypting, setDecrypting] = useState(isFirstView);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset on log change
    if (isFirstView) {
      setDecrypting(true);
      setDisplayedChars(0);

      // Brief "decrypting" phase then start typing
      const decryptTimer = setTimeout(() => {
        setDecrypting(false);
        let charIndex = 0;
        intervalRef.current = setInterval(() => {
          charIndex += 2; // 2 chars per tick for speed
          if (charIndex >= log.content.length) {
            charIndex = log.content.length;
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
          setDisplayedChars(charIndex);
        }, 12);
      }, 800);

      return () => {
        clearTimeout(decryptTimer);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      setDecrypting(false);
      setDisplayedChars(log.content.length);
    }
  }, [log.id, isFirstView, log.content.length]);

  // Skip animation on click
  const skipAnimation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDecrypting(false);
    setDisplayedChars(log.content.length);
  };

  const visibleContent = log.content.slice(0, displayedChars);
  const isTyping = displayedChars < log.content.length && !decrypting;
  const paragraphs = visibleContent.split("\n\n");

  return (
    <div
      className={`system-panel p-6 border-2 ${config.borderColor} cursor-text`}
      onClick={skipAnimation}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded border ${config.borderColor} bg-background`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div>
          <div className={`text-[10px] font-mono uppercase tracking-[0.2em] ${config.color}`}>
            {config.label}
          </div>
          <h1 className={`text-xl font-bold ${isUnknown ? "text-red-400" : "text-foreground"}`}>
            <GlitchText
              text={log.title}
              interval={5000}
              maxGlitch={1}
              glitchDuration={100}
            />
          </h1>
        </div>
      </div>

      {/* Metadata bar */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border text-[10px] font-mono text-muted-foreground">
        <span>REC {new Date(log.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
        <span>SEC:{log.category === LogCategory.UNKNOWN ? "NONE" : "ALPHA"}</span>
        <span>FRAG:{Math.floor(Math.random() * 900 + 100)}</span>
        {isPersonal && (
          <span className="flex items-center gap-1 text-chart-4">
            <Volume2 className="h-3 w-3" /> AUDIO
          </span>
        )}
      </div>

      {/* Decrypt animation */}
      {decrypting && (
        <div className="space-y-3 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-ping" />
            {isUnknown ? "ATTEMPTING SIGNAL DECODE..." : "RECOVERING DATA FRAGMENTS..."}
          </div>
          <div className="font-mono text-xs text-muted-foreground/50 leading-relaxed overflow-hidden">
            {generateDecryptNoise(3)}
          </div>
        </div>
      )}

      {/* Audio waveform for personal logs */}
      {isPersonal && !decrypting && (
        <div className="flex items-end gap-[2px] h-8 mb-4 opacity-60">
          {Array.from({ length: 60 }).map((_, i) => {
            const height = Math.sin(i * 0.4 + displayedChars * 0.01) * 0.5 + 0.5;
            const active = (i / 60) < (displayedChars / log.content.length);
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-all duration-100 ${
                  active ? "bg-chart-4" : "bg-muted"
                }`}
                style={{ height: `${Math.max(8, height * 100)}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Content */}
      {!decrypting && (
        <div className={`leading-relaxed ${isUnknown ? "font-mono text-red-400/90 text-sm" : "terminal-text text-sm"}`}>
          {paragraphs.map((para, i) => (
            <p key={i} className={`${i > 0 ? "mt-4" : ""} ${isUnknown ? "tracking-wider" : ""}`}>
              {!isTyping ? (
                <GlitchText
                  text={para}
                  interval={4000}
                  maxGlitch={1}
                  glitchDuration={120}
                />
              ) : (
                para
              )}
            </p>
          ))}
          {isTyping && <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />}
        </div>
      )}

      {/* Footer */}
      {!decrypting && displayedChars >= log.content.length && (
        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground">
            END OF RECORD
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {log.content.length} BYTES RECOVERED
          </span>
        </div>
      )}
    </div>
  );
}

function generateDecryptNoise(lines: number): string {
  const chars = "0123456789ABCDEF░▒▓█╔╗╚╝║═─┼┤├┬┴";
  return Array.from({ length: lines })
    .map(() =>
      Array.from({ length: 48 })
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join("")
    )
    .join("\n");
}
