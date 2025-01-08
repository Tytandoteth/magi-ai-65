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
    
    // Always fetch MAG token data regardless of input
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

    // Format MAG data to match token_metadata structure
    const formattedMagData = {
      id: 1,
      created_at: magData.created_at,
      symbol: 'MAG',
      name: 'Magnify',
      coingecko_id: 'magnify',
      description: 'Magnify is a DeFAI (Decentralized Finance Augmented by Intelligence) protocol.',
      categories: ['DeFi', 'AI'],
      platforms: {
        ethereum: '0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105'
      },
      market_data: {
        current_price: { usd: magData.price },
        market_cap: { usd: magData.market_cap },
        total_volume: { usd: magData.volume_24h },
        price_change_24h: 0, // We don't have this data yet
        price_change_percentage_24h: 0 // We don't have this data yet
      },
      metadata: {
        image: 'https://magnify.cash/logo.png',
        last_updated: magData.created_at,
        additional_metrics: {
          market_cap_rank: null,
          holders_count: magData.holders_count,
          transactions_24h: magData.transactions_24h
        }
      }
    };

    // Create a mock DeFi protocol entry for MAG
    const defiData = {
      id: 1,
      created_at: magData.created_at,
      protocol_id: 'magnify',
      name: 'Magnify',
      symbol: 'MAG',
      category: 'DeFAI',
      tvl: magData.market_cap, // Using market cap as TVL for now
      change_1h: 0, // We don't have this data yet
      change_1d: 0, // We don't have this data yet
      change_7d: 0, // We don't have this data yet
      raw_data: {
        name: 'Magnify',
        description: 'DeFAI protocol leveraging artificial intelligence',
        chain: 'Ethereum',
        symbol: 'MAG',
        category: 'DeFAI'
      }
    };

    return new Response(
      JSON.stringify({
        token_metadata: [formattedMagData],
        defi_llama: [defiData],
        query: {
          original: 'MAG',
          normalized: 'MAG',
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