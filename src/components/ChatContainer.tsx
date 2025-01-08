import { useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatState } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedPhrases } from "./chat/AnimatedPhrases";
import { SuggestedPrompts } from "./chat/SuggestedPrompts";

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

  console.log("ChatContainer rendered with state:", chatState);

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
            <AnimatedPhrases onPhraseClick={onSendMessage} />
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4">
              {chatState.messages?.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
            <div className="px-4 py-2">
              <SuggestedPrompts onPhraseClick={onSendMessage} />
            </div>
          </>
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