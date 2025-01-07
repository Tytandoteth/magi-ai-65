import { InventoryManager } from "../inventory/InventoryManager";
import { supabase } from "@/integrations/supabase/client";

export class LowLevelPlanner {
  private inventoryManager: InventoryManager;

  constructor() {
    this.inventoryManager = InventoryManager.getInstance();
  }

  async executeTask(taskName: string, params: any): Promise<any> {
    console.log(`Executing task: ${taskName}`, params);
    
    try {
      switch (taskName) {
        case "MARKET_UPDATE":
          return await this.generateMarketUpdate(params);
        case "PRICE_CHECK":
          return await this.checkPrice(params);
        default:
          return await this.generateGeneralResponse(params);
      }
    } catch (error) {
      console.error(`Error executing task ${taskName}:`, error);
      throw error;
    }
  }

  private async generateMarketUpdate(params: any): Promise<string> {
    const template = this.inventoryManager.getItem("tweetTemplates")?.marketUpdate;
    if (!template) throw new Error("Market update template not found");

    // Fetch latest market data from Supabase
    const { data: marketData, error } = await supabase
      .from('defi_market_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    const metrics = `TVL: $${marketData.total_value_locked.toLocaleString()}`;
    return template.replace("${metrics}", metrics);
  }

  private async checkPrice(params: any): Promise<string> {
    const template = this.inventoryManager.getItem("tweetTemplates")?.priceAlert;
    if (!template) throw new Error("Price alert template not found");

    // Implementation for price checking
    return template
      .replace("${token}", params.token || "Unknown")
      .replace("${percentage}", params.percentage || "0");
  }

  private async generateGeneralResponse(params: any): Promise<string> {
    return "I'm here to help with any DeFi-related questions!";
  }
}