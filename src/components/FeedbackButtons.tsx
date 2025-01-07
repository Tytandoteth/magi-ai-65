import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { submitFeedback } from "@/services/feedback";
import { FeedbackState } from "@/types/feedback";

interface FeedbackButtonsProps {
  messageId: string;
}

export const FeedbackButtons = ({ messageId }: FeedbackButtonsProps) => {
  const [state, setState] = useState<FeedbackState>({
    isSubmitting: false,
    error: null,
    submitted: false
  });
  
  const { toast } = useToast();

  const handleFeedback = async (type: "positive" | "negative") => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      await submitFeedback({
        type,
        messageId,
        timestamp: new Date()
      });
      
      setState(prev => ({ ...prev, submitted: true }));
      toast({
        description: "Thank you for your feedback!",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || "Failed to submit feedback"
      }));
      
      toast({
        variant: "destructive",
        description: error.message || "Failed to submit feedback. Please try again.",
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (state.submitted) {
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
        disabled={state.isSubmitting}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-gray-100"
        onClick={() => handleFeedback("negative")}
        disabled={state.isSubmitting}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};