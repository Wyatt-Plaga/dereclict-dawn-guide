"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface DevModeContextValue {
  devMode: boolean;
  toggleDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextValue | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevMode] = useState(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("devMode");
      if (stored === "true") setDevMode(true);
    } catch {}
  }, []);

  const toggleDevMode = () => {
    setDevMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("devMode", next.toString());
      } catch {}
      return next;
    });
  };

  return (
    <DevModeContext.Provider value={{ devMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used inside DevModeProvider");
  return ctx;
} 