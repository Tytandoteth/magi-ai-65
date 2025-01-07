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
    this.tokenRepository = new TokenRepository();
    this.tokenFormatter = new TokenFormatter();
    this.tokenOperations = new TokenOperations();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    try {
      // Special handling for MAG token
      if (symbol.toUpperCase() === 'MAG') {
        console.log('Fetching MAG token data from mag_token_analytics');
        const { data: magData, error } = await supabase
          .from('mag_token_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching MAG data:', error);
          throw new Error(`Failed to fetch MAG data: ${error.message}`);
        }

        if (!magData) {
          console.log('No MAG token data found in database');
          return `I couldn't find any current data for the MAG token. This could be because:
1. The data hasn't been updated recently
2. There might be an issue with our data provider
3. The token information is temporarily unavailable

Please try again later or check other reliable sources for the most up-to-date information.

IMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;
        }

        return `Here are the current metrics for Magnify (MAG):

Current Price: $${magData.price?.toLocaleString() ?? 'N/A'}
Market Cap: $${magData.market_cap?.toLocaleString() ?? 'N/A'}
Total Supply: ${magData.total_supply?.toLocaleString() ?? 'N/A'} MAG
Circulating Supply: ${magData.circulating_supply?.toLocaleString() ?? 'N/A'} MAG
Holders: ${magData.holders_count?.toLocaleString() ?? 'N/A'}
24h Transactions: ${magData.transactions_24h?.toLocaleString() ?? 'N/A'}
24h Volume: $${magData.volume_24h?.toLocaleString() ?? 'N/A'}

Description: Magnify is a DeFAI (Decentralized Finance Augmented by Intelligence) protocol that leverages artificial intelligence to provide real-time market insights and automated financial guidance.

IMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;
      }

      // Call the token-profile edge function for other tokens
      const { data, error } = await supabase.functions.invoke('token-profile', {
        body: { symbol }
      });

      console.log('Token profile response:', data, 'Error:', error);

      if (error || !data) {
        throw new Error(`Failed to fetch token data: ${error?.message || 'No data returned'}`);
      }

      return data.data;

    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      throw error;
    }
  }
}