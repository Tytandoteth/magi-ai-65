import {
  GameFunction,
  ExecutableGameFunctionResponse,
  ExecutableGameFunctionStatus,
} from "@virtuals-protocol/game";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch token information
export const fetchTokenInfoFunction = new GameFunction({
  name: "fetch_token_info",
  description: "Fetch detailed information about a specific token",
  args: [
    { name: "symbol", type: "string", description: "Token symbol (e.g., ETH, BTC)" },
  ] as const,
  executable: async (args, logger) => {
    try {
      logger(`Fetching token info for ${args.symbol}`);
      
      const { data, error } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('symbol', args.symbol.toUpperCase())
        .single();

      if (error) throw error;

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(data)
      );
    } catch (e) {
      logger(`Error fetching token info: ${e.message}`);
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to fetch token info: ${e.message}`
      );
    }
  },
});

// Function to get market analysis
export const getMarketAnalysisFunction = new GameFunction({
  name: "get_market_analysis",
  description: "Get current market analysis and trends",
  args: [] as const,
  executable: async (_, logger) => {
    try {
      logger('Fetching market analysis');
      
      const { data, error } = await supabase
        .from('defi_market_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(data)
      );
    } catch (e) {
      logger(`Error fetching market analysis: ${e.message}`);
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to get market analysis: ${e.message}`
      );
    }
  },
});

// Function to get latest crypto news
export const getCryptoNewsFunction = new GameFunction({
  name: "get_crypto_news",
  description: "Get latest cryptocurrency news and updates",
  args: [] as const,
  executable: async (_, logger) => {
    try {
      logger('Fetching crypto news');
      
      const { data, error } = await supabase
        .from('crypto_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Done,
        JSON.stringify(data)
      );
    } catch (e) {
      logger(`Error fetching crypto news: ${e.message}`);
      return new ExecutableGameFunctionResponse(
        ExecutableGameFunctionStatus.Failed,
        `Failed to get crypto news: ${e.message}`
      );
    }
  },
});