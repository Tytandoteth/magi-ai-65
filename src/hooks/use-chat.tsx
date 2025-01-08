import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useApiLogs, ApiLog } from "./use-api-logs";
import { useChatMessages } from "./use-chat-messages";
import { useMagi } from "./use-magi";

/**
 * useChat Hook
 * 
 * A custom hook that manages the chat functionality including message handling,
 * API interactions, and state management.
 * 
 * @returns {Object} Chat state and control functions
 * @property {ChatState} chatState - Current state of the chat
 * @property {ApiLog[]} apiLogs - Logs of API interactions
 * @property {Function} handleSendMessage - Function to send new messages
 * 
 * @example
 * ```tsx
 * const { chatState, apiLogs, handleSendMessage } = useChat();
 * ```
 */
export const useChat = () => {
  const { toast } = useToast();
  const { apiLogs, addApiLog } = useApiLogs();
  const { chatState, addMessage, setLoading, setError } = useChatMessages();
  const { processMessage } = useMagi();

  /**
   * Handles sending a new message in the chat
   * @param {string} content - The message content to send
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);
    setError(null);

    const currentMessages = [...chatState.messages, userMessage];
    const apiLog: ApiLog = {
      timestamp: new Date(),
      request: {
        messages: currentMessages,
        apis: []
      },
    };

    try {
      console.log('Starting chat request with messages:', currentMessages);
      
      const response = await processMessage(currentMessages);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      apiLog.response = { content: response };
      addApiLog(apiLog);
      addMessage(assistantMessage);
      setLoading(false);
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      apiLog.error = error.message;
      
      if (apiLog.request.apis) {
        apiLog.request.apis.push({
          name: 'chat',
          status: 'error',
          error: error.message
        });
      }
      
      addApiLog(apiLog);
      setError("Failed to get response. Please try again.");
      setLoading(false);

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again.",
      });
    }
  };

  return {
    chatState,
    apiLogs,
    handleSendMessage,
  };
};