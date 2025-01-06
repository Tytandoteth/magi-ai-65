import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSend(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 items-end p-4 chat-input-container rounded-b-xl">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="How can I help you today?"
        className="resize-none bg-[#1e1f23] border-gray-800 focus-visible:ring-gray-500 text-gray-100 placeholder:text-gray-400"
        rows={1}
        disabled={disabled}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="icon"
        className="bg-transparent hover:bg-transparent p-0 h-8 w-8"
      >
        <img 
          src="/lovable-uploads/cb051562-df58-4bf5-b272-606e94765a37.png" 
          alt="Send"
          className="w-full h-full object-contain"
        />
      </Button>
    </div>
  );
};