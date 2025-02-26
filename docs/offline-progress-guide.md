# Offline Progress Calculation Implementation Guide

This guide focuses on Phase 2 of our implementation plan: enhancing offline progress calculation. I notice you already have some offline progress calculation in the `app/api/progress/route.ts` file, so we'll build on that foundation.

## Phase 2: Offline Progress Calculation

### Step 1: Create a Client-Side Offline Calculator

First, let's create a utility function to calculate offline progress on the client side as well, which will help reduce server load and provide immediate feedback:

```typescript
// utils/offline-progress.ts
import { GameProgress, ResourceState } from '@/utils/supabase/context';

/**
 * Calculate offline progress based on time difference
 * @param gameProgress The last saved game progress
 * @param maxOfflineMinutes Maximum minutes to calculate (default: 24 hours)
 * @returns Object containing updated resources and gain information
 */
export function calculateOfflineProgress(
  gameProgress: GameProgress,
  maxOfflineMinutes = 1440 // 24 hours
) {
  const now = new Date();
  const lastOnlineDate = new Date(gameProgress.lastOnline);
  
  // Calculate minutes passed
  let minutesPassed = Math.floor((now.getTime() - lastOnlineDate.getTime()) / 60000);
  
  // Cap the offline progress if needed
  if (minutesPassed > maxOfflineMinutes) {
    minutesPassed = maxOfflineMinutes;
    console.log(`Capping offline progress to ${maxOfflineMinutes} minutes`);
  }
  
  // If less than 1 minute passed, don't calculate offline progress
  if (minutesPassed < 1) {
    return {
      updatedResources: gameProgress.resources,
      minutesPassed: 0,
      gains: {
        energy: 0,
        insight: 0,
        crew: 0,
        scrap: 0
      }
    };
  }
  
  console.log(`Calculating offline progress for ${minutesPassed} minutes`);
  
  // Make a deep copy of resources to avoid mutating the original
  const updatedResources = JSON.parse(JSON.stringify(gameProgress.resources)) as ResourceState;
  
  // Initialize gains tracking
  const gains = {
    energy: 0,
    insight: 0,
    crew: 0,
    scrap: 0
  };
  
  // Energy calculation
  if (updatedResources.energy && updatedResources.energy.autoGeneration > 0) {
    const offlineGain = updatedResources.energy.autoGeneration * minutesPassed * 60; // Per minute
    const newAmount = Math.min(
      updatedResources.energy.amount + offlineGain,
      updatedResources.energy.capacity
    );
    gains.energy = newAmount - updatedResources.energy.amount;
    updatedResources.energy.amount = newAmount;
  }
  
  // Insight calculation
  if (updatedResources.insight && updatedResources.insight.autoGeneration > 0) {
    const offlineGain = updatedResources.insight.autoGeneration * minutesPassed * 60 * 0.2; // Per minute (0.2 per second)
    const newAmount = Math.min(
      updatedResources.insight.amount + offlineGain,
      updatedResources.insight.capacity
    );
    gains.insight = newAmount - updatedResources.insight.amount;
    updatedResources.insight.amount = newAmount;
  }
  
  // Crew calculation
  if (updatedResources.crew && updatedResources.crew.workerCrews > 0) {
    const offlineGain = updatedResources.crew.workerCrews * minutesPassed * 60 * 0.1; // Per minute (0.1 per second)
    const newAmount = Math.min(
      updatedResources.crew.amount + offlineGain,
      updatedResources.crew.capacity
    );
    gains.crew = newAmount - updatedResources.crew.amount;
    updatedResources.crew.amount = newAmount;
  }
  
  // Scrap calculation
  if (updatedResources.scrap && updatedResources.scrap.manufacturingBays > 0) {
    const offlineGain = updatedResources.scrap.manufacturingBays * minutesPassed * 60 * 0.5; // Per minute (0.5 per second)
    const newAmount = Math.min(
      updatedResources.scrap.amount + offlineGain,
      updatedResources.scrap.capacity
    );
    gains.scrap = newAmount - updatedResources.scrap.amount;
    updatedResources.scrap.amount = newAmount;
  }
  
  return {
    updatedResources,
    minutesPassed,
    gains
  };
}
```

### Step 2: Enhance the Game State Context to Handle Offline Progress

Update the game state context to calculate and apply offline progress when loading:

