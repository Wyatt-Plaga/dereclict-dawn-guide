"use client";

import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BattleLogEntry } from "@/game-engine/types";

interface BattleLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: BattleLogEntry[];
}

export default function BattleLogDialog({
  open,
  onOpenChange,
  entries,
}: BattleLogDialogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [entries]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-[90vw] sm:w-[500px] overflow-y-auto">
        <h2 className="text-lg font-semibold terminal-text mb-2">
          Battle Log
        </h2>
        <div
          ref={logRef}
          className="font-mono text-xs leading-tight space-y-1"
        >
          {entries.map((entry, idx) => (
            <p key={entry.id ?? idx}>{entry.text}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
