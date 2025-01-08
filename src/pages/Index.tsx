import React, { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatContainer } from "@/components/ChatContainer";
import { ApiLogs } from "@/components/ApiLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiStatusDashboard from "@/components/ApiStatusDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HeaderLogo } from "@/components/header/HeaderLogo";
import { ActionButtons } from "@/components/header/ActionButtons";
import { UpdateDataButton } from "@/components/header/UpdateDataButton";

const Index: React.FC = () => {
  const { chatState, apiLogs, handleSendMessage } = useChat();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleFetchTokens = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-top-tokens');
      
      if (error) {
        console.error('Error fetching tokens:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch token data. Please try again.",
        });
        return;
      }

      console.log('Tokens fetched successfully:', data);
      const summary = data;
      
      toast({
        title: "Success",
        description: `Updated ${summary.processed.marketData} market data entries and added ${summary.processed.tokenMetadata} new tokens. (${summary.existingTokens} tokens already in database)`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching token data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestToken = async () => {
    try {
      setIsTestingToken(true);
      setTestResults(null);
      console.log('Testing token endpoint with PENGU');
      
      const { data, error } = await supabase.functions.invoke('test-token', {
        body: { symbol: 'PENGU' }
      });

      if (error) {
        console.error('Error testing token:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to test token endpoint. Please try again.",
        });
        return;
      }

      console.log('Token test results:', data);
      setTestResults(data);
      
      const resultSummary = data.token_metadata?.[0] 
        ? `Found exact match: ${data.token_metadata[0].name} ($${data.token_metadata[0].market_data?.current_price?.usd?.toFixed(4)})`
        : data.defi_llama?.[0]
        ? `Found related protocol: ${data.defi_llama[0].name}`
        : 'No matches found';

      toast({
        title: "Test Results",
        description: resultSummary,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while testing the token endpoint.",
      });
    } finally {
      setIsTestingToken(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
        <HeaderLogo />

        <ErrorBoundary>
          <Tabs defaultValue="chat" className="flex-1 w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="mb-0">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="logs">API Logs</TabsTrigger>
                <TabsTrigger value="status">API Status</TabsTrigger>
                <TabsTrigger value="test">Test Results</TabsTrigger>
              </TabsList>

              <ActionButtons 
                onTestToken={handleTestToken}
                isTestingToken={isTestingToken}
              />
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <ChatContainer 
                chatState={chatState}
                onSendMessage={handleSendMessage}
              />
            </TabsContent>
            
            <TabsContent value="logs" className="flex-1 flex flex-col mt-0">
              <div className="chat-container flex-1">
                <ApiLogs logs={apiLogs} />
              </div>
            </TabsContent>

            <TabsContent value="status" className="flex-1 flex flex-col mt-0">
              <ApiStatusDashboard />
            </TabsContent>

            <TabsContent value="test" className="flex-1 flex flex-col mt-0">
              {testResults ? (
                <div className="rounded-lg border p-4 space-y-4">
                  <h3 className="text-lg font-semibold">Test Results for {testResults.query.original}</h3>
                  
                  {testResults.token_metadata?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">✓ Exact Token Match Found:</h4>
                      <div className="bg-muted p-4 rounded">
                        <div className="flex items-center gap-4 mb-4">
                          {testResults.token_metadata[0].metadata?.image && (
                            <img 
                              src={testResults.token_metadata[0].metadata.image} 
                              alt={testResults.token_metadata[0].name}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <div>
                            <h5 className="font-semibold">{testResults.token_metadata[0].name} ({testResults.token_metadata[0].symbol})</h5>
                            <p className="text-sm text-muted-foreground">
                              Market Cap Rank: #{testResults.token_metadata[0].metadata?.additional_metrics?.market_cap_rank || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="font-medium">${testResults.token_metadata[0].market_data?.current_price?.usd?.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">24h Change</p>
                            <p className={`font-medium ${testResults.token_metadata[0].market_data?.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {testResults.token_metadata[0].market_data?.price_change_percentage_24h?.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Market Cap</p>
                            <p className="font-medium">${(testResults.token_metadata[0].market_data?.market_cap?.usd / 1e6).toFixed(2)}M</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">24h Volume</p>
                            <p className="font-medium">${(testResults.token_metadata[0].market_data?.total_volume?.usd / 1e6).toFixed(2)}M</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Raw Data:</p>
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(testResults.token_metadata[0], null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {testResults.defi_llama?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-600">ℹ️ Related DeFi Protocol Found:</h4>
                      <div className="bg-muted p-4 rounded">
                        <div className="flex items-center gap-4 mb-4">
                          {testResults.defi_llama[0].raw_data?.logo && (
                            <img 
                              src={testResults.defi_llama[0].raw_data.logo} 
                              alt={testResults.defi_llama[0].name}
                              className="w-12 h-12 rounded-full"
                            />
                          )}
                          <div>
                            <h5 className="font-semibold">{testResults.defi_llama[0].name} ({testResults.defi_llama[0].symbol})</h5>
                            <p className="text-sm text-muted-foreground">Category: {testResults.defi_llama[0].category}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">TVL</p>
                            <p className="font-medium">${testResults.defi_llama[0].tvl.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">24h Change</p>
                            <p className={`font-medium ${testResults.defi_llama[0].change_1d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {testResults.defi_llama[0].change_1d?.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Raw Data:</p>
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(testResults.defi_llama[0], null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Query Details:</h4>
                    <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(testResults.query, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click the "Test Token" button to see results here
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ErrorBoundary>

        <UpdateDataButton 
          onUpdate={handleFetchTokens}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;