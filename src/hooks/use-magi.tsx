import { useState, useCallback } from "react";
import { HighLevelPlanner } from "@/services/planners/HighLevelPlanner";
import { LowLevelPlanner } from "@/services/planners/LowLevelPlanner";
import { Message } from "@/types/chat";

export const useMagi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hlp = new HighLevelPlanner();
  const llp = new LowLevelPlanner();

  const processMessage = useCallback(async (messages: Message[]): Promise<string> => {
    console.log('Processing message with Magi:', messages);
    setIsProcessing(true);

    try {
      // Get high-level action plan
      const action = await hlp.planAction(messages);
      console.log('Planned action:', action);

      // Execute the planned action
      const response = await llp.executeTask(action, {
        messages,
        token: "ETH", // Example parameter
        percentage: "5.2" // Example parameter
      });

      return response;
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