import { TokenRepository } from "./repository/TokenRepository";
import { TokenResolver } from "./TokenResolver";
import { TokenData, TokenError } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";

interface AggregatedTokenData {
  basicInfo: {
    name: string;
    symbol: string;
    description?: string;
  };
  marketData?: {
    currentPrice?: number;
    marketCap?: number;
    volume24h?: number;
    priceChange24h?: number;
  };
  defiMetrics?: {
    tvl?: number;
    change24h?: number;
    category?: string;
    chains?: string[];
    apy?: number;
  };
  metadata?: {
    marketCapRank?: number;
    socialScore?: number;
    platforms?: Record<string, string>;
  };
}

export class TokenAggregator {
  private tokenRepo: TokenRepository;

  constructor() {
    this.tokenRepo = TokenRepository.getInstance();
  }

  async aggregateTokenData(inputSymbol: string): Promise<AggregatedTokenData> {
    console.log('Starting token data aggregation for:', inputSymbol);
    
    // Resolve the token symbol using the static method
    const resolvedSymbol = TokenResolver.resolveTokenSymbol(inputSymbol);
    if (!resolvedSymbol) {
      throw new TokenError(`Could not resolve symbol: ${inputSymbol}`, 'INVALID_SYMBOL');
    }
    console.log('Resolved symbol:', resolvedSymbol);

    try {
      // Fetch token metadata
      const tokenData = await this.tokenRepo.fetchTokenData(resolvedSymbol);
      console.log('Token metadata fetched:', tokenData);

      // Fetch DeFi protocol data
      const { data: protocolData, error: protocolError } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .eq('symbol', resolvedSymbol)
        .maybeSingle();

      if (protocolError) {
        console.error('Error fetching protocol data:', protocolError);
      }
      console.log('Protocol data fetched:', protocolData);

      // Type assertion for raw_data
      const rawData = protocolData?.raw_data as { chains?: string[]; apy?: number } | null;

      // Combine the data
      const aggregatedData: AggregatedTokenData = {
        basicInfo: {
          name: tokenData?.name || protocolData?.name || resolvedSymbol,
          symbol: resolvedSymbol,
          description: tokenData?.description
        },
        marketData: tokenData?.market_data ? {
          currentPrice: tokenData.market_data.current_price?.usd,
          marketCap: tokenData.market_data.market_cap?.usd,
          volume24h: tokenData.market_data.total_volume?.usd,
          priceChange24h: tokenData.market_data.price_change_percentage_24h
        } : undefined,
        defiMetrics: protocolData ? {
          tvl: protocolData.tvl,
          change24h: protocolData.change_1d,
          category: protocolData.category,
          chains: rawData?.chains || [],
          apy: rawData?.apy
        } : undefined,
        metadata: tokenData?.metadata?.additional_metrics ? {
          marketCapRank: tokenData.metadata.additional_metrics.market_cap_rank,
          socialScore: tokenData.metadata.additional_metrics.coingecko_score,
          platforms: {} // Initialize with empty object as platforms might not be available
        } : undefined
      };

      console.log('Aggregated data:', aggregatedData);
      return aggregatedData;
    } catch (error) {
      console.error('Error in token data aggregation:', error);
      throw error;
    }
  }
}