import { supabase } from "@/integrations/supabase/client";
import { TokenData, TokenNotFoundError, TokenFetchError } from "@/types/token";

export class TokenRepository {
  private static instance: TokenRepository;
  private cache: Map<string, { data: TokenData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): TokenRepository {
    if (!TokenRepository.instance) {
      TokenRepository.instance = new TokenRepository();
    }
    return TokenRepository.instance;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async fetchTokenData(symbol: string): Promise<TokenData> {
    console.log('Fetching token data for:', symbol);
    
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log('Cache hit for token:', symbol);
      return cached.data;
    }

    try {
      // Fetch token metadata
      const { data: tokenData, error: tokenError } = await supabase
        .from('token_metadata')
        .select('*')
        .ilike('symbol', symbol)
        .maybeSingle();

      if (tokenError) {
        console.error('Error fetching token metadata:', tokenError);
        throw new TokenFetchError(symbol, tokenError.message);
      }

      if (!tokenData) {
        throw new TokenNotFoundError(symbol);
      }

      // Fetch protocol data
      const { data: protocolData, error: protocolError } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (protocolError) {
        console.error('Error fetching protocol data:', protocolError);
      }

      // Transform the data
      const transformedData: TokenData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        marketData: tokenData.market_data,
        metadata: tokenData.metadata?.additional_metrics,
        protocolData: protocolData ? {
          tvl: protocolData.tvl,
          change24h: protocolData.change_1d,
          category: protocolData.category,
          chains: protocolData.chains,
          apy: protocolData.apy
        } : undefined
      };

      // Cache the result
      this.cache.set(symbol, {
        data: transformedData,
        timestamp: Date.now()
      });

      return transformedData;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      throw new TokenFetchError(symbol, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}