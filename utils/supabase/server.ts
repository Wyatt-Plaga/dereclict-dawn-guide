import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function createClerkSupabaseClientSsr() {
    // The auth function gives us the user ID
    const { userId } = await auth();

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Log partial values for debugging (be careful not to log full sensitive values)
    console.log(`[DEBUG] Supabase URL exists: ${!!supabaseUrl}`);
    console.log(`[DEBUG] Service key exists: ${!!supabaseServiceKey}`);
    console.log(`[DEBUG] User ID from Clerk: ${userId}`);

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Supabase credentials missing in environment variables');
        throw new Error('Supabase credentials missing');
    }

    // Create a Supabase client with the service role key
    // This bypasses RLS and gives full access to the database
    // We will manually filter data based on the userId from Clerk
    const supabase = createClient(
        supabaseUrl,
        supabaseServiceKey
    );

    return supabase;
}