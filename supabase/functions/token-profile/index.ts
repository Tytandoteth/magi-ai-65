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
    const { symbol } = await req.json();
    console.log('Creating token profile for symbol:', symbol);
    
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    console.log('Cleaned symbol:', cleanSymbol);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch from CoinGecko
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY');
    if (!cgApiKey) {
      throw new Error('COINGECKO_API_KEY is not set');
    }

    // First try to search for the token
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${cleanSymbol}`,
      {
        headers: {
          'x-cg-demo-api-key': cgApiKey
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`CoinGecko API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);

    if (!searchData.coins?.length) {
      return new Response(
        JSON.stringify({
          error: `No data found for token ${cleanSymbol}`,
          data: `I couldn't find information about ${cleanSymbol}. This token might be new, unlisted, or not tracked by major platforms.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the most relevant result
    const relevantCoins = searchData.coins.filter((coin: any) => 
      coin.symbol.toLowerCase() === cleanSymbol.toLowerCase()
    );
    const topResult = relevantCoins[0] || searchData.coins[0];

    // Fetch detailed data
    const detailResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${topResult.id}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`,
      {
        headers: {
          'x-cg-demo-api-key': cgApiKey
        }
      }
    );

    if (!detailResponse.ok) {
      throw new Error(`CoinGecko detail API error: ${detailResponse.status}`);
    }

    const tokenData = await detailResponse.json();
    console.log('Token details:', tokenData);

    // Store in database
    const { error: insertError } = await supabase
      .from('token_metadata')
      .insert({
        symbol: tokenData.symbol.toUpperCase(),
        name: tokenData.name,
        coingecko_id: tokenData.id,
        description: tokenData.description?.en,
        categories: tokenData.categories,
        platforms: tokenData.platforms,
        market_data: {
          current_price: tokenData.market_data?.current_price,
          market_cap: tokenData.market_data?.market_cap,
          total_volume: tokenData.market_data?.total_volume,
          price_change_24h: tokenData.market_data?.price_change_24h,
          price_change_percentage_24h: tokenData.market_data?.price_change_percentage_24h
        },
        last_updated: new Date().toISOString(),
        metadata: {
          image: tokenData.image,
          links: tokenData.links,
          last_updated: tokenData.last_updated,
          additional_metrics: {
            market_cap_rank: tokenData.market_cap_rank,
            coingecko_rank: tokenData.coingecko_rank,
            coingecko_score: tokenData.coingecko_score
          }
        }
      });

    if (insertError) {
      console.error('Error storing token data:', insertError);
    }

    // Format response
    const formattedResponse = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol.toUpperCase()}):\n\n` +
      `Current Price: $${tokenData.market_data?.current_price?.usd?.toLocaleString() || 'N/A'}\n` +
      `Market Cap: $${tokenData.market_data?.market_cap?.usd?.toLocaleString() || 'N/A'}\n` +
      `24h Trading Volume: $${tokenData.market_data?.total_volume?.usd?.toLocaleString() || 'N/A'}\n` +
      `24h Price Change: ${tokenData.market_data?.price_change_percentage_24h?.toFixed(2) || 'N/A'}%\n` +
      (tokenData.market_cap_rank ? `Market Cap Rank: #${tokenData.market_cap_rank}\n` : '') +
      (tokenData.description?.en ? `\nDescription: ${tokenData.description.en}\n` : '') +
      `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;

    return new Response(
      JSON.stringify({ data: formattedResponse }),
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