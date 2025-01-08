import { useState, useCallback } from "react";
import { HighLevelPlanner } from "@/services/planners/HighLevelPlanner";
import { LowLevelPlanner } from "@/services/planners/LowLevelPlanner";
import { Message } from "@/types/chat";
import { HighLevelAction } from "@/types/actions";
import { MagiGameService } from "@/services/game/MagiGameService";

export const useMagi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hlp = new HighLevelPlanner();
  const llp = new LowLevelPlanner();
  const gameService = MagiGameService.getInstance();

  const processMessage = useCallback(async (messages: Message[]): Promise<string> => {
    console.log('Processing message with Magi:', messages);
    setIsProcessing(true);

    try {
      // Initialize game service if needed (you'll need to provide the API key)
      await gameService.initialize("YOUR_API_KEY");

      // Get high-level action plan
      const action: HighLevelAction = await hlp.planAction(messages);
      console.log('Planned action:', action);

      // Process with Game SDK
      const lastMessage = messages[messages.length - 1];
      const gameResponse = await gameService.processMessage(lastMessage.content);
      console.log('Game SDK response:', gameResponse);

      // Execute the planned action with both systems
      const response = await llp.executeTask(action, {
        messages,
        gameResponse,
        token: "ETH",
        percentage: "5.2"
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