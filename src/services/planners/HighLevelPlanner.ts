import { MemoryManager } from "../memory/MemoryManager";
import { Message } from "@/types/chat";
import { HighLevelAction } from "@/types/actions";

export class HighLevelPlanner {
  private memoryManager: MemoryManager;

  constructor() {
    this.memoryManager = MemoryManager.getInstance();
  }

  async planAction(messages: Message[]): Promise<HighLevelAction> {
    console.log('Planning high-level action based on messages:', messages);
    
    const lastMessage = messages[messages.length - 1];
    const engagement = this.memoryManager.retrieveData("engagementMetrics");
    
    // Check for token queries
    if (lastMessage.content.toLowerCase().match(/\$[a-zA-Z]+/)) {
      return {
        type: "GET_TOKEN_INFO",
        description: "Get token information"
      };
    }
    
    // Check for percentage calculations
    if (lastMessage.content.toLowerCase().includes('%')) {
      return {
        type: "CALCULATE_PERCENTAGE",
        description: "Calculate percentage value"
      };
    }
    
    return {
      type: "UNKNOWN",
      description: "Unknown action requested"
    };
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