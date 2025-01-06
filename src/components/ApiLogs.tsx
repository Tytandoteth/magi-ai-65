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
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {logs.map((log, index) => (
        <div key={index} className="bg-[#2A2B2D] rounded-xl p-6 border border-gray-700/50 shadow-lg transition-all hover:border-gray-600">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            <time className="text-sm text-gray-400 font-medium">
              {log.timestamp.toLocaleString()}
            </time>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="text-blue-400">→</span> Request
              </h3>
              <pre className="bg-[#1E1F21] p-4 rounded-lg text-sm overflow-x-auto font-mono text-gray-300 border border-gray-800">
                {JSON.stringify(log.request, null, 2)}
              </pre>
            </div>
            
            {log.response && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <span className="text-green-400">←</span> Response
                </h3>
                <pre className="bg-[#1E1F21] p-4 rounded-lg text-sm overflow-x-auto font-mono text-gray-300 border border-gray-800">
                  {JSON.stringify(log.response, null, 2)}
                </pre>
              </div>
            )}
            
            {log.error && (
              <div>
                <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <span className="text-red-400">⚠</span> Error
                </h3>
                <pre className="bg-[#1E1F21] p-4 rounded-lg text-sm overflow-x-auto font-mono text-red-300 border border-red-900/50">
                  {log.error}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};