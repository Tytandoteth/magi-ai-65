import { HelpCircle, Lightbulb, Info, List, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_PROMPTS = [
  {
    icon: HelpCircle,
    command: "Tell me about $MAG"
  },
  {
    icon: Lightbulb,
    command: "Show me the best DeFi strategies for high yield"
  },
  {
    icon: Info,
    command: "What's your analysis of the current market conditions?"
  },
  {
    icon: List,
    command: "What are the top DeFi protocols by TVL?"
  },
  {
    icon: MessageCircle,
    command: "What are the latest developments in crypto?"
  }
];

interface SuggestedPromptsProps {
  onPhraseClick: (command: string) => void;
}

export const SuggestedPrompts = ({ onPhraseClick }: SuggestedPromptsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTED_PROMPTS.map((prompt, index) => {
        const Icon = prompt.icon;
        return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-primary/80 transition-colors duration-200"
            onClick={() => onPhraseClick(prompt.command)}
          >
            <Icon className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[150px]">{prompt.command}</span>
          </Button>
        );
      })}
    </div>
  );
};