import { supabase } from "@/integrations/supabase/client";
import { TokenData } from "@/types/token";

export class TokenRepository {
  private static instance: TokenRepository;

  public static getInstance(): TokenRepository {
    if (!TokenRepository.instance) {
      TokenRepository.instance = new TokenRepository();
    }
    return TokenRepository.instance;
  }

  async fetchTokenData(symbol: string): Promise<TokenData | null> {
    console.log('TokenRepository: Fetching data for symbol:', symbol);
    
    try {
      // Fetch from token_metadata table with exact symbol match
      const { data: tokenData, error: tokenError } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();

      if (tokenError) {
        console.error('Error fetching token metadata:', tokenError);
        throw tokenError;
      }

      if (!tokenData) {
        console.log('No token data found for symbol:', symbol);
        return null;
      }

      console.log('Found token data:', tokenData);

      // Ensure platforms is a valid Record<string, string>
      const platforms = this.validatePlatforms(tokenData.platforms);

      // Transform the data to match TokenData interface
      const transformedData: TokenData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description || undefined,
        market_data: tokenData.market_data || undefined,
        metadata: {
          additional_metrics: tokenData.metadata?.additional_metrics || undefined,
          platforms: platforms
        },
        protocol_data: undefined // Will be populated by protocol data if available
      };

      // Try to fetch protocol data if available
      const { data: protocolData, error: protocolError } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();

      if (protocolError) {
        console.error('Error fetching protocol data:', protocolError);
      } else if (protocolData) {
        console.log('Found protocol data:', protocolData);
        transformedData.protocol_data = {
          tvl: protocolData.tvl || undefined,
          change_24h: protocolData.change_1d || undefined,
          category: protocolData.category || undefined,
          chains: protocolData.raw_data?.chains || undefined,
          apy: protocolData.raw_data?.apy || undefined
        };
      }

      return transformedData;
    } catch (error) {
      console.error('Error in fetchTokenData:', error);
      throw error;
    }
  }

  private validatePlatforms(platforms: any): Record<string, string> {
    if (!platforms || typeof platforms !== 'object') {
      return {};
    }

    const validatedPlatforms: Record<string, string> = {};
    
    Object.entries(platforms).forEach(([key, value]) => {
      if (typeof value === 'string') {
        validatedPlatforms[key] = value;
      } else if (value !== null && value !== undefined) {
        validatedPlatforms[key] = String(value);
      }
    });

    return validatedPlatforms;
  }
}