import { commonTokens, tokenAliases } from './TokenMaps';

export class TokenResolver {
  static resolveTokenSymbol(content: string): string | null {
    console.log('Resolving token symbol for:', content);
    
    if (!content) {
      console.log('Empty content provided');
      return null;
    }

    // Clean the input first
    const cleanInput = content.replace(/\$/g, '').toLowerCase().trim();
    console.log('Cleaned input:', cleanInput);

    // Direct match for uppercase symbols (e.g., BTC, ETH)
    const upperSymbol = cleanInput.toUpperCase();
    if (Array.from(commonTokens.values()).includes(upperSymbol)) {
      console.log('Found direct match for uppercase symbol:', upperSymbol);
      return upperSymbol;
    }
    
    // Special case for PENGU variations
    if (cleanInput.includes('peng') || cleanInput === 'pudgy') {
      console.log('Detected PENGU variation:', cleanInput);
      return 'PENGU';
    }
    
    // Check for direct matches in common tokens
    if (commonTokens.has(cleanInput)) {
      const resolvedSymbol = commonTokens.get(cleanInput);
      console.log('Found direct match in common tokens:', resolvedSymbol);
      return resolvedSymbol || null;
    }
    
    // Check aliases
    if (tokenAliases.has(cleanInput)) {
      const mainName = tokenAliases.get(cleanInput);
      if (mainName && commonTokens.has(mainName)) {
        const resolvedSymbol = commonTokens.get(mainName);
        console.log('Resolved alias to symbol:', resolvedSymbol);
        return resolvedSymbol || null;
      }
    }
    
    console.log('No token match found for:', cleanInput);
    return null;
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