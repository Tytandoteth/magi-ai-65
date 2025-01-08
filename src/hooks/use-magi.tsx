import { useState, useCallback } from "react";
import { HighLevelPlanner } from "@/services/planners/HighLevelPlanner";
import { LowLevelPlanner } from "@/services/planners/LowLevelPlanner";
import { Message } from "@/types/chat";
import { HighLevelAction } from "@/types/actions";
import { MagiGameAgent } from "@/services/game/agent";
import { supabase } from "@/integrations/supabase/client";

export const useMagi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hlp = new HighLevelPlanner();
  const llp = new LowLevelPlanner();

  const processMessage = useCallback(async (messages: Message[]): Promise<string> => {
    console.log('Processing message with Magi:', messages);
    setIsProcessing(true);

    try {
      // Call the chat edge function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages }
      });

      if (error) {
        console.error('Error calling chat function:', error);
        throw new Error('Failed to process message');
      }

      console.log('Chat response:', data);

      if (!data?.response?.content) {
        throw new Error('Invalid response from chat function');
      }

      return data.response.content;

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