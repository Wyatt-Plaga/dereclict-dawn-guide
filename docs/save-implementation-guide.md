# Game Progress Saving Implementation Guide

This guide provides detailed implementation instructions for Phase 1 of the game progress saving functionality. It includes code examples and explanations for each step.

## Phase 1: Local State Management and Basic Saving

### Step 1: Create/Enhance Game State Context

I see you already have a `SupabaseProvider` in `utils/supabase/context.tsx` that handles some game state. Let's enhance it with proper debouncing and local storage backup.

First, add the necessary dependencies:

```bash
npm install lodash.debounce
# or
yarn add lodash.debounce
```

Then update the context provider to include debounced saving:

```typescript
// utils/supabase/context.tsx
import debounce from 'lodash.debounce';
import { useBeforeUnload } from 'react-use'; // Consider adding this package

// Add to the SupabaseProvider
export function SupabaseProvider({ children }: { children: ReactNode }) {
  // ... existing code ...
  
  // Create a debounced save function
  const debouncedSaveProgress = useMemo(() => 
    debounce(async (progress: GameProgress) => {
      try {
        // First save to localStorage as backup
        localStorage.setItem('gameProgressBackup', JSON.stringify({
          ...progress,
          lastSaved: new Date().toISOString()
        }));
        
        // Then save to Supabase if user is authenticated
        if (supabase && session?.user?.id) {
          await saveGameProgress(progress);
        }
      } catch (error) {
        console.error('Error in debounced save:', error);
        // We don't set the error state here to avoid UI disruptions
        // during automatic saves
      }
    }, 2000), // 2 second debounce
    [supabase, session, saveGameProgress]
  );

  // Set up interval save
  useEffect(() => {
    if (!gameProgress) return;
    
    const intervalId = setInterval(() => {
      // Save current game state every 30 seconds
      if (gameProgress) {
        debouncedSaveProgress({
          ...gameProgress,
          lastOnline: new Date().toISOString()
        });
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [gameProgress, debouncedSaveProgress]);
  
  // Save on page unload
  useBeforeUnload(() => {
    if (gameProgress) {
      // Cancel debounce and save immediately
      debouncedSaveProgress.cancel();
      
      // Save to localStorage synchronously (this will work during unload)
      localStorage.setItem('gameProgressBackup', JSON.stringify({
        ...gameProgress,
        lastOnline: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      }));
      
      // Try to save to server, but this might not complete
      // Use navigator.sendBeacon for more reliable unload saves if needed
    }
  }, [gameProgress, debouncedSaveProgress]);
  
  // Expose debounced save in context
  const triggerSave = useCallback((progress: GameProgress) => {
    debouncedSaveProgress(progress);
  }, [debouncedSaveProgress]);
  
  // Try to load from localStorage on initial mount
  useEffect(() => {
    const localBackup = localStorage.getItem('gameProgressBackup');
    if (localBackup && !gameProgress) {
      try {
        const parsedBackup = JSON.parse(localBackup) as GameProgress;
        setGameProgress(parsedBackup);
      } catch (error) {
        console.error('Error parsing local backup:', error);
      }
    }
  }, []);
  
  // ... existing code ...
  
  return (
    <SupabaseContext.Provider 
      value={{ 
        supabase, 
        gameProgress, 
        loadGameProgress, 
        saveGameProgress,
        triggerSave, // Add the debounced save function
        loading, 
        error 
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

// Update the context type to include the new function
interface SupabaseContextType {
  // ... existing properties ...
  triggerSave: (progress: GameProgress) => void;
}
```

### Step 2: Implement Resource Update Functions

Create helper functions to update resources and automatically trigger saves:

```typescript
// utils/game-helpers.ts
import { GameProgress, ResourceState } from '@/utils/supabase/context';

// Update a single resource and trigger save
export function updateResource(
  gameProgress: GameProgress,
  resourceType: keyof ResourceState,
  property: string,
  value: number,
  triggerSave: (progress: GameProgress) => void
) {
  if (!gameProgress.resources[resourceType]) return gameProgress;
  
  const updatedProgress = {
    ...gameProgress,
    resources: {
      ...gameProgress.resources,
      [resourceType]: {
        ...gameProgress.resources[resourceType],
        [property]: value
      }
    }
  };
  
  // Trigger save with debounce
  triggerSave(updatedProgress);
  
  return updatedProgress;
}

// Batch update multiple resources at once
export function batchUpdateResources(
  gameProgress: GameProgress,
  updates: Array<{
    resourceType: keyof ResourceState,
    property: string,
    value: number
  }>,
  triggerSave: (progress: GameProgress) => void
) {
  let updatedProgress = { ...gameProgress };
  
  // Apply all updates to the copy
  updates.forEach(update => {
    if (!updatedProgress.resources[update.resourceType]) return;
    
    updatedProgress = {
      ...updatedProgress,
      resources: {
        ...updatedProgress.resources,
        [update.resourceType]: {
          ...updatedProgress.resources[update.resourceType],
          [update.property]: update.value
        }
      }
    };
  });
  
  // Trigger save once with all updates
  triggerSave(updatedProgress);
  
  return updatedProgress;
}
```

