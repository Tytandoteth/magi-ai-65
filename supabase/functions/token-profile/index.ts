import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { fetchCoinGeckoData } from "../chat/utils/token/coingeckoApi.ts";
import { fetchDefiLlamaData } from "../chat/utils/token/defiLlamaApi.ts";
import { fetchSocialMetrics } from "../chat/utils/token/socialMetrics.ts";
import { formatTokenProfile } from "../chat/utils/token/formatters.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    console.log('Creating token profile for symbol:', symbol);
    
    // Clean up symbol (remove $ if present)
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    
    // Fetch data from different sources
    const tokenData = await fetchCoinGeckoData(cleanSymbol);
    console.log('CoinGecko data:', tokenData);

    const defiLlamaData = await fetchDefiLlamaData(cleanSymbol);
    console.log('DeFi Llama data:', defiLlamaData);

    const socialMetrics = await fetchSocialMetrics(cleanSymbol);
    console.log('Social metrics:', socialMetrics);

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: `I couldn't find reliable data for ${cleanSymbol}. Please verify the token symbol and try again.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profile = {
      symbol: cleanSymbol,
      name: tokenData.name,
      price: tokenData.market_data?.current_price?.usd,
      marketCap: tokenData.market_data?.market_cap?.usd,
      volume24h: tokenData.market_data?.total_volume?.usd,
      description: tokenData.description?.en,
      defiMetrics: defiLlamaData ? {
        tvl: defiLlamaData.tvl,
        change24h: defiLlamaData.change_1d,
        category: defiLlamaData.category,
        chains: defiLlamaData.chains,
        apy: defiLlamaData.apy,
        protocol: defiLlamaData.name
      } : undefined,
      socialMetrics
    };

    const formattedProfile = formatTokenProfile(profile);

    return new Response(
      JSON.stringify({ data: formattedProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch token profile' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});