import { useState } from "react";
import { Message, ChatState } from "@/types/chat";

export const useChatMessages = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const addMessage = (message: Message) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const setLoading = (isLoading: boolean) => {
    setChatState(prev => ({
      ...prev,
      isLoading,
    }));
  };

  const setError = (error: string | null) => {
    setChatState(prev => ({
      ...prev,
      error,
    }));
  };

  return {
    chatState,
    addMessage,
    setLoading,
    setError,
  };
};