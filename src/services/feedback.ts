import { supabase } from "@/integrations/supabase/client";
import { FeedbackData } from "@/types/feedback";

export async function submitFeedback(data: FeedbackData) {
  console.log(`Submitting ${data.type} feedback for message ${data.messageId}`);
  
  const messageIdNumber = parseInt(data.messageId);
  if (isNaN(messageIdNumber)) {
    throw new Error("Invalid message ID");
  }

  // Verify message exists
  const { data: message, error: messageError } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("id", messageIdNumber)
    .maybeSingle();

  if (messageError) {
    console.error("Error checking message:", messageError);
    throw messageError;
  }

  if (!message) {
    console.error("Message not found for ID:", messageIdNumber);
    throw new Error("Message not found");
  }

  console.log("Found message:", message);

  // Insert feedback
  const { error } = await supabase
    .from("ai_agent_metrics")
    .insert({
      message_id: messageIdNumber,
      feedback: { type: data.type },
      effectiveness_score: data.type === "positive" ? 1 : 0,
    });

  if (error) {
    console.error("Error inserting feedback:", error);
    throw error;
  }

  console.log("Feedback submitted successfully");
}