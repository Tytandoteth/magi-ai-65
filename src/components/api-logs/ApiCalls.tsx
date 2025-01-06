interface ApiCall {
  name: string;
  status: 'success' | 'error';
  responseTime?: number;
  error?: string;
}

interface ApiCallsProps {
  apis: ApiCall[];
}

export const ApiCalls = ({ apis }: ApiCallsProps) => {
  const getApiStatusColor = (status: 'success' | 'error') => {
    return status === 'success' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <span className="text-purple-400">⚡</span> API Calls
      </h3>
      <div className="space-y-2">
        {apis.map((api, apiIndex) => (
          <div 
            key={apiIndex}
            className="bg-[#2A2B2D] p-3 rounded-lg text-sm font-mono border border-gray-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className={getApiStatusColor(api.status)}>
                {api.status === 'success' ? '✓' : '✗'}
              </span>
              <span className="text-gray-300">{api.name}</span>
            </div>
            <div className="flex items-center gap-4">
              {api.responseTime && (
                <span className="text-gray-500 text-xs">
                  {api.responseTime}ms
                </span>
              )}
              {api.error && (
                <span className="text-red-400 text-xs">
                  {api.error}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};