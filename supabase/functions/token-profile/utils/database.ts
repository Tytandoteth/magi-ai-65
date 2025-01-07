import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { corsHeaders } from './cors.ts';

export async function initSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables for Supabase client');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function getTokenFromDatabase(supabase: any, symbol: string) {
  console.log('Fetching token data from database for:', symbol);
  
  const { data, error } = await supabase
    .from('token_metadata')
    .select('*')
    .eq('symbol', symbol)
    .maybeSingle();

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
}

export async function storeTokenData(supabase: any, tokenDetails: any) {
  console.log('Storing token data:', tokenDetails.symbol);
  
  const { error: insertError } = await supabase
    .from('token_metadata')
    .upsert({
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
    throw new Error(`Failed to store token data: ${insertError.message}`);
  }
}