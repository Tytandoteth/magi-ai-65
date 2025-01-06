import { useState } from "react";
import { Message, ChatState } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiLog {
  timestamp: Date;
  request: {
    messages: Message[];
  };
  response?: {
    content: string;
  };
  error?: string;
}

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

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
      setApiLogs(prev => [...prev, apiLog]);

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      apiLog.error = error.message;
      setApiLogs(prev => [...prev, apiLog]);
      
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to get response. Please try again.",
      }));

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