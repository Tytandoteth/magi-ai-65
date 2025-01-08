import { useState, useCallback } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

export const useMagi = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processMessage = useCallback(async (messages: Message[]): Promise<string> => {
    console.log('Processing message with Magi:', messages);
    setIsProcessing(true);

    try {
      // Call the chat edge function with proper URL formatting
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: messages.slice(-5) // Only send last 5 messages to reduce payload
        }
      });

      if (error) {
        console.error('Error calling chat function:', error);
        throw new Error(`Failed to process message: ${error.message}`);
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