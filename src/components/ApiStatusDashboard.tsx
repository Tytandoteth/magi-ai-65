import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiStatus } from "@/types/api";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        return 'bg-green-500 hover:bg-green-600';
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
      // Try to parse JSON error message
      const parsedError = JSON.parse(error);
      if (parsedError.detail) {
        return parsedError.detail;
      }
      if (parsedError.message) {
        return parsedError.message;
      }
      // If it's HTML, return a generic message
      if (error.includes('<!DOCTYPE html>')) {
        return 'Service unavailable';
      }
      return String(parsedError);
    } catch {
      // If not JSON, clean up HTML content
      if (error.includes('<!DOCTYPE html>')) {
        return 'Service unavailable';
      }
      return error;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>Loading API status information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription className="text-red-500">
            Error loading API status: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Status</CardTitle>
        <CardDescription>Real-time status of integrated APIs</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {apiStatuses && Object.entries(apiStatuses).map(([name, status]) => (
              <div 
                key={name} 
                className="flex flex-col space-y-2 p-4 bg-secondary rounded-lg border border-secondary-foreground/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium capitalize">{name}</h3>
                    <Badge className={getStatusColor(status.status)}>
                      {status.status}
                    </Badge>
                  </div>
                  {status.responseTime && (
                    <span className="text-sm text-muted-foreground">
                      {status.responseTime}ms
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                </p>
                
                {status.error && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <p className="text-sm text-destructive">
                      {formatErrorMessage(status.error)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ApiStatusDashboard;