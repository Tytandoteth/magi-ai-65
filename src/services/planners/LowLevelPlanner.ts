import { createTokenProfile } from "@/utils/token/tokenProfile";
import { InventoryManager } from "../inventory/InventoryManager";
import { TokenResolver } from "../token/TokenResolver";
import { TokenInfoService } from "../token/TokenInfoService";
import { supabase } from "@/integrations/supabase/client";

export class LowLevelPlanner {
  private inventoryManager: InventoryManager;
  private tokenInfoService: TokenInfoService;

  constructor() {
    this.inventoryManager = InventoryManager.getInstance();
    this.tokenInfoService = TokenInfoService.getInstance();
  }

  async executeTask(taskName: string, params: any): Promise<string> {
    console.log(`Executing task: ${taskName} with params:`, params);
    
    try {
      // Check for token queries in different formats
      if (params.messages) {
        const lastMessage = params.messages[params.messages.length - 1];
        if (lastMessage?.content) {
          console.log('Processing message content:', lastMessage.content);
          
          const symbol = TokenResolver.resolveTokenSymbol(lastMessage.content);
          if (symbol) {
            return await this.tokenInfoService.getTokenInfo(symbol);
          }
          
          return TokenResolver.getSuggestionMessage(lastMessage.content);
        }
      }

      // Otherwise proceed with regular task handling
      switch (taskName) {
        case "PRICE_CHECK":
          return await this.checkPrice(params);
        case "MARKET_UPDATE":
          return await this.generateMarketUpdate(params);
        case "TOKEN_INFO":
          return await this.tokenInfoService.getTokenInfo(params.token);
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

  private async generateGeneralResponse(params: any): Promise<string> {
    return "I'm here to help with any DeFi-related questions! You can ask me about specific tokens by using the $ symbol (e.g., $ETH), get market updates, or ask about DeFi protocols.";
  }
}