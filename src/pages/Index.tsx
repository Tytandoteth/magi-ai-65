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
      toast({
        title: "Test Results",
        description: "Check the console for detailed token resolution results",
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