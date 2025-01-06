import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  
  return (
    <div
      className={cn(
        "flex w-full mb-4 message-appear px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser 
            ? "bg-[#3B3D40] text-gray-100"
            : "bg-[#2A2B2D] text-gray-100 border border-gray-700"
        )}
      >
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
};