import { Message } from "@/types/chat";
import { UserMessage } from "./UserMessage";
import { ApiCalls } from "./ApiCalls";
import { MagiResponse } from "./MagiResponse";
import { ErrorMessage } from "./ErrorMessage";

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

interface LogEntryProps {
  log: ApiLog;
  index: number;
}

export const LogEntry = ({ log, index }: LogEntryProps) => {
  const getLastMessage = (messages: Message[]) => {
    return messages[messages.length - 1];
  };

  const lastMessage = getLastMessage(log.request.messages);

  return (
    <div key={index} className="bg-[#1E1F21] rounded-xl p-6 border border-gray-700/50 shadow-lg transition-all hover:border-gray-600">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse"></div>
        <time className="text-sm text-gray-400 font-medium">
          {log.timestamp.toLocaleString()}
        </time>
      </div>
      
      <div className="space-y-6">
        <UserMessage message={lastMessage} />
        {log.request.apis && <ApiCalls apis={log.request.apis} />}
        {log.response && <MagiResponse response={log.response} />}
        {log.error && <ErrorMessage error={log.error} />}
        
        <div className="pt-4 border-t border-gray-800">
          <button 
            onClick={() => console.log('Raw data:', log)}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
          >
            <span>View raw data</span>
            <span className="text-gray-600">▼</span>
          </button>
        </div>
      </div>
    </div>
  );
};