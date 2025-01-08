import { useState, useCallback } from "react";
import { HighLevelPlanner } from "@/services/planners/HighLevelPlanner";
import { LowLevelPlanner } from "@/services/planners/LowLevelPlanner";
import { Message } from "@/types/chat";
import { HighLevelAction } from "@/types/actions";
import { MagiGameAgent } from "@/services/game/agent";

export const useMagi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hlp = new HighLevelPlanner();
  const llp = new LowLevelPlanner();

  const processMessage = useCallback(async (messages: Message[]): Promise<string> => {
    console.log('Processing message with Magi:', messages);
    setIsProcessing(true);

    try {
      // Initialize Game Agent
      const gameAgent = MagiGameAgent.getInstance();
      await gameAgent.initialize();

      // Get high-level action plan
      const action: HighLevelAction = await hlp.planAction(messages);
      console.log('Planned action:', action);

      // Try processing with Game Agent first
      try {
        const gameResponse = await gameAgent.processMessage(messages[messages.length - 1].content);
        return gameResponse;
      } catch (gameError) {
        console.log('Game Agent processing failed, falling back to legacy system:', gameError);
        
        // Fall back to legacy system if Game Agent fails
        const response = await llp.executeTask(action, {
          messages,
          token: "ETH",
          percentage: "5.2"
        });

        return response;
      }
    } catch (error) {
      console.error('Error in Magi processing:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processMessage,
    isProcessing
  };
};