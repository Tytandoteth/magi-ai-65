import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiStatus } from "@/types/api";
import { supabase } from "@/integrations/supabase/client";
import { StatusCard } from "./api-status/StatusCard";

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
              <StatusCard key={name} name={name} status={status} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ApiStatusDashboard;