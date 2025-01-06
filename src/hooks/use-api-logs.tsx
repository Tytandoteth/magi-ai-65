import { Message } from "@/types/chat";

export interface ApiLog {
  timestamp: Date;
  request: {
    messages: Message[];
    apis?: {
      name: string;
      status: 'success' | 'error';
      responseTime?: number;
      error?: string;
    }[];
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