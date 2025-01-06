import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { Message, ChatState } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiLogs } from "@/components/ApiLogs";

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

const Index = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSendMessage = async (content: string) => {
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
        messages: currentMessages.map(({ role, content }) => ({
          role,
          content,
        })),
      },
    };

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: currentMessages.map(({ role, content }) => ({
            role,
            content,
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
      console.error("Error:", error);
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

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <Tabs defaultValue="chat" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="logs">API Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          <div className="chat-container flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto py-4">
              {chatState.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {chatState.isLoading && (
                <div className="flex justify-start mb-4 px-4">
                  <div className="bg-[#2A2B2D] text-gray-100 rounded-lg px-4 py-3 border border-gray-700">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSendMessage} disabled={chatState.isLoading} />
          </div>
        </TabsContent>
        <TabsContent value="logs" className="flex-1 flex flex-col mt-0">
          <div className="chat-container flex-1">
            <ApiLogs logs={apiLogs} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;