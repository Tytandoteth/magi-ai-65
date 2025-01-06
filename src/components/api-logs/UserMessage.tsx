import { Message } from "@/types/chat";

interface UserMessageProps {
  message: Message;
}

export const UserMessage = ({ message }: UserMessageProps) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <span className="text-blue-400">→</span> User Message
      </h3>
      <span className="text-xs text-gray-500">
        {message.timestamp.toString().split('T')[1].split('.')[0]}
      </span>
    </div>
    <div className="bg-[#2A2B2D] p-4 rounded-lg text-sm font-mono text-gray-300 border border-gray-800">
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  </div>
);