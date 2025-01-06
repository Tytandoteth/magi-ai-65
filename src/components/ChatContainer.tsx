import { useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatState } from "@/types/chat";

interface ChatContainerProps {
  chatState: ChatState;
  onSendMessage: (message: string) => void;
}

export const ChatContainer = ({ chatState, onSendMessage }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  return (
    <div className="chat-container flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        {chatState.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {chatState.isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSend={onSendMessage} 
        disabled={chatState.isLoading} 
      />
    </div>
  );
};