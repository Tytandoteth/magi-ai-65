import { useRef, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatState } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatContainerProps {
  chatState: ChatState;
  onSendMessage: (message: string) => void;
}

const ANIMATED_PHRASES = [
  {
    display: "Ask me about any token",
    command: "Tell me about $MAG"
  },
  {
    display: "Ask me where to find the yields in DeFi",
    command: "Show me the best DeFi strategies for high yield"
  },
  {
    display: "Ask me what I think about the market",
    command: "What's your analysis of the current market conditions?"
  }
];

export const ChatContainer = ({ chatState, onSendMessage }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % ANIMATED_PHRASES.length);
    }, 3000); // Change phrase every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePhraseClick = () => {
    const command = ANIMATED_PHRASES[currentPhraseIndex].command;
    onSendMessage(command);
  };

  console.log("ChatContainer rendered with state:", chatState);

  // Early return for initial loading state
  if (!chatState) {
    return (
      <div className="chat-container flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col space-y-4 p-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-12 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        {(!chatState.messages || chatState.messages.length === 0) && !chatState.isLoading ? (
          <div className="flex flex-col space-y-4 p-4">
            <div 
              onClick={handlePhraseClick}
              className="text-center text-gray-500 cursor-pointer hover:text-primary transition-colors duration-300 animate-fade-in"
              key={currentPhraseIndex}
            >
              {ANIMATED_PHRASES[currentPhraseIndex].display}
            </div>
          </div>
        ) : (
          chatState.messages?.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {chatState.isLoading && (
          <>
            <TypingIndicator />
            <div className="flex justify-start px-4 opacity-50">
              <div className="text-xs text-gray-400 animate-pulse">
                Processing your request...
              </div>
            </div>
          </>
        )}
        
        {chatState.error && (
          <div className="flex justify-center p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{chatState.error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSend={onSendMessage} 
        disabled={chatState.isLoading} 
      />
    </div>
  );
};