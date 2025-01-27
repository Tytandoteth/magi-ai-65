import { useState } from "react";
import { HelpCircle, Lightbulb, Info, List, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_PROMPTS = [
  {
    icon: HelpCircle,
    display: "Ask me about any token",
    command: "Tell me about $MAG"
  },
  {
    icon: Lightbulb,
    display: "Ask me where to find the yields in DeFi",
    command: "Show me the best DeFi strategies for high yield"
  },
  {
    icon: Info,
    display: "Ask me what I think about the market",
    command: "What's your analysis of the current market conditions?"
  },
  {
    icon: List,
    display: "Ask me about DeFi protocols",
    command: "What are the top DeFi protocols by TVL?"
  },
  {
    icon: MessageCircle,
    display: "Ask me about recent crypto news",
    command: "What are the latest developments in crypto?"
  }
];

interface AnimatedPhrasesProps {
  onPhraseClick: (command: string) => void;
}

export const AnimatedPhrases = ({ onPhraseClick }: AnimatedPhrasesProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3 items-center justify-center p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Not sure what to ask? Try these:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTED_PROMPTS.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className={`flex items-center gap-2 text-left justify-start h-auto py-3 px-4 transition-all duration-200 ${
                hoveredIndex === index 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-400 hover:text-primary/80'
              }`}
              onClick={() => onPhraseClick(prompt.command)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm">{prompt.display}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};