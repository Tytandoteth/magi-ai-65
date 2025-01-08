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
          return `I couldn't find any current data for the MAG token. This could be because:
1. The data hasn't been updated recently
2. There might be an issue with our data provider
3. The token information is temporarily unavailable

Please try again later or check other reliable sources for the most up-to-date information.`;
        }

        console.log('[TokenService] Successfully fetched MAG data:', {
          price: magData.price,
          marketCap: magData.market_cap,
          holders: magData.holders_count,
          timestamp: magData.created_at
        });

        return `Here are the current metrics for Magnify (MAG):

Current Price: $${magData.price?.toLocaleString() ?? 'N/A'}
Market Cap: $${magData.market_cap?.toLocaleString() ?? 'N/A'}
Total Supply: ${magData.total_supply?.toLocaleString() ?? 'N/A'} MAG
Circulating Supply: ${magData.circulating_supply?.toLocaleString() ?? 'N/A'} MAG
Holders: ${magData.holders_count?.toLocaleString() ?? 'N/A'}
24h Transactions: ${magData.transactions_24h?.toLocaleString() ?? 'N/A'}
24h Volume: $${magData.volume_24h?.toLocaleString() ?? 'N/A'}

Description: Magnify is a DeFAI (Decentralized Finance Augmented by Intelligence) protocol that leverages artificial intelligence to provide real-time market insights and automated financial guidance.`;
      }

      console.log('[TokenService] Calling token-profile edge function');
      const { data, error } = await supabase.functions.invoke('token-profile', {
        body: { symbol }
      });

      console.log('[TokenService] Edge function response:', {
        success: !!data,
        error: error?.message,
        responseTime: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      if (error || !data) {
        throw new Error(`Failed to fetch token data: ${error?.message || 'No data returned'}`);
      }

      return data.data;

    } catch (error) {
      console.error('[TokenService] Error in getTokenInfo:', {
        symbol,
        error: error.message,
        stack: error.stack,
        responseTime: `${(performance.now() - startTime).toFixed(2)}ms`
      });
      throw error;
    }
  }
}