import { HelpCircle, Lightbulb, Info, List, MessageCircle, ArrowRightLeft, TrendingUp, Wallet } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Prompt {
  icon: LucideIcon;
  display: string;
  command?: string;
  tooltip?: string;
}

export const SUGGESTED_PROMPTS: Prompt[] = [
  {
    icon: HelpCircle,
    display: "Ask me about any token",
    command: "Tell me about $MAG"
  }
];

export const COMING_SOON_FEATURES: Prompt[] = [
  {
    icon: MessageCircle,
    display: "Ask me about recent crypto news",
    tooltip: "Coming soon"
  },
  {
    icon: Info,
    display: "Ask me what I think about the market",
    tooltip: "Coming soon"
  },
  {
    icon: List,
    display: "Ask me about DeFi protocols",
    tooltip: "Coming soon"
  },
  {
    icon: Lightbulb,
    display: "Ask me where to find the yields in DeFi",
    tooltip: "Coming soon"
  },
  {
    icon: ArrowRightLeft,
    display: "Move a token from my wallet to someone elses",
    tooltip: "Coming soon"
  },
  {
    icon: TrendingUp,
    display: "Go 10x long on $MAG",
    tooltip: "Coming soon"
  },
  {
    icon: Wallet,
    display: "Lend against Pudgy Penguins",
    tooltip: "Coming soon"
  }
];