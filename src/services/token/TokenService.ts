import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";
import { isMarketData } from "@/types/market";
import { tokenMetadata } from "./TokenMaps";

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
    
    try {
      // Special handling for MAG token using hardcoded data
      if (symbol.toUpperCase() === 'MAG') {
        console.log('[TokenService] Using hardcoded MAG token data');
        const magData = tokenMetadata.get('MAG');
        
        if (!magData || !magData.marketData) {
          return "Could not find MAG token data";
        }

        const {
          currentPrice,
          marketCap,
          volume24h,
          circulatingSupply,
          totalSupply,
          priceChangePercentages,
          btcPrice,
          btcPriceChange24h,
          ethPrice,
          ethPriceChange24h
        } = magData.marketData;

        return `🪄 Magnify (MAG) Market Data

💵 Price: $${currentPrice.toFixed(6)} (${priceChangePercentages['24h']}% 24h)
🌍 Market Cap: $${marketCap.toLocaleString()}
📈 Supply: ${circulatingSupply.toLocaleString()} MAG / ${totalSupply.toLocaleString()} MAG
💹 24h Volume: $${volume24h.toLocaleString()}

📊 Price Changes:
• 1h: ${priceChangePercentages['1h']}%
• 24h: ${priceChangePercentages['24h']}%
• 7d: ${priceChangePercentages['7d']}%
• 30d: ${priceChangePercentages['30d']}%

💎 Pair Prices:
• BTC: ${btcPrice} (${btcPriceChange24h}% 24h)
• ETH: ${ethPrice} (${ethPriceChange24h}% 24h)

Magnify is an AI-powered DeFi assistant that brings real-time market insights and automated financial guidance to the crypto space.`;
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