import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";
import { isMarketData } from "@/types/market";

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
        console.log('[TokenService] Detected MAG token, using hardcoded data');
        
        const magData = {
          price: 0.001288,
          market_cap: 991698,
          total_supply: 880000000,
          circulating_supply: 769755726,
          volume_24h: 15551.84,
          price_change_24h: 1.3,
          holders_count: 4012,
          transactions_24h: 250 // Keeping this as is since not provided in new data
        };

        return `🪄 Magnify (MAG) Snapshot

💵 Price: $${magData.price.toFixed(6)}
🌍 Market Cap: $${magData.market_cap.toLocaleString()}
📈 Circulating Supply: ${magData.circulating_supply.toLocaleString()} MAG / ${magData.total_supply.toLocaleString()} MAG
👥 Holders: ${magData.holders_count.toLocaleString()}
🔄 Transactions (24h): ${magData.transactions_24h.toLocaleString()}
💹 Volume (24h): $${magData.volume_24h.toLocaleString()}
📊 24h Change: ${magData.price_change_24h}%

Magnify isn't just a token; it's a movement. Powered by AI, it brings real-time market insights and automated financial guidance to the DeFi space.

IMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;
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
      console.error('[TokenService] Error in getTokenInfo:', error);
      throw error;
    }
  }
}