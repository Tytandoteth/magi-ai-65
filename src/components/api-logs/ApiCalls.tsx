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

  const getApiIcon = (apiName: string) => {
    switch (apiName.toLowerCase()) {
      case 'coingecko':
        return '🪙';
      case 'defillama':
        return '🦙';
      case 'twitter':
        return '🐦';
      case 'etherscan':
        return '⛓️';
      case 'market api':
        return '📊';
      default:
        return '🔄';
    }
  };

  const formatApiName = (name: string) => {
    // Capitalize first letter of each word
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <span className="text-purple-400">⚡</span> API Calls ({apis.length})
      </h3>
      <div className="space-y-2">
        {apis.map((api, apiIndex) => (
          <div 
            key={apiIndex}
            className="bg-[#2A2B2D] p-3 rounded-lg text-sm font-mono border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg" role="img" aria-label={api.name}>
                {getApiIcon(api.name)}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={getApiStatusColor(api.status)}>
                    {api.status === 'success' ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-300">{formatApiName(api.name)}</span>
                </div>
                {api.error && (
                  <span className="text-red-400 text-xs mt-1">
                    Error: {api.error}
                  </span>
                )}
              </div>
            </div>
            {api.responseTime && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Response time:</span>
                <span className={`${api.responseTime < 1000 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {api.responseTime}ms
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};