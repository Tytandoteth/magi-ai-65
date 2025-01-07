import { supabase } from "@/integrations/supabase/client";

export async function createTokenProfile(symbol: string): Promise<string> {
  try {
    console.log('Creating token profile for symbol:', symbol);
    
    // First try to get from our database
    const { data: tokenData, error: dbError } = await supabase
      .from('token_metadata')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    if (tokenData) {
      console.log('Found token data in database:', tokenData);
      return formatTokenDataFromDb(tokenData);
    }

    // If not in database, fetch from API
    const { data, error } = await supabase.functions.invoke('token-profile', {
      body: { symbol }
    });

    if (error) {
      console.error('Error fetching token profile:', error);
      throw new Error(`Error fetching data for ${symbol}`);
    }

    if (!data || data.error) {
      console.log('API returned error or no data:', data?.error);
      throw new Error(`No reliable data found for ${symbol}`);
    }

    console.log('API returned data:', data);
    return data.data;
  } catch (error) {
    console.error('Error creating token profile:', error);
    throw error;
  }
}

function formatTokenDataFromDb(tokenData: any): string {
  let response = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol}):\n\n`;

  if (tokenData.market_data) {
    const marketData = tokenData.market_data;
    
    if (marketData.current_price) {
      response += `Current Price: $${marketData.current_price.toLocaleString()}\n`;
    }
    
    if (marketData.market_cap) {
      response += `Market Cap: $${marketData.market_cap.toLocaleString()}\n`;
    }
    
    if (marketData.total_volume) {
      response += `24h Trading Volume: $${marketData.total_volume.toLocaleString()}\n`;
    }
  }

  if (tokenData.description) {
    response += `\nDescription: ${tokenData.description}\n`;
  }

  response += `\nPlease note that cryptocurrency investments carry risks. Always conduct thorough research before making investment decisions.`;

  return response;
}