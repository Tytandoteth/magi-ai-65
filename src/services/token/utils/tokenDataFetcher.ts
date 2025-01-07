import { supabase } from "@/integrations/supabase/client";

export async function fetchTokenData(symbol: string) {
  console.log('Fetching token data for:', symbol);
  
  const { data: tokenData, error } = await supabase
    .from('token_metadata')
    .select('*')
    .ilike('symbol', symbol)
    .order('last_updated', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching token metadata:', error);
    throw error;
  }

  return tokenData?.[0];
}

export async function fetchTokenFromAPI(symbol: string) {
  console.log(`Fetching data from API for token: ${symbol}`);
  const { data: cgResponse, error: cgError } = await supabase.functions.invoke('token-profile', {
    body: { symbol }
  });

  if (cgError) {
    console.error(`Error fetching token profile for ${symbol}:`, cgError);
    throw cgError;
  }

  return cgResponse?.data;
}