import { GameWorker } from "@virtuals-protocol/game";
import { fetchTokenDataFunction, getMarketAnalysisFunction, getCryptoNewsFunction } from "./functions";

export const magiWorker = new GameWorker({
  id: "magi_defi_worker",
  name: "Magi DeFi Assistant",
  description: "A specialized worker for DeFi analysis and token information",
  functions: [
    fetchTokenDataFunction,
    getMarketAnalysisFunction,
    getCryptoNewsFunction
  ],
  getEnvironment: async () => ({
    supportedTokens: ["ETH", "BTC", "MAG", "PENGU"],
    dataProviders: ["CoinGecko", "DefiLlama", "Etherscan"],
    capabilities: [
      "token_analysis",
      "market_trends",
      "news_aggregation"
    ]
  }),
});