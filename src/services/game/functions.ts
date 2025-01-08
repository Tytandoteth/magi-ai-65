import {
  GameFunction,
  ExecutableGameFunctionResponse,
  ExecutableGameFunctionStatus,
} from "@virtuals-protocol/game";
import { supabase } from "@/integrations/supabase/client";
import { TokenService } from "@/services/token/TokenService";

export const fetchTokenDataFunction = new GameFunction({
  name: "fetch_token_data",
  description: "Fetch comprehensive data for a specific token",
  args: [
    { name: "symbol", type: "string", description: "The token symbol (e.g., ETH, BTC)" },
  ] as const,
  executable: async (args, logger) => {
    try {
      logger?.(`Fetching data for token: ${args.symbol}`);
      const tokenService = TokenService.getInstance();
      const tokenInfo = await tokenService.getTokenInfo(args.symbol);
      
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        tokenInfo
      );
    } catch (error) {
      console.error('Error in fetchTokenDataFunction:', error);
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to fetch token data: ${error.message}`
      );
    }
  },
});

export const getMarketAnalysisFunction = new GameFunction({
  name: "get_market_analysis",
  description: "Get current market analysis and trends",
  args: [] as const,
  executable: async (_, logger) => {
    try {
      logger?.('Fetching market analysis');
      const { data: marketData, error } = await supabase
        .from('defi_market_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const analysis = {
        totalMarketCap: marketData.reduce((sum, token) => sum + (token.market_cap || 0), 0),
        volume24h: marketData.reduce((sum, token) => sum + (token.total_volume || 0), 0),
        topMovers: marketData
          .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
          .slice(0, 3)
      };

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(analysis)
      );
    } catch (error) {
      console.error('Error in getMarketAnalysisFunction:', error);
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to get market analysis: ${error.message}`
      );
    }
  },
});

export const getCryptoNewsFunction = new GameFunction({
  name: "get_crypto_news",
  description: "Get latest crypto news and developments",
  args: [] as const,
  executable: async (_, logger) => {
    try {
      logger?.('Fetching crypto news');
      const { data: news, error } = await supabase
        .from('crypto_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(news)
      );
    } catch (error) {
      console.error('Error in getCryptoNewsFunction:', error);
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to fetch crypto news: ${error.message}`
      );
    }
  },
});