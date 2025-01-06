import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface MagAnalytics {
  price: number;
  total_supply: number;
  circulating_supply: number;
  holders_count: number;
  transactions_24h: number;
  volume_24h: number;
  market_cap: number;
  created_at: string;
}

export const MagAnalyticsSection = () => {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["magAnalytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mag_token_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data[0] as MagAnalytics;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Error loading MAG analytics</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
        <p className="text-2xl font-bold">${analyticsData?.price?.toFixed(4)}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
        <p className="text-2xl font-bold">${analyticsData?.market_cap?.toLocaleString()}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
        <p className="text-2xl font-bold">${analyticsData?.volume_24h?.toLocaleString()}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Holders</h3>
        <p className="text-2xl font-bold">{analyticsData?.holders_count?.toLocaleString()}</p>
      </Card>

      <Card className="p-6 col-span-full">
        <h3 className="text-lg font-semibold mb-4">Supply Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                {
                  name: "Total Supply",
                  value: analyticsData?.total_supply,
                },
                {
                  name: "Circulating Supply",
                  value: analyticsData?.circulating_supply,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};