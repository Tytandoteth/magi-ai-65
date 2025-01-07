import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { FeedbackButtons } from "./FeedbackButtons";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  
  const formatContent = (content: string) => {
    if (!content) return ""; // Handle empty content
    
    // Enhanced number formatting with locale and proper grouping
    content = content.replace(
      /\$\d+(?:\.\d{1,2})?(?:k|m|b)?/gi,
      match => {
        const num = parseFloat(match.replace(/[$kmb]/gi, ''));
        let multiplier = 1;
        
        if (match.toLowerCase().includes('k')) multiplier = 1000;
        if (match.toLowerCase().includes('m')) multiplier = 1000000;
        if (match.toLowerCase().includes('b')) multiplier = 1000000000;
        
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num * multiplier);
      }
    );

    // Format percentages consistently
    content = content.replace(
      /([-+]?\d+\.?\d*)%/g,
      match => {
        const num = parseFloat(match);
        return `${num.toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        })}%`;
      }
    );

    // Handle error messages with proper formatting
    if (content.toLowerCase().includes('error:')) {
      return content.split('\n').map(line => {
        if (line.toLowerCase().startsWith('error:')) {
          return `❌ ${line.slice(6).trim()}`;
        }
        return line;
      }).join('\n');
    }

    return content;
  };

  console.log("Rendering message:", message);

  // Check if the message contains an error
  const isError = message.content?.toLowerCase().includes('error:');
  
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
            : "bg-[#1e1f23] text-gray-100 border border-gray-800",
          isError && !isUser && "border-red-800 bg-red-900/10"
        )}
      >
        {!isUser && (
          <div className="absolute -left-1 -top-6 text-sm text-gray-400">
            Magi
          </div>
        )}
        
        {isError && !isUser ? (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formatContent(message.content)}
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
            {formatContent(message.content || '')}
          </p>
        )}
        
        {!isUser && <FeedbackButtons messageId={message.id} />}
      </div>
    </div>
  );
};