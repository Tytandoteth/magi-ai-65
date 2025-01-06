import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching DeFi data from DefiLlama...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch TVL data
    const tvlResponse = await fetch('https://api.llama.fi/v2/chains');
    const tvlData = await tvlResponse.json();
    console.log('Fetched TVL data:', tvlData);

    // Fetch protocol data
    const protocolsResponse = await fetch('https://api.llama.fi/protocols');
    const protocolsData = await protocolsResponse.json();
    console.log('Fetched protocols data:', protocolsData);

    // Fetch stablecoins data
    const stablecoinsResponse = await fetch('https://stablecoins.llama.fi/stablecoins');
    const stablecoinsData = await stablecoinsResponse.json();
    console.log('Fetched stablecoins data:', stablecoinsData);

    // Store the data in Supabase
    const { data: insertedData, error } = await supabase
      .from('defi_market_data')
      .insert({
        coin_id: 'defi_llama_overview',
        symbol: 'DEFI',
        name: 'DeFi Overview',
        raw_data: {
          tvl: tvlData,
          protocols: protocolsData,
          stablecoins: stablecoinsData,
        }
      });

    if (error) {
      console.error('Error storing DeFi data:', error);
      throw error;
    }

    console.log('Successfully stored DeFi data');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tvl: tvlData,
          protocols: protocolsData,
          stablecoins: stablecoinsData
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in fetch-defi-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});