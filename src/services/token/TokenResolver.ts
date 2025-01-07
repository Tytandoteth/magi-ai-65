import { TokenError } from '@/types/token/errors';
import { TokenMetadata } from '@/types/token/metadata';
import { tokenMetadata, symbolLookup } from './TokenMaps';

export class TokenResolver {
  static resolveTokenSymbol(content: string, chainId?: number): string | null {
    console.log('Resolving token symbol for:', content, 'chainId:', chainId);
    
    if (!content) {
      throw new TokenError('Input content cannot be empty', 'INVALID_SYMBOL');
    }

    const normalizedContent = content.trim().toLowerCase();
    const symbol = symbolLookup.get(normalizedContent);
    
    console.log('Resolved symbol:', symbol);

    if (!symbol) {
      return null;
    }

    // If chainId is provided, verify the token exists on that chain
    if (chainId !== undefined) {
      const metadata = tokenMetadata.get(symbol);
      if (!metadata?.chainData[chainId]) {
        throw new TokenError(
          `Token ${symbol} not supported on chain ${chainId}`,
          'INVALID_CHAIN'
        );
      }
    }

    return symbol;
  }

  static getTokenMetadata(symbol: string, chainId?: number): TokenMetadata | null {
    console.log('Getting token metadata for:', symbol, 'chainId:', chainId);
    
    const metadata = tokenMetadata.get(symbol);
    
    if (!metadata) {
      console.log('No metadata found for symbol:', symbol);
      return null;
    }

    if (chainId !== undefined && !metadata.chainData[chainId]) {
      throw new TokenError(
        `Token ${symbol} not supported on chain ${chainId}`,
        'INVALID_CHAIN'
      );
    }

    console.log('Found metadata:', metadata);
    return metadata;
  }

  static getSuggestionMessage(content: string): string {
    const cleanContent = content.replace(/\$/g, '').toLowerCase().trim();
    
    // Special handling for PENGU-related queries
    if (cleanContent.includes('peng') || cleanContent === 'pudgy') {
      return `To get information about PENGU (Pudgy Penguins), use $PENGU.`;
    }
    
    if (content.match(/^[a-z0-9\s]+$/i) && content.length <= 20) {
      const suggestedSymbol = content.replace(/\s+/g, '').toUpperCase();
      return `To get information about ${suggestedSymbol}, please use the $ symbol (e.g., $${suggestedSymbol}).`;
    }
    
    return "I'm here to help with any DeFi-related questions! You can ask me about specific tokens by using the $ symbol (e.g., $ETH), get market updates, or ask about DeFi protocols.";
  }
}