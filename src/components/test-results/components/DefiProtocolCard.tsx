import React from "react";
import { Coins, LineChart, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";

interface DefiProtocolCardProps {
  protocolData: any;
}

export const DefiProtocolCard: React.FC<DefiProtocolCardProps> = ({ protocolData }) => {
  return (
    <Card className="p-6 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-yellow-600 font-medium">
          <Coins className="h-5 w-5" />
          <span>Related DeFi Protocol Found</span>
        </div>
        
        <div className="flex items-center gap-4">
          {protocolData.raw_data?.logo && (
            <img 
              src={protocolData.raw_data.logo} 
              alt={protocolData.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h4 className="text-lg font-semibold">
              {protocolData.name} ({protocolData.symbol})
            </h4>
            <p className="text-sm text-muted-foreground">
              Category: {protocolData.category}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            icon={<Wallet className="h-4 w-4" />}
            label="TVL"
            value={`$${protocolData.tvl.toLocaleString()}`}
          />
          <MetricCard
            icon={<LineChart className="h-4 w-4" />}
            label="24h Change"
            value={`${protocolData.change_1d?.toFixed(2)}%`}
            trend={protocolData.change_1d >= 0 ? 'up' : 'down'}
          />
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            View Raw Data
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {JSON.stringify(protocolData, null, 2)}
          </pre>
        </details>
      </div>
    </Card>
  );
};