import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useState, KeyboardEvent, useEffect, useRef } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSend(trimmedMessage);
      setMessage("");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 items-end p-4 chat-input-container opacity-50">
      <div className="flex-1 relative textarea-container">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Coming soon..."
          className="resize-none bg-[#1e1f23] border-none focus-visible:ring-0 text-gray-100 placeholder:text-gray-400"
          rows={1}
          disabled={true}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={true}
        size="icon"
        className="bg-[#1e1f23] hover:bg-[#2a2b2e] text-gray-100"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
};