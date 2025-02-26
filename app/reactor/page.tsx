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
import { updateResource } from "@/utils/game-helpers"

export default function ReactorPage() {
  const [energy, setEnergy] = useState(0)
  const [energyCapacity, setEnergyCapacity] = useState(100)
  const [autoGeneration, setAutoGeneration] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Supabase and Clerk integration test
  const { 
    supabase, 
    gameProgress, 
    loadGameProgress, 
    saveGameProgress, 
    triggerSave, 
    loading, 
    error, 
    updatePageTimestamp, 
    offlineGains,
    dismissOfflineGains 
  } = useSupabase()
  const { user, isSignedIn } = useUser()
  const [testError, setTestError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Track if we've already updated the page timestamp
  const [timestampUpdated, setTimestampUpdated] = useState(false);
  
  // Update the page timestamp only once when the component mounts and gameProgress is available
  useEffect(() => {
    if (gameProgress && !timestampUpdated) {
      // Record that the player visited the reactor page
      updatePageTimestamp('reactor');
      setTimestampUpdated(true);
    }
  }, [gameProgress, timestampUpdated, updatePageTimestamp]);
  
  // Synchronize local state with gameProgress from context
  useEffect(() => {
    if (gameProgress?.resources?.energy) {
      console.log("Initializing component state from gameProgress:", gameProgress.resources.energy);
      setEnergy(gameProgress.resources.energy.amount || 0);
      setEnergyCapacity(gameProgress.resources.energy.capacity || 100);
      setAutoGeneration(gameProgress.resources.energy.autoGeneration || 0);
    }
  }, [gameProgress]); // This will run whenever gameProgress changes
  
  // Test saving game progress
  const testSaveProgress = async () => {
    try {
      setIsSaving(true)
      setTestError(null)
      
      // Create test game progress
      const testProgress = {
        resources: {
          energy: { amount: energy, capacity: energyCapacity, autoGeneration },
          insight: { amount: 10, capacity: 50, autoGeneration: 0 },
          crew: { amount: 2, capacity: 5, workerCrews: 0 },
          scrap: { amount: 25, capacity: 100, manufacturingBays: 0 }
        },
        upgrades: { reactorUpgrade1: true },
        unlockedLogs: [1, 2, 3],
        lastOnline: new Date().toISOString(),
        page_timestamps: {
          ...gameProgress?.page_timestamps,
          reactor: new Date().toISOString()
        }
      };
      
      await saveGameProgress(testProgress);
      console.log("Game progress saved successfully");
    } catch (err: any) {
      console.error("Error saving game progress:", err);
      setTestError(`Error saving: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Test loading game progress
  const testLoadProgress = async () => {
    try {
      setIsLoading(true);
      setTestError(null);
      
      const progress = await loadGameProgress();
      console.log("Game progress loaded:", progress);
      
      if (progress?.resources?.energy) {
        setEnergy(progress.resources.energy.amount || 0);
        setEnergyCapacity(progress.resources.energy.capacity || 100);
        setAutoGeneration(progress.resources.energy.autoGeneration || 0);
      }
      
    } catch (err: any) {
      console.error("Error loading game progress:", err);
      setTestError(`Error loading: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-generate energy based on autoGeneration rate (per second)
  useEffect(() => {
    // Don't set up interval if no auto generation or no game progress
    if (autoGeneration <= 0 || !gameProgress) return;
    
    console.log(`Setting up energy auto-generation interval with rate: ${autoGeneration}/sec`);
    
    const interval = setInterval(() => {
      // Get current values from gameProgress to stay in sync
      const currentAmount = gameProgress.resources.energy?.amount || 0;
      const currentCapacity = gameProgress.resources.energy?.capacity || 100;
      
      // Calculate new energy value respecting capacity
      const newValue = Math.min(currentAmount + autoGeneration, currentCapacity);
      
      // Only update if there's actually a change
      if (newValue > currentAmount) {
        console.log(`Auto-generating energy: ${currentAmount} -> ${newValue}`);
        
        // Use updateResource to handle state update and trigger save
        updateResource(
          gameProgress,
          'energy',
          'amount',
          newValue,
          triggerSave
        );
        
        // Update local state for UI
        setEnergy(newValue);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoGeneration, gameProgress, triggerSave, setEnergy]);
  
  // Save last online timestamp when unloading the page
  useEffect(() => {
    // Update last online time when the component unmounts
    return () => {
      // No need for custom handling here anymore, since we use updatePageTimestamp
      console.log("Component unmounting, page timestamp already tracked");
    }
  }, [])
  
  // Generate energy on manual click
  const generateEnergy = () => {
    if (!gameProgress) return;
    
    // Get current values from gameProgress
    const currentAmount = gameProgress.resources.energy?.amount || 0;
    const currentCapacity = gameProgress.resources.energy?.capacity || 100;
    
    // Calculate new energy value with +1 increment, respecting capacity
    const newValue = Math.min(currentAmount + 1, currentCapacity);
    
    console.log(`Generating energy: ${currentAmount} -> ${newValue}`);
    
    // Update and save automatically using helper function
    updateResource(
      gameProgress,
      'energy',
      'amount',
      newValue,
      triggerSave
    );
    
    // Update local state for UI
    setEnergy(newValue);
  }
  
  // Upgrade energy capacity
  const upgradeCapacity = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.energy?.amount || 0;
    const currentCapacity = gameProgress.resources.energy?.capacity || 100;
    const upgradeCost = currentCapacity * 0.8;
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newCapacity = currentCapacity * 1.5;
      
      // Update energy amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'energy',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update capacity and trigger save
      const updatedProgress2 = updateResource(
        updatedProgress1,
        'energy',
        'capacity',
        newCapacity,
        triggerSave
      );
      
      // Update local state for UI
      setEnergy(newAmount);
      setEnergyCapacity(newCapacity);
    }
  };
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.energy?.amount || 0;
    const currentAutoGen = gameProgress.resources.energy?.autoGeneration || 0;
    const upgradeCost = (currentAutoGen + 1) * 20;
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newAutoGen = currentAutoGen + 1;
      
      // Update energy amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'energy',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update auto generation and trigger save
      const updatedProgress2 = updateResource(
        updatedProgress1,
        'energy',
        'autoGeneration',
        newAutoGen,
        triggerSave
      );
      
      // Update local state for UI
      setEnergy(newAmount);
      setAutoGeneration(newAutoGen);
    }
  };
  
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
  "page_timestamps" jsonb NOT NULL DEFAULT '{}'::jsonb,
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
                  onClick={testSaveProgress}
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
                      <span>Test Save</span>
                    </div>
                  )}
                </button>
                
                <button 
                  onClick={testLoadProgress}
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
                      <span>Test Load</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Offline progress notification */}
            {offlineGains && offlineGains.gains.energy > 0 && (
              <OfflineProgress
                minutesPassed={offlineGains.minutesPassed}
                gains={offlineGains.gains}
                onClose={() => dismissOfflineGains()}
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
                  <span className="font-mono">{Math.floor(energy)} / {Math.floor(energyCapacity)}</span>
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