import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiStatus } from "@/types/api";
import { supabase } from "@/integrations/supabase/client";

const ApiStatusDashboard = () => {
  const { data: apiStatuses, isLoading, error } = useQuery({
    queryKey: ['api-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-api-status');
      if (error) throw error;
      return data as Record<string, ApiStatus>;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: ApiStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'degraded':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'down':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatErrorMessage = (error: string) => {
    try {
      const parsedError = JSON.parse(error);
      if (parsedError.detail) {
        return parsedError.detail;
      }
      if (parsedError.message) {
        return parsedError.message;
      }
      if (error.includes('<!DOCTYPE html>')) {
        return 'Service unavailable';
      }
      return String(parsedError);
    } catch {
      if (error.includes('<!DOCTYPE html>')) {
        return 'Service unavailable';
      }
      return error;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1a1b1e]">
        <CardHeader>
          <CardTitle className="text-gray-100">API Status</CardTitle>
          <CardDescription className="text-gray-400">Loading API status information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#1a1b1e]">
        <CardHeader>
          <CardTitle className="text-gray-100">API Status</CardTitle>
          <CardDescription className="text-red-400">
            Error loading API status: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1b1e]">
      <CardHeader>
        <CardTitle className="text-gray-100">API Status</CardTitle>
        <CardDescription className="text-gray-400">Real-time status of integrated APIs</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {apiStatuses && Object.entries(apiStatuses).map(([name, status]) => (
              <div 
                key={name} 
                className="flex flex-col p-4 bg-[#1e1f23] rounded-lg border border-gray-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-100 capitalize">{name}</h3>
                    <Badge className={`${getStatusColor(status.status)} text-white`}>
                      {status.status}
                    </Badge>
                  </div>
                  {status.responseTime && (
                    <span className="text-sm text-gray-400">
                      {status.responseTime}ms
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-gray-500">
                    Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                  </p>
                  
                  {status.error && (
                    <p className="text-sm text-red-400">
                      {formatErrorMessage(status.error)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ApiStatusDashboard;