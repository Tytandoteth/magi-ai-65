import { Message } from "@/types/chat";
import { UserMessage } from "./UserMessage";
import { ApiCalls } from "./ApiCalls";
import { MagiResponse } from "./MagiResponse";
import { ErrorMessage } from "./ErrorMessage";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const { toast } = useToast();
  const [showRawData, setShowRawData] = useState(false);
  
  const getLastMessage = (messages: Message[]) => {
    return messages[messages.length - 1];
  };

  const lastMessage = getLastMessage(log.request.messages);

  const handleCopyLog = async () => {
    try {
      const logContent = JSON.stringify(log, null, 2);
      await navigator.clipboard.writeText(logContent);
      toast({
        title: "Copied!",
        description: "Log content has been copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy log content",
        variant: "destructive",
      });
    }
  };

  const getRequestSummary = () => {
    const apiCount = log.request.apis?.length || 0;
    const hasError = log.error || log.request.apis?.some(api => api.status === 'error');
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className={hasError ? "text-red-400" : "text-green-400"}>
          {hasError ? "⚠️" : "✓"}
        </span>
        <span className="text-gray-400">
          {apiCount} API {apiCount === 1 ? 'call' : 'calls'}
        </span>
        {hasError && <span className="text-red-400">with errors</span>}
      </div>
    );
  };

  return (
    <div key={index} className="bg-[#1E1F21] rounded-xl p-6 border border-gray-700/50 shadow-lg transition-all hover:border-gray-600">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse"></div>
          <time className="text-sm text-gray-400 font-medium">
            {new Date(log.timestamp).toLocaleString()}
          </time>
          {getRequestSummary()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-300"
          onClick={handleCopyLog}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Log
        </Button>
      </div>
      
      <div className="space-y-6">
        <UserMessage message={lastMessage} />
        {log.request.apis && log.request.apis.length > 0 && (
          <ApiCalls apis={log.request.apis} />
        )}
        {log.response && <MagiResponse response={log.response} />}
        {log.error && <ErrorMessage error={log.error} />}
        
        <div className="pt-4 border-t border-gray-800">
          <button 
            onClick={() => setShowRawData(!showRawData)}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
          >
            <span>Raw data</span>
            {showRawData ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showRawData && (
            <pre className="mt-2 p-4 bg-[#2A2B2D] rounded-lg text-xs text-gray-400 overflow-x-auto">
              {JSON.stringify(log, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};