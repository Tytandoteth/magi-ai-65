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

      // Also fetch DeFi Llama protocol data
      const { data: protocolData, error: protocolError } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (protocolError) {
        console.error('Error fetching DeFi Llama data:', protocolError);
      }

      // Check if this is a TVL-specific query
      const isTVLQuery = symbol.toLowerCase().includes('tvl');

      if (tokenData && tokenData.length > 0) {
        console.log('Found token data in database:', tokenData[0]);
        return TokenInfoService.formatTokenResponse(tokenData[0], protocolData?.[0], isTVLQuery);
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

  private static formatTokenResponse(tokenData: any, protocolData?: any, isTVLQuery: boolean = false): string {
    if (!tokenData) return "Token data not found";

    let response = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol}):\n\n`;

    // If it's a TVL query and we have protocol data, prioritize that information
    if (isTVLQuery && protocolData?.tvl) {
      response = `${tokenData.name} (${tokenData.symbol}) TVL Metrics:\n\n`;
      response += `Total Value Locked (TVL): $${protocolData.tvl.toLocaleString()}\n`;
      
      if (protocolData.change_1d) {
        response += `24h TVL Change: ${protocolData.change_1d.toFixed(2)}%\n`;
      }

      if (protocolData.category) {
        response += `Protocol Category: ${protocolData.category}\n`;
      }

      // Add a brief market context
      if (tokenData.market_data?.current_price?.usd) {
        response += `\nCurrent Token Price: $${tokenData.market_data.current_price.usd.toLocaleString()}\n`;
      }
    } else {
      // Regular token information format
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

      // Add TVL data if available
      if (protocolData?.tvl) {
        response += `Total Value Locked (TVL): $${protocolData.tvl.toLocaleString()}\n`;
        
        if (protocolData.change_1d) {
          response += `24h TVL Change: ${protocolData.change_1d.toFixed(2)}%\n`;
        }

        if (protocolData.category) {
          response += `Protocol Category: ${protocolData.category}\n`;
        }
      }

      if (tokenData.metadata?.additional_metrics?.market_cap_rank) {
        response += `Market Cap Rank: #${tokenData.metadata.additional_metrics.market_cap_rank}\n`;
      }

      if (tokenData.description) {
        response += `\nDescription: ${tokenData.description}\n`;
      }
    }

    response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

    return response;
  }
}