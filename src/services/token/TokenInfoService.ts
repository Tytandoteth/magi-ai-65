import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData, ProtocolData } from "@/types/token";
import { ITokenService } from "./interfaces/TokenService";

export class TokenInfoService implements ITokenService {
  private tokenRepository: TokenRepository;
  private tokenFormatter: TokenFormatter;
  private tokenOperations: TokenOperations;

  constructor() {
    this.tokenRepository = new TokenRepository();
    this.tokenFormatter = new TokenFormatter();
    this.tokenOperations = new TokenOperations();
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

      // If no data in database, try API
      const finalTokenData = tokenData || await this.tokenRepository.fetchTokenFromAPI(cleanSymbol);

      // Combine and validate data
      const response = this.tokenOperations.combineTokenData(finalTokenData, protocolData);

      // Format the response
      return this.tokenFormatter.formatResponse(response);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      return `I apologize, but I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }
  }

  async fetchTokenData(symbol: string): Promise<TokenData | null> {
    return this.tokenRepository.fetchTokenData(symbol);
  }

  async fetchProtocolData(symbol: string): Promise<ProtocolData | null> {
    return this.tokenRepository.fetchProtocolData(symbol);
  }
}