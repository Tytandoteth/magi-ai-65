import { fetchTokenData, fetchTokenFromAPI } from "./utils/tokenDataFetcher";
import { fetchProtocolData } from "./utils/protocolDataFetcher";
import { formatTokenResponse } from "./utils/responseFormatter";

export class TokenInfoService {
  static async getTokenInfo(symbol: string): Promise<string> {
    console.log('Getting token info for:', symbol);
    
    if (!symbol) {
      return "Please provide a token symbol to get information about.";
    }

    try {
      // Check if this is a TVL-specific query
      const isTVLQuery = symbol.toLowerCase().includes('tvl');

      // Fetch data from different sources
      const [tokenData, protocolData] = await Promise.all([
        fetchTokenData(symbol).catch(() => null),
        fetchProtocolData(symbol)
      ]);

      // If we have token data in our database, use it
      if (tokenData) {
        console.log('Found token data in database:', tokenData);
        console.log('DeFi Llama protocol data:', protocolData);
        
        // If it's a TVL query but we don't have protocol data
        if (isTVLQuery && !protocolData?.tvl) {
          return `I couldn't find TVL data for ${tokenData.name} (${tokenData.symbol}). This might mean:
          - The token is not associated with a DeFi protocol
          - TVL data is not currently available
          - The protocol is not tracked by DeFi Llama
          
          Please verify the token and try again.`;
        }
        
        return formatTokenResponse(tokenData, protocolData, isTVLQuery);
      }

      // If not in database, fetch from API
      const apiData = await fetchTokenFromAPI(symbol);

      if (!apiData) {
        return `I couldn't find reliable information about ${symbol}. This token might be:
        - Not yet listed on major exchanges
        - A new or emerging project
        - Using a different symbol
        
        Please verify the token symbol and conduct thorough research before considering any investment.`;
      }

      return apiData;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return `I apologize, but I encountered an error while fetching token information. Please try again later.`;
    }
  }
}