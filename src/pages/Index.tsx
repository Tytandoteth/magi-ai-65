import React, { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatContainer } from "@/components/ChatContainer";
import { ApiLogs } from "@/components/ApiLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiStatusDashboard from "@/components/ApiStatusDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Wallet } from "lucide-react";

const Index: React.FC = () => {
  const { chatState, apiLogs, handleSendMessage } = useChat();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img 
            src="/lovable-uploads/c59be568-ac29-4c04-ac17-49fce02a6865.png" 
            alt="Magi Mascot" 
            className="w-24 h-24 animate-bounce-slow"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FFDEE2] via-[#D3E4FD] to-[#FFDEE2] animate-gradient-flow text-transparent bg-clip-text">
            Magi Terminal V1
          </h1>
          <p className="text-muted-foreground">Your AI-Powered DeFi Assistant</p>
          <span className="text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors duration-300 mt-1 tracking-wide">
            Powered by <a 
              href="https://www.coingecko.com/en/coins/magnify-cash" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-300"
            >
              $MAG
            </a>
          </span>
        </div>

        <ErrorBoundary>
          <Tabs defaultValue="chat" className="flex-1 w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="mb-0">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="logs">API Logs</TabsTrigger>
                <TabsTrigger value="status">API Status</TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-[#9b87f5]/80 via-[#7E69AB]/80 to-[#D6BCFA]/80 text-white/90 hover:opacity-100 transition-opacity duration-200 text-xs px-3 py-1"
                disabled
              >
                <Wallet className="mr-1 h-3 w-3" />
                Connect Wallet (Coming Soon)
              </Button>
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

        <Button 
          onClick={handleFetchTokens}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="fixed bottom-2 right-2 opacity-30 hover:opacity-100 transition-opacity duration-200 text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Data'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Index;