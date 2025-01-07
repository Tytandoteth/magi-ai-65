import { useState, useEffect } from "react";

const ANIMATED_PHRASES = [
  {
    display: "Ask me about any token",
    command: "Tell me about $MAG"
  },
  {
    display: "Ask me where to find the yields in DeFi",
    command: "Show me the best DeFi strategies for high yield"
  },
  {
    display: "Ask me what I think about the market",
    command: "What's your analysis of the current market conditions?"
  }
];

interface AnimatedPhrasesProps {
  onPhraseClick: (command: string) => void;
}

export const AnimatedPhrases = ({ onPhraseClick }: AnimatedPhrasesProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % ANIMATED_PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    onPhraseClick(ANIMATED_PHRASES[currentPhraseIndex].command);
  };

  return (
    <div 
      onClick={handleClick}
      className="text-center text-gray-500 cursor-pointer hover:text-primary transition-colors duration-300 animate-fade-in"
      key={currentPhraseIndex}
    >
      {ANIMATED_PHRASES[currentPhraseIndex].display}
    </div>
  );
};