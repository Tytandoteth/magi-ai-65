import React from "react";
import { Coins, DollarSign, LineChart, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";

interface TokenMatchCardProps {
  tokenData: any;
}

export const TokenMatchCard: React.FC<TokenMatchCardProps> = ({ tokenData }) => {
  return (
    <Card className="p-6 border-green-200 bg-green-50/50 dark:bg-green-950/10">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <Coins className="h-5 w-5" />
          <span>Exact Token Match Found</span>
        </div>
        
        <div className="flex items-center gap-4">
          {tokenData.metadata?.image && (
            <img 
              src={tokenData.metadata.image} 
              alt={tokenData.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h4 className="text-lg font-semibold">
              {tokenData.name} ({tokenData.symbol})
            </h4>
            <p className="text-sm text-muted-foreground">
              Market Cap Rank: #{tokenData.metadata?.additional_metrics?.market_cap_rank || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Price"
            value={`$${tokenData.market_data?.current_price?.usd?.toFixed(4)}`}
          />
          <MetricCard
            icon={<LineChart className="h-4 w-4" />}
            label="24h Change"
            value={`${tokenData.market_data?.price_change_percentage_24h?.toFixed(2)}%`}
            trend={tokenData.market_data?.price_change_percentage_24h >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4" />}
            label="Market Cap"
            value={`$${(tokenData.market_data?.market_cap?.usd / 1e6).toFixed(2)}M`}
          />
          <MetricCard
            icon={<LineChart className="h-4 w-4" />}
            label="24h Volume"
            value={`$${(tokenData.market_data?.total_volume?.usd / 1e6).toFixed(2)}M`}
          />
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            View Raw Data
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {JSON.stringify(tokenData, null, 2)}
          </pre>
        </details>
      </div>
    </Card>
  );
};