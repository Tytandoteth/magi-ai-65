import { TokenError } from '@/types/token/errors';
import { TokenMetadata } from '@/types/token/metadata';
import { tokenMetadata, symbolLookup } from './TokenMaps';
import { supabase } from '@/integrations/supabase/client';

export class TokenResolver {
  static async resolveTokenSymbol(content: string, chainId?: number): Promise<string | null> {
    console.log('Resolving token symbol for:', content, 'chainId:', chainId);
    
    if (!content) {
      console.log('Empty content provided');
      return null;
    }

    // Clean and normalize the input
    const normalizedContent = content
      .replace(/\$/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .trim();
    
    console.log('Normalized content:', normalizedContent);

    if (!normalizedContent) {
      console.log('No valid content after normalization');
      return null;
    }

    // Special handling for MAG token variations
    if (normalizedContent === 'mag' || 
        normalizedContent === 'magnify' || 
        normalizedContent.includes('magnify')) {
      console.log('Special case: MAG token identified');
      return 'MAG';
    }

    // Check for common name variations in token metadata
    const symbol = symbolLookup.get(normalizedContent);
    if (symbol) {
      console.log('Found symbol through lookup:', symbol);
      return symbol;
    }

    // Try to find token in database by name or symbol
    try {
      const { data: tokenData, error } = await supabase
        .from('token_metadata')
        .select('symbol, name')
        .or(`symbol.ilike.${normalizedContent},name.ilike.%${normalizedContent}%`)
        .limit(1);

      if (error) {
        console.error('Error querying token metadata:', error);
        return null;
      }

      if (tokenData && tokenData.length > 0) {
        console.log('Found token in database:', tokenData[0]);
        return tokenData[0].symbol.toUpperCase();
      }
    } catch (error) {
      console.error('Error in database query:', error);
    }

    return null;
  }

  static async getTokenMetadata(symbol: string, chainId?: number): Promise<TokenMetadata | null> {
    console.log('Getting token metadata for:', symbol, 'chainId:', chainId);
    
    // Special handling for MAG token
    if (symbol.toUpperCase() === 'MAG') {
      try {
        const { data: magData, error } = await supabase
          .from('mag_token_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching MAG data:', error);
          return null;
        }

        if (magData) {
          return {
            symbol: 'MAG',
            commonNames: ['mag', 'magnify', 'magnifycash'],
            decimals: 18,
            chainData: {
              1: { 
                address: '0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105',
                verified: true 
              }
            },
            marketData: {
              price: magData.price,
              totalSupply: magData.total_supply,
              circulatingSupply: magData.circulating_supply,
              holdersCount: magData.holders_count,
              transactions24h: magData.transactions_24h,
              volume24h: magData.volume_24h,
              marketCap: magData.market_cap
            }
          };
        }
      } catch (error) {
        console.error('Error fetching MAG token data:', error);
      }
    }

    const metadata = tokenMetadata.get(symbol);
    
    if (!metadata) {
      console.log('No metadata found for symbol:', symbol);
      return null;
    }

    if (chainId !== undefined && !metadata.chainData[chainId]) {
      console.error(`Token ${symbol} not supported on chain ${chainId}`);
      throw new TokenError(
        `Token ${symbol} not supported on chain ${chainId}`,
        'INVALID_CHAIN'
      );
    }

    console.log('Found metadata:', metadata);
    return metadata;
  }

  static getSuggestionMessage(content: string): string {
    console.log('Getting suggestion message for:', content);
    const cleanContent = content.replace(/\$/g, '').toLowerCase().trim();
    
    if (!cleanContent) {
      return "Please provide a valid token symbol using the $ symbol (e.g., $ETH).";
    }
    
    // Special handling for MAG-related queries
    if (cleanContent.includes('mag') || cleanContent === 'magnify') {
      return `To get information about MAG (Magnify), use $MAG.`;
    }

    const resolvedSymbol = this.resolveTokenSymbol(cleanContent);
    if (resolvedSymbol) {
      return `Token found: $${resolvedSymbol}. Use this symbol to fetch data.`;
    }
    
    return `The token "${content}" could not be resolved. Check the symbol and try again.`;
  }
}