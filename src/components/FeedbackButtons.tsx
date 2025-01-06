import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface FeedbackButtonsProps {
  messageId: string;
}

export const FeedbackButtons = ({ messageId }: FeedbackButtonsProps) => {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const { toast } = useToast();

  const handleFeedback = async (type: "positive" | "negative") => {
    try {
      console.log(`Submitting ${type} feedback for message ${messageId}`);
      
      const messageIdNumber = parseInt(messageId);
      if (isNaN(messageIdNumber)) {
        throw new Error("Invalid message ID");
      }

      const { error } = await supabase
        .from("ai_agent_metrics")
        .insert({
          message_id: messageIdNumber,
          feedback: { type },
          effectiveness_score: type === "positive" ? 1 : 0,
        });

      if (error) throw error;

      setFeedback(type);
      toast({
        description: "Thank you for your feedback!",
        duration: 3000,
      });

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        description: "Failed to submit feedback. Please try again.",
      });
    }
  };

  if (feedback) {
    return (
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-gray-100"
        onClick={() => handleFeedback("positive")}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-gray-100"
        onClick={() => handleFeedback("negative")}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};