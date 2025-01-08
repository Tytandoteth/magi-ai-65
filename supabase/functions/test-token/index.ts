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
    const { symbol } = await req.json();
    console.log('Testing token resolution for:', symbol);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Step 1: Check if it's MAG token
    if (symbol.toUpperCase() === 'MAG') {
      console.log('Fetching MAG token data');
      const { data: magData, error: magError } = await supabase
        .from('mag_token_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (magError) {
        throw new Error(`MAG data fetch error: ${magError.message}`);
      }

      return new Response(
        JSON.stringify({
          source: 'mag_token_analytics',
          data: magData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Check token_metadata table
    console.log('Checking token_metadata table');
    const { data: tokenData, error: tokenError } = await supabase
      .from('token_metadata')
      .select('*')
      .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
      .order('last_updated', { ascending: false })
      .limit(1);

    if (tokenError) {
      throw new Error(`Token metadata fetch error: ${tokenError.message}`);
    }

    // Step 3: Check DeFi Llama data
    console.log('Checking DeFi Llama data');
    const { data: defiData, error: defiError } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (defiError) {
      throw new Error(`DeFi Llama fetch error: ${defiError.message}`);
    }

    // Step 4: If we don't have data, try CoinGecko
    if (!tokenData?.length) {
      console.log('No cached data found, would fetch from CoinGecko here');
      // Note: In production, this would make a CoinGecko API call
    }

    return new Response(
      JSON.stringify({
        token_metadata: tokenData,
        defi_llama: defiData,
        query: {
          original: symbol,
          normalized: symbol.toUpperCase(),
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-token function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});