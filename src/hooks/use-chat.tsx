import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useApiLogs, ApiLog } from "./use-api-logs";
import { useChatMessages } from "./use-chat-messages";

export const useChat = () => {
  const { toast } = useToast();
  const { apiLogs, addApiLog } = useApiLogs();
  const { chatState, addMessage, setLoading, setError } = useChatMessages();

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
      },
    };

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: currentMessages.map(({ role, content, id, timestamp }) => ({
            role,
            content,
            id,
            timestamp,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response.content,
        role: "assistant",
        timestamp: new Date(),
      };

      apiLog.response = data.response;
      addApiLog(apiLog);
      addMessage(assistantMessage);
      setLoading(false);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      apiLog.error = error.message;
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