import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { initSupabaseClient, getTokenFromDatabase, storeTokenData } from "./utils/database.ts";
import { fetchFromCoinGecko } from "./utils/coingecko.ts";
import { formatTokenResponse } from "./utils/formatter.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    console.log('Creating token profile for symbol:', symbol);
    
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    console.log('Cleaned symbol:', cleanSymbol);

    const supabase = await initSupabaseClient();
    console.log('Supabase client initialized');

    // First check our database
    const tokenData = await getTokenFromDatabase(supabase, cleanSymbol);

    // If we have recent data (less than 5 minutes old), use it
    if (tokenData && tokenData.last_updated) {
      const lastUpdated = new Date(tokenData.last_updated);
      const now = new Date();
      if ((now.getTime() - lastUpdated.getTime()) < 300000) {
        console.log('Using cached token data for:', cleanSymbol);
        return new Response(
          JSON.stringify({
            data: formatTokenResponse(tokenData)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If not in database or data is stale, fetch from CoinGecko
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY');
    if (!cgApiKey) {
      throw new Error('COINGECKO_API_KEY is not set');
    }

    const tokenDetails = await fetchFromCoinGecko(cleanSymbol, cgApiKey);

    if (!tokenDetails) {
      return new Response(
        JSON.stringify({
          error: `No data found for token ${cleanSymbol}`,
          data: `I couldn't find information about ${cleanSymbol}. This token might be new, unlisted, or not tracked by major platforms.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in database
    await storeTokenData(supabase, tokenDetails);

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