### Step 3: Modify UI Components to Use the New Functions

Update your reactor page to use the new saving mechanism:

```typescript
// app/reactor/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useSupabase } from "@/utils/supabase/context"
import { updateResource } from "@/utils/game-helpers"

export default function ReactorPage() {
  const { gameProgress, triggerSave } = useSupabase();
  
  // Use the update function to modify energy
  const generateEnergy = () => {
    if (!gameProgress) return;
    
    const currentEnergy = gameProgress.resources.energy?.amount || 0;
    const energyCapacity = gameProgress.resources.energy?.capacity || 100;
    
    // Calculate new energy value
    const newValue = Math.min(currentEnergy + 1, energyCapacity);
    
    // Update and save automatically
    updateResource(
      gameProgress,
      'energy',
      'amount',
      newValue,
      triggerSave
    );
  }
  
  // Similar updates for other resource changes
  // ...
}
```

### Step 4: Implement Save Status Indicators

Add a simple save status indicator component:

```typescript
// components/ui/save-indicator.tsx
"use client"
import { useState, useEffect } from "react"
import { Save, Check, AlertTriangle } from "lucide-react"

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  errorMessage?: string;
}

export function SaveIndicator({ status, errorMessage }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(true);
  
  // Auto-hide the "saved" indicator after 3 seconds
  useEffect(() => {
    if (status === 'saved') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [status]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 system-panel p-2 flex items-center gap-2">
      {status === 'idle' && <Save className="h-4 w-4 text-muted-foreground" />}
      {status === 'saving' && (
        <>
          <Save className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-xs">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-xs">{errorMessage || 'Save error'}</span>
        </>
      )}
    </div>
  );
}
```

Then integrate it into your layout:

```typescript
// app/layout.tsx
import { SaveIndicator } from "@/components/ui/save-indicator"
import { SaveStatusProvider, useSaveStatus } from "@/components/providers/save-status-provider"

// Create a wrapper component to use the context
function SaveStatusWrapper() {
  const { status, errorMessage } = useSaveStatus();
  return <SaveIndicator status={status} errorMessage={errorMessage} />;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SaveStatusProvider>
          {children}
          <SaveStatusWrapper />
        </SaveStatusProvider>
      </body>
    </html>
  );
}
```

### Step 5: Create a Save Status Provider

```typescript
// components/providers/save-status-provider.tsx
"use client"
import { createContext, useContext, useState, ReactNode } from "react"

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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

export function useSaveStatus() {
  return useContext(SaveStatusContext);
}
```

### Step 6: Update the Supabase Context to Use Save Status

```typescript
// utils/supabase/context.tsx
import { useSaveStatus } from "@/components/providers/save-status-provider"

export function SupabaseProvider({ children }: { children: ReactNode }) {
  // ... existing code ...
  
  const { setSaving, setSaved, setError } = useSaveStatus();
  
  // Update the debounced save function to use status indicators
  const debouncedSaveProgress = useMemo(() => 
    debounce(async (progress: GameProgress) => {
      try {
        setSaving(); // Set status to saving
        
        // First save to localStorage as backup
        localStorage.setItem('gameProgressBackup', JSON.stringify({
          ...progress,
          lastSaved: new Date().toISOString()
        }));
        
        // Then save to Supabase if user is authenticated
        if (supabase && session?.user?.id) {
          await saveGameProgress(progress);
        }
        
        setSaved(); // Set status to saved
      } catch (error) {
        console.error('Error in debounced save:', error);
        setError(error instanceof Error ? error.message : 'Unknown error saving game');
      }
    }, 2000), // 2 second debounce
    [supabase, session, saveGameProgress, setSaving, setSaved, setError]
  );
  
  // ... rest of the code ...
}
```

## Next Steps

After implementing Phase 1, you'll have a functional auto-saving system with local backup and visual indicators. This forms the foundation for the rest of the implementation plan.

For Phase 2, you'll focus on enhancing the offline progress calculation based on the work you've already done in `app/api/progress/route.ts`.

The implementation of these components will provide you with a robust foundation for game state management and saving, with fallbacks and user feedback built in from the start. 