```typescript
// utils/supabase/context.tsx

// Add to the existing imports
import { calculateOfflineProgress } from '@/utils/offline-progress';

export function SupabaseProvider({ children }: { children: ReactNode }) {
  // ... existing code ...
  
  // Add state for offline progress
  const [offlineGains, setOfflineGains] = useState<{
    minutesPassed: number;
    gains: {
      energy: number;
      insight: number;
      crew: number;
      scrap: number;
    };
  } | null>(null);
  
  // Enhance loadGameProgress to calculate offline progress
  const loadGameProgress = async (): Promise<GameProgress | null> => {
    if (!supabase || !session?.user?.id) {
      if (!supabase) setError('Supabase client not initialized');
      if (!session?.user?.id) setError('User not authenticated');
      return null;
    }
    
    try {
      setLoading(true);
      console.log('[DEBUG] Loading game progress for user:', session.user.id);
      
      // Check for local backup first
      let localBackup: GameProgress | null = null;
      const localBackupJson = localStorage.getItem('gameProgressBackup');
      if (localBackupJson) {
        try {
          localBackup = JSON.parse(localBackupJson) as GameProgress;
          console.log('[DEBUG] Found local backup from:', new Date(localBackup.lastOnline));
        } catch (e) {
          console.error('Failed to parse local backup:', e);
        }
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      // ... existing error handling ...
      
      // Map database format to our application format
      let progress: GameProgress;
      
      if (data) {
        progress = {
          resources: data.resources as ResourceState,
          upgrades: data.upgrades as Record<string, boolean>,
          unlockedLogs: data.unlocked_logs as number[],
          lastOnline: data.last_online
        };
        
        // Compare with local backup and use the most recent one
        if (localBackup && new Date(localBackup.lastOnline) > new Date(progress.lastOnline)) {
          console.log('[DEBUG] Local backup is more recent, using that instead');
          progress = localBackup;
        }
      } else if (localBackup) {
        // No data from server but we have a local backup
        progress = localBackup;
      } else {
        // Default new game progress
        progress = { ...defaultGameProgress };
      }
      
      // Calculate offline progress
      const { updatedResources, minutesPassed, gains } = calculateOfflineProgress(progress);
      
      // Only show offline progress if significant time has passed and there are gains
      const hasGains = Object.values(gains).some(value => value > 0);
      if (minutesPassed > 0 && hasGains) {
        setOfflineGains({ minutesPassed, gains });
        progress.resources = updatedResources;
      }
      
      // Update the server with the new values
      if (minutesPassed > 0) {
        try {
          const { error: updateError } = await supabase
            .from('game_progress')
            .update({
              resources: updatedResources,
              last_online: new Date().toISOString()
            })
            .eq('user_id', session.user.id);
            
          if (updateError) {
            console.error('Error updating offline progress on server:', updateError);
          }
        } catch (e) {
          console.error('Failed to update server with offline progress:', e);
        }
      }
      
      setGameProgress(progress);
      return progress;
    } catch (e: any) {
      console.error('Unexpected error loading game progress:', e);
      setError(`Unexpected error: ${e.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to dismiss offline gains notification
  const dismissOfflineGains = useCallback(() => {
    setOfflineGains(null);
  }, []);
  
  // Include offline gains in the context
  return (
    <SupabaseContext.Provider 
      value={{ 
        supabase, 
        gameProgress, 
        loadGameProgress, 
        saveGameProgress,
        triggerSave,
        loading, 
        error,
        offlineGains,
        dismissOfflineGains
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

// Update the context type
interface SupabaseContextType {
  // ... existing properties ...
  offlineGains: {
    minutesPassed: number;
    gains: {
      energy: number;
      insight: number;
      crew: number;
      scrap: number;
    };
  } | null;
  dismissOfflineGains: () => void;
}
```

### Step 3: Enhance the Offline Progress Component

Improve the existing offline progress component to display more detailed information:

```typescript
// components/ui/offline-progress.tsx
"use client"
import { useState, useEffect } from "react"
import { X, Clock, Zap, Brain, Users, Wrench } from "lucide-react"
import { formatDistanceStrict } from "date-fns"

interface OfflineProgressProps {
  minutesPassed: number;
  gains: {
    energy: number;
    insight: number;
    crew: number;
    scrap: number;
  };
  onClose: () => void;
}

export function OfflineProgress({ 
  minutesPassed, 
  gains, 
  onClose 
}: OfflineProgressProps) {
  const [visible, setVisible] = useState(true);
  
  const handleClose = () => {
    setVisible(false);
    // Delay actual close for animation
    setTimeout(onClose, 300);
  };
  
  // Auto-dismiss after 15 seconds if not interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format time in hours and minutes
  const timeAway = minutesPassed >= 60 
    ? `${Math.floor(minutesPassed / 60)}h ${minutesPassed % 60}m`
    : `${minutesPassed}m`;
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in">
      <div className="system-panel max-w-md w-full p-6 m-4 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-primary">While You Were Away</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>You were away for {timeAway}</span>
        </div>
        
        <div className="space-y-3 my-6">
          {gains.energy > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-chart-1 mr-2" />
                <span>Energy</span>
              </div>
              <span className="font-mono">+{Math.floor(gains.energy)}</span>
            </div>
          )}
          
          {gains.insight > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-chart-2 mr-2" />
                <span>Insight</span>
              </div>
              <span className="font-mono">+{Math.floor(gains.insight)}</span>
            </div>
          )}
          
          {gains.crew > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-chart-3 mr-2" />
                <span>Crew</span>
              </div>
              <span className="font-mono">+{Math.floor(gains.crew)}</span>
            </div>
          )}
          
          {gains.scrap > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-chart-4 mr-2" />
                <span>Scrap</span>
              </div>
              <span className="font-mono">+{Math.floor(gains.scrap)}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleClose}
          className="w-full system-panel-button py-2 flex justify-center items-center"
        >
          Collect Resources
        </button>
      </div>
    </div>
  );
}
```

### Step 4: Add CSS Animations

Add these animations to your global CSS file:

```css
/* app/global.css (or your CSS file) */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
```

### Step 5: Integrate the Offline Progress Component into the Layout

```typescript
// app/layout.tsx
import { OfflineProgress } from "@/components/ui/offline-progress"
import { useSupabase } from "@/utils/supabase/context"

