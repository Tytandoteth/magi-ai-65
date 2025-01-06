import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface MarketData {
  coin_id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  created_at: string;
}

export const MarketDataSection = () => {
  const { data: marketData, isLoading, error } = useQuery({
    queryKey: ["marketData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("defi_market_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as MarketData[];
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
        <p className="text-red-500">Error loading market data</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketData?.map((coin) => (
          <Card key={coin.coin_id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{coin.name}</h3>
                <p className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${coin.current_price.toLocaleString()}</p>
                <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};