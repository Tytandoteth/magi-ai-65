import { useState } from "react";
import { Message } from "@/types/chat";

interface ApiLog {
  timestamp: Date;
  request: {
    messages: Message[];
  };
  response?: {
    content: string;
  };
  error?: string;
}

export const useApiLogs = () => {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const addApiLog = (log: ApiLog) => {
    setApiLogs(prev => [...prev, log]);
  };

  return {
    apiLogs,
    addApiLog
  };
};