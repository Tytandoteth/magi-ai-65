import { supabase } from "@/integrations/supabase/client";
import { TokenData, TokenMarketData, TokenMetadata } from "@/types/token";
import { Json } from "@/integrations/supabase/types/base";

export class TokenRepository {
  private static instance: TokenRepository;

  public static getInstance(): TokenRepository {
    if (!TokenRepository.instance) {
      console.log('[TokenRepository] Creating new instance');
      TokenRepository.instance = new TokenRepository();
    }
    return TokenRepository.instance;
  }

  async fetchTokenData(symbol: string): Promise<TokenData | null> {
    const startTime = performance.now();
    console.log('[TokenRepository] Fetching data for symbol:', symbol);
    
    try {
      // Fetch from token_metadata table with exact symbol match
      console.log('[TokenRepository] Querying token_metadata table');
      const { data: tokenData, error: tokenError } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();

      if (tokenError) {
        console.error('[TokenRepository] Error fetching token metadata:', {
          error: tokenError,
          symbol,
          responseTime: `${(performance.now() - startTime).toFixed(2)}ms`
        });
        throw tokenError;
      }

      if (!tokenData) {
        console.log('[TokenRepository] No token data found for symbol:', symbol);
        return null;
      }

      console.log('[TokenRepository] Found token data:', {
        symbol: tokenData.symbol,
        name: tokenData.name,
        lastUpdated: tokenData.last_updated,
        hasMarketData: !!tokenData.market_data
      });

      // Transform the data to match TokenData interface
      const transformedData: TokenData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description || undefined,
        market_data: this.parseMarketData(tokenData.market_data),
        metadata: {
          additional_metrics: this.parseAdditionalMetrics(tokenData.metadata),
          platforms: this.validatePlatforms(tokenData.platforms)
        }
      };

      // Try to fetch protocol data if available
      console.log('[TokenRepository] Fetching protocol data');
      const { data: protocolData, error: protocolError } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();

      if (protocolError) {
        console.error('[TokenRepository] Error fetching protocol data:', protocolError);
      } else if (protocolData) {
        console.log('[TokenRepository] Found protocol data:', {
          name: protocolData.name,
          category: protocolData.category,
          tvl: protocolData.tvl
        });
        
        transformedData.protocol_data = {
          tvl: protocolData.tvl || undefined,
          change_24h: protocolData.change_1d || undefined,
          category: protocolData.category || undefined,
          chains: this.parseChains(protocolData.raw_data),
          apy: this.parseApy(protocolData.raw_data)
        };
      }

      console.log('[TokenRepository] Completed data fetch:', {
        symbol,
        responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
        dataFound: true
      });

      return transformedData;
    } catch (error) {
      console.error('[TokenRepository] Error in fetchTokenData:', {
        error: error.message,
        stack: error.stack,
        symbol,
        responseTime: `${(performance.now() - startTime).toFixed(2)}ms`
      });
      throw error;
    }
  }

  private parseMarketData(marketData: Json | null): TokenMarketData | undefined {
    if (!marketData || typeof marketData !== 'object') {
      return undefined;
    }

    const md = marketData as Record<string, any>;
    return {
      current_price: md.current_price?.usd,
      market_cap: md.market_cap?.usd,
      total_volume: md.total_volume?.usd,
      price_change_percentage_24h: md.price_change_percentage_24h
    };
  }

  private parseAdditionalMetrics(metadata: Json | null): TokenMetadata['additional_metrics'] | undefined {
    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }

    const md = metadata as Record<string, any>;
    return md.additional_metrics ? {
      market_cap_rank: md.additional_metrics.market_cap_rank,
      coingecko_score: md.additional_metrics.coingecko_score,
      developer_score: md.additional_metrics.developer_score,
      community_score: md.additional_metrics.community_score
    } : undefined;
  }

  private validatePlatforms(platforms: Json | null): Record<string, string> {
    if (!platforms || typeof platforms !== 'object') {
      return {};
    }

    const validatedPlatforms: Record<string, string> = {};
    const platformsObj = platforms as Record<string, any>;
    
    Object.entries(platformsObj).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        validatedPlatforms[key] = String(value);
      }
    });

    return validatedPlatforms;
  }

  private parseChains(rawData: Json | null): string[] | undefined {
    if (!rawData || typeof rawData !== 'object') {
      return undefined;
    }

    const rd = rawData as Record<string, any>;
    return Array.isArray(rd.chains) ? rd.chains : undefined;
  }

  private parseApy(rawData: Json | null): number | undefined {
    if (!rawData || typeof rawData !== 'object') {
      return undefined;
    }

    const rd = rawData as Record<string, any>;
    return typeof rd.apy === 'number' ? rd.apy : undefined;
  }
}