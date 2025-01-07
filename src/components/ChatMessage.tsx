import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { FeedbackButtons } from "./FeedbackButtons";

/**
 * ChatMessage Component
 * 
 * Renders an individual message in the chat interface with proper formatting
 * and feedback buttons for AI responses.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Message} props.message - The message object to display
 * 
 * @example
 * ```tsx
 * <ChatMessage 
 *   message={{
 *     id: "123",
 *     content: "Hello!",
 *     role: "user",
 *     timestamp: new Date()
 *   }} 
 * />
 * ```
 */
export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  
  /**
   * Formats numerical values in the message content to proper currency format
   * @param {string} content - The message content to format
   * @returns {string} Formatted message content
   */
  const formatContent = (content: string) => {
    return content.replace(
      /\$\d+(?:\.\d{2})?/g,
      match => {
        const num = parseFloat(match.replace('$', ''));
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num);
      }
    );
  };
  
  return (
    <div
      className={cn(
        "flex w-full mb-4 message-appear px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-4 py-3",
          isUser 
            ? "bg-[#1e1f23] text-gray-100"
            : "bg-[#1e1f23] text-gray-100 border border-gray-800"
        )}
      >
        {!isUser && (
          <div className="absolute -left-1 -top-6 text-sm text-gray-400">
            Magi
          </div>
        )}
        <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
          {formatContent(message.content)}
        </p>
        {!isUser && <FeedbackButtons messageId={message.id} />}
      </div>
    </div>
  );
};