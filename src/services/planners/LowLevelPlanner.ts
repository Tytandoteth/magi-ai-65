import { createTokenProfile } from "../../../supabase/functions/chat/utils/token/tokenProfile";
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

    // Remove $ if present and convert to uppercase
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    
    try {
      const tokenProfile = await createTokenProfile(cleanSymbol);
      console.log('Token profile:', tokenProfile);
      return tokenProfile;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return `I apologize, but I couldn't find detailed information about ${cleanSymbol}. Please verify the token symbol and try again.`;
    }
  }

  private async generateGeneralResponse(params: any): Promise<string> {
    const messages = params.messages || [];
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.content?.toLowerCase().includes('$')) {
      // Extract token symbol and get info
      const symbol = lastMessage.content.match(/\$(\w+)/)?.[1];
      if (symbol) {
        return await this.getTokenInfo(symbol);
      }
    }
    
    return "I'm here to help with any DeFi-related questions! You can ask me about specific tokens by using the $ symbol (e.g., $ETH), get market updates, or ask about DeFi protocols.";
  }
}