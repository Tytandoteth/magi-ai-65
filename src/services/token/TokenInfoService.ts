import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData } from "@/types/token";
import { ITokenService } from "./interfaces/TokenService";

export class TokenInfoService implements ITokenService {
  private static instance: TokenInfoService;
  private tokenRepository: TokenRepository;
  private tokenFormatter: TokenFormatter;
  private tokenOperations: TokenOperations;

  constructor() {
    this.tokenRepository = new TokenRepository();
    this.tokenFormatter = new TokenFormatter();
    this.tokenOperations = new TokenOperations();
  }

  public static getInstance(): TokenInfoService {
    if (!TokenInfoService.instance) {
      TokenInfoService.instance = new TokenInfoService();
    }
    return TokenInfoService.instance;
  }

  async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    try {
      const cleanSymbol = this.tokenOperations.validateTokenSymbol(symbol);
      console.log('Cleaned symbol:', cleanSymbol);

      // Fetch data from different sources
      const tokenData = await this.tokenRepository.fetchTokenData(cleanSymbol);
      console.log('Token data:', tokenData);

      if (!tokenData) {
        console.error('No token data found for:', cleanSymbol);
        return `I couldn't find reliable data for ${cleanSymbol}. Please verify the token symbol and try again.`;
      }

      // Format the response
      return this.tokenFormatter.formatTokenResponse(tokenData);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      return `I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }
  }
}