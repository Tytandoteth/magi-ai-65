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
    <div className="flex-1 overflow-y-auto p-4">
      {logs.map((log, index) => (
        <div key={index} className="mb-6 bg-[#2A2B2D] rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">
            {log.timestamp.toLocaleString()}
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Request:</h3>
            <pre className="bg-[#3B3D40] p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(log.request, null, 2)}
            </pre>
          </div>
          {log.response && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Response:</h3>
              <pre className="bg-[#3B3D40] p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(log.response, null, 2)}
              </pre>
            </div>
          )}
          {log.error && (
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-2">Error:</h3>
              <pre className="bg-[#3B3D40] p-3 rounded text-sm overflow-x-auto text-red-400">
                {log.error}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};