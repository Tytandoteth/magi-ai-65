import { cn } from "@/lib/utils";

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="bg-[#2A2B2D] text-gray-100 rounded-lg px-4 py-3 border border-gray-700 relative">
        <div className="absolute -left-1 -top-6 text-sm text-gray-400">
          Magi
        </div>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};