import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData, ProtocolData } from "@/types/token";
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
      const isTVLQuery = this.tokenOperations.isTVLQuery(symbol);

      // Fetch data from different sources
      const [tokenData, protocolData] = await Promise.all([
        this.fetchTokenData(cleanSymbol),
        this.fetchProtocolData(cleanSymbol)
      ]);

      console.log('Token data:', tokenData);
      console.log('Protocol data:', protocolData);

      // If no data found in database, try API
      const finalTokenData = tokenData || await this.tokenRepository.fetchTokenFromAPI(cleanSymbol);

      if (!finalTokenData && !protocolData) {
        console.error('No token data found for:', cleanSymbol);
        return `I couldn't find reliable data for ${cleanSymbol}. Please verify the token symbol and try again.`;
      }

      // Combine token and protocol data
      const combinedData = this.tokenOperations.combineTokenData(finalTokenData, protocolData);
      console.log('Combined data:', combinedData);

      // Format the response
      return this.tokenFormatter.formatResponse(combinedData);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      return `I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }
  }

  async fetchTokenData(symbol: string): Promise<TokenData | null> {
    return this.tokenRepository.fetchTokenData(symbol);
  }

  async fetchProtocolData(symbol: string): Promise<ProtocolData | null> {
    return this.tokenRepository.fetchProtocolData(symbol);
  }
}