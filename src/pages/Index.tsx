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
        ? `Found token in metadata: ${data.token_metadata[0].name}`
        : data.defi_llama?.[0]
        ? `Found in DeFi Llama: ${data.defi_llama[0].name}`
        : 'No direct matches found';

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
                  <h3 className="text-lg font-semibold">Test Results for PENGU</h3>
                  
                  {testResults.token_metadata?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Token Metadata:</h4>
                      <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                        {JSON.stringify(testResults.token_metadata[0], null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResults.defi_llama?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">DeFi Llama Data:</h4>
                      <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                        {JSON.stringify(testResults.defi_llama[0], null, 2)}
                      </pre>
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