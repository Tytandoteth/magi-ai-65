import { useRef, useEffect } from "react";
import { AlertCircle, Construction, Twitter } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatState } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedPhrases } from "./chat/AnimatedPhrases";
import { SuggestedPrompts } from "./chat/SuggestedPrompts";
import { Button } from "./ui/button";

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

  return (
    <div className="chat-container flex-1 flex flex-col relative">
      {/* Alpha Banner */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 rounded-xl">
        <div className="bg-background/95 p-6 rounded-lg shadow-xl max-w-md text-center space-y-4">
          <Construction className="h-12 w-12 mx-auto text-yellow-500 animate-bounce-slow" />
          <h2 className="text-xl font-semibold text-gray-200">Alpha Version</h2>
          <p className="text-gray-400">
            Magi Terminal is currently in development. Features will be enabled soon.
          </p>
          <div className="text-sm text-gray-500">
            Expected Release: January 2025
          </div>
          <a 
            href="https://x.com/Agent_Magi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-background hover:bg-accent text-primary hover:text-accent-foreground transition-colors duration-200"
            >
              <Twitter className="mr-2 h-4 w-4" />
              Follow @Agent_Magi
            </Button>
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 opacity-30 pointer-events-none">
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
        disabled={true}
      />
    </div>
  );
};