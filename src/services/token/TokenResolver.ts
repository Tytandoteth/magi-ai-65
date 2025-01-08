import { TokenError } from '@/types/token/errors';
import { TokenMetadata } from '@/types/token/metadata';
import { tokenMetadata, symbolLookup } from './TokenMaps';

export class TokenResolver {
  static resolveTokenSymbol(content: string, chainId?: number): string | null {
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

    // Special handling for MAG token
    if (normalizedContent === 'mag' || normalizedContent === 'magnify') {
      console.log('Special case: MAG token identified');
      return 'MAG';
    }

    const symbol = symbolLookup.get(normalizedContent);
    console.log('Symbol lookup result:', symbol);

    return symbol || null;
  }

  static getTokenMetadata(symbol: string, chainId?: number): TokenMetadata | null {
    console.log('Getting token metadata for:', symbol, 'chainId:', chainId);
    
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