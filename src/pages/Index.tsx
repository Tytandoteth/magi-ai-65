import { useChat } from "@/hooks/use-chat";
import { ChatContainer } from "@/components/ChatContainer";
import { ApiLogs } from "@/components/ApiLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiStatusDashboard from "@/components/ApiStatusDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  const { chatState, apiLogs, handleSendMessage } = useChat();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <img 
            src="/lovable-uploads/c59be568-ac29-4c04-ac17-49fce02a6865.png" 
            alt="Magi Mascot" 
            className="w-24 h-24 animate-bounce-slow"
          />
          <h1 className="text-2xl font-bold text-primary">Magi Terminal V1</h1>
          <p className="text-muted-foreground">Your AI-Powered DeFi Assistant</p>
        </div>

        <ErrorBoundary>
          <Tabs defaultValue="chat" className="flex-1 w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="logs">API Logs</TabsTrigger>
              <TabsTrigger value="status">API Status</TabsTrigger>
            </TabsList>
            
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
      </div>
    </div>
  );
};

export default Index;