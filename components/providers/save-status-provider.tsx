"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { SaveStatus } from "@/components/ui/save-indicator"

interface SaveStatusContextType {
  status: SaveStatus;
  errorMessage: string | undefined;
  setSaving: () => void;
  setSaved: () => void;
  setError: (message: string) => void;
  setIdle: () => void;
}

const SaveStatusContext = createContext<SaveStatusContextType>({
  status: 'idle',
  errorMessage: undefined,
  setSaving: () => {},
  setSaved: () => {},
  setError: () => {},
  setIdle: () => {},
});

// Export the hook before the provider component
export const useSaveStatus = () => useContext(SaveStatusContext);

export function SaveStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  
  const setSaving = () => {
    setStatus('saving');
    setErrorMessage(undefined);
  };
  
  const setSaved = () => {
    setStatus('saved');
    setErrorMessage(undefined);
  };
  
  const setError = (message: string) => {
    setStatus('error');
    setErrorMessage(message);
  };
  
  const setIdle = () => {
    setStatus('idle');
    setErrorMessage(undefined);
  };
  
  return (
    <SaveStatusContext.Provider
      value={{
        status,
        errorMessage,
        setSaving,
        setSaved,
        setError,
        setIdle,
      }}
    >
      {children}
    </SaveStatusContext.Provider>
  );
} 