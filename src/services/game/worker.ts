import { GameWorker } from "@virtuals-protocol/game";
import { 
  fetchTokenInfoFunction, 
  getMarketAnalysisFunction,
  getCryptoNewsFunction 
} from "./functions";

export const magiWorker = new GameWorker({
  id: "magi_main_worker",
  name: "Magi DeFi Assistant",
  description: "A specialized worker for DeFi and cryptocurrency analysis",
  functions: [
    fetchTokenInfoFunction,
    getMarketAnalysisFunction,
    getCryptoNewsFunction
  ],
  getEnvironment: async () => {
    return {
      max_tokens: 500,
      response_format: "detailed",
      include_market_context: true
    };
  },
});