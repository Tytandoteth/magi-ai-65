import { commonTokens, tokenAliases } from './TokenMaps';

export class TokenResolver {
  static resolveTokenSymbol(content: string): string | null {
    console.log('Resolving token symbol for:', content);
    
    // Check for $ symbol queries first
    if (content.includes('$')) {
      const match = content.match(/\$(\w+)/i);
      if (match) {
        const symbol = match[1].toUpperCase();
        console.log('Extracted token symbol:', symbol);
        return symbol;
      }
    }
    
    // Clean and normalize the input
    const lowercaseContent = content.toLowerCase().trim();
    
    // Check for token aliases first
    if (tokenAliases.has(lowercaseContent)) {
      console.log('Found token alias:', lowercaseContent);
      const mainName = tokenAliases.get(lowercaseContent);
      if (mainName && commonTokens.has(mainName)) {
        console.log('Resolved alias to main token:', mainName);
        return commonTokens.get(mainName)!;
      }
    }
    
    // Check for common token names (including multi-word tokens)
    if (commonTokens.has(lowercaseContent)) {
      console.log('Detected common token name:', lowercaseContent);
      return commonTokens.get(lowercaseContent)!;
    }
    
    return null;
  }

  static getSuggestionMessage(content: string): string {
    if (content.match(/^[a-z0-9\s]+$/i) && content.length <= 20) {
      const suggestedSymbol = content.replace(/\s+/g, '').toUpperCase();
      return `To get information about ${suggestedSymbol}, please use the $ symbol (e.g., $${suggestedSymbol}). You can also ask about market updates or specific DeFi protocols.`;
    }
    return "I'm here to help with any DeFi-related questions! You can ask me about specific tokens by using the $ symbol (e.g., $ETH), get market updates, or ask about DeFi protocols.";
  }

  static isSameToken(symbol1: string, symbol2: string): boolean {
    return symbol1.toLowerCase() === symbol2.toLowerCase();
  }
}