// Create a wrapper component for offline progress
function OfflineProgressWrapper() {
  const { offlineGains, dismissOfflineGains } = useSupabase();
  
  if (!offlineGains) return null;
  
  return (
    <OfflineProgress
      minutesPassed={offlineGains.minutesPassed}
      gains={offlineGains.gains}
      onClose={dismissOfflineGains}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SaveStatusProvider>
          <SupabaseProvider>
            {children}
            <SaveStatusWrapper />
            <OfflineProgressWrapper />
          </SupabaseProvider>
        </SaveStatusProvider>
      </body>
    </html>
  );
}
```

### Step 6: Add Server-Side Verification for Offline Calculation

While it's important to calculate progress on the client for immediate feedback, we should also verify on the server to prevent cheating:

```typescript
// app/api/verify-offline-progress/route.ts
import { NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the client-calculated offline progress
    const { 
      resources, 
      clientTimestamp,
      lastOnlineFromClient 
    } = await request.json();
    
    // Get the server's record
    const supabase = await createClerkSupabaseClientSsr();
    const { data, error } = await supabase
      .from('game_progress')
      .select('resources, last_online')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching server data:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Get the server time
    const serverTime = new Date();
    const clientTime = new Date(clientTimestamp);
    
    // Check for time manipulation (if client time is more than 5 minutes
    // ahead of server time, it might be suspicious)
    const timeDiffMinutes = (clientTime.getTime() - serverTime.getTime()) / 60000;
    
    if (timeDiffMinutes > 5) {
      console.warn('Possible time manipulation detected:', {
        userId,
        clientTime: clientTime.toISOString(),
        serverTime: serverTime.toISOString(),
        diffMinutes: timeDiffMinutes
      });
      
      // Return the server's data instead
      return NextResponse.json({
        verified: false,
        message: 'Time discrepancy detected',
        serverResources: data.resources,
        serverLastOnline: data.last_online
      });
    }
    
    // If everything seems valid, approve the client's calculated progress
    await supabase
      .from('game_progress')
      .update({
        resources: resources,
        last_online: serverTime.toISOString()
      })
      .eq('user_id', userId);
      
    return NextResponse.json({
      verified: true,
      serverTime: serverTime.toISOString()
    });
  } catch (error) {
    console.error('Error in verify-offline-progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 7: Add Client-Side Verification Request

Enhance the game state context to verify critical offline progress:

```typescript
// utils/supabase/context.tsx
// Add to the loadGameProgress function

// If significant offline progress occurred, verify with the server
if (minutesPassed > 60 || Object.values(gains).some(v => v > 50)) {
  try {
    const res = await fetch('/api/verify-offline-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resources: updatedResources,
        clientTimestamp: new Date().toISOString(),
        lastOnlineFromClient: progress.lastOnline
      })
    });
    
    const data = await res.json();
    
    if (!data.verified) {
      console.warn('Server rejected offline progress calculation:', data.message);
      // Use server resources instead
      progress.resources = data.serverResources;
      progress.lastOnline = data.serverLastOnline;
    }
  } catch (e) {
    console.error('Failed to verify offline progress with server:', e);
    // Continue with client calculation, but log the error
  }
}
```

## Next Steps

After implementing these enhancements, you'll have a robust offline progress system with:

1. Client-side calculation for immediate feedback
2. Server-side verification to prevent cheating
3. Visual feedback via the offline progress modal
4. Proper handling of time manipulation attempts

This completes Phase 2 of our implementation plan. For Phase 3, you would focus on optimization and edge cases, such as improving performance and handling network errors. 