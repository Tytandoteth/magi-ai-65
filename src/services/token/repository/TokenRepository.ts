import { supabase } from "@/integrations/supabase/client";
import { TokenData, ProtocolData, RawTokenData } from "@/types/token";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export class TokenRepository {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = INITIAL_RETRY_DELAY
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries === 0) throw error;
      
      console.log(`Retrying operation, ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryOperation(operation, retries - 1, delay * 2);
    }
  }

  private getCacheKey(type: string, symbol: string): string {
    return `${type}:${symbol.toLowerCase()}`;
  }

  private getFromCache<T>(type: string, symbol: string): T | null {
    const key = this.getCacheKey(type, symbol);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${key}`);
      return cached.data as T;
    }
    
    return null;
  }

  private setCache(type: string, symbol: string, data: any): void {
    const key = this.getCacheKey(type, symbol);
    this.cache.set(key, { data, timestamp: Date.now() });
    console.log(`Cached data for ${key}`);
  }

  private transformTokenData(rawData: RawTokenData): TokenData {
    console.log('Transforming raw token data:', rawData);
    
    return {
      name: rawData.name,
      symbol: rawData.symbol,
      description: rawData.description || undefined,
      market_data: rawData.market_data as TokenData['market_data'],
      metadata: rawData.metadata as TokenData['metadata']
    };
  }

  async fetchTokenData(symbol: string): Promise<TokenData | null> {
    console.log('Fetching token data for:', symbol);
    
    // Check cache first
    const cached = this.getFromCache<TokenData>('token', symbol);
    if (cached) return cached;

    try {
      const { data: tokenData, error } = await this.retryOperation(() => 
        supabase
          .from('token_metadata')
          .select('*')
          .ilike('symbol', symbol)
          .order('last_updated', { ascending: false })
          .limit(1)
          .maybeSingle()
      );

      if (error) {
        console.error('Error fetching token metadata:', error);
        return null;
      }

      if (!tokenData) {
        return null;
      }

      const transformedData = this.transformTokenData(tokenData as RawTokenData);
      this.setCache('token', symbol, transformedData);
      
      return transformedData;
    } catch (error) {
      console.error('Error in fetchTokenData:', error);
      throw error;
    }
  }

  async fetchProtocolData(symbol: string): Promise<ProtocolData | null> {
    console.log('Fetching protocol data for:', symbol);
    
    // Check cache first
    const cached = this.getFromCache<ProtocolData>('protocol', symbol);
    if (cached) return cached;

    try {
      const { data: protocolData, error } = await this.retryOperation(() =>
        supabase
          .from('defi_llama_protocols')
          .select('*')
          .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      );

      if (error) {
        console.error('Error fetching DeFi Llama data:', error);
        return null;
      }

      if (protocolData) {
        this.setCache('protocol', symbol, protocolData);
      }

      return protocolData;
    } catch (error) {
      console.error('Error fetching protocol data:', error);
      throw error;
    }
  }

  async fetchTokenFromAPI(symbol: string): Promise<TokenData | null> {
    console.log(`Fetching data from API for token: ${symbol}`);
    
    try {
      const { data: response, error } = await this.retryOperation(() =>
        supabase.functions.invoke('token-profile', {
          body: { symbol }
        })
      );

      if (error || !response?.data) {
        console.error(`Error fetching token profile for ${symbol}:`, error);
        return null;
      }

      // Cache the API response
      this.setCache('token', symbol, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error in fetchTokenFromAPI:', error);
      return null;
    }
  }
}