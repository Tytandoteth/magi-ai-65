import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
        <div className="space-y-4">
          {apiStatuses && Object.entries(apiStatuses).map(([name, status]) => (
            <div key={name} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                </p>
                {status.error && (
                  <p className="text-sm text-red-400 mt-1">{status.error}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {status.responseTime && (
                  <span className="text-sm text-muted-foreground">
                    {status.responseTime}ms
                  </span>
                )}
                <Badge className={getStatusColor(status.status)}>
                  {status.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusDashboard;