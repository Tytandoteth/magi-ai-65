import React from "react";
import { SaveAll } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TokenMatchCard } from "./components/TokenMatchCard";
import { DefiProtocolCard } from "./components/DefiProtocolCard";
import { supabase } from "@/integrations/supabase/client";

interface TokenTestResultsProps {
  testResults: any;
}

export const TokenTestResults: React.FC<TokenTestResultsProps> = ({ testResults }) => {
  const { toast } = useToast();
  const [magData, setMagData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchMagData = async () => {
      if (testResults?.query?.normalized === 'MAG') {
        console.log('Fetching MAG token analytics data...');
        const { data, error } = await supabase
          .from('mag_token_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching MAG data:', error);
          return;
        }

        console.log('Fetched MAG data:', data);
        setMagData(data);
      }
    };

    fetchMagData();
  }, [testResults]);

  const handleCopyAllLogs = async () => {
    try {
      const logsContent = JSON.stringify(testResults, null, 2);
      await navigator.clipboard.writeText(logsContent);
      toast({
        title: "Success",
        description: "Test results have been copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy test results to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!testResults) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Click the "Test Token" button to see results here
      </div>
    );
  }

  // Override the query to always test MAG token
  testResults.query = {
    ...testResults.query,
    original: "MAG",
    normalized: "MAG"
  };

  // Enhance token metadata with MAG data if available
  const enhancedTokenMetadata = testResults.token_metadata?.[0] ? {
    ...testResults.token_metadata[0],
    market_data: magData ? {
      current_price: { usd: magData.price },
      market_cap: { usd: magData.market_cap },
      total_volume: { usd: magData.volume_24h },
      price_change_percentage_24h: 0 // We'll need to calculate this from historical data
    } : testResults.token_metadata[0].market_data,
    metadata: {
      ...testResults.token_metadata[0].metadata,
      additional_metrics: {
        ...testResults.token_metadata[0].metadata?.additional_metrics,
        holders_count: magData?.holders_count || 0,
        transactions_24h: magData?.transactions_24h || 0
      }
    }
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Test Results for {testResults.query.original}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAllLogs}
          className="text-gray-400 hover:text-gray-300"
        >
          <SaveAll className="mr-2" />
          Copy All Results
        </Button>
      </div>
      
      {enhancedTokenMetadata && (
        <TokenMatchCard tokenData={enhancedTokenMetadata} />
      )}

      {testResults.defi_llama?.length > 0 && (
        <DefiProtocolCard protocolData={testResults.defi_llama[0]} />
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