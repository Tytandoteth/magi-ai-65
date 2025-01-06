import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { Message, ChatState } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
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

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...chatState.messages, userMessage].map(({ role, content }) => ({
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

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error:", error);
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
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4">
        {chatState.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {chatState.isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} disabled={chatState.isLoading} />
    </div>
  );
};

export default Index;