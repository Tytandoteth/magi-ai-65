import React from "react";
import { ArrowDown, ArrowUp, Coins, DollarSign, LineChart, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TokenTestResultsProps {
  testResults: any;
}

export const TokenTestResults: React.FC<TokenTestResultsProps> = ({ testResults }) => {
  if (!testResults) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Click the "Test Token" button to see results here
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        Test Results for {testResults.query.original}
      </h3>
      
      {testResults.token_metadata?.length > 0 && (
        <Card className="p-6 border-green-200 bg-green-50/50 dark:bg-green-950/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Coins className="h-5 w-5" />
              <span>Exact Token Match Found</span>
            </div>
            
            <div className="flex items-center gap-4">
              {testResults.token_metadata[0].metadata?.image && (
                <img 
                  src={testResults.token_metadata[0].metadata.image} 
                  alt={testResults.token_metadata[0].name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h4 className="text-lg font-semibold">
                  {testResults.token_metadata[0].name} ({testResults.token_metadata[0].symbol})
                </h4>
                <p className="text-sm text-muted-foreground">
                  Market Cap Rank: #{testResults.token_metadata[0].metadata?.additional_metrics?.market_cap_rank || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={<DollarSign className="h-4 w-4" />}
                label="Price"
                value={`$${testResults.token_metadata[0].market_data?.current_price?.usd?.toFixed(4)}`}
              />
              <MetricCard
                icon={<LineChart className="h-4 w-4" />}
                label="24h Change"
                value={`${testResults.token_metadata[0].market_data?.price_change_percentage_24h?.toFixed(2)}%`}
                trend={testResults.token_metadata[0].market_data?.price_change_percentage_24h >= 0 ? 'up' : 'down'}
              />
              <MetricCard
                icon={<Wallet className="h-4 w-4" />}
                label="Market Cap"
                value={`$${(testResults.token_metadata[0].market_data?.market_cap?.usd / 1e6).toFixed(2)}M`}
              />
              <MetricCard
                icon={<LineChart className="h-4 w-4" />}
                label="24h Volume"
                value={`$${(testResults.token_metadata[0].market_data?.total_volume?.usd / 1e6).toFixed(2)}M`}
              />
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                View Raw Data
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                {JSON.stringify(testResults.token_metadata[0], null, 2)}
              </pre>
            </details>
          </div>
        </Card>
      )}

      {testResults.defi_llama?.length > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-600 font-medium">
              <Coins className="h-5 w-5" />
              <span>Related DeFi Protocol Found</span>
            </div>
            
            <div className="flex items-center gap-4">
              {testResults.defi_llama[0].raw_data?.logo && (
                <img 
                  src={testResults.defi_llama[0].raw_data.logo} 
                  alt={testResults.defi_llama[0].name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h4 className="text-lg font-semibold">
                  {testResults.defi_llama[0].name} ({testResults.defi_llama[0].symbol})
                </h4>
                <p className="text-sm text-muted-foreground">
                  Category: {testResults.defi_llama[0].category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<Wallet className="h-4 w-4" />}
                label="TVL"
                value={`$${testResults.defi_llama[0].tvl.toLocaleString()}`}
              />
              <MetricCard
                icon={<LineChart className="h-4 w-4" />}
                label="24h Change"
                value={`${testResults.defi_llama[0].change_1d?.toFixed(2)}%`}
                trend={testResults.defi_llama[0].change_1d >= 0 ? 'up' : 'down'}
              />
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                View Raw Data
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                {JSON.stringify(testResults.defi_llama[0], null, 2)}
              </pre>
            </details>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h4 className="font-medium mb-2">Query Details</h4>
        <pre className="bg-muted p-2 rounded text-sm overflow-auto">
          {JSON.stringify(testResults.query, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, trend }) => {
  const getTrendColor = () => {
    if (!trend) return 'text-foreground';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-3 bg-background rounded-lg border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className={`font-medium flex items-center gap-1 ${getTrendColor()}`}>
        {value}
        {trend && (
          trend === 'up' ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
};