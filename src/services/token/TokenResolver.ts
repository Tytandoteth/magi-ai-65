import { commonTokens, tokenAliases } from './TokenMaps';

export class TokenResolver {
  static resolveTokenSymbol(content: string): string | null {
    console.log('Resolving token symbol for:', content);
    
    // Clean the input first
    const cleanInput = content.replace(/\$/g, '').toLowerCase().trim();
    console.log('Cleaned input:', cleanInput);
    
    // Check for direct matches in common tokens
    if (commonTokens.has(cleanInput)) {
      console.log('Found direct match in common tokens:', cleanInput);
      return commonTokens.get(cleanInput)!;
    }
    
    // Check aliases
    if (tokenAliases.has(cleanInput)) {
      console.log('Found token alias:', cleanInput);
      const mainName = tokenAliases.get(cleanInput);
      if (mainName && commonTokens.has(mainName)) {
        console.log('Resolved alias to main token:', mainName);
        return commonTokens.get(mainName)!;
      }
    }
    
    // Handle special cases for PENGU variations
    if (cleanInput.includes('peng') || cleanInput === 'pudgy') {
      console.log('Detected PENGU variation:', cleanInput);
      return 'PENGU';
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

  static isSameToken(symbol1: string, symbol2: string): boolean {
    const clean1 = symbol1.toLowerCase().trim();
    const clean2 = symbol2.toLowerCase().trim();
    
    // Handle PENGU variations
    const isPengu1 = clean1.includes('peng') || clean1 === 'pudgy';
    const isPengu2 = clean2.includes('peng') || clean2 === 'pudgy';
    
    if (isPengu1 && isPengu2) return true;
    
    return clean1 === clean2;
  }
}