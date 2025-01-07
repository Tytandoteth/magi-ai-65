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
    
    // First check our database
    const { data: tokenData, error: dbError } = await supabase
      .from('token_metadata')
      .select('*')
      .eq('symbol', cleanSymbol)
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Database error');
    }

    if (tokenData) {
      console.log('Found token data in database:', tokenData);
      return new Response(
        JSON.stringify({
          data: formatTokenResponse(tokenData)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not in database, fetch from CoinGecko
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY');
    if (!cgApiKey) {
      throw new Error('COINGECKO_API_KEY is not set');
    }

    // Search for the token
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

    const tokenDetails = await detailResponse.json();
    console.log('Token details:', tokenDetails);

    // Store in database
    const { error: insertError } = await supabase
      .from('token_metadata')
      .insert({
        symbol: tokenDetails.symbol.toUpperCase(),
        name: tokenDetails.name,
        coingecko_id: tokenDetails.id,
        description: tokenDetails.description?.en,
        categories: tokenDetails.categories,
        platforms: tokenDetails.platforms,
        market_data: {
          current_price: tokenDetails.market_data?.current_price,
          market_cap: tokenDetails.market_data?.market_cap,
          total_volume: tokenDetails.market_data?.total_volume,
          price_change_24h: tokenDetails.market_data?.price_change_24h,
          price_change_percentage_24h: tokenDetails.market_data?.price_change_percentage_24h
        },
        last_updated: new Date().toISOString(),
        metadata: {
          image: tokenDetails.image,
          links: tokenDetails.links,
          last_updated: tokenDetails.last_updated,
          additional_metrics: {
            market_cap_rank: tokenDetails.market_cap_rank,
            coingecko_rank: tokenDetails.coingecko_rank,
            coingecko_score: tokenDetails.coingecko_score
          }
        }
      });

    if (insertError) {
      console.error('Error storing token data:', insertError);
    }

    const response = formatTokenResponse(tokenDetails);

    return new Response(
      JSON.stringify({ data: response }),
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

function formatTokenResponse(tokenData: any): string {
  let response = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol.toUpperCase()}):\n\n`;

  if (tokenData.market_data) {
    const marketData = tokenData.market_data;
    
    if (marketData.current_price?.usd) {
      response += `Current Price: $${marketData.current_price.usd.toLocaleString()}\n`;
    }
    
    if (marketData.market_cap?.usd) {
      response += `Market Cap: $${marketData.market_cap.usd.toLocaleString()}\n`;
    }
    
    if (marketData.total_volume?.usd) {
      response += `24h Trading Volume: $${marketData.total_volume.usd.toLocaleString()}\n`;
    }

    if (marketData.price_change_percentage_24h) {
      response += `24h Price Change: ${marketData.price_change_percentage_24h.toFixed(2)}%\n`;
    }
  }

  if (tokenData.metadata?.additional_metrics?.market_cap_rank) {
    response += `Market Cap Rank: #${tokenData.metadata.additional_metrics.market_cap_rank}\n`;
  }

  if (tokenData.description) {
    response += `\nDescription: ${tokenData.description}\n`;
  }

  response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;

  return response;
}