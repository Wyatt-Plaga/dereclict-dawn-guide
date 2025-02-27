import { NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

// Helper function to calculate offline progress
function calculateOfflineProgress(
  lastOnline: string,
  resources: any,
  page_timestamps: Record<string, string> = {},
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
  
  // Energy calculation using latestSave timestamp or reactor timestamp if available
  if (resources.energy && resources.energy.autoGeneration > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = resources.energy.latestSave;
    const reactorTimestamp = latestSaveTimestamp || page_timestamps.reactor || lastOnline;
    const reactorDate = new Date(reactorTimestamp);
    let energyMinutesPassed = Math.floor((now.getTime() - reactorDate.getTime()) / 60000);
    energyMinutesPassed = Math.min(energyMinutesPassed, maxOfflineMinutes);
    
    if (energyMinutesPassed > 0) {
      const offlineGain = resources.energy.autoGeneration * energyMinutesPassed * 60; // Per minute
      updatedResources.energy.amount = Math.min(
        resources.energy.amount + offlineGain,
        resources.energy.capacity
      );
    }
  }
  
  // Insight calculation using latestSave timestamp or processor timestamp if available
  if (resources.insight && resources.insight.autoGeneration > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = resources.insight.latestSave;
    const processorTimestamp = latestSaveTimestamp || page_timestamps.processor || lastOnline;
    const processorDate = new Date(processorTimestamp);
    let insightMinutesPassed = Math.floor((now.getTime() - processorDate.getTime()) / 60000);
    insightMinutesPassed = Math.min(insightMinutesPassed, maxOfflineMinutes);
    
    if (insightMinutesPassed > 0) {
      const offlineGain = resources.insight.autoGeneration * insightMinutesPassed * 60 * 0.2; // Per minute (0.2 per second)
      updatedResources.insight.amount = Math.min(
        resources.insight.amount + offlineGain,
        resources.insight.capacity
      );
    }
  }
  
  // Crew calculation using latestSave timestamp or crew-quarters timestamp if available
  if (resources.crew && resources.crew.workerCrews > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = resources.crew.latestSave;
    const crewTimestamp = latestSaveTimestamp || page_timestamps["crew-quarters"] || lastOnline;
    const crewDate = new Date(crewTimestamp);
    let crewMinutesPassed = Math.floor((now.getTime() - crewDate.getTime()) / 60000);
    crewMinutesPassed = Math.min(crewMinutesPassed, maxOfflineMinutes);
    
    if (crewMinutesPassed > 0) {
      const offlineGain = resources.crew.workerCrews * crewMinutesPassed * 60 * 0.1; // Per minute (0.1 per second)
      updatedResources.crew.amount = Math.min(
        resources.crew.amount + offlineGain,
        resources.crew.capacity
      );
    }
  }
  
  // Scrap calculation using latestSave timestamp or manufacturing timestamp if available
  if (resources.scrap && resources.scrap.manufacturingBays > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = resources.scrap.latestSave;
    const manufacturingTimestamp = latestSaveTimestamp || page_timestamps.manufacturing || lastOnline;
    const manufacturingDate = new Date(manufacturingTimestamp);
    let scrapMinutesPassed = Math.floor((now.getTime() - manufacturingDate.getTime()) / 60000);
    scrapMinutesPassed = Math.min(scrapMinutesPassed, maxOfflineMinutes);
    
    if (scrapMinutesPassed > 0) {
      const offlineGain = resources.scrap.manufacturingBays * scrapMinutesPassed * 60 * 0.5; // Per minute (0.5 per second)
      updatedResources.scrap.amount = Math.min(
        resources.scrap.amount + offlineGain,
        resources.scrap.capacity
      );
    }
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

// GET - Fetch and calculate offline progress
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = await createClerkSupabaseClientSsr();
    
    // Get the user's game progress
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching game progress:', error);
      console.error('User ID:', userId);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'No game progress found' },
        { status: 404 }
      );
    }
    
    // Calculate offline progress using page timestamps
    const { updatedResources, minutesPassed, gains } = calculateOfflineProgress(
      data.last_online,
      data.resources,
      data.page_timestamps || {}
    );
    
    // Update the resources and last_online timestamp but keep page_timestamps unchanged
    const { error: updateError } = await supabase
      .from('game_progress')
      .update({
        resources: updatedResources,
        last_online: new Date().toISOString()
        // Don't update page_timestamps here
      })
      .eq('user_id', userId);
      
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      offlineTime: minutesPassed,
      gains,
      updatedResources,
      page_timestamps: data.page_timestamps || {}
    });
  } catch (error) {
    console.error('Error calculating offline progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update game progress
export async function POST(request: Request) {
  try {
    // Get the Supabase client
    const supabase = await createClerkSupabaseClientSsr();
    
    // Get the user ID from auth (this is populated by the Clerk middleware)
    const { userId } = await auth();
    
    if (!userId) {
      console.error('User not authenticated');
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Parse the request body
    const data = await request.json();
    console.log('Saving game progress for user:', userId);
    
    // First check if a record exists for this user
    const { data: existingRecord, error: checkError } = await supabase
      .from('game_progress')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing record:', checkError);
      console.error('User ID:', userId);
      return Response.json({ error: `Error checking existing record: ${checkError.message}` }, { status: 500 });
    }
    
    let error;
    
    if (existingRecord) {
      // Update existing record
      console.log('[DEBUG] Updating existing game progress record');
      const { error: updateError } = await supabase
        .from('game_progress')
        .update({
          resources: data.resources,
          upgrades: data.upgrades || {},
          unlocked_logs: data.unlockedLogs || [],
          last_online: new Date().toISOString(),
          page_timestamps: data.page_timestamps || {}
        })
        .eq('user_id', userId);
        
      error = updateError;
    } else {
      // Insert new record
      console.log('[DEBUG] Creating new game progress record');
      const { error: insertError } = await supabase
        .from('game_progress')
        .insert({
          user_id: userId,
          resources: data.resources,
          upgrades: data.upgrades || {},
          unlocked_logs: data.unlockedLogs || [],
          last_online: new Date().toISOString(),
          page_timestamps: data.page_timestamps || {}
        });
        
      error = insertError;
    }
    
    if (error) {
      console.error('Error updating game progress:', error);
      console.error('User ID:', userId);
      console.error('Request data:', JSON.stringify(data));
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error in POST handler:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 