import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SUGGESTED_PROMPTS, COMING_SOON_FEATURES } from "@/data/suggestedPrompts";

interface AnimatedPhrasesProps {
  onPhraseClick: (command: string) => void;
}

export const AnimatedPhrases = ({ onPhraseClick }: AnimatedPhrasesProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <TooltipProvider>
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
                onClick={() => prompt.command && onPhraseClick(prompt.command)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm">{prompt.display}</span>
              </Button>
            );
          })}
          
          {COMING_SOON_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Tooltip key={`coming-soon-${index}`}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-left justify-start h-auto py-3 px-4 transition-all duration-200 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{feature.display}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};