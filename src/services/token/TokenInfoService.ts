import { TokenRepository } from "./repository/TokenRepository";
import { TokenFormatter } from "./utils/TokenFormatter";

export class TokenInfoService {
  static async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    if (!symbol) {
      return "Please provide a token symbol to get information about.";
    }

    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    const isTVLQuery = symbol.toLowerCase().includes('tvl');

    try {
      // Fetch data from different sources
      const [tokenData, protocolData] = await Promise.all([
        TokenRepository.fetchTokenData(cleanSymbol),
        TokenRepository.fetchProtocolData(cleanSymbol)
      ]);

      // If no data in database, try API
      const finalTokenData = tokenData || await TokenRepository.fetchTokenFromAPI(cleanSymbol);

      // Format the response
      const response = TokenFormatter.formatTokenResponse(
        finalTokenData,
        protocolData,
        isTVLQuery
      );

      return TokenFormatter.formatResponse(response);
    } catch (error) {
      console.error('Error in getTokenInfo:', error);
      return `I apologize, but I encountered an error while fetching data for ${cleanSymbol}. Please try again later.`;
    }
  }
}