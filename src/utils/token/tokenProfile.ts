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

    // Get DeFi Llama data for TVL
    const { data: defiLlamaData, error: llamaError } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('DeFi Llama data:', defiLlamaData);

    if (tokenData) {
      console.log('Found token data in database:', tokenData);
      return formatTokenDataFromDb(tokenData, defiLlamaData);
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

function formatTokenDataFromDb(tokenData: any, defiLlamaData?: any): string {
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

    if (marketData.price_change_percentage_24h) {
      response += `24h Price Change: ${marketData.price_change_percentage_24h.toFixed(2)}%\n`;
    }

    if (marketData.market_cap_rank) {
      response += `Market Cap Rank: #${marketData.market_cap_rank}\n`;
    }
  }

  // Add TVL data if available
  if (defiLlamaData && defiLlamaData.tvl) {
    response += `\nTotal Value Locked (TVL): $${defiLlamaData.tvl.toLocaleString()}\n`;
    
    if (defiLlamaData.change_1d) {
      response += `24h TVL Change: ${defiLlamaData.change_1d.toFixed(2)}%\n`;
    }
    
    if (defiLlamaData.category) {
      response += `Category: ${defiLlamaData.category}\n`;
    }
  }

  if (tokenData.description) {
    response += `\nDescription: ${tokenData.description}\n`;
  }

  response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

  return response;
}