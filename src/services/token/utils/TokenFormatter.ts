import { TokenData, ProtocolData, TokenResponse } from "@/types/token";

export class TokenFormatter {
  static formatTokenResponse(
    tokenData: TokenData | null, 
    protocolData: ProtocolData | null, 
    isTVLQuery: boolean
  ): TokenResponse {
    if (!tokenData && !protocolData) {
      return {
        success: false,
        error: "No data available for this token"
      };
    }

    // If it's a TVL query but no protocol data
    if (isTVLQuery && !protocolData?.tvl) {
      return {
        success: false,
        error: `TVL data not available for ${tokenData?.name || 'this token'}`,
        data: tokenData || undefined
      };
    }

    return {
      success: true,
      data: tokenData || undefined,
      protocolData: protocolData || undefined
    };
  }

  static formatResponse(response: TokenResponse): string {
    if (!response.success) {
      return response.error || "Failed to fetch token information";
    }

    let result = `Here are the current metrics for ${response.data?.name} (${response.data?.symbol}):\n\n`;

    // Market Data
    if (response.data?.market_data) {
      const marketData = response.data.market_data;
      
      if (marketData.current_price?.usd) {
        result += `Current Price: $${marketData.current_price.usd.toLocaleString()}\n`;
      }
      
      if (marketData.market_cap?.usd) {
        result += `Market Cap: $${marketData.market_cap.usd.toLocaleString()}\n`;
      }
      
      if (marketData.total_volume?.usd) {
        result += `24h Trading Volume: $${marketData.total_volume.usd.toLocaleString()}\n`;
      }

      if (marketData.price_change_percentage_24h) {
        result += `24h Price Change: ${marketData.price_change_percentage_24h.toFixed(2)}%\n`;
      }
    }

    // Protocol Data (TVL)
    if (response.protocolData?.tvl) {
      result += `\nProtocol Metrics:\n`;
      result += `Total Value Locked (TVL): $${response.protocolData.tvl.toLocaleString()}\n`;
      
      if (response.protocolData.change_1d) {
        result += `24h TVL Change: ${response.protocolData.change_1d.toFixed(2)}%\n`;
      }

      if (response.protocolData.category) {
        result += `Category: ${response.protocolData.category}\n`;
      }
    }

    // Description
    if (response.data?.description) {
      result += `\nDescription:\n${response.data.description}\n`;
    }

    // Risk Warning
    result += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

    return result;
  }
}