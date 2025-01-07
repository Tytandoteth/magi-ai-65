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
    if (!symbol) {
      return "Please provide a token symbol to get information about.";
    }

    // Handle multiple token queries
    const tokens = symbol.split(/\s+/)
      .filter(t => t.startsWith('$'))
      .map(t => t.substring(1).toUpperCase());

    if (tokens.length === 0) {
      return "Please provide token symbols starting with $ to get information about them.";
    }

    try {
      const responses = await Promise.all(tokens.map(async (token) => {
        try {
          const tokenProfile = await createTokenProfile(token);
          return tokenProfile;
        } catch (error) {
          console.error(`Error fetching info for ${token}:`, error);
          return `I couldn't find detailed information about ${token}. Please verify the token symbol and try again.`;
        }
      }));

      return responses.join('\n\n');
    } catch (error) {
      console.error('Error fetching token info:', error);
      return `I apologize, but I encountered an error while fetching token information. Please try again later.`;
    }
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