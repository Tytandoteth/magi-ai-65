import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useApiLogs, ApiLog } from "./use-api-logs";
import { useChatMessages } from "./use-chat-messages";
import { useMagi } from "./use-magi";

export const useChat = () => {
  const { toast } = useToast();
  const { apiLogs, addApiLog } = useApiLogs();
  const { chatState, addMessage, setLoading, setError } = useChatMessages();
  const { processMessage } = useMagi();

  const logChatQuery = async (query: string, response: string, metadata: any) => {
    try {
      const { error } = await supabase
        .from('chat_queries')
        .insert({
          query,
          response,
          metadata,
          processing_time_ms: metadata.processingTime,
          tokens_used: metadata.tokensUsed,
        });

      if (error) {
        console.error('Error logging chat query:', error);
      }
    } catch (error) {
      console.error('Error in logChatQuery:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const startTime = Date.now();
    
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
      const processingTime = Date.now() - startTime;
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      // Log the chat query with analytics
      await logChatQuery(content, response, {
        processingTime,
        tokensUsed: response.length / 4, // Rough estimate
        messageCount: currentMessages.length,
        userMessageLength: content.length,
        responseLength: response.length,
      });

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