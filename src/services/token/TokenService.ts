import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";

export class TokenService {
  private static instance: TokenService;
  private tokenRepository: TokenRepository;
  private tokenFormatter: TokenFormatter;
  private tokenOperations: TokenOperations;

  constructor() {
    console.log('[TokenService] Initializing service');
    this.tokenRepository = new TokenRepository();
    this.tokenFormatter = new TokenFormatter();
    this.tokenOperations = new TokenOperations();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      console.log('[TokenService] Creating new instance');
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async getTokenInfo(symbol: string): Promise<string> {
    console.log('[TokenService] Getting token info for:', symbol);
    const startTime = performance.now();
    
    try {
      // Special handling for MAG token
      if (symbol.toUpperCase() === 'MAG') {
        console.log('[TokenService] Detected MAG token, using specialized flow');
        const { data: magData, error } = await supabase
          .from('mag_token_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[TokenService] Error fetching MAG data:', error);
          throw new Error(`Failed to fetch MAG data: ${error.message}`);
        }

        if (!magData) {
          console.log('[TokenService] No MAG token data found in database');
          return `🤔 Hmm, I couldn't find current MAG token data. This could be because:
1. The data hasn't been updated recently
2. There might be an issue with our data provider
3. The token information is temporarily unavailable

Let's try again in a bit!`;
        }

        console.log('[TokenService] Successfully fetched MAG data:', {
          price: magData.price,
          marketCap: magData.market_cap,
          holders: magData.holders_count,
          timestamp: magData.created_at
        });

        return `🪄 Magnify (MAG) Snapshot

💵 Price: $${magData.price?.toLocaleString() ?? 'N/A'}
🌍 Market Cap: $${magData.market_cap?.toLocaleString() ?? 'N/A'}
📈 Circulating Supply: ${magData.circulating_supply?.toLocaleString() ?? 'N/A'} MAG / ${magData.total_supply?.toLocaleString() ?? 'N/A'} MAG
👥 Holders: ${magData.holders_count?.toLocaleString() ?? 'N/A'}
🔄 Transactions (24h): ${magData.transactions_24h?.toLocaleString() ?? 'N/A'}
💹 Volume (24h): $${magData.volume_24h?.toLocaleString() ?? 'N/A'}

Magnify isn't just a token; it's a movement. Powered by AI, it brings real-time market insights and automated financial guidance to the DeFi space.`;
      }

      // For other tokens, fetch from token_metadata
      const { data: tokenData, error } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch token data: ${error.message}`);
      }

      if (!tokenData) {
        return `I couldn't find information about ${symbol}. This token might be new, unlisted, or not tracked by major platforms.`;
      }

      let response = `📊 ${tokenData.name} (${tokenData.symbol}) Analysis\n\n`;

      if (tokenData.market_data) {
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
      console.error('[TokenService] Error in getTokenInfo:', error);
      throw error;
    }
  }
}