import { MemoryManager } from "../memory/MemoryManager";
import { Message } from "@/types/chat";

export class HighLevelPlanner {
  private memoryManager: MemoryManager;

  constructor() {
    this.memoryManager = MemoryManager.getInstance();
  }

  async planAction(messages: Message[]): Promise<string> {
    console.log('Planning high-level action based on messages:', messages);
    
    const lastMessage = messages[messages.length - 1];
    const engagement = this.memoryManager.retrieveData("engagementMetrics");
    
    // Check for token queries
    if (lastMessage.content.toLowerCase().match(/\$[a-zA-Z]+/)) {
      return "TOKEN_INFO";
    }
    
    // Check for market-related queries
    if (lastMessage.content.toLowerCase().includes('market') && engagement?.average > 10) {
      return "MARKET_UPDATE";
    } 
    
    // Check for price-related queries
    if (lastMessage.content.toLowerCase().includes('price')) {
      return "PRICE_CHECK";
    }
    
    return "GENERAL_RESPONSE";
  }

  async processFeedback(feedback: any): Promise<void> {
    console.log('Processing feedback:', feedback);
    const currentMetrics = this.memoryManager.retrieveData("engagementMetrics") || { average: 0, count: 0 };
    
    const newAverage = (currentMetrics.average * currentMetrics.count + feedback.score) / (currentMetrics.count + 1);
    await this.memoryManager.storeData("engagementMetrics", {
      average: newAverage,
      count: currentMetrics.count + 1
    });
  }
}