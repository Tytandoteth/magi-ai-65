import { TokenAggregator } from "./TokenAggregator";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenError } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";

export class TokenService {
  private static instance: TokenService;
  private aggregator: TokenAggregator;
  private formatter: TokenFormatter;

  private constructor() {
    this.aggregator = new TokenAggregator();
    this.formatter = TokenFormatter.getInstance();
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
      // Clean up symbol
      const cleanSymbol = this.validateTokenSymbol(symbol);
      console.log('Cleaned symbol:', cleanSymbol);

      // First try to get from token_metadata
      const { data: tokenData, error } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('symbol', cleanSymbol)
        .maybeSingle();

      console.log('Token data from DB:', tokenData, 'Error:', error);

      if (error) {
        throw new TokenError(`Database error: ${error.message}`, 'DATABASE_ERROR');
      }

      if (!tokenData) {
        // If not in database, try to fetch from CoinGecko via edge function
        console.log('Token not found in DB, fetching from API...');
        const { data: apiData, error: apiError } = await supabase.functions.invoke('token-profile', {
          body: { symbol: cleanSymbol }
        });

        console.log('API response:', apiData, 'Error:', apiError);

        if (apiError || !apiData) {
          throw new TokenError(
            `Failed to fetch ${cleanSymbol} data: ${apiError?.message || 'No data returned'}`,
            'API_ERROR'
          );
        }

        return apiData.data;
      }

      // Format response from database
      return this.formatter.formatTokenResponse({
        symbol: tokenData.symbol,
        name: tokenData.name,
        description: tokenData.description,
        market_data: tokenData.market_data,
        metadata: tokenData.metadata
      });

    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      
      if (error instanceof TokenError) {
        return `I couldn't find reliable data for ${symbol}. ${error.message}`;
      }
      
      return `I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }
  }

  private validateTokenSymbol(symbol: string): string {
    if (!symbol) {
      throw new TokenError('Token symbol is required', 'INVALID_SYMBOL');
    }
    
    // Remove $ if present and convert to uppercase
    return symbol.replace('$', '').toUpperCase();
  }
}