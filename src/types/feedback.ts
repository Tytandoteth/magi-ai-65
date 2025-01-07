export interface FeedbackData {
  type: "positive" | "negative";
  messageId: string;
  timestamp: Date;
}

export interface FeedbackState {
  isSubmitting: boolean;
  error: string | null;
  submitted: boolean;
}