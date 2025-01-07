import { supabase } from "@/integrations/supabase/client";
import { TokenData, TokenMetadata } from "@/types/token";

interface ProtocolRawData {
  chains?: string[];
  apy?: number;
  [key: string]: unknown;
}

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

  async fetchTokenData(symbol: string): Promise<TokenData | null> {
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
        .eq('symbol', symbol)
        .maybeSingle();

      if (tokenError) {
        console.error('Error fetching token metadata:', tokenError);
        throw new Error(`Error fetching token data: ${tokenError.message}`);
      }

      if (!tokenData) {
        console.log('No token data found for symbol:', symbol);
        return null;
      }

      console.log('Found token data:', tokenData);

      // Fetch protocol data if available
      const { data: protocolData, error: protocolError } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .or(`symbol.eq.${symbol},name.ilike.%${symbol}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (protocolError) {
        console.error('Error fetching protocol data:', protocolError);
      } else {
        console.log('Found protocol data:', protocolData);
      }

      // Transform the data
      const transformedData: TokenData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        market_data: tokenData.market_data as TokenData['market_data'],
        metadata: {
          additional_metrics: tokenData.metadata && typeof tokenData.metadata === 'object' 
            ? (tokenData.metadata as any).additional_metrics 
            : undefined
        }
      };

      // Add protocol data if available
      if (protocolData && protocolData.raw_data) {
        const rawData = protocolData.raw_data as ProtocolRawData;
        transformedData.protocol_data = {
          tvl: protocolData.tvl,
          change_24h: protocolData.change_1d,
          category: protocolData.category,
          chains: Array.isArray(rawData.chains) ? rawData.chains : [],
          apy: typeof rawData.apy === 'number' ? rawData.apy : undefined
        };
      }

      // Cache the result
      this.cache.set(symbol, {
        data: transformedData,
        timestamp: Date.now()
      });

      return transformedData;
    } catch (error) {
      console.error('Error in fetchTokenData:', error);
      throw error;
    }
  }
}