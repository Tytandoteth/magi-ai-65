import React from "react";
import { Coins, DollarSign, LineChart, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";

interface TokenMatchCardProps {
  tokenData: any;
}

export const TokenMatchCard: React.FC<TokenMatchCardProps> = ({ tokenData }) => {
  // Special handling for MAG token
  const isMagToken = tokenData.symbol?.toUpperCase() === 'MAG';
  
  // Format market data values
  const formatValue = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  const getMarketData = () => {
    if (isMagToken) {
      // Try to get latest MAG analytics data
      const marketData = tokenData.market_data || {};
      return {
        price: marketData.current_price?.usd || 0,
        marketCap: marketData.market_cap?.usd || 0,
        volume: marketData.total_volume?.usd || 0,
        priceChange: marketData.price_change_percentage_24h || 0
      };
    }
    
    // Default market data handling
    return {
      price: tokenData.market_data?.current_price?.usd || 0,
      marketCap: tokenData.market_data?.market_cap?.usd || 0,
      volume: tokenData.market_data?.total_volume?.usd || 0,
      priceChange: tokenData.market_data?.price_change_percentage_24h || 0
    };
  };

  const marketData = getMarketData();

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
            value={`$${formatValue(marketData.price)}`}
          />
          <MetricCard
            icon={<LineChart className="h-4 w-4" />}
            label="24h Change"
            value={`${formatValue(marketData.priceChange)}%`}
            trend={marketData.priceChange >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            icon={<Wallet className="h-4 w-4" />}
            label="Market Cap"
            value={`$${(marketData.marketCap / 1e6).toFixed(2)}M`}
          />
          <MetricCard
            icon={<LineChart className="h-4 w-4" />}
            label="24h Volume"
            value={`$${(marketData.volume / 1e6).toFixed(2)}M`}
          />
        </div>

        {isMagToken && tokenData.metadata?.additional_metrics && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h5 className="font-medium mb-2">Additional Metrics</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Holders:</span>
                <p className="font-medium">{tokenData.metadata.additional_metrics.holders_count?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">24h Transactions:</span>
                <p className="font-medium">{tokenData.metadata.additional_metrics.transactions_24h?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        )}

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