import { Message } from "@/types/chat";
import { LogEntry } from "./api-logs/LogEntry";

interface ApiLog {
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

interface ApiLogsProps {
  logs: ApiLog[];
}

export const ApiLogs = ({ logs }: ApiLogsProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {logs.map((log, index) => (
        <LogEntry key={index} log={log} index={index} />
      ))}
    </div>
  );
};