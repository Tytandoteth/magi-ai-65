import { TokenData, ProtocolData, TokenResponse } from "@/types/token";

export class TokenFormatter {
  private static formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private static formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  private static formatMarketData(marketData: TokenData['market_data']): string {
    let result = '';
    
    if (marketData?.current_price?.usd) {
      result += `Current Price: $${this.formatNumber(marketData.current_price.usd)}\n`;
    }
    
    if (marketData?.market_cap?.usd) {
      result += `Market Cap: $${this.formatNumber(marketData.market_cap.usd)}\n`;
    }
    
    if (marketData?.total_volume?.usd) {
      result += `24h Trading Volume: $${this.formatNumber(marketData.total_volume.usd)}\n`;
    }

    if (marketData?.price_change_percentage_24h) {
      result += `24h Price Change: ${this.formatPercentage(marketData.price_change_percentage_24h)}\n`;
    }

    return result;
  }

  private static formatProtocolData(protocolData: ProtocolData): string {
    let result = '\nProtocol Metrics:\n';
    
    if (protocolData.tvl) {
      result += `Total Value Locked (TVL): $${this.formatNumber(protocolData.tvl)}\n`;
    }
    
    if (protocolData.change_1d) {
      result += `24h TVL Change: ${this.formatPercentage(protocolData.change_1d)}\n`;
    }

    if (protocolData.category) {
      result += `Category: ${protocolData.category}\n`;
    }

    return result;
  }

  static formatResponse(response: TokenResponse): string {
    if (!response.success) {
      return response.error || "Failed to fetch token information";
    }

    let result = `Here are the current metrics for ${response.data?.name} (${response.data?.symbol}):\n\n`;

    // Market Data
    if (response.data?.market_data) {
      result += this.formatMarketData(response.data.market_data);
    }

    // Protocol Data (TVL)
    if (response.protocolData) {
      result += this.formatProtocolData(response.protocolData);
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