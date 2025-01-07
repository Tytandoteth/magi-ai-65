import { Message } from "@/types/chat";
import { LogEntry } from "./api-logs/LogEntry";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SaveAll } from "lucide-react";

interface ApiLog {
  timestamp: Date;
  request: {
    messages: Message[];
    apis?: {
      name: string;
      status: 'success' | 'error';
      responseTime?: number;
      error?: string;
    }[];
  };
  response?: {
    content: string;
  };
  error?: string;
}

interface ApiLogsProps {
  logs: ApiLog[];
}

export const ApiLogs = ({ logs }: ApiLogsProps) => {
  const { toast } = useToast();

  const handleCopyAllLogs = async () => {
    try {
      const logsContent = JSON.stringify(logs, null, 2);
      await navigator.clipboard.writeText(logsContent);
      toast({
        title: "Success",
        description: "All logs have been copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy logs to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {logs.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAllLogs}
            className="text-gray-400 hover:text-gray-300"
          >
            <SaveAll className="mr-2" />
            Capture All Logs
          </Button>
        </div>
      )}
      <div className="space-y-6">
        {logs.map((log, index) => (
          <LogEntry key={index} log={log} index={index} />
        ))}
      </div>
    </div>
  );
};