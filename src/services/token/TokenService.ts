import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenData, TokenError } from "@/types/token";

export class TokenService {
  private static instance: TokenService;
  private repository: TokenRepository;
  private formatter: TokenFormatter;

  private constructor() {
    this.repository = TokenRepository.getInstance();
    this.formatter = TokenFormatter.getInstance();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    try {
      // Clean up symbol
      const cleanSymbol = this.validateTokenSymbol(symbol);
      console.log('Cleaned symbol:', cleanSymbol);

      // Fetch data
      const tokenData = await this.repository.fetchTokenData(cleanSymbol);
      console.log('Token data fetched:', tokenData);

      // Format response
      return this.formatter.formatTokenResponse(tokenData);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      
      if (error instanceof TokenError) {
        return `I couldn't find reliable data for ${symbol}. ${error.message}`;
      }
      
      return `I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }
  }

  private validateTokenSymbol(symbol: string): string {
    if (!symbol) {
      throw new TokenError('Token symbol is required', 'INVALID_SYMBOL');
    }
    
    // Remove $ if present and convert to uppercase
    return symbol.replace('$', '').toUpperCase();
  }
}