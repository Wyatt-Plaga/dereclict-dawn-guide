import { createClerkSupabaseClientSsr } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Helper function to calculate offline progress
function calculateOfflineProgress(
  lastOnline: string,
  resources: any,
  maxOfflineMinutes = 1440 // Cap at 24 hours
) {
  const now = new Date();
  const lastOnlineDate = new Date(lastOnline);
  
  // Calculate minutes passed since last online
  let minutesPassed = Math.floor((now.getTime() - lastOnlineDate.getTime()) / 60000);
  
  // Cap the offline progress if needed
  if (minutesPassed > maxOfflineMinutes) {
    minutesPassed = maxOfflineMinutes;
  }
  
  // Calculate gained resources
  const updatedResources = { ...resources };
  
  // Energy calculation (if auto-generation exists)
  if (resources.energy && resources.energy.autoGeneration > 0) {
    const offlineGain = resources.energy.autoGeneration * minutesPassed * 60; // Per minute
    updatedResources.energy.amount = Math.min(
      resources.energy.amount + offlineGain,
      resources.energy.capacity
    );
  }
  
  // Insight calculation
  if (resources.insight && resources.insight.autoGeneration > 0) {
    const offlineGain = resources.insight.autoGeneration * minutesPassed * 60 * 0.2; // Per minute (0.2 per second)
    updatedResources.insight.amount = Math.min(
      resources.insight.amount + offlineGain,
      resources.insight.capacity
    );
  }
  
  // Crew calculation
  if (resources.crew && resources.crew.workerCrews > 0) {
    const offlineGain = resources.crew.workerCrews * minutesPassed * 60 * 0.1; // Per minute (0.1 per second)
    updatedResources.crew.amount = Math.min(
      resources.crew.amount + offlineGain,
      resources.crew.capacity
    );
  }
  
  // Scrap calculation
  if (resources.scrap && resources.scrap.manufacturingBays > 0) {
    const offlineGain = resources.scrap.manufacturingBays * minutesPassed * 60 * 0.5; // Per minute (0.5 per second)
    updatedResources.scrap.amount = Math.min(
      resources.scrap.amount + offlineGain,
      resources.scrap.capacity
    );
  }
  
  return {
    updatedResources,
    minutesPassed,
    gains: {
      energy: resources.energy?.autoGeneration ? Math.min(resources.energy.autoGeneration * minutesPassed * 60, resources.energy.capacity - resources.energy.amount) : 0,
      insight: resources.insight?.autoGeneration ? Math.min(resources.insight.autoGeneration * minutesPassed * 60 * 0.2, resources.insight.capacity - resources.insight.amount) : 0,
      crew: resources.crew?.workerCrews ? Math.min(resources.crew.workerCrews * minutesPassed * 60 * 0.1, resources.crew.capacity - resources.crew.amount) : 0,
      scrap: resources.scrap?.manufacturingBays ? Math.min(resources.scrap.manufacturingBays * minutesPassed * 60 * 0.5, resources.scrap.capacity - resources.scrap.amount) : 0,
    }
  };
}

/**
 * GET route to fetch game progress
 */
export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameter only
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please provide a userId query parameter." },
        { status: 401 }
      );
    }
    
    // Get Supabase client
    const supabase = await createClerkSupabaseClientSsr();
    
    // Calculate offline progress if time param provided
    const lastOnlineParam = req.nextUrl.searchParams.get('lastOnline');
    let offlineGainResponse = {};
    
    if (lastOnlineParam) {
      try {
        const lastOnlineTimestamp = parseInt(lastOnlineParam);
        const currentTime = Date.now();
        const timeDiffSeconds = Math.floor((currentTime - lastOnlineTimestamp) / 1000);
        
        if (timeDiffSeconds > 60) { // Only calculate if more than a minute has passed
          // Fetch current progression data to calculate rates
          const { data: progressData, error: fetchError } = await supabase
            .from('game_progress')
            .select('resources, upgrades')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (fetchError) {
            console.error("Error fetching data for offline calculation:", fetchError);
          } else if (progressData) {
            const resources = progressData.resources || {};
            const upgrades = progressData.upgrades || {};
            
            // Calculate offline gains for each resource type
            // The calculation rate depends on the auto-generation level
            const offlineGains = {
              energy: (resources.energy_auto_gen || 0) * 0.5 * timeDiffSeconds,
              insight: (resources.insight_auto_gen || 0) * 0.2 * timeDiffSeconds,
              crew: (resources.crew_auto_gen || 0) * 0.1 * timeDiffSeconds,
              scrap: (resources.scrap_auto_gen || 0) * 0.4 * timeDiffSeconds,
            };
            
            offlineGainResponse = {
              offlineGains,
              timeSinceLastOnline: timeDiffSeconds
            };
          }
        }
      } catch (err) {
        console.error("Error calculating offline progress:", err);
      }
    }
    
    // Fetch the user's game progress
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching game progress:', error);
      console.error('User ID:', userId);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      progress: data || { resources: {}, upgrades: {}, unlocked_logs: [] },
      ...offlineGainResponse
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST route to save game progress
 */
export async function POST(req: NextRequest) {
  try {
    // Get user data from request body
    const data = await req.json();
    
    // Validate request data
    if (!data || !data.resources) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    
    // Get userId from request data or header
    const userId = data.userId || req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please provide a user ID." },
        { status: 401 }
      );
    }
    
    console.log('Saving game progress for user:', userId);
    
    // Get Supabase client
    const supabase = await createClerkSupabaseClientSsr();
    
    // Check if a record exists for this user
    const { data: existingRecord, error: checkError } = await supabase
      .from('game_progress')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing record:', checkError);
      console.error('User ID:', userId);
      console.error('Request data:', JSON.stringify(data));
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    let error = null;
    
    // Update or insert based on whether a record exists
    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('game_progress')
        .update({
          resources: data.resources,
          upgrades: data.upgrades || {},
          unlocked_logs: data.unlockedLogs || [],
          last_online: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('game_progress')
        .insert({
          user_id: userId,
          resources: data.resources,
          upgrades: data.upgrades || {},
          unlocked_logs: data.unlockedLogs || [],
          last_online: new Date().toISOString()
        });
      
      error = insertError;
    }
    
    if (error) {
      console.error('Error updating game progress:', error);
      console.error('User ID:', userId);
      console.error('Request data:', JSON.stringify(data));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 