import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";
import { TokenOperations } from "./utils/TokenOperations";
import { TokenData, ProtocolData } from "@/types/token";

export class TokenInfoService {
  static async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    try {
      const cleanSymbol = TokenOperations.validateTokenSymbol(symbol);
      const isTVLQuery = TokenOperations.isTVLQuery(symbol);

      // Fetch data from different sources
      const [tokenData, protocolData] = await Promise.all([
        TokenRepository.fetchTokenData(cleanSymbol),
        TokenRepository.fetchProtocolData(cleanSymbol)
      ] as [Promise<TokenData | null>, Promise<ProtocolData | null>]);

      console.log('Token data:', tokenData);
      console.log('Protocol data:', protocolData);

      // If no data in database, try API
      const finalTokenData = tokenData || await TokenRepository.fetchTokenFromAPI(cleanSymbol);

      // Combine and validate data
      const response = TokenOperations.combineTokenData(finalTokenData, protocolData);

      // Format the response
      return TokenFormatter.formatResponse(response);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      return `I apologize, but I encountered an error while fetching data for ${symbol}. Please try again later.`;
    }
  }
}