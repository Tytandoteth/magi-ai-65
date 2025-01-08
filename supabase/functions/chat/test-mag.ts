import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Testing MAG token data fetch...');

    // Test database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('mag_token_analytics')
      .select('created_at')
      .limit(1);

    if (connectionError) {
      throw new Error(`Database connection error: ${connectionError.message}`);
    }

    console.log('Database connection successful');

    // Fetch latest MAG data
    const { data: magData, error: magError } = await supabase
      .from('mag_token_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (magError) {
      throw new Error(`MAG data fetch error: ${magError.message}`);
    }

    // Prepare diagnostic information
    const diagnostics = {
      timestamp: new Date().toISOString(),
      connectionTest: {
        success: true,
        latestRecord: connectionTest?.[0]?.created_at
      },
      magData: magData ? {
        ...magData,
        dataCompleteness: Object.entries(magData).reduce((acc, [key, value]) => {
          acc[key] = value !== null && value !== undefined;
          return acc;
        }, {} as Record<string, boolean>)
      } : null,
      environment: {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasSupabaseKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    };

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Test endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});