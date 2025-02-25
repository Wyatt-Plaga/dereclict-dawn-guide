"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Battery, Zap, ArrowUpCircle, Save, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSearchParams } from "next/navigation"
import { OfflineProgress } from "@/components/ui/offline-progress"
import { AuthCheck } from "@/components/auth/auth-check"
import { ErrorBoundary } from "@/components/providers/error-boundary"
import { useSupabase } from "@/utils/supabase/context"
import { useUser } from "@clerk/nextjs"
import { ErrorBanner } from "@/components/ui/error-banner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ReactorPage() {
  const [energy, setEnergy] = useState(0)
  const [energyCapacity, setEnergyCapacity] = useState(100)
  const [autoGeneration, setAutoGeneration] = useState(0)
  const [showOfflineProgress, setShowOfflineProgress] = useState(false)
  const [offlineGain, setOfflineGain] = useState(0)
  const [lastOnline, setLastOnline] = useState(Date.now())
  const { shouldFlicker } = useSystemStatus()
  
  // Supabase and Clerk integration
  const { supabase, gameProgress, loadGameProgress, saveGameProgress, loading, error } = useSupabase()
  const { user, isSignedIn } = useUser()
  const [testError, setTestError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Load game data from API on component mount
  useEffect(() => {
    if (isSignedIn) {
      loadGameData();
    }
  }, [isSignedIn]);
  
  // Auto-save when state changes (debounced)
  useEffect(() => {
    if (!isSignedIn) return;
    
    const timer = setTimeout(() => {
      saveCurrentGameState();
    }, 3000); // Save 3 seconds after the last change
    
    return () => clearTimeout(timer);
  }, [energy, energyCapacity, autoGeneration, isSignedIn]);
  
  // Load game data from the API
  const loadGameData = async () => {
    try {
      setIsLoading(true);
      setTestError(null);
      
      // First try to load offline progress from the API
      const response = await fetch('/api/progress');
      
      if (response.ok) {
        const data = await response.json();
        if (data.offlineTime > 0 && data.gains && data.gains.energy > 0) {
          // We have offline gains to show
          setOfflineGain(data.gains.energy);
          setLastOnline(Date.now() - (data.offlineTime * 60 * 1000)); // Convert minutes to ms
          setShowOfflineProgress(true);
        }
        
        // Update state with the latest values
        if (data.updatedResources?.energy) {
          setEnergy(data.updatedResources.energy.amount || 0);
          setEnergyCapacity(data.updatedResources.energy.capacity || 100);
          setAutoGeneration(data.updatedResources.energy.autoGeneration || 0);
        }
      } else {
        // Fallback to loading from the context/database directly
        const progress = await loadGameProgress();
        
        if (progress?.resources?.energy) {
          setEnergy(progress.resources.energy.amount || 0);
          setEnergyCapacity(progress.resources.energy.capacity || 100);
          setAutoGeneration(progress.resources.energy.autoGeneration || 0);
        }
      }
    } catch (err: any) {
      console.error("Error loading game data:", err);
      setTestError(`Error loading: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save current game state to the API
  const saveCurrentGameState = async () => {
    if (!isSignedIn) return;
    
    try {
      setIsSaving(true);
      
      const gameData = {
        resources: {
          energy: { 
            amount: energy, 
            capacity: energyCapacity, 
            autoGeneration 
          },
          // Include other resources with empty/default values so we don't overwrite them
          insight: gameProgress?.resources?.insight || { amount: 0, capacity: 50, autoGeneration: 0 },
          crew: gameProgress?.resources?.crew || { amount: 0, capacity: 5, workerCrews: 0 },
          scrap: gameProgress?.resources?.scrap || { amount: 0, capacity: 100, manufacturingBays: 0 }
        },
        upgrades: gameProgress?.upgrades || {},
        unlockedLogs: gameProgress?.unlockedLogs || [1, 2, 3],
        lastOnline: new Date().toISOString()
      };
      
      // First try the API endpoint
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      
      if (!response.ok) {
        // Fallback to the context method
        await saveGameProgress(gameData);
      }
      
      setTestError(null);
    } catch (err: any) {
      console.error("Error saving game state:", err);
      setTestError(`Error saving: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Auto-generate energy based on autoGeneration rate (per second)
  useEffect(() => {
    if (autoGeneration <= 0) return
    
    const interval = setInterval(() => {
      setEnergy(current => {
        const newValue = current + autoGeneration
        return newValue > energyCapacity ? energyCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoGeneration, energyCapacity])
  
  // Generate energy on manual click
  const generateEnergy = () => {
    setEnergy(current => {
      const newValue = current + 1
      return newValue > energyCapacity ? energyCapacity : newValue
    })
  }
  
  // Upgrade energy capacity
  const upgradeCapacity = () => {
    if (energy >= energyCapacity * 0.8) {
      setEnergy(current => current - energyCapacity * 0.8)
      setEnergyCapacity(current => current * 1.5)
    }
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    const upgradeCost = (autoGeneration + 1) * 20
    
    if (energy >= upgradeCost) {
      setEnergy(current => current - upgradeCost)
      setAutoGeneration(current => current + 1)
    }
  }
  
  // Handle closing the offline progress notification
  const handleCloseOfflineProgress = () => {
    setShowOfflineProgress(false)
    // Add the offline gain to the current energy
    setEnergy(current => {
      const newValue = current + offlineGain
      return newValue > energyCapacity ? energyCapacity : newValue
    })
  }
  
  return (
    <AuthCheck>
      <ErrorBoundary>
        <main className="flex min-h-screen flex-col">
          <NavBar />
          
          <div className="flex flex-col p-4 md:p-8 md:ml-64">
            {error && error.includes("does not exist") && (
              <div className="system-panel p-4 mb-4 border-red-500 border-2">
                <h2 className="text-lg font-semibold text-red-500 mb-2">Database Setup Required</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  The game progress table doesn't exist in your Supabase database yet. Please follow these steps:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-2 text-sm">
                  <li>Log in to the <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabase Dashboard</a></li>
                  <li>Select your project (vpdsczspmrbkppalatjt)</li>
                  <li>Navigate to the SQL Editor in the left sidebar</li>
                  <li>Create a new query</li>
                  <li>Copy and paste the SQL below</li>
                  <li>Run the query to create the necessary tables</li>
                </ol>
                <div className="bg-muted p-3 rounded-md overflow-x-auto text-xs mb-4">
                  <pre>{`-- Create a table to store player game progress
CREATE TABLE IF NOT EXISTS "public"."game_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "last_online" timestamp with time zone NOT NULL DEFAULT now(),
  "resources" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "upgrades" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "unlocked_logs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "game_progress_user_id_key" UNIQUE ("user_id")
);

-- Create RLS policies
ALTER TABLE "public"."game_progress" ENABLE ROW LEVEL SECURITY;

-- Since we're using Clerk auth, use a service role approach
CREATE POLICY "Allow all access with service role" 
  ON "public"."game_progress" 
  USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to update the updated_at timestamp automatically
CREATE TRIGGER update_game_progress_updated_at
  BEFORE UPDATE ON "public"."game_progress"
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column();`}</pre>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  After running the SQL, refresh this page to test the integration again.
                </p>
              </div>
            )}

            {error && error.includes("No JWT template exists with name: supabase") && (
              <div className="system-panel p-4 mb-4 border-yellow-500 border-2">
                <h2 className="text-lg font-semibold text-yellow-500 mb-2">Clerk-Supabase Integration Setup Required</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  You need to configure a JWT template in your Clerk dashboard to properly integrate with Supabase:
                </p>
                <ol className="list-decimal pl-5 mb-4 space-y-2 text-sm">
                  <li>Log in to the <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Clerk Dashboard</a></li>
                  <li>Navigate to "JWT Templates" in the sidebar</li>
                  <li>Click "Add new template"</li>
                  <li>Name it exactly "supabase" (lowercase)</li>
                  <li>Set the signing algorithm to "HS256"</li>
                  <li>For the signing key, use your Supabase service_role_key</li>
                  <li>Add the following claims:
                    <pre className="bg-muted p-2 mt-1 rounded-md overflow-x-auto text-xs">
                      {`{
  "sub": "{{user.id}}",
  "role": "authenticated", 
  "aud": "authenticated"
}`}
                    </pre>
                  </li>
                  <li>Save the template and refresh this page</li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  The app will work without this setup, but using the proper JWT template is recommended for production.
                </p>
              </div>
            )}

            {/* Authentication test panel */}
            <div className="system-panel p-4 mb-4">
              <h2 className="text-lg font-semibold text-primary mb-2">Authentication Status</h2>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Authentication status: {isSignedIn ? "Signed In" : "Not Signed In"}</p>
                {isSignedIn && user && (
                  <p>User: {user.firstName || user.username || user.id}</p>
                )}
                <p>Supabase connection: {supabase ? "Connected" : "Not Connected"}</p>
                <p>Game progress loaded: {gameProgress ? "Yes" : "No"}</p>
              </div>
              
              {error && (
                <ErrorBanner message={error} variant="error" />
              )}
              
              {testError && (
                <ErrorBanner 
                  message={testError} 
                  variant="error" 
                  onClose={() => setTestError(null)} 
                />
              )}
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={saveCurrentGameState}
                  disabled={isSaving || !isSignedIn}
                  className={`system-panel py-2 px-4 ${isSaving || !isSignedIn ? 'opacity-50' : 'hover:bg-accent/10'}`}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <LoadingSpinner size={16} text="" className="mr-2" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      <span>Save Progress</span>
                    </div>
                  )}
                </button>
                
                <button 
                  onClick={loadGameData}
                  disabled={isLoading || !isSignedIn}
                  className={`system-panel py-2 px-4 ${isLoading || !isSignedIn ? 'opacity-50' : 'hover:bg-accent/10'}`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size={16} text="" className="mr-2" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <span>Load Progress</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Offline progress notification */}
            {showOfflineProgress && autoGeneration > 0 && (
              <OfflineProgress
                resourceType="Energy"
                gainAmount={offlineGain}
                lastOnlineTimestamp={lastOnline}
                onClose={handleCloseOfflineProgress}
                colorClass="text-chart-1"
              />
            )}
            
            <div className="system-panel p-6 mb-6">
              <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`}>Reactor Core</h1>
              <p className="text-muted-foreground mb-6">
                The ship's primary energy generation system. Repair and enhance to power all ship functions.
              </p>
              
              {/* Resource display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Battery className="h-5 w-5 text-chart-1 mr-2" />
                    <span className="terminal-text">Energy</span>
                  </div>
                  <span className="font-mono">{Math.floor(energy)} / {energyCapacity}</span>
                </div>
                <Progress value={(energy / energyCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
                <div className="text-xs text-muted-foreground mt-1">
                  {autoGeneration > 0 && <span>+{autoGeneration} per second</span>}
                </div>
              </div>
              
              {/* Manual button */}
              <button 
                onClick={generateEnergy} 
                className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Zap className={`h-12 w-12 text-chart-1 mb-2 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
                  <span className="terminal-text">Generate Energy</span>
                  <span className="text-xs text-muted-foreground mt-1">+1 Energy per click</span>
                </div>
              </button>
              
              {/* Upgrades section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
                
                {/* Capacity upgrade */}
                <div className={`system-panel p-4 ${energy >= energyCapacity * 0.8 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                     onClick={upgradeCapacity}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 text-chart-1 mr-2" />
                      <span>Reactor Expansion</span>
                    </div>
                    <span className="font-mono text-xs">{Math.floor(energyCapacity * 0.8)} Energy</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expand energy storage capacity to {Math.floor(energyCapacity * 1.5)}
                  </p>
                </div>
                
                {/* Auto generation upgrade */}
                <div className={`system-panel p-4 ${energy >= (autoGeneration + 1) * 20 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                     onClick={upgradeAutoGeneration}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-chart-1 mr-2" />
                      <span>Energy Converter</span>
                    </div>
                    <span className="font-mono text-xs">{(autoGeneration + 1) * 20} Energy</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add +1 automatic energy generation per second
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ErrorBoundary>
    </AuthCheck>
  )
} 