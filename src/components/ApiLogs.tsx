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

interface ApiLogsProps {
  logs: ApiLog[];
}

export const ApiLogs = ({ logs }: ApiLogsProps) => {
  const formatJson = (obj: any) => {
    // Filter out null values and format the JSON for display
    const filtered = Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v != null)
    );
    return JSON.stringify(filtered, null, 2);
  };

  const getLastMessage = (messages: Message[]) => {
    return messages[messages.length - 1];
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {logs.map((log, index) => {
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span className="text-blue-400">→</span> User Message
                  </h3>
                  <span className="text-xs text-gray-500">
                    {lastMessage.timestamp.toString().split('T')[1].split('.')[0]}
                  </span>
                </div>
                <div className="bg-[#2A2B2D] p-4 rounded-lg text-sm font-mono text-gray-300 border border-gray-800">
                  <p className="whitespace-pre-wrap">{lastMessage.content}</p>
                </div>
              </div>
              
              {log.response && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <span className="text-green-400">←</span> Magi Response
                    </h3>
                  </div>
                  <div className="bg-[#2A2B2D] p-4 rounded-lg text-sm font-mono text-gray-300 border border-gray-800">
                    <p className="whitespace-pre-wrap">{log.response.content}</p>
                  </div>
                </div>
              )}
              
              {log.error && (
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="text-red-400">⚠</span> Error
                  </h3>
                  <div className="bg-[#2A2B2D] p-4 rounded-lg text-sm font-mono text-red-300 border border-red-900/50">
                    <p className="whitespace-pre-wrap">{log.error}</p>
                  </div>
                </div>
              )}
              
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
      })}
    </div>
  );
};