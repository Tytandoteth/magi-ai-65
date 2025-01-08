import { TokenError } from '@/types/token/errors';
import { TokenData } from '@/types/token/metadata';
import { TokenResolver } from './TokenResolver';
import { supabase } from '@/integrations/supabase/client';

export class TokenAggregator {
  private async fetchTokenPrice(symbol: string): Promise<number> {
    console.log('Fetching token price for:', symbol);
    
    try {
      const { data: marketData, error } = await supabase
        .from('defi_market_data')
        .select('current_price')
        .eq('symbol', symbol)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching price from Supabase:', error);
        throw new TokenError(
          `Failed to fetch price for ${symbol}`,
          'NETWORK_ERROR',
          error
        );
      }

      if (!marketData?.current_price) {
        throw new TokenError(
          `No price data available for ${symbol}`,
          'NO_DATA_FOUND'
        );
      }

      console.log('Fetched price:', marketData.current_price);
      return marketData.current_price;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      throw new TokenError(
        `Failed to fetch price data: ${error.message}`,
        'NETWORK_ERROR',
        error
      );
    }
  }

  async aggregateTokenData(
    input: string,
    chainId?: number,
    options: {
      includePrices?: boolean;
      validateAddresses?: boolean;
    } = {}
  ): Promise<TokenData> {
    console.log('Aggregating token data for:', input, 'options:', options);
    
    const resolvedSymbol = await TokenResolver.resolveTokenSymbol(input, chainId);
    
    if (!resolvedSymbol) {
      throw new TokenError(`Could not resolve symbol: ${input}`, 'INVALID_SYMBOL');
    }

    const metadata = await TokenResolver.getTokenMetadata(resolvedSymbol, chainId);
    if (!metadata) {
      throw new TokenError(
        `No metadata found for symbol: ${resolvedSymbol}`,
        'NO_DATA_FOUND'
      );
    }

    const result: TokenData = {
      symbol: metadata.symbol,
      name: metadata.commonNames[0], // Use first common name as canonical name
      decimals: metadata.decimals
    };

    if (chainId !== undefined) {
      const chainData = metadata.chainData[chainId];
      result.address = chainData.address;
      result.chainId = chainId;
    }

    if (options.includePrices) {
      try {
        const price = await this.fetchTokenPrice(resolvedSymbol);
        Object.assign(result, { price });
      } catch (error) {
        if (error instanceof TokenError) {
          throw error;
        }
        throw new TokenError(
          `Failed to fetch price data: ${error.message}`,
          'NETWORK_ERROR',
          error
        );
      }
    }

    console.log('Aggregated token data:', result);
    return result;
  }
}