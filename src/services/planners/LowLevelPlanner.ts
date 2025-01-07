import { createTokenProfile } from "@/utils/token/tokenProfile";
import { InventoryManager } from "../inventory/InventoryManager";
import { supabase } from "@/integrations/supabase/client";

export class LowLevelPlanner {
  private inventoryManager: InventoryManager;

  constructor() {
    this.inventoryManager = InventoryManager.getInstance();
  }

  async executeTask(taskName: string, params: any): Promise<string> {
    console.log(`Executing task: ${taskName}`, params);
    
    try {
      switch (taskName) {
        case "PRICE_CHECK":
          return await this.checkPrice(params);
        case "MARKET_UPDATE":
          return await this.generateMarketUpdate(params);
        case "TOKEN_INFO":
          return await this.getTokenInfo(params.token);
        default:
          return await this.generateGeneralResponse(params);
      }
    } catch (error) {
      console.error(`Error executing task ${taskName}:`, error);
      throw error;
    }
  }

  private async checkPrice(params: any): Promise<string> {
    const template = this.inventoryManager.getItem("tweetTemplates")?.priceAlert;
    if (!template) throw new Error("Price alert template not found");

    return template
      .replace("${token}", params.token || "Unknown")
      .replace("${percentage}", params.percentage || "0");
  }

  private async generateMarketUpdate(params: any): Promise<string> {
    const { data: marketData, error } = await supabase
      .from('defi_market_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return `Current Market Update:\nTotal Value Locked: $${marketData.total_value_locked.toLocaleString()}`;
  }

  private async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    if (!symbol) {
      return "Please provide a token symbol to get information about.";
    }

    // Extract token symbols from the message
    const tokens = symbol.split(/\s+/)
      .filter(t => t.startsWith('$'))
      .map(t => t.substring(1).toUpperCase());

    if (tokens.length === 0) {
      // If no $ symbols found, treat the input as a direct token symbol
      tokens.push(symbol.toUpperCase());
    }

    try {
      console.log('Processing tokens:', tokens);
      
      // First check if token exists in our database
      const { data: tokenData, error } = await supabase
        .from('token_metadata')
        .select('*')
        .in('symbol', tokens)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error checking token metadata:', error);
        throw error;
      }

      const knownTokens = new Set(tokenData?.map(t => t.symbol) || []);
      const responses = await Promise.all(tokens.map(async (token) => {
        if (knownTokens.has(token)) {
          const tokenInfo = tokenData?.find(t => t.symbol === token);
          return this.formatTokenResponse(tokenInfo);
        }
        
        try {
          console.log(`Fetching data for token: ${token}`);
          const { data: cgResponse, error: cgError } = await supabase.functions.invoke('token-profile', {
            body: { symbol: token }
          });

          if (cgError) {
            console.error(`Error fetching token profile for ${token}:`, cgError);
            throw cgError;
          }

          if (!cgResponse?.data) {
            return `I couldn't find reliable information about ${token}. This token might be:
            - Not yet listed on major exchanges
            - A new or emerging project
            - Using a different symbol
            
            Please verify the token symbol and conduct thorough research before considering any investment. Consider checking:
            - Official project documentation
            - Major crypto exchanges
            - Community forums and social media`;
          }

          return cgResponse.data;
        } catch (error) {
          console.error(`Error fetching info for ${token}:`, error);
          return `I encountered an error while fetching data for ${token}. Please try again later.`;
        }
      }));

      return responses.join('\n\n');
    } catch (error) {
      console.error('Error fetching token info:', error);
      return `I apologize, but I encountered an error while fetching token information. Please try again later.`;
    }
  }

  private formatTokenResponse(tokenData: any): string {
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

  private async generateGeneralResponse(params: any): Promise<string> {
    const messages = params.messages || [];
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.content?.toLowerCase().includes('$')) {
      // Extract all token symbols and get info
      const symbols = lastMessage.content.match(/\$(\w+)/g);
      if (symbols && symbols.length > 0) {
        return await this.getTokenInfo(symbols.join(' '));
      }
    }
    
    return "I'm here to help with any DeFi-related questions! You can ask me about specific tokens by using the $ symbol (e.g., $ETH), get market updates, or ask about DeFi protocols.";
  }
}