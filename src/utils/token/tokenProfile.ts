import { supabase } from "@/integrations/supabase/client";

export async function createTokenProfile(symbol: string): Promise<string> {
  try {
    console.log('Fetching token profile for:', symbol);
    
    // First try to get data from our database
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
      return `I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }

    if (data.error) {
      console.log('API returned error:', data.error);
      return `I couldn't find reliable data for ${symbol}. Please verify the token symbol and try again.`;
    }

    console.log('API returned data:', data);
    return data.data;
  } catch (error) {
    console.error('Error creating token profile:', error);
    return `I encountered an error while fetching data for ${symbol}. Please try again later.`;
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