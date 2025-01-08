import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";
import { isMarketData } from "@/types/market";
import { TokenResolver } from "./TokenResolver";

export class TokenInfoService {
  private static instance: TokenInfoService;
  private tokenRepository: TokenRepository;
  private tokenFormatter: TokenFormatter;
  private tokenOperations: TokenOperations;

  constructor() {
    this.tokenRepository = new TokenRepository();
    this.tokenFormatter = new TokenFormatter();
    this.tokenOperations = new TokenOperations();
  }

  public static getInstance(): TokenInfoService {
    if (!TokenInfoService.instance) {
      console.log('[TokenInfoService] Creating new instance');
      TokenInfoService.instance = new TokenInfoService();
    }
    return TokenInfoService.instance;
  }

  async getTokenInfo(input: string): Promise<string> {
    console.log('[TokenInfoService] Getting token info for:', input);
    const startTime = performance.now();
    
    try {
      // Resolve the token symbol using the enhanced resolver
      const resolvedSymbol = await TokenResolver.resolveTokenSymbol(input);
      console.log('[TokenInfoService] Resolved symbol:', resolvedSymbol);

      if (!resolvedSymbol) {
        return `I couldn't find information about "${input}". This might be because:
1. The token symbol is misspelled
2. The token is not yet tracked in our system
3. You might want to try using the full name or ticker symbol

Try using a dollar sign before the token symbol (e.g. $ETH for Ethereum) or provide more context about the token you're interested in.`;
      }

      // Special handling for MAG token
      if (resolvedSymbol.toUpperCase() === 'MAG') {
        const { data: magData, error } = await supabase
          .from('mag_token_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('[TokenInfoService] Error fetching MAG data:', error);
          throw new Error(`Failed to fetch MAG data: ${error.message}`);
        }

        if (!magData) {
          return `I couldn't find current MAG token data. This could be because:
1. The data hasn't been updated recently
2. There might be an issue with our data provider
3. The token information is temporarily unavailable

Please try again in a few moments.`;
        }

        return `Here are the current metrics for Magnify (MAG):

Current Price: $${magData.price?.toFixed(6)}
Market Cap: $${magData.market_cap?.toLocaleString()}
Total Supply: ${magData.total_supply?.toLocaleString()} MAG
Circulating Supply: ${magData.circulating_supply?.toLocaleString()} MAG
Holders: ${magData.holders_count?.toLocaleString()}
24h Transactions: ${magData.transactions_24h?.toLocaleString()}
24h Volume: $${magData.volume_24h?.toLocaleString()}

Magnify is a DeFAI (Decentralized Finance Augmented by Intelligence) protocol that leverages artificial intelligence to provide real-time market insights and automated financial guidance.

IMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;
      }

      // For other tokens, fetch from token_metadata
      const { data: tokenData, error } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('symbol', resolvedSymbol.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch token data: ${error.message}`);
      }

      if (!tokenData) {
        return `I couldn't find detailed information about ${resolvedSymbol}. This token might be new, unlisted, or not tracked by major platforms.`;
      }

      let response = `📊 ${tokenData.name} (${tokenData.symbol}) Analysis\n\n`;

      if (tokenData.market_data && isMarketData(tokenData.market_data)) {
        const marketData = tokenData.market_data;
        if (marketData.current_price?.usd) {
          response += `💵 Price: $${marketData.current_price.usd.toLocaleString()}\n`;
        }
        if (marketData.market_cap?.usd) {
          response += `🌍 Market Cap: $${marketData.market_cap.usd.toLocaleString()}\n`;
        }
        if (marketData.total_volume?.usd) {
          response += `💹 24h Volume: $${marketData.total_volume.usd.toLocaleString()}\n`;
        }
        if (marketData.price_change_percentage_24h) {
          response += `📈 24h Change: ${marketData.price_change_percentage_24h.toFixed(2)}%\n`;
        }
      }

      if (tokenData.description) {
        response += `\n${tokenData.description}\n`;
      }

      return response;
    } catch (error) {
      console.error('[TokenInfoService] Error in getTokenInfo:', error);
      throw error;
    }
  }
}