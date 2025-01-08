import { GameAgent } from "@virtuals-protocol/game";
import { magiWorker } from "./worker";

export const createMagiAgent = (apiKey: string) => {
  const agent = new GameAgent(apiKey, {
    name: "Magi",
    goal: "Provide accurate and helpful DeFi and cryptocurrency insights",
    description: "An AI assistant specialized in DeFi analysis and market insights",
    workers: [magiWorker],
    getAgentState: async () => {
      return {
        agent_type: "defi_assistant",
        capabilities: [
          "token_analysis",
          "market_insights",
          "news_aggregation"
        ],
        context_window: 4096
      };
    },
  });

  // Add custom logging
  agent.setLogger(agent, (msg) => {
    console.log(`[Magi Agent] ${msg}`);
  });

  return agent;
};