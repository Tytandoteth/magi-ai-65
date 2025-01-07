import { supabase } from "@/integrations/supabase/client";

export class TokenInfoService {
  static async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    if (!symbol) {
      return "Please provide a token symbol to get information about.";
    }

    try {
      // First check if token exists in our database
      const { data: tokenData, error } = await supabase
        .from('token_metadata')
        .select('*')
        .ilike('symbol', symbol)
        .order('last_updated', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking token metadata:', error);
        throw error;
      }

      if (tokenData && tokenData.length > 0) {
        console.log('Found token data in database:', tokenData[0]);
        return TokenInfoService.formatTokenResponse(tokenData[0]);
      }

      // If not in database, fetch from API
      console.log(`Fetching data for token: ${symbol}`);
      const { data: cgResponse, error: cgError } = await supabase.functions.invoke('token-profile', {
        body: { symbol }
      });

      if (cgError) {
        console.error(`Error fetching token profile for ${symbol}:`, cgError);
        throw cgError;
      }

      if (!cgResponse?.data) {
        return `I couldn't find reliable information about ${symbol}. This token might be:
        - Not yet listed on major exchanges
        - A new or emerging project
        - Using a different symbol
        
        Please verify the token symbol and conduct thorough research before considering any investment.`;
      }

      return cgResponse.data;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return `I apologize, but I encountered an error while fetching token information. Please try again later.`;
    }
  }

  private static formatTokenResponse(tokenData: any): string {
    if (!tokenData) return "Token data not found";

    let response = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol}):\n\n`;

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
    }

    if (tokenData.description) {
      response += `\nDescription: ${tokenData.description}\n`;
    }

    response += `\nPlease note that cryptocurrency investments carry risks. Always conduct thorough research before making investment decisions.`;

    return response;
  }
}