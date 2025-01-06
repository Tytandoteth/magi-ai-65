import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  
  return (
    <div
      className={cn(
        "flex w-full mb-4 message-appear",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
};