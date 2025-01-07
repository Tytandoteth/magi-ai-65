import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchCoinGeckoData } from "../chat/utils/token/coingeckoApi.ts";
import { fetchDefiLlamaData } from "../chat/utils/token/defiLlamaApi.ts";
import { formatTokenProfile } from "../chat/utils/token/formatters.ts";

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
    console.log('Creating token profile for symbol:', symbol);
    
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    console.log('Cleaned symbol:', cleanSymbol);
    
    // Fetch data from different sources
    const [tokenData, defiLlamaData] = await Promise.all([
      fetchCoinGeckoData(cleanSymbol).catch(error => {
        console.error('Error fetching CoinGecko data:', error);
        return null;
      }),
      fetchDefiLlamaData(cleanSymbol).catch(error => {
        console.error('Error fetching DeFi Llama data:', error);
        return null;
      })
    ]);

    console.log('Token data:', tokenData);
    console.log('DeFi Llama data:', defiLlamaData);

    if (!tokenData && !defiLlamaData) {
      return new Response(
        JSON.stringify({
          error: `No data found for token ${cleanSymbol}`,
          data: `I couldn't find reliable information about ${cleanSymbol}. This token might be new, unlisted, or not tracked by major platforms. Please verify the token symbol and conduct thorough research before considering any investment.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profile = {
      symbol: cleanSymbol,
      name: tokenData?.name || defiLlamaData?.name || cleanSymbol,
      description: tokenData?.description?.en,
      market_data: tokenData?.market_data,
      metadata: {
        image: tokenData?.image,
        links: tokenData?.links,
        last_updated: tokenData?.last_updated,
        additional_metrics: {
          market_cap_rank: tokenData?.market_cap_rank,
          coingecko_rank: tokenData?.coingecko_rank,
          coingecko_score: tokenData?.coingecko_score
        }
      },
      defiMetrics: defiLlamaData ? {
        tvl: defiLlamaData.tvl,
        change24h: defiLlamaData.change_1d,
        category: defiLlamaData.category,
        chains: defiLlamaData.chains,
        protocol: defiLlamaData.name
      } : undefined
    };

    const formattedProfile = formatTokenProfile(profile);

    return new Response(
      JSON.stringify({ data: formattedProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in token-profile function:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch token profile',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});