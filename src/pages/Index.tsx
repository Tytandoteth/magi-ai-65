import { useChat } from "@/hooks/use-chat";
import { ChatContainer } from "@/components/ChatContainer";
import { ApiLogs } from "@/components/ApiLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { chatState, apiLogs, handleSendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <Tabs defaultValue="chat" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="logs">API Logs</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